const db = require('../db');
const claUtils = require('../lib/cla_utils');

module.exports = {
    name: 'convidar-clã',
    execute: async (sock, msg) => {
        try {
            const sId = db.normalizarId(msg.key.participant || msg.key.remoteJid);
            let user = db.obterUsuario(sId);
            let nomeSender = user.nome || "Usuário";

            if (!user || !user.cla) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Você não tem um clã!" }, { quoted: msg });
            const clas = claUtils.lerClas();
            const meuCla = clas[user.cla];
            if (!meuCla || meuCla.dono !== sId) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Só o dono pode enviar convites!" }, { quoted: msg });

            let aJid = null;
            const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
            if(mentions.length > 0) aJid = mentions[0];
            else if(quotedParticipant) aJid = quotedParticipant;

            if(!aJid) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Marque ou responda a pessoa!" }, { quoted: msg });
            const aId = db.normalizarId(aJid);
            if(sId === aId) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Convidando a si mesmo?" }, { quoted: msg });

            let alvo = db.obterUsuario(aId);
            if(!alvo) { db.registrar(aId, "Usuário"); alvo = db.obterUsuario(aId); }
            let nomeAlvo = alvo.nome || "Usuário";

            if(alvo.cla) return sock.sendMessage(msg.key.remoteJid, { text: `❌ ${nomeAlvo} já tem clã!` }, { quoted: msg });
            if(meuCla.membros.length >= 50) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Seu clã está cheio! (Máx: 50)" }, { quoted: msg });
            
            // Impede sobreposição de convites
            if(alvo.pedidoCla && Date.now() < alvo.pedidoCla.expira) {
                return sock.sendMessage(msg.key.remoteJid, { text: "⏳ O usuário já tem um convite pendente. Aguarde expirar." }, { quoted: msg });
            }

            const txt = `╭━━━『 🛡️ 𝑪𝑶𝑵𝑽𝑰𝑻𝑬 』━━━╮\n┃ ✨ *${nomeAlvo}*, convocado!\n┃ O líder *${nomeSender}* chamou você para \n┃ a guilda *${meuCla.nomeOriginal}*!\n┃\n┃ 📌 RESPONDA esta mensagem com:\n┃ ✅ !aceitar-clã\n┃ ❌ !recusar-clã\n┃ ⏳ _(Expira em 5 mins)_\n╰━━━━━━━━━━━━━━━━━━━━╯`;
            const sent = await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });

            // ATENÇÃO: Salvamento 100% SEGURO. Não apaga a conta do cara!
            alvo.pedidoCla = { cla: user.cla, de: sId, msgId: sent.key.id, expira: Date.now() + 300000 };
            db.salvar(aId, alvo);
        } catch(e) { console.error(e); }
    }
};
