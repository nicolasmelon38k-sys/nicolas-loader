const db = require('../db');
module.exports = { name: 'aceitar-namoro', async execute(sock, msg, args) {
    const sId = db.normalizarId(msg.key.participant || msg.key.remoteJid);
    let user = db.obterUsuario(sId);
    let nomeSender = user.nome || "Usuário";
    const qId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;

    if(!qId) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Poxa, você precisa RESPONDER à mensagem do convite pra dar certo!" }, { quoted: msg });
    if(!user.pedidoAmor) return sock.sendMessage(msg.key.remoteJid, { text: "🥀 Você não tem nenhum pedido de amor pendente no momento." }, { quoted: msg });
    if(user.pedidoAmor.msgId !== qId) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Esse NÃO é o seu convite pendente. Clica na mensagem certa!" }, { quoted: msg });
    if(Date.now() > user.pedidoAmor.expira) { db.salvar(sId, { pedidoAmor: null }); return sock.sendMessage(msg.key.remoteJid, { text: "⏳ Ops... Você demorou muito e o tempo do convite expirou." }, { quoted: msg }); }
    if(user.pedidoAmor.tipo !== 'namoro') return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Ei, esse convite não é pra namoro!" }, { quoted: msg });

    const pId = user.pedidoAmor.de;
    let partner = db.obterUsuario(pId);
    let nomePartner = partner ? partner.nome : "Usuário";

    db.salvar(sId, { status: `Namorando com @${pId}`, pedidoAmor: null }); 
    db.salvar(pId, { status: `Namorando com @${sId}` });

    const txt = `╭━━━『 💖 𝑶 𝑨𝑴𝑶𝑹 𝑽𝑬𝑵𝑪𝑬𝑼 💖 』━━━╮\n┃\n┃ 🎉 VIVAM OS POMBINHOS! 🎀\n┃ 💞 *${nomeSender}* disse SIM para *${nomePartner}*!\n┃\n┃ ✨ Que esse amor seja lindo e floresça\n┃ cada dia mais! Cuidem-se bem! 🥰\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
    await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
}};