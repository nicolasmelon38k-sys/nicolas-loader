const fs = require('fs');
const db = require('../db');
const { isGroupAdmin } = require('../lib/permissoes');

module.exports = {
    name: 'desmutar',
    execute: async (sock, msg, args) => {
        const chatId = msg.key.remoteJid;
        if (!chatId.endsWith('@g.us')) return;

        const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;
        const isAdmin = await isGroupAdmin(sock, chatId, senderJid);
        const isDonoBot = db.normalizarId(senderJid) === '554896669255';

        if (!isAdmin && !isDonoBot && !msg.key.fromMe) return;

        let aJid = null;
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentions.length > 0) aJid = mentions[0];
        else if (msg.message?.extendedTextMessage?.contextInfo?.participant) aJid = msg.message.extendedTextMessage.contextInfo.participant;

        if (!aJid) return await sock.sendMessage(chatId, { text: "⚠️ Marque ou responda quem você quer desmutar!" }, { quoted: msg });

        const gruposPath = './grupos.json';
        if (!fs.existsSync(gruposPath)) fs.writeFileSync(gruposPath, JSON.stringify({}));
        const grupos = JSON.parse(fs.readFileSync(gruposPath, 'utf8'));
        
        let configGrupo = grupos[chatId] || {};
        let mutados = configGrupo.mutados || [];
        
        configGrupo.mutados = mutados.filter(id => id !== aJid);
        grupos[chatId] = configGrupo;
        
        fs.writeFileSync(gruposPath, JSON.stringify(grupos, null, 2));
        await sock.sendMessage(chatId, { text: `🔊 O usuário @${aJid.split('@')[0]} foi desmutado e já pode falar!`, mentions: [aJid] });
    }
};
