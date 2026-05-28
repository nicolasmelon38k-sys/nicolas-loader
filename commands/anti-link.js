const fs = require('fs');
const db = require('../db');
const { isGroupAdmin } = require('../lib/permissoes');

module.exports = {
    name: 'anti-link',
    execute: async (sock, msg, args) => {
        try {
            const chatId = msg.key.remoteJid;

            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: "❌ Comando apenas para grupos." });
            }

            const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;
            const senderIdNum = db.normalizarId(senderJid);

            const isAdmin = await isGroupAdmin(sock, chatId, senderJid);
            const isDonoBot = senderIdNum === '554896669255';

            if (!isAdmin && !isDonoBot && !msg.key.fromMe) {
                return await sock.sendMessage(
                    chatId,
                    { text: "🚫 *Acesso Negado:* Comando exclusivo para Admins." },
                    { quoted: msg }
                );
            }

            const gruposPath = './grupos.json';
            if (!fs.existsSync(gruposPath)) fs.writeFileSync(gruposPath, JSON.stringify({}));

            const grupos = JSON.parse(fs.readFileSync(gruposPath, 'utf8'));
            const acao = (args[0] || '').trim();

            if (acao === '1') {
                grupos[chatId] = { ...grupos[chatId], 'anti-link': true, antilink: true };
                fs.writeFileSync(gruposPath, JSON.stringify(grupos, null, 2));
                return await sock.sendMessage(
                    chatId,
                    { text: "🛡️ *ANTI-LINK ATIVADO!* Quem mandar link e não for admin será removido." },
                    { quoted: msg }
                );
            }

            if (acao === '0') {
                grupos[chatId] = { ...grupos[chatId], 'anti-link': false, antilink: false };
                fs.writeFileSync(gruposPath, JSON.stringify(grupos, null, 2));
                return await sock.sendMessage(
                    chatId,
                    { text: "🔓 *ANTI-LINK DESATIVADO!* Links liberados." },
                    { quoted: msg }
                );
            }

            return await sock.sendMessage(
                chatId,
                { text: "⚙️ Como usar:\n*!anti-link 1* (Ligar)\n*!anti-link 0* (Desligar)" },
                { quoted: msg }
            );
        } catch (e) {
            console.error("Erro interno no anti-link:", e);
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ *Erro interno:* " + e.message });
        }
    }
};
