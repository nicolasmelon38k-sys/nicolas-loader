const fs = require('fs');
const db = require('../db');
const { isGroupAdmin } = require('../lib/permissoes');

module.exports = {
    name: 'anti-spam',
    execute: async (sock, msg, args) => {
        const chatId = msg.key.remoteJid;
        if (!chatId.endsWith('@g.us')) return await sock.sendMessage(chatId, { text: "❌ Comando apenas para grupos." });

        const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;
        const isAdmin = await isGroupAdmin(sock, chatId, senderJid);
        const isDonoBot = db.normalizarId(senderJid) === '554896669255';

        if (!isAdmin && !isDonoBot && !msg.key.fromMe) {
            return await sock.sendMessage(chatId, { text: "🚫 *Acesso Negado:* Exclusivo para Admins." }, { quoted: msg });
        }

        const gruposPath = './grupos.json';
        if (!fs.existsSync(gruposPath)) fs.writeFileSync(gruposPath, JSON.stringify({}));
        const grupos = JSON.parse(fs.readFileSync(gruposPath, 'utf8'));
        const acao = (args[0] || '').trim();

        if (acao === '1') {
            grupos[chatId] = { ...grupos[chatId], antiSpam: true };
            fs.writeFileSync(gruposPath, JSON.stringify(grupos, null, 2));
            return await sock.sendMessage(chatId, { text: "🛡️ *ANTI-SPAM ATIVADO!* \nSe mandar 3 mensagens ou figurinhas em menos de 2s, é BAN na hora." }, { quoted: msg });
        } else if (acao === '0') {
            grupos[chatId] = { ...grupos[chatId], antiSpam: false };
            fs.writeFileSync(gruposPath, JSON.stringify(grupos, null, 2));
            return await sock.sendMessage(chatId, { text: "🔓 *ANTI-SPAM DESATIVADO!*" }, { quoted: msg });
        }

        return await sock.sendMessage(chatId, { text: "⚙️ Como usar:\n*!anti-spam 1* (Ligar)\n*!anti-spam 0* (Desligar)" }, { quoted: msg });
    }
};
