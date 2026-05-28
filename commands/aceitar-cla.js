const db = require('../db');
const claUtils = require('../lib/cla_utils');

module.exports = {
    name: 'aceitar-clã',
    execute: async (sock, msg) => {
        try {
            const sId = db.normalizarId(msg.key.participant || msg.key.remoteJid);
            let user = db.obterUsuario(sId);
            let nomeSender = user.nome || "Usuário";
            const qId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;

            if(!qId) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ RESPONDA à mensagem do convite!" }, { quoted: msg });
            if(!user.pedidoCla) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Sem convites pendentes." }, { quoted: msg });
            if(user.pedidoCla.msgId !== qId) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Responda à mensagem correta!" }, { quoted: msg });
            
            if(Date.now() > user.pedidoCla.expira) { 
                user.pedidoCla = null; db.salvar(sId, user);
                return sock.sendMessage(msg.key.remoteJid, { text: "⏳ O convite expirou." }, { quoted: msg }); 
            }

            if(user.cla) {
                user.pedidoCla = null; db.salvar(sId, user);
                return sock.sendMessage(msg.key.remoteJid, { text: "❌ Você já está em um clã!" }, { quoted: msg }); 
            }

            const clas = claUtils.lerClas();
            const claId = user.pedidoCla.cla;
            const meuCla = clas[claId];

            if(!meuCla) {
                user.pedidoCla = null; db.salvar(sId, user);
                return sock.sendMessage(msg.key.remoteJid, { text: "❌ Esse clã foi desfeito." }, { quoted: msg });
            }
            if(meuCla.membros.length >= 50) {
                user.pedidoCla = null; db.salvar(sId, user);
                return sock.sendMessage(msg.key.remoteJid, { text: "❌ O clã lotou!" }, { quoted: msg });
            }

            user.cla = claId;
            user.pedidoCla = null;
            db.salvar(sId, user);

            // Prevenção de Clone: Verifica se já tá no Array antes de dar push!
            if (!meuCla.membros.includes(sId)) {
                meuCla.membros.push(sId);
                claUtils.salvarClas(clas);
            }

            const moedas = user.moedas || 0;
            const txt = `╭━━━━『 🛡️ 𝑵𝑶𝑽𝑶 𝑴𝑬𝑴𝑩𝑹𝑶 』━━━━╮\n┃ 🎉 *${nomeSender}* entrou!\n┃ ⚔️ Clã: *${meuCla.nomeOriginal}*\n┃ 🌟 Poder VIP: ${moedas.toLocaleString('pt-BR')} 🪙\n┃ 👥 Membros: ${meuCla.membros.length}/50\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
        } catch(e) { console.error(e); }
    }
};
