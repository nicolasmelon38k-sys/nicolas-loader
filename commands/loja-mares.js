const mares = require('../data/mares_pesca');

module.exports = {
    name: 'loja-mares',
    execute: async (sock, msg) => {
        let txt = "╭━━━━━━『 🌊 𝑳𝑶𝑱𝑨 𝑫𝑬 𝑴𝑨𝑹𝑬𝑺 🌊 』━━━━━━╮\n┃\n";
        for (let i = 1; i <= 10; i++) {
            const mar = mares[i];
            const status = mar.preco === 0 ? "GRÁTIS" : `R$ ${mar.preco.toLocaleString('pt-BR')}`;
            txt += `┃ ⟫ *[ID ${i}]* ${mar.nome}\n┃ 💰 Custo da Viagem: ${status}\n┃\n`;
        }
        txt += "┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        txt += "┃ 💡 *Para viajar:* !comprar-mar [ID]\n";
        txt += "┃ 🐟 *Ver todos os peixes:* !peixes-biomas\n";
        txt += "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯";

        await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
    }
};
