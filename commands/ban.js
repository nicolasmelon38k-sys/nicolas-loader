const db = require('../db');
const { isGroupAdmin } = require('../lib/permissoes');

module.exports = {
    name: 'ban',
    execute: async (sock, msg, args) => {
        try {
            const remetente = msg.key.remoteJid;
            if (!remetente.endsWith('@g.us')) {
                return sock.sendMessage(remetente, { text: "❌ Comando apenas para grupos." }, { quoted: msg });
            }

            const sender = msg.key.participant || msg.participant || msg.key.remoteJid;
            const senderIdNum = db.normalizarId(sender);

            const botId = sock.user.id.includes(':')
                ? sock.user.id.split(':')[0] + '@s.whatsapp.net'
                : sock.user.id;

            const isAuthorized =
                await isGroupAdmin(sock, remetente, sender) ||
                ['554896669255'].includes(senderIdNum) ||
                msg.key.fromMe;

            if (!isAuthorized) {
                return sock.sendMessage(
                    remetente,
                    { text: "⚠️ Você não tem poder para banir ninguém!" },
                    { quoted: msg }
                );
            }

            let alvo =
                msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                msg.message?.extendedTextMessage?.contextInfo?.participant;

            if (!alvo) {
                return sock.sendMessage(
                    remetente,
                    { text: "❌ Marque alguém ou responda a mensagem de quem você quer banir!" },
                    { quoted: msg }
                );
            }

            if (alvo === botId) {
                return sock.sendMessage(
                    remetente,
                    { text: "🤣 Tá tentando me banir? Aí não né pai." },
                    { quoted: msg }
                );
            }

            const isBotAdmin = await isGroupAdmin(sock, remetente, botId);
            if (!isBotAdmin) {
                return sock.sendMessage(
                    remetente,
                    { text: "⚠️ Eu preciso ser Admin para expulsar alguém!" },
                    { quoted: msg }
                );
            }

            await sock.groupParticipantsUpdate(remetente, [alvo], "remove");

            await sock.sendMessage(remetente, {
                text: `🚀 *MARRETADA APLICADA!*\n@${db.normalizarId(alvo)} foi removido com sucesso.`,
                mentions: [alvo]
            }, { quoted: msg });

        } catch (e) {
            console.log("Erro no ban:", e);
            sock.sendMessage(msg.key.remoteJid, { text: "❌ Ocorreu um erro ao tentar banir." });
        }
    }
};
