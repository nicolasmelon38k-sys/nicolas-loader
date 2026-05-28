const db = require('../db');
module.exports = {
    name: 'ser-pai',
    execute: async (sock, msg) => {
        const id = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        const user = db.obterUsuario(id);
        if (!user) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Mande um `!menu` antes de tentar virar pai para registrar seu perfil." }, { quoted: msg });
        const fam = user.familia || { filhos: [], tios: [] };
        if (fam.papel === 'filho' || fam.papel === 'filha') return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Você é um filho! Use !abandonar-familia antes." }, { quoted: msg });
        fam.papel = 'pai';
        db.salvar(id, { familia: fam });
        await sock.sendMessage(msg.key.remoteJid, { text: "👨 Agora você tem a certidão de *Pai*! Use `!adotar @usuario` para ter filhos." }, { quoted: msg });
    }
};
