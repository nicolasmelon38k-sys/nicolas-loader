const db = require('../db');

module.exports = {
    name: 'afk',
    execute: async (sock, msg, args) => {
        let quemEnviouRaw = msg.key.fromMe ? "554896669255@s.whatsapp.net" : (msg.key.participant || msg.key.remoteJid);
        const senderId = db.normalizarId(quemEnviouRaw);
        const nome = msg.pushName || 'Usuário';

        const motivo = args.join(' ').trim() || 'nenhum';
        const timestamp = Date.now();

        db.salvar(senderId, { 
            afk: { status: true, motivo: motivo, desde: timestamp },
            nome: nome 
        });

        const layout = `
╭━━━━━━━『 💤 𝑴𝑶𝑫𝑶 𝑨𝑭𝑲 』━━━━━━━╮
┃
┃ ✅ *AFK registrado com sucesso!*
┃ 👤 *Usuário:* ${nome}
┃ 📝 *Motivo:* ${motivo}
┃
┃ _Sua ausência foi computada._
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

        await sock.sendMessage(msg.key.remoteJid, { text: layout }, { quoted: msg });
    }
};
