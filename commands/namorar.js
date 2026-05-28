const db = require('../db');
module.exports = { name: 'namorar', async execute(sock, msg, args) {
    const sId = db.normalizarId(msg.key.participant || msg.key.remoteJid);
    let user = db.obterUsuario(sId);
    let nomeSender = user.nome || "Usuário";

    let aJid = null;
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

    if(mentions.length > 0) aJid = mentions[0];
    else if(quotedParticipant) aJid = quotedParticipant;

    if(!aJid) return sock.sendMessage(msg.key.remoteJid, { text: "🌸 Poxa, você precisa marcar com @ ou RESPONDER a uma mensagem da pessoa!" }, { quoted: msg });
    
    const aId = db.normalizarId(aJid);
    if(sId === aId) return sock.sendMessage(msg.key.remoteJid, { text: "🥀 Amor próprio é tudo de bom, mas o bot precisa de duas pessoas diferentes!" }, { quoted: msg });

    let alvo = db.obterUsuario(aId);
    if(!alvo) { db.registrar(aId, "Usuário"); alvo = db.obterUsuario(aId); }
    let nomeAlvo = alvo.nome || "Usuário";

    if(user.status && user.status !== "Solteiro(a)") return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Opa! Você já tem um compromisso, foca no seu amor!" }, { quoted: msg });
    if(alvo.status && alvo.status !== "Solteiro(a)") return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Poxa... Essa pessoa já tem dono(a). Talaricagem não rola aqui! 🛑" }, { quoted: msg });

    const txt = `╭━━━『 🌸 𝑷𝑬𝑫𝑰𝑫𝑶 𝑫𝑬 𝑵𝑨𝑴𝑶𝑹𝑶 🌸 』━━━╮\n┃\n┃ ✨ *${nomeAlvo}*, seu coração foi fisgado!\n┃ *${nomeSender}* está muito apaixonado(a) por você!\n┃\n┃ 💖 𝑨𝒄𝒆𝒊𝒕𝒂 𝒏𝒂𝒎𝒐𝒓𝒂𝒓 𝒄𝒐𝒎𝒊𝒈𝒐? 🥺\n┃\n┃ 📌 RESPONDA a esta mensagem com:\n┃ 💌 !aceitar-namoro\n┃ 💔 !recusar-namoro\n┃\n┃ ⏳ _(Expira em 5 minutinhos)_ \n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
    const sent = await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });

    db.salvar(aId, { pedidoAmor: { tipo: 'namoro', de: sId, msgId: sent.key.id, expira: Date.now() + 300000 } });
}};