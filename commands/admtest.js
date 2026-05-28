const db = require('../db');
const config = require('../config.json');
module.exports = {
    name: 'admtest',
    execute: async (sock, msg) => {
        const reis = ['554896669255', '161830827753644'];
        const remetente = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        if (!reis.includes(remetente)) return; // Trava Real

        const p = config.prefix || '!';
        const txt = `🔍 *DEBUG ADMIN*\n\n✅ Seu ID: ${remetente}\n✅ Prefixo Atual: ${p}\n✅ Acesso: Autorizado 👑`;
        await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
    }
};
