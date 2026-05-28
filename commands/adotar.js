const db = require('../db');
module.exports = {
    name: 'adotar',
    execute: async (sock, msg) => {
        const sId = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        const user = db.obterUsuario(sId);
        
        if (!user) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Seu perfil não existe, mande !menu." }, { quoted: msg });
        if (!user.familia || (user.familia.papel !== 'pai' && user.familia.papel !== 'mae')) {
            return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Você precisa ser Pai ou Mãe para adotar. Use `!ser-pai` ou `!ser-mae`." }, { quoted: msg });
        }

        let aJid = null;
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentions.length > 0) aJid = mentions[0];
        else if (msg.message?.extendedTextMessage?.contextInfo?.participant) aJid = msg.message.extendedTextMessage.contextInfo.participant;

        if (!aJid) return sock.sendMessage(msg.key.remoteJid, { text: "👶 Marque a pessoa que quer adotar! Ex: !adotar @usuario" }, { quoted: msg });

        const aId = db.normalizarId(aJid);
        if (sId === aId) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Você não pode adotar a si mesmo!" }, { quoted: msg });

        const txt = `╭━━『 👶 𝑷𝑬𝑫𝑰𝑫𝑶 𝑫𝑬 𝑨𝑫𝑶Ç𝑨̃𝑶 』━━╮\n┃\n┃ ✨ *${user.nome}* quer te adotar!\n┃\n┃ 📌 RESPONDA a esta mensagem com:\n┃ 🍼 !aceitar-entrar-familia\n┃\n┃ ⏳ _(O orfanato fecha em 5 minutos)_ \n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
        const sent = await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });

        db.salvar(aId, { pedidoFamilia: { tipo: 'adocao', de: sId, msgId: sent.key.id, expira: Date.now() + 300000 } });
    }
};
