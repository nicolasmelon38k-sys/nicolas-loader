const db = require('../db');

module.exports = {
    name: 'meuid',
    execute: async (sock, msg, args) => {
        const remetente = msg.key.participant || msg.key.remoteJid;
        const idLimpo = db.normalizarId(remetente);

        const texto = `
╭━━━━━━━ 『 🆔 𝑴𝑬𝑼 𝑰𝑫 』━━━━━━━╮
┃
┃ 👤 *Usuário:* ${msg.pushName || "Daemon"}
┃ 🔑 *Seu ID:* ${idLimpo}
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 💡 *Dica:* Use esse número acima 
┃ para se registrar no site da Daemon!
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};
