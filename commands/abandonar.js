const db = require('../db');

module.exports = {
    name: 'abandonar',
    execute: async (sock, msg) => {
        const id = msg.key.participant || msg.key.remoteJid;
        const user = db.obterUsuario(id);

        if (!user) return;

        if (!user.emprego || user.emprego === 'Auxiliar Geral' || user.emprego === 'Desempregado') {
            return sock.sendMessage(msg.key.remoteJid, { text: "ℹ️ Você já está sem cargo (Auxiliar Geral)." });
        }

        db.salvar(id, { emprego: 'Auxiliar Geral' });
        await sock.sendMessage(msg.key.remoteJid, { text: "✅ Cargo abandonado com sucesso! Agora você é um *Auxiliar Geral*." });
    }
};
