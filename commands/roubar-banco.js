const db = require('../db');
const { executarRoubo } = require('../systems/heist');

module.exports = {
    name: 'roubar-banco',
    execute: async (sock, msg, args) => {
        const senderId = msg.key.participant;
        const user = db.obterUsuario(senderId);
        const remetente = msg.key.remoteJid;

        const cooldown = 5 * 60 * 1000; // 5 minutos
        const agora = Date.now();
        if (agora - (user.ultimoBanco || 0) < cooldown) {
            const restante = cooldown - (agora - user.ultimoBanco);
            const min = Math.floor(restante / 60000);
            const seg = Math.floor((restante % 60000) / 1000);
            return sock.sendMessage(remetente, { text: `⏳ O banco reforçou a segurança! Espere ${min}m ${seg}s.` }, { quoted: msg });
        }

        db.salvar(senderId, { ultimoBanco: agora });

        // Pega até 3 parceiros (Equipe de 4 contando com o líder)
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const convidadosRaw = [...new Set(mentions)].filter(id => id !== senderId).slice(0, 3);

        if (convidadosRaw.length === 0) {
            return await executarRoubo(sock, remetente, 'banco', [senderId]);
        }

        const convidadosIds = convidadosRaw.map(id => db.normalizarId(id));
        const nomesConvidados = convidadosIds.map(id => db.obterUsuario(id)?.nome || 'Aventureiro');

        const texto = `🏦 *GRANDE ASSALTO AO BANCO!* 🏦\n\n👤 *${user.nome}* precisa de um esquadrão pesado para invadir o cofre central!\n\n👥 *Convocados:* ${nomesConvidados.join(', ')}\n\n👉 *Como entrar:* Respondam a esta exata mensagem com o comando:\n!aceitar-roubo`;

        const sentMsg = await sock.sendMessage(remetente, { text: texto, mentions: convidadosRaw }, { quoted: msg });

        global.activeHeists = global.activeHeists || new Map();
        global.activeHeists.set(sentMsg.key.id, {
            tipo: 'banco',
            lider: senderId,
            convidados: convidadosIds,
            aceitos: [senderId],
            chatId: remetente,
            timer: setTimeout(() => {
                if (global.activeHeists.has(sentMsg.key.id)) {
                    sock.sendMessage(remetente, { text: `⏳ A polícia cercou o quarteirão! O assalto foi cancelado por demora.` }, { quoted: sentMsg });
                    global.activeHeists.delete(sentMsg.key.id);
                }
            }, 5 * 60 * 1000)
        });
    }
};
