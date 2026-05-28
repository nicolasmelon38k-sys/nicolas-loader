module.exports = {
    name: 'rank-pau',
    execute: async (sock, msg, args) => {
        try {
            const chatId = msg.key.remoteJid;

            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { 
                    text: "⚠️ *Mano, esse comando é pra expor a galera!* Só funciona em grupos." 
                }, { quoted: msg });
            }

            await sock.sendMessage(chatId, { react: { text: "🍆", key: msg.key } });

            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants.map(p => p.id);

            const shuffled = participants.sort(() => 0.5 - Math.random());
            const selectedMembers = shuffled.slice(0, 10);

            const frases = [
                "Tão pequeno que precisa de um microscópio pra achar 🔬",
                "Pau de formiga, praticamente invisível a olho nu 🐜",
                "Isso é um botão de camisa ou o seu pau? 🔘",
                "Tamanho pendrive, só serve pra transferir vírus 💾",
                "Um clipe de papel aberto é maior que isso 📎",
                "Parece um amendoim assustado 🥜",
                "Pau médio, o famoso arroz com feijão 🍚",
                "Tamanho de um controle de TV, dá pro gasto 📺",
                "Meia bomba de respeito, assusta mas não mata 🌭",
                "Tamanho de uma lata de Pringles, já faz um estrago 🥫",
                "A famosa 3ª perna, precisa amarrar no joelho pra andar 🦵",
                "Uma anaconda selvagem, perigo iminente na selva 🐍",
                "O poste de luz da rua, totalmente colossal 🗼",
                "Tão grande que o prefeito tá cobrando IPTU da rola 🏢",
                "Uma espada medieval pronta pra guerra ⚔️",
                "Porte ilegal de arma branca na cueca 🛑",
                "Parece um extintor de incêndio, monstruoso 🧯",
                "Um monstro marinho, o próprio Kraken 🦑"
            ];

            let textoRank = "📏 *RANK DO PAU DO GRUPO* 📏\n_Medição 100% científica e precisa:_\n\n";
            const mentionsArray = [];

            selectedMembers.forEach((membroId, index) => {
                const fraseSorteada = frases[Math.floor(Math.random() * frases.length)];
                const formatoNome = `@${membroId.split('@')[0]}`;
                
                textoRank += `*${index + 1}º* - ${formatoNome}\n└ ${fraseSorteada}\n\n`;
                mentionsArray.push(membroId);
            });

            textoRank += "😎 _O bot nunca mente._";

            await sock.sendMessage(chatId, {
                text: textoRank,
                mentions: mentionsArray
            }, { quoted: msg });

        } catch (e) {
            console.error("Erro no comando !rank-pau:", e.message);
            await sock.sendMessage(msg.key.remoteJid, { 
                text: "❌ *Erro ao processar o rank.* O bot ficou com vergonha." 
            }, { quoted: msg });
        }
    }
}
