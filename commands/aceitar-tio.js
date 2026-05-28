const db = require('../db');
module.exports = {
    name: 'aceitar-tio',
    execute: async (sock, msg) => {
        const id = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        const user = db.obterUsuario(id);

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
        if (!quoted) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Você precisa RESPONDER diretamente o convite!" }, { quoted: msg });

        const pedido = user.pedidoFamilia;
        if (!pedido || pedido.msgId !== quoted || pedido.tipo !== 'tio') {
            return sock.sendMessage(msg.key.remoteJid, { text: "❌ Convite inválido." }, { quoted: msg });
        }
        if (Date.now() > pedido.expira) return sock.sendMessage(msg.key.remoteJid, { text: "⏳ O convite expirou!" }, { quoted: msg });

        const paiFamId = pedido.de;
        const paiFam = db.obterUsuario(paiFamId);

        // Define a pessoa como tio
        db.salvar(id, { pedidoFamilia: null, familia: { papel: 'tio' } });

        // Adiciona ao array de tios do criador
        const fFam = paiFam.familia || { tios: [] };
        if (!fFam.tios) fFam.tios = [];
        if (!fFam.tios.includes(id)) fFam.tios.push(id);
        db.salvar(paiFamId, { familia: fFam });

        await sock.sendMessage(msg.key.remoteJid, { text: `🧔 Sucesso! Agora você é Tio/Tia na família de *${paiFam.nome}*!` }, { quoted: msg });
    }
};
