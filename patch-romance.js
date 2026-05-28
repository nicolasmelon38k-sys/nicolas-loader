const fs = require('fs');
const path = require('path');

console.log("💖 Injetando Patch de Romance V3: Marcação Inteligente e Zero IDs...");

const dir = path.join(__dirname, 'commands');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const arquivos = {
    'namorar.js': `
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

    const txt = \`╭━━━『 🌸 𝑷𝑬𝑫𝑰𝑫𝑶 𝑫𝑬 𝑵𝑨𝑴𝑶𝑹𝑶 🌸 』━━━╮\\n┃\\n┃ ✨ *\${nomeAlvo}*, seu coração foi fisgado!\\n┃ *\${nomeSender}* está muito apaixonado(a) por você!\\n┃\\n┃ 💖 𝑨𝒄𝒆𝒊𝒕𝒂 𝒏𝒂𝒎𝒐𝒓𝒂𝒓 𝒄𝒐𝒎𝒊𝒈𝒐? 🥺\\n┃\\n┃ 📌 RESPONDA a esta mensagem com:\\n┃ 💌 !aceitar-namoro\\n┃ 💔 !recusar-namoro\\n┃\\n┃ ⏳ _(Expira em 5 minutinhos)_ \\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\`;
    const sent = await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });

    db.salvar(aId, { pedidoAmor: { tipo: 'namoro', de: sId, msgId: sent.key.id, expira: Date.now() + 300000 } });
}};`,

    'aceitar-namoro.js': `
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

    db.salvar(sId, { status: \`Namorando com @\${pId}\`, pedidoAmor: null }); 
    db.salvar(pId, { status: \`Namorando com @\${sId}\` });

    const txt = \`╭━━━『 💖 𝑶 𝑨𝑴𝑶𝑹 𝑽𝑬𝑵𝑪𝑬𝑼 💖 』━━━╮\\n┃\\n┃ 🎉 VIVAM OS POMBINHOS! 🎀\\n┃ 💞 *\${nomeSender}* disse SIM para *\${nomePartner}*!\\n┃\\n┃ ✨ Que esse amor seja lindo e floresça\\n┃ cada dia mais! Cuidem-se bem! 🥰\\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯\`;
    await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
}};`,

    'recusar-namoro.js': `
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

    const txt = \`╭━━━『 🥀 𝑪𝑶𝑹𝑨𝑪̧𝑨̃𝑶 𝑷𝑨𝑹𝑻𝑰𝑫𝑶 🥀 』━━━╮\\n┃\\n┃ 💔 Ah não... *\${nomeSender}* recusou\\n┃ o pedido com muito jeitinho...\\n┃\\n┃ 🌧️ Força, *\${nomePartner}*! Foca no\\n┃ seu RPG que logo o amor verdadeiro\\n┃ bate na sua porta! 🧸\\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\`;
    await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
}};`,

    'casar.js': `
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

    if(user.status !== \`Namorando com @\${aId}\`) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Calma aí! Vocês precisam estar NAMORANDO para casar!" }, { quoted: msg });

    const txt = \`╭━━『 💍 𝑷𝑬𝑫𝑰𝑫𝑶 𝑫𝑬 𝑪𝑨𝑺𝑨𝑴𝑬𝑵𝑻𝑶 💍 』━━╮\\n┃\\n┃ ✨ *\${nomeAlvo}*, o amor transbordou!\\n┃ *\${nomeSender}* quer dar o próximo passo!\\n┃\\n┃ 💒 𝑨𝒄𝒆𝒊𝒕𝒂 𝒔𝒆 𝒄𝒂𝒔𝒂𝒓 𝒄𝒐𝒎𝒊𝒈𝒐? 🥺\\n┃\\n┃ 📌 RESPONDA a esta mensagem com:\\n┃ 🥂 !aceitar-casamento\\n┃ 🏃💨 !recusar-casamento\\n┃\\n┃ ⏳ _(O padre espera por 5 minutos)_ \\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\`;
    const sent = await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });

    db.salvar(aId, { pedidoAmor: { tipo: 'casamento', de: sId, msgId: sent.key.id, expira: Date.now() + 300000 } });
}};`,

    'aceitar-casamento.js': `
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

    db.salvar(sId, { status: \`Casado(a) com @\${pId}\`, pedidoAmor: null }); 
    db.salvar(pId, { status: \`Casado(a) com @\${sId}\` });

    const txt = \`╭━━━『 💒 𝑱𝑼𝑺𝑻 𝑴𝑨𝑹𝑹𝑰𝑬𝑫 💒 』━━━╮\\n┃\\n┃ 🎊 CHUVA DE ARROZ! 🥂\\n┃ 💞 *\${nomeSender}* e *\${nomePartner}* agora\\n┃ estão oficialmente CASADOS! 💍\\n┃\\n┃ ✨ Muitas felicidades ao novo\\n┃ casal do grupo! Estão lindos! 🥰\\n╰━━━━━━━━━━━━━━━━━━━━━━━╯\`;
    await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
}};`,

    'recusar-casamento.js': `
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

    const txt = \`╭━━━『 🏃💨 𝑭𝑼𝑮𝑨 𝑵𝑶 𝑨𝑳𝑻𝑨𝑹 🏃💨 』━━━╮\\n┃\\n┃ 💔 Que climão... *\${nomeSender}* não quis\\n┃ casar e fugiu correndo do altar!\\n┃\\n┃ 🥀 *\${nomePartner}*, calma... Vocês ainda\\n┃ estão namorando, mas o susto foi grande! 🥺\\n╰━━━━━━━━━━━━━━━━━━━━━━━╯\`;
    await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
}};`,

    'terminar-namoro.js': `
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

    const txt = \`╭━━『 ⛈️ 𝑭𝑰𝑴 𝑫𝑶 𝑵𝑨𝑴𝑶𝑹𝑶 ⛈️ 』━━╮\\n┃\\n┃ 💔 Tudo tem um fim...\\n┃ *\${nomeSender}* decidiu terminar\\n┃ o namoro com *\${nomeEx}*. 🥀\\n┃\\n┃ 🍂 Ambos estão solteiros e livres\\n┃ na pista novamente. Força aos dois.\\n╰━━━━━━━━━━━━━━━━━━━━━━━╯\`;
    await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
}};`,

    'terminar-casamento.js': `
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

    const txt = \`╭━━━『 📝 𝑫𝑰𝑽𝑶́𝑹𝑪𝑰𝑶 𝑨𝑺𝑺𝑰𝑵𝑨𝑫𝑶 📝 』━━━╮\\n┃\\n┃ 💔 O conto de fadas afundou.\\n┃ *\${nomeSender}* assinou os papéis e\\n┃ pediu o divórcio para *\${nomeEx}*.\\n┃\\n┃ 💸 A justiça cobrou R$ \${taxa.toLocaleString('pt-BR')} de\\n┃ honorários do advogado para limpar\\n┃ o nome! ⚖️\\n┃\\n┃ 🍂 Os dois voltam ao mercado de solteiros.\\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\`;
    await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
}};`
};

for (const [arquivo, conteudo] of Object.entries(arquivos)) {
    fs.writeFileSync(path.join(dir, arquivo), conteudo.trim());
    console.log(`✅ Comando ${arquivo} atualizado para modo Resposta e Sem IDs!`);
}
console.log("🎀 Patch de Romance V3 aplicado! Digite 'node index.js' para iniciar!");
