const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config.json');

const genAI = new GoogleGenerativeAI(config.geminiKey);

// Ordem estrita: do melhor/mais avançado para o fallback de emergência
const modelosFallback = [
    "gemini-3.5-flash",          // 1º Tentativa: O mais novo e rápido
    "gemini-3.1-pro-preview",    // 2º Tentativa: Pro ultra inteligente
    "gemini-2.5-pro",            // 3º Tentativa: Pro estável garantido
    "gemini-2.5-flash",          // 4º Tentativa: Flash super rápido
    "gemini-flash-latest"        // 5º Tentativa: Fallback universal
];

module.exports = {
    name: 'ai',
    execute: async (sock, msg, args) => {
        const remetente = msg.key.remoteJid;
        const prompt = args.join(' ');
        
        if (!prompt) {
            return sock.sendMessage(remetente, { text: "❌ Digite sua pergunta após o comando." }, { quoted: msg });
        }

        // Bota um react pra mostrar que o bot tá pensando
        await sock.sendMessage(remetente, { react: { text: "🧠", key: msg.key } });

        let resposta = "";
        let modeloUsado = "";
        let fim = 0;
        const inicio = Date.now();

        // Roda o loop pela lista de modelos
        for (const modelName of modelosFallback) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                
                // Se chegou aqui sem dar erro, pega a resposta
                resposta = result.response.text();
                modeloUsado = modelName;
                fim = Date.now() - inicio;
                
                // O BREAK MATA O LOOP! Impede de usar 2 IAs ao mesmo tempo.
                break; 
            } catch (error) {
                console.log("⚠️ [IA] " + modelName + " falhou ou está lotado. Tentando o próximo...");
            }
        }

        // Se o loop acabou e a resposta continua vazia, todos caíram
        if (!resposta) {
            return await sock.sendMessage(remetente, { text: "❌ Falha crítica: Todos os servidores da IA estão sobrecarregados no momento. Tente de novo em 1 minuto." }, { quoted: msg });
        }

        // Monta o layout blindado contra erros de formatação no Termux
        const layout = "╭━━━━━━━『 𝑫𝑨𝑬𝑴𝑶𝑵-𝑰𝑨 』━━━━━━━╮\n┃\n" +
                       resposta + "\n┃\n" +
                       "┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                       "┃ 🛠️ *MODELO:* " + modeloUsado + "\n" +
                       "┃ ⚡ *LATÊNCIA:* " + fim + "ms\n" +
                       "┃ 🟢 *STATUS:* Operacional\n" +
                       "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯";

        // Manda a mensagem final
        await sock.sendMessage(remetente, { text: layout }, { quoted: msg });
    }
};
