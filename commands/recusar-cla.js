const db = require('../db');

module.exports = {
    name: 'recusar-clã',
    execute: async (sock, msg) => {
        try {
            const sId = db.normalizarId(msg.key.participant || msg.key.remoteJid);
            let user = db.obterUsuario(sId);
            const qId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;

            if(!qId) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Responda à mensagem do convite!" }, { quoted: msg });
            if(!user.pedidoCla || user.pedidoCla.msgId !== qId) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Convite inválido." }, { quoted: msg });

            user.pedidoCla = null; // SALVAMENTO SEGURO
            db.salvar(sId, user);
            
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ Convite recusado. Lobo solitário!" }, { quoted: msg });
        } catch(e) { console.error(e); }
    }
};
