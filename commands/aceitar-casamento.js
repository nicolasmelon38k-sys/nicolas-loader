const db = require('../db');
module.exports = { name: 'aceitar-casamento', async execute(sock, msg, args) {
    const sId = db.normalizarId(msg.key.participant || msg.key.remoteJid);
    let user = db.obterUsuario(sId);
    let nomeSender = user.nome || "Usuário";
    const qId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;

    if(!qId || !user.pedidoAmor || user.pedidoAmor.msgId !== qId) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Por favor, responda o convite correto no chat." }, { quoted: msg });
    if(Date.now() > user.pedidoAmor.expira) { db.salvar(sId, { pedidoAmor: null }); return sock.sendMessage(msg.key.remoteJid, { text: "⏳ O padre cansou de esperar e o convite expirou no altar!" }, { quoted: msg }); }
    if(user.pedidoAmor.tipo !== 'casamento') return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Esse convite não é pra casar!" }, { quoted: msg });

    const pId = user.pedidoAmor.de;
    let partner = db.obterUsuario(pId);
    let nomePartner = partner ? partner.nome : "Usuário";

    db.salvar(sId, { status: `Casado(a) com @${pId}`, pedidoAmor: null }); 
    db.salvar(pId, { status: `Casado(a) com @${sId}` });

    const txt = `╭━━━『 💒 𝑱𝑼𝑺𝑻 𝑴𝑨𝑹𝑹𝑰𝑬𝑫 💒 』━━━╮\n┃\n┃ 🎊 CHUVA DE ARROZ! 🥂\n┃ 💞 *${nomeSender}* e *${nomePartner}* agora\n┃ estão oficialmente CASADOS! 💍\n┃\n┃ ✨ Muitas felicidades ao novo\n┃ casal do grupo! Estão lindos! 🥰\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`;
    await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
}};