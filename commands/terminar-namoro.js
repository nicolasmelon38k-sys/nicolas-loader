const db = require('../db');
module.exports = { name: 'terminar-namoro', async execute(sock, msg, args) {
    const sId = db.normalizarId(msg.key.participant || msg.key.remoteJid);
    let user = db.obterUsuario(sId);
    let nomeSender = user.nome || "Usuário";

    if(!user.status || !user.status.startsWith('Namorando com @')) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Você não está namorando ninguém para poder terminar!" }, { quoted: msg });

    const exId = user.status.replace('Namorando com @', '').trim();
    let exUser = db.obterUsuario(exId);
    let nomeEx = exUser ? exUser.nome : "Usuário";

    db.salvar(sId, { status: "Solteiro(a)" }); 
    db.salvar(exId, { status: "Solteiro(a)" });

    const txt = `╭━━『 ⛈️ 𝑭𝑰𝑴 𝑫𝑶 𝑵𝑨𝑴𝑶𝑹𝑶 ⛈️ 』━━╮\n┃\n┃ 💔 Tudo tem um fim...\n┃ *${nomeSender}* decidiu terminar\n┃ o namoro com *${nomeEx}*. 🥀\n┃\n┃ 🍂 Ambos estão solteiros e livres\n┃ na pista novamente. Força aos dois.\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`;
    await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
}};