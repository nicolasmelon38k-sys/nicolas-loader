const db = require('../db');
module.exports = {
    name: 'editar-idade',
    execute: async (sock, msg, args) => {
        const id = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        const user = db.obterUsuario(id);
        
        if (!user.familia || (user.familia.papel !== 'filho' && user.familia.papel !== 'filha')) {
            return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Você precisa ser filho(a) de alguém para ter idade." }, { quoted: msg });
        }

        const novaIdade = parseInt(args[0]);
        if (isNaN(novaIdade) || novaIdade < 1 || novaIdade > 40) {
            return sock.sendMessage(msg.key.remoteJid, { text: "❌ Idade inválida! Escolha um número entre *1 e 40*." }, { quoted: msg });
        }

        user.familia.idade = novaIdade;
        db.salvar(id, { familia: user.familia });
        await sock.sendMessage(msg.key.remoteJid, { text: `🎂 Sua idade foi atualizada para *${novaIdade} anos*!` }, { quoted: msg });
    }
};
