const db = require('../db');
module.exports = {
    name: 'pedir-tio',
    execute: async (sock, msg) => {
        const sId = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        const user = db.obterUsuario(sId);
        
        if (!user.familia || (user.familia.papel !== 'pai' && user.familia.papel !== 'mae')) {
            return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Você precisa ser Pai/Mãe para convidar tios para sua família." }, { quoted: msg });
        }

        let aJid = null;
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentions.length > 0) aJid = mentions[0];
        else if (msg.message?.extendedTextMessage?.contextInfo?.participant) aJid = msg.message.extendedTextMessage.contextInfo.participant;

        if (!aJid) return sock.sendMessage(msg.key.remoteJid, { text: "🧔 Marque quem você quer como Tio/Tia! Ex: !pedir-tio @usuario" }, { quoted: msg });
        
        const aId = db.normalizarId(aJid);
        const txt = `╭━━『 🧔 𝑪𝑶𝑵𝑽𝑰𝑻𝑬 𝑷𝑨𝑹𝑨 𝑻𝑰𝑶(𝑨) 』━━╮\n┃\n┃ ✨ *${user.nome}* te convidou para ser da família!\n┃\n┃ 📌 RESPONDA a esta mensagem com:\n┃ 🥂 !aceitar-tio\n┃\n┃ ⏳ _(Expira em 5 minutos)_ \n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
        const sent = await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });

        db.salvar(aId, { pedidoFamilia: { tipo: 'tio', de: sId, msgId: sent.key.id, expira: Date.now() + 300000 } });
    }
};
