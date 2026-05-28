const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

module.exports = (app, checkAuth, db, configWeb) => {
    let key = '';
    try { key = require('../config.json').geminiKey; } catch(e) {}
    const genAI = new GoogleGenerativeAI(key);
    const historyPath = path.join(__dirname, '../data/ai_history.json');

    const readHistory = () => JSON.parse(fs.readFileSync(historyPath, 'utf8') || '{}');
    const saveHistory = (data) => fs.writeFileSync(historyPath, JSON.stringify(data, null, 2));

    app.get('/api/ai/history', checkAuth, (req, res) => {
        const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        res.json({ success: true, chats: readHistory()[userId] || {} });
    });

    // ✏️ NOVA ROTA: Renomear Chat
    app.post('/api/ai/rename', checkAuth, (req, res) => {
        const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const { chatId, newTitle } = req.body;
        const dbAi = readHistory();
        if (dbAi[userId] && dbAi[userId][chatId]) {
            dbAi[userId][chatId].title = newTitle;
            saveHistory(dbAi);
            return res.json({ success: true });
        }
        res.json({ success: false });
    });

    app.post('/api/ai/chat', checkAuth, async (req, res) => {
        const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const { prompt, model, chatId, reasoningLvl } = req.body;
        const currentChatId = chatId || 'chat_' + Date.now();

        const dbAi = readHistory();
        if (!dbAi[userId]) dbAi[userId] = {};
        if (!dbAi[userId][currentChatId]) dbAi[userId][currentChatId] = { title: "Novo Chat...", msgs: [] };
        
        const chatData = dbAi[userId][currentChatId];

        // 🧠 CRIANDO A MEMÓRIA DA IA
        const geminiHistory = [];
        for (let m of chatData.msgs) {
            // A API do Gemini só aceita 'user' ou 'model'
            geminiHistory.push({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            });
        }

        // 🛡️ FALLBACK ATUALIZADO
        const fallbackList = [
            model,
            'gemini-3.1-flash-lite',
            'gemini-3.5-flash',
            'gemini-3.1-pro-preview',
            'gemini-2.5-pro',
            'gemini-1.5-flash'
        ];

        let responseText = '';
        let reasoningText = 'Nenhum raciocínio gerado.';
        let modeloQueRespondeu = '';
        let erroFinal = '';

        // ⏰ INJETANDO RELÓGIO E LOCALIZAÇÃO (Anti-Alucinação de Datas)
        const dateStr = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const systemPrompt = "Você é Daemon AI. Informação de sistema: Hoje é " + dateStr + " no Brasil. O usuário está no Brasil. Aja naturalmente e lembre-se do contexto.";

        for (const modelName of fallbackList) {
            try {
                if (!modelName) continue;
                
                // Raciocínio Estendido
                if (reasoningLvl === 'estendido') {
                    try {
                        const modelReasoning = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                        const resReas = await modelReasoning.generateContent("Create a 3-step technical thought process for this prompt in English. Output ONLY the log. Prompt: " + prompt);
                        reasoningText = resReas.response.text();
                    } catch(e) { reasoningText = "Raciocínio ignorado por limite de cota."; }
                }

                // Inicia o chat com histórico + Instrução de Sistema
                const modelFinal = genAI.getGenerativeModel({ 
                    model: modelName,
                    systemInstruction: { parts: [{ text: systemPrompt }] }
                });
                
                const chatSession = modelFinal.startChat({ history: geminiHistory });
                const resultFinal = await chatSession.sendMessage(prompt);
                
                responseText = resultFinal.response.text();
                modeloQueRespondeu = modelName;
                break; 
            } catch (error) {
                console.log('⚠️ Modelo ' + modelName + ' falhou. Tentando próximo... Erro: ' + error.message);
                erroFinal = error.message;
            }
        }

        if (!responseText) return res.json({ success: false, erro: 'Servidores indisponíveis. Erro: ' + erroFinal });

        // 🪄 GERADOR AUTOMÁTICO DE TÍTULO (Só na 1º Mensagem)
        if (chatData.msgs.length === 0) {
            try {
                const titleModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const titleRes = await titleModel.generateContent("Leia este texto e crie um título curtíssimo de 2 a 4 palavras resumindo o assunto. Não use aspas, não use ponto final. Texto: " + prompt);
                chatData.title = titleRes.response.text().trim().replace(/["']/g, '');
            } catch(e) { chatData.title = prompt.substring(0, 20) + '...'; }
        }

        // Salva a nova interação no banco
        chatData.msgs.push({ role: 'user', text: prompt });
        chatData.msgs.push({ role: 'model', text: responseText, reasoning: reasoningText, modelUsed: modeloQueRespondeu });
        saveHistory(dbAi);

        res.json({ success: true, reasoning: reasoningText, response: responseText, modelUsed: modeloQueRespondeu, chatId: currentChatId, chatTitle: chatData.title });
    });
};