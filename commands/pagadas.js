const fs = require('fs');
const db = require('../db');
const { isGroupAdmin } = require('../lib/permissoes');

module.exports = {
    name: 'pagadas',
    execute: async (sock, msg) => {
        const chatId = msg.key.remoteJid;
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: "❌ Comando apenas para grupos." }, { quoted: msg });
        }

        const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;
        const isAdmin = await isGroupAdmin(sock, chatId, senderJid);
        const isDonoBot = db.normalizarId(senderJid) === '554896669255';

        if (!isAdmin && !isDonoBot && !msg.key.fromMe) {
            return await sock.sendMessage(chatId, { text: "🚫 *Acesso Negado:* Apenas Admins podem ver a lixeira de mensagens." }, { quoted: msg });
        }

        const apagadasPath = './apagadas.json';
        if (!fs.existsSync(apagadasPath)) {
            return await sock.sendMessage(chatId, { text: "🗑️ O banco de dados da lixeira ainda está vazio." }, { quoted: msg });
        }

        const dbApagadas = JSON.parse(fs.readFileSync(apagadasPath, 'utf8'));
        const lista = dbApagadas[chatId] || [];

        if (lista.length === 0) {
            return await sock.sendMessage(chatId, { text: "🗑️ Nenhuma mensagem recente foi apagada neste grupo." }, { quoted: msg });
        }

        let txt = `╭━━『 👁️ 𝑹𝑨𝑰𝑶-𝑿 (𝑨𝑷𝑨𝑮𝑨𝑫𝑨𝑺) 』━━╮\n┃\n`;
        
        lista.forEach((item) => {
            txt += `┃ 👤 *${item.nome}* (@${item.numero})\n`;
            txt += `┃ 🆔 *ID:* ${item.id}\n`;
            txt += `┃ 📅 *Data:* ${item.data}\n`;
            txt += `┃ 💬 *Msg:* ${item.texto}\n`;
            txt += `┃ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\n`;
        });
        
        txt += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

        // Extrai os contatos para marcar as pessoas apagadoras e mostrar o nome delas
        const mentionsArr = lista.map(l => l.numero + '@s.whatsapp.net');

        await sock.sendMessage(chatId, { text: txt, mentions: mentionsArr }, { quoted: msg });
    }
};
