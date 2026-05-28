const fs = require('fs');
const db = require('../db');
const { isGroupAdmin } = require('../lib/permissoes');

module.exports = {
    name: 'mutar',
    execute: async (sock, msg, args) => {
        const chatId = msg.key.remoteJid;
        if (!chatId.endsWith('@g.us')) return;

        const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;
        const isAdmin = await isGroupAdmin(sock, chatId, senderJid);
        const isDonoBot = db.normalizarId(senderJid) === '554896669255';

        if (!isAdmin && !isDonoBot && !msg.key.fromMe) {
            return await sock.sendMessage(chatId, { text: "🚫 Apenas Admins podem mutar." }, { quoted: msg });
        }

        let aJid = null;
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentions.length > 0) aJid = mentions[0];
        else if (msg.message?.extendedTextMessage?.contextInfo?.participant) aJid = msg.message.extendedTextMessage.contextInfo.participant;

        if (!aJid) return await sock.sendMessage(chatId, { text: "⚠️ Marque ou responda quem você quer mutar!" }, { quoted: msg });

        const gruposPath = './grupos.json';
        if (!fs.existsSync(gruposPath)) fs.writeFileSync(gruposPath, JSON.stringify({}));
        const grupos = JSON.parse(fs.readFileSync(gruposPath, 'utf8'));
        
        let configGrupo = grupos[chatId] || {};
        let mutados = configGrupo.mutados || [];
        
        if (!mutados.includes(aJid)) mutados.push(aJid);
        configGrupo.mutados = mutados;
        grupos[chatId] = configGrupo;
        
        fs.writeFileSync(gruposPath, JSON.stringify(grupos, null, 2));
        await sock.sendMessage(chatId, { text: `🤐 *Silêncio!* O usuário @${aJid.split('@')[0]} foi mutado. Tudo que ele disser será apagado na velocidade da luz.`, mentions: [aJid] });
    }
};
