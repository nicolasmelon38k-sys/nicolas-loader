const db = require('../db');
const claUtils = require('../lib/cla_utils');

module.exports = {
    name: 'remover-clã',
    execute: async (sock, msg) => {
        try {
            const remetente = msg.key.remoteJid;
            const id = db.normalizarId(msg.key.participant || remetente);
            let user = db.obterUsuario(id);
            if (!user || !user.cla) return sock.sendMessage(remetente, { text: "❌ Você não tem clã!" }, { quoted: msg });

            const clas = claUtils.lerClas();
            const meuCla = clas[user.cla];
            if (!meuCla || meuCla.dono !== id) return sock.sendMessage(remetente, { text: "❌ Só o dono expulsa!" }, { quoted: msg });

            let targetId = msg.message?.extendedTextMessage?.contextInfo?.participant || msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            if (!targetId) return sock.sendMessage(remetente, { text: "❌ Marque/responda quem quer expulsar!" }, { quoted: msg });
            targetId = db.normalizarId(targetId);

            if (targetId === id) return sock.sendMessage(remetente, { text: "❌ Use !apagar-clã para destruir tudo." }, { quoted: msg });

            const index = meuCla.membros.indexOf(targetId);
            if (index === -1) return sock.sendMessage(remetente, { text: "❌ Jogador não está no clã." }, { quoted: msg });

            let targetUser = db.obterUsuario(targetId);
            if (targetUser) { 
                targetUser.cla = null; 
                db.salvar(targetId, targetUser); 
            }

            meuCla.membros.splice(index, 1);
            claUtils.salvarClas(clas);

            await sock.sendMessage(remetente, { text: `👢 @${targetId.split('@')[0]} foi banido do clã.`, mentions: [targetId] }, { quoted: msg });
        } catch(e) { console.error(e); }
    }
};
