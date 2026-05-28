const db = require('../db');
module.exports = { name: 'terminar-casamento', async execute(sock, msg, args) {
    const sId = db.normalizarId(msg.key.participant || msg.key.remoteJid);
    let user = db.obterUsuario(sId);
    let nomeSender = user.nome || "Usuário";

    if(!user.status || !user.status.startsWith('Casado(a) com @')) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Você não está casado(a) para pedir divórcio!" }, { quoted: msg });

    const exId = user.status.replace('Casado(a) com @', '').trim();
    let exUser = db.obterUsuario(exId);
    let nomeEx = exUser ? exUser.nome : "Usuário";
    
    let taxa = (user.dinheiro || 0) / 2;
    db.salvar(sId, { status: "Solteiro(a)", dinheiro: user.dinheiro - taxa }); 
    db.salvar(exId, { status: "Solteiro(a)" });

    const txt = `╭━━━『 📝 𝑫𝑰𝑽𝑶́𝑹𝑪𝑰𝑶 𝑨𝑺𝑺𝑰𝑵𝑨𝑫𝑶 📝 』━━━╮\n┃\n┃ 💔 O conto de fadas afundou.\n┃ *${nomeSender}* assinou os papéis e\n┃ pediu o divórcio para *${nomeEx}*.\n┃\n┃ 💸 A justiça cobrou R$ ${taxa.toLocaleString('pt-BR')} de\n┃ honorários do advogado para limpar\n┃ o nome! ⚖️\n┃\n┃ 🍂 Os dois voltam ao mercado de solteiros.\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
    await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
}};