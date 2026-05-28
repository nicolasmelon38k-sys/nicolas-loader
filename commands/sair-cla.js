const db = require('../db');
const claUtils = require('../lib/cla_utils');

module.exports = {
    name: 'sair-clã',
    execute: async (sock, msg) => {
        try {
            const remetente = msg.key.remoteJid;
            const id = db.normalizarId(msg.key.participant || remetente);
            let user = db.obterUsuario(id);
            
            if (!user || !user.cla) return sock.sendMessage(remetente, { text: "❌ Você não está em nenhum clã!" }, { quoted: msg });

            const clas = claUtils.lerClas();
            const meuCla = clas[user.cla];

            if (meuCla && meuCla.dono === id) {
                return sock.sendMessage(remetente, { text: "❌ Você é o líder! Passe a liderança ou use !apagar-clã." }, { quoted: msg });
            }

            if (meuCla) {
                const index = meuCla.membros.indexOf(id);
                if (index !== -1) {
                    meuCla.membros.splice(index, 1);
                    claUtils.salvarClas(clas);
                }
            }

            user.cla = null;
            db.salvar(id, user);

            await sock.sendMessage(remetente, { text: `🚶‍♂️ Você saiu da guilda e seguiu seu próprio caminho.` }, { quoted: msg });
        } catch(e) { console.error(e); }
    }
};
