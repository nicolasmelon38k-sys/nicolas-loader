const { isGroupAdmin } = require('../lib/permissoes');
const db = require('../db');

module.exports = {
    name: 'remover-adv',
    execute: async (sock, msg, args) => {
        try {
            const chatId = msg.key.remoteJid;
            
            // Trava: Comando só faz sentido em grupos
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: "❌ Comando apenas para grupos." });
            }

            const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;

            // 1. CHECAGEM DE ADMIN
            const isAdmin = await isGroupAdmin(sock, chatId, senderJid);
            if (!isAdmin) {
                return await sock.sendMessage(chatId, {
                    text: "🚫 *Acesso Negado:* Comando exclusivo para Admins do grupo."
                }, { quoted: msg });
            }

            // 2. IDENTIFICAR O ALVO (Por Menção ou Resposta)
            let aJid = null;
            const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (mentions.length > 0) {
                aJid = mentions[0];
            } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
                aJid = msg.message.extendedTextMessage.contextInfo.participant;
            }

            if (!aJid) {
                return await sock.sendMessage(chatId, { 
                    text: "⚠️ *Como usar:* Marque a pessoa com @ ou responda à mensagem dela com !remover-adv" 
                }, { quoted: msg });
            }

            const aId = db.normalizarId(aJid);
            const alvoUser = db.obterUsuario(aId);
            
            // 3. DIMINUIR A ADVERTÊNCIA
            let advAtual = alvoUser ? (alvoUser.adv || 0) : 0;

            if (advAtual <= 0) {
                return await sock.sendMessage(chatId, { 
                    text: `✅ O membro @${aJid.split('@')[0]} já tem a ficha completamente limpa (0 advertências).`,
                    mentions: [aJid]
                }, { quoted: msg });
            }

            advAtual -= 1;
            db.salvar(aId, { adv: advAtual });

            await sock.sendMessage(chatId, { 
                text: `🛡️ *ADVERTÊNCIA REMOVIDA!* \n\nO membro @${aJid.split('@')[0]} foi perdoado por um Admin.\n🚨 *Status Atual:* [ ${advAtual} / 3 ]`,
                mentions: [aJid]
            }, { quoted: msg });

        } catch (e) {
            console.error("ERRO NO COMANDO REMOVER-ADV:", e.message);
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ *Erro interno:* " + e.message
            });
        }
    }
};
