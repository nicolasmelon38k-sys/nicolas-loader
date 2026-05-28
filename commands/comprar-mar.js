const db = require('../db');
const mares = require('../data/mares_pesca');

module.exports = {
    name: 'comprar-mar',
    execute: async (sock, msg, args) => {
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(id);
        if (!user) return;

        const marId = args[0];
        if (!marId || !mares[marId]) {
            return sock.sendMessage(remetente, { text: "❌ *ID inválido!* Use `!loja-mares` para ver os mares disponíveis." }, { quoted: msg });
        }

        const mar = mares[marId];

        if ((user.marPesca || "1") === marId) {
            return sock.sendMessage(remetente, { text: `✅ Você já está pescando em: *${mar.nome}*` }, { quoted: msg });
        }

        if ((user.dinheiro || 0) < mar.preco) {
            return sock.sendMessage(remetente, { text: `❌ *Dinheiro insuficiente!*\nVocê precisa de R$ ${mar.preco.toLocaleString('pt-BR')} na carteira para essa viagem.` }, { quoted: msg });
        }

        user.dinheiro -= mar.preco;
        user.marPesca = marId;
        db.salvar(id, user);

        const txt = `╭━━━━━━『 ⚓ 𝑽𝑰𝑨𝑮𝑬𝑴 𝑪𝑶𝑵𝑪𝑳𝑼𝑰́𝑫𝑨 』━━━━━━╮\n` +
                    `┃ ✅ Você navegou para: *${mar.nome}*\n` +
                    `┃ 💸 Custo da Passagem: R$ ${mar.preco.toLocaleString('pt-BR')}\n` +
                    `┃ 🐟 Novos peixes místicos desbloqueados!\n` +
                    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(remetente, { text: txt }, { quoted: msg });
    }
};
