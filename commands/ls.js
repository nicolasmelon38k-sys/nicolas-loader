const fs = require('fs');
const db = require('../db');
module.exports = {
    name: 'ls',
    execute: async (sock, msg, args) => {
        const reis = ['554896669255', '161830827753644'];
        const remetente = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        if (!reis.includes(remetente)) return;

        const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        const lista = files.map(f => `📄 ${f}`).join('\n');
        await sock.sendMessage(msg.key.remoteJid, { text: `📂 *ARQUIVOS DO SISTEMA:*\n\n${lista}` }, { quoted: msg });
    }
}
