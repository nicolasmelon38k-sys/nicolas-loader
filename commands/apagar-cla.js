const db = require('../db');
const claUtils = require('../lib/cla_utils');

module.exports = {
    name: 'apagar-clã',
    execute: async (sock, msg) => {
        try {
            const remetente = msg.key.remoteJid;
            const id = db.normalizarId(msg.key.participant || remetente);
            let user = db.obterUsuario(id);
            if (!user || !user.cla) return sock.sendMessage(remetente, { text: "❌ Você não está em nenhum clã!" }, { quoted: msg });

            const clas = claUtils.lerClas();
            const claId = user.cla;
            const meuCla = clas[claId];
            
            if (!meuCla || meuCla.dono !== id) return sock.sendMessage(remetente, { text: "❌ Apenas o DONO pode apagar o clã!" }, { quoted: msg });

            const nome = meuCla.nomeOriginal;
            
            // Remove o clã do perfil de TODOS os membros para evitar contas orfãs
            for (let membroId of meuCla.membros) {
                let m = db.obterUsuario(membroId);
                if (m) {
                    m.cla = null;
                    db.salvar(membroId, m);
                }
            }

            delete clas[claId];
            claUtils.salvarClas(clas);

            await sock.sendMessage(remetente, { text: `💥 O clã *${nome}* foi destruído. Todos os membros estão soltos.` }, { quoted: msg });
        } catch(e) { console.error(e); }
    }
};
