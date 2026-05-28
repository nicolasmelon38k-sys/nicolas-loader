const db = require('../db');
module.exports = { name: 'recusar-casamento', async execute(sock, msg, args) {
    const sId = db.normalizarId(msg.key.participant || msg.key.remoteJid);
    let user = db.obterUsuario(sId);
    let nomeSender = user.nome || "Usuário";
    const qId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;

    if(!qId || !user.pedidoAmor || user.pedidoAmor.msgId !== qId) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Responda o convite corretamente!" }, { quoted: msg });

    const pId = user.pedidoAmor.de; 
    let partner = db.obterUsuario(pId);
    let nomePartner = partner ? partner.nome : "Usuário";
    db.salvar(sId, { pedidoAmor: null });

    const txt = `╭━━━『 🏃💨 𝑭𝑼𝑮𝑨 𝑵𝑶 𝑨𝑳𝑻𝑨𝑹 🏃💨 』━━━╮\n┃\n┃ 💔 Que climão... *${nomeSender}* não quis\n┃ casar e fugiu correndo do altar!\n┃\n┃ 🥀 *${nomePartner}*, calma... Vocês ainda\n┃ estão namorando, mas o susto foi grande! 🥺\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`;
    await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
}};