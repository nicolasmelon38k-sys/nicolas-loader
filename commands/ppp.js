const db = require('../db');

module.exports = {
    name: 'ppp',
    execute: async (sock, msg, args) => {
        try {
            let alvoRaw = null;

            // 1. Verifica se você "puxou pro lado" a mensagem de alguém
            if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
                alvoRaw = msg.message.extendedTextMessage.contextInfo.participant;
            } 
            // 2. Ou verifica se você marcou alguém com o @ direto no comando (!ppp @usuario)
            else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                alvoRaw = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }

            let tituloEnquete = '🔥 𝓟𝓮𝓰𝓪, 𝓟𝓪𝓼𝓼𝓸 𝓸𝓾 𝓟𝓮𝓷𝓼𝓸? 👀';

            // Se o bot encontrou um alvo, ele muda o título!
            if (alvoRaw) {
                const numeroLimpo = alvoRaw.split('@')[0];
                
                // Puxa o nome da pessoa do banco de dados (se ela for registrada)
                const alvoUser = db.obterUsuario(db.normalizarId(alvoRaw));
                
                // Se a pessoa tiver nome no DB, usa o nome, se não, usa o @numero
                const nomeDisplay = (alvoUser && alvoUser.nome) ? alvoUser.nome : `@${numeroLimpo}`;

                tituloEnquete = `🔥 𝓥𝓸𝓬𝓮̂ 𝓹𝓮𝓰𝓪𝓻𝓲𝓪 ${nomeDisplay}? 👀`;
            }

            const enquete = {
                poll: {
                    name: tituloEnquete,
                    values: [
                        'Pego 🔥',
                        'Passo 🏃💨',
                        'Penso 🤔'
                    ],
                    selectableCount: 1 // Trava pra pessoa votar em 1 só!
                }
            };

            await sock.sendMessage(msg.key.remoteJid, enquete, { quoted: msg });
        } catch (error) {
            console.log("❌ Erro no comando PPP:", error);
        }
    }
};
