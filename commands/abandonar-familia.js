const db = require('../db');
module.exports = {
    name: 'abandonar-familia',
    execute: async (sock, msg) => {
        const id = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        const user = db.obterUsuario(id);
        
        if (!user.familia) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Você não tem família para abandonar." }, { quoted: msg });

        // Limpeza dos pais se a pessoa for filho
        if (user.familia.pai) {
            let p = db.obterUsuario(user.familia.pai);
            if (p && p.familia && p.familia.filhos) {
                p.familia.filhos = p.familia.filhos.filter(f => f !== id);
                db.salvar(user.familia.pai, { familia: p.familia });
            }
        }
        if (user.familia.mae) {
            let m = db.obterUsuario(user.familia.mae);
            if (m && m.familia && m.familia.filhos) {
                m.familia.filhos = m.familia.filhos.filter(f => f !== id);
                db.salvar(user.familia.mae, { familia: m.familia });
            }
        }

        // Limpeza dos filhos se a pessoa for pai/mãe
        if (user.familia.filhos && user.familia.filhos.length > 0) {
            for (let fId of user.familia.filhos) {
                let f = db.obterUsuario(fId);
                if (f && f.familia) {
                    if (user.familia.papel === 'pai') f.familia.pai = null;
                    if (user.familia.papel === 'mae') f.familia.mae = null;
                    db.salvar(fId, { familia: f.familia });
                }
            }
        }

        db.salvar(id, { familia: null });
        await sock.sendMessage(msg.key.remoteJid, { text: "💔 Você abandonou sua família e agora é uma alma solitária..." }, { quoted: msg });
    }
};
