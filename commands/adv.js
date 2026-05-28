const { isGroupAdmin } = require('../lib/permissoes');
const db = require('../db');

module.exports = {
    name: 'adv',
    execute: async (sock, msg, args) => {
        try {
            const chatId = msg.key.remoteJid;
            
            // Trava: Comando só faz sentido em grupos
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: "❌ Comando apenas para grupos." });
            }

            const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;

            // 1. CHECAGEM DE ADMIN (Igual ao !g)
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
                    text: "⚠️ *Como usar:* Marque a pessoa com @ ou responda a mensagem dela com !adv" 
                }, { quoted: msg });
            }

            // Impede de dar ADV no próprio bot
            const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            if (aJid === botJid) {
                return await sock.sendMessage(chatId, { text: "❌ Tá doido? Não posso me dar advertência!" }, { quoted: msg });
            }

            const aId = db.normalizarId(aJid);
            const alvoUser = db.obterUsuario(aId);
            
            // 3. SOMAR A ADVERTÊNCIA
            let advAtual = alvoUser ? (alvoUser.adv || 0) : 0;
            advAtual += 1;

            if (advAtual >= 3) {
                // Remove o cara do grupo
                await sock.groupParticipantsUpdate(chatId, [aJid], "remove");

                // Zera as ADVs pra não ficar banindo ele no automático se ele voltar um dia
                db.salvar(aId, { adv: 0 });
                
                await sock.sendMessage(chatId, { 
                    text: `🚫 *BOMBA!* O membro @${aJid.split('@')[0]} atingiu 3 advertências e foi **BANIDO** do grupo! 🔨`,
                    mentions: [aJid]
                });

            } else {
                // Salva a nova contagem
                db.salvar(aId, { adv: advAtual });

                await sock.sendMessage(chatId, { 
                    text: `⚠️ *ADVERTÊNCIA APLICADA!* \n\nO membro @${aJid.split('@')[0]} recebeu uma advertência.\n🚨 *Status:* [ ${advAtual} / 3 ]\n\n_Se chegar a 3 advertências, será banido na hora!_`,
                    mentions: [aJid]
                }, { quoted: msg });
            }

        } catch (e) {
            console.error("ERRO NO COMANDO ADV:", e.message);
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ *Erro interno:* " + e.message
            });
        }
    }
};
