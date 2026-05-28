const db = require('../db');
module.exports = { name: 'recusar-namoro', async execute(sock, msg, args) {
    const sId = db.normalizarId(msg.key.participant || msg.key.remoteJid);
    let user = db.obterUsuario(sId);
    let nomeSender = user.nome || "Usuário";
    const qId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;

    if(!qId) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Você precisa RESPONDER à mensagem do convite!" }, { quoted: msg });
    if(!user.pedidoAmor || user.pedidoAmor.msgId !== qId) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ O convite é inválido ou já expirou." }, { quoted: msg });

    const pId = user.pedidoAmor.de; 
    let partner = db.obterUsuario(pId);
    let nomePartner = partner ? partner.nome : "Usuário";
    db.salvar(sId, { pedidoAmor: null });

    const txt = `╭━━━『 🥀 𝑪𝑶𝑹𝑨𝑪̧𝑨̃𝑶 𝑷𝑨𝑹𝑻𝑰𝑫𝑶 🥀 』━━━╮\n┃\n┃ 💔 Ah não... *${nomeSender}* recusou\n┃ o pedido com muito jeitinho...\n┃\n┃ 🌧️ Força, *${nomePartner}*! Foca no\n┃ seu RPG que logo o amor verdadeiro\n┃ bate na sua porta! 🧸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
    await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
}};