const db = require('../db');
module.exports = { name: 'casar', async execute(sock, msg, args) {
    const sId = db.normalizarId(msg.key.participant || msg.key.remoteJid);
    let user = db.obterUsuario(sId);
    let nomeSender = user.nome || "Usuário";

    let aJid = null;
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

    if(mentions.length > 0) aJid = mentions[0];
    else if(quotedParticipant) aJid = quotedParticipant;

    if(!aJid) return sock.sendMessage(msg.key.remoteJid, { text: "💍 Ei, marque ou RESPONDA a mensagem do amor da sua vida! Ex: !casar" }, { quoted: msg });
    
    const aId = db.normalizarId(aJid);
    let alvo = db.obterUsuario(aId);
    let nomeAlvo = alvo ? alvo.nome : "Usuário";

    if(user.status !== `Namorando com @${aId}`) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Calma aí! Vocês precisam estar NAMORANDO para casar!" }, { quoted: msg });

    const txt = `╭━━『 💍 𝑷𝑬𝑫𝑰𝑫𝑶 𝑫𝑬 𝑪𝑨𝑺𝑨𝑴𝑬𝑵𝑻𝑶 💍 』━━╮\n┃\n┃ ✨ *${nomeAlvo}*, o amor transbordou!\n┃ *${nomeSender}* quer dar o próximo passo!\n┃\n┃ 💒 𝑨𝒄𝒆𝒊𝒕𝒂 𝒔𝒆 𝒄𝒂𝒔𝒂𝒓 𝒄𝒐𝒎𝒊𝒈𝒐? 🥺\n┃\n┃ 📌 RESPONDA a esta mensagem com:\n┃ 🥂 !aceitar-casamento\n┃ 🏃💨 !recusar-casamento\n┃\n┃ ⏳ _(O padre espera por 5 minutos)_ \n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
    const sent = await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });

    db.salvar(aId, { pedidoAmor: { tipo: 'casamento', de: sId, msgId: sent.key.id, expira: Date.now() + 300000 } });
}};