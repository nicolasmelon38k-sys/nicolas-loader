module.exports = {
    name: 'rank-xibiu',
    execute: async (sock, msg, args) => {
        try {
            const chatId = msg.key.remoteJid;

            // 1. TRAVA: Só funciona em grupos
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { 
                    text: "⚠️ *Mano, esse comando é pra expor a galera!* Só funciona em grupos." 
                }, { quoted: msg });
            }

            await sock.sendMessage(chatId, { react: { text: "🌮", key: msg.key } });

            // 2. Pegar os membros do grupo
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants.map(p => p.id);

            // 3. Embaralhar a lista de membros e pegar até 10 pessoas
            const shuffled = participants.sort(() => 0.5 - Math.random());
            const selectedMembers = shuffled.slice(0, 10);

            // 4. Frases absurdas e zoeiras
            const frases = [
                "Apertadinha, nível alicate de pressão 🗜️",
                "Tamanho PP, só entra com senha e biometria 🔒",
                "Xibiu de ouro, a lenda conta que brilha no escuro ✨",
                "Uma verdadeira Caverna do Dragão, quem entra não sai 🐉",
                "Padrão FIFA, gramado impecável ⚽",
                "Tão funda que a Petrobras já tá querendo extrair petróleo 🛢️",
                "Cheirinho de morango com chantilly 🍓",
                "Braba demais, morde e não solta 🦖",
                "Misteriosa, é o próprio Triângulo das Bermudas 🔺",
                "Bem cuidada, parece um jardim botânico 🌺",
                "Xibiu blindado, nível carro-forte da Brink's 🚐",
                "Xibiu Premium VIP, assinatura mensal caríssima 💳",
                "Estilo buraco negro, suga até a luz e o tempo 🌌",
                "Perigosa, parece um campo minado 💣",
                "Acolhedora, parece abraço de mãe 🫂",
                "Pequenininha, cabe numa caixa de fósforo 📦",
                "Parece o abismo de Helm, dá até eco 🕳️",
                "Tão gelada que parece o coração do ex 🧊"
            ];

            // 5. Montar o texto do Ranking
            let textoRank = "🌮 *RANK DO XIBIU DO GRUPO* 🌮\n_Medição 100% científica e imparcial:_\n\n";
            const mentionsArray = [];

            selectedMembers.forEach((membroId, index) => {
                const fraseSorteada = frases[Math.floor(Math.random() * frases.length)];
                const formatoNome = `@${membroId.split('@')[0]}`;
                
                textoRank += `*${index + 1}º* - ${formatoNome}\n└ ${fraseSorteada}\n\n`;
                mentionsArray.push(membroId); // Guarda pra marcar a pessoa
            });

            textoRank += "😎 _A voz do bot é a voz de Deus._";

            // 6. Enviar a mensagem com as marcações ativadas
            await sock.sendMessage(chatId, {
                text: textoRank,
                mentions: mentionsArray
            }, { quoted: msg });

        } catch (e) {
            console.error("Erro no comando !rank-xibiu:", e.message);
            await sock.sendMessage(msg.key.remoteJid, { 
                text: "❌ *Erro ao processar o rank.* Deu ruim na vistoria." 
            }, { quoted: msg });
        }
    }
}
