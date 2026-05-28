const fs = require('fs');
const db = require('../db');
const { isGroupAdmin } = require('../lib/permissoes');

module.exports = {
    name: 'soa-adm',
    execute: async (sock, msg, args) => {
        const chatId = msg.key.remoteJid;
        if (!chatId.endsWith('@g.us')) return;

        const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;
        const isAdmin = await isGroupAdmin(sock, chatId, senderJid);
        const isDonoBot = db.normalizarId(senderJid) === '554896669255';

        if (!isAdmin && !isDonoBot && !msg.key.fromMe) {
            return await sock.sendMessage(chatId, { text: "🚫 Apenas Admins podem ligar este modo." }, { quoted: msg });
        }

        const gruposPath = './grupos.json';
        if (!fs.existsSync(gruposPath)) fs.writeFileSync(gruposPath, JSON.stringify({}));
        const grupos = JSON.parse(fs.readFileSync(gruposPath, 'utf8'));
        const acao = (args[0] || '').trim();

        if (acao === '1') {
            grupos[chatId] = { ...grupos[chatId], soaAdm: true };
            fs.writeFileSync(gruposPath, JSON.stringify(grupos, null, 2));
            return await sock.sendMessage(chatId, { text: "👑 *MODO ADMIN ATIVADO!* \nAgora apenas administradores podem usar comandos do bot." });
        } else if (acao === '0') {
            grupos[chatId] = { ...grupos[chatId], soaAdm: false };
            fs.writeFileSync(gruposPath, JSON.stringify(grupos, null, 2));
            return await sock.sendMessage(chatId, { text: "🌐 *MODO ADMIN DESATIVADO!* \nTodos os membros voltaram a ter permissão de usar o bot." });
        }

        return await sock.sendMessage(chatId, { text: "⚙️ Uso:\n*!soa-adm 1* (Apenas Admins usam o bot)\n*!soa-adm 0* (Todos usam o bot)" }, { quoted: msg });
    }
};
