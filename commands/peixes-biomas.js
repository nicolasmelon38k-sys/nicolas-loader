const mares = require('../data/mares_pesca');
const produtos = require('../data/produtos');

module.exports = {
    name: 'peixes-biomas',
    execute: async (sock, msg) => {
        let txt = "╭━━━━『 📖 𝑬𝑵𝑪𝑰𝑪𝑳𝑶𝑷𝑬́𝑫𝑰𝑨 𝑴𝑨𝑹𝑰𝑵𝑯𝑨 』━━━━╮\n┃\n";

        for (let i = 2; i <= 10; i++) {
            const mar = mares[i];
            txt += `┃ ${mar.nome}\n`;
            const rars = Object.keys(mar.peixes);
            for (let rar of rars) {
                const fishIds = mar.peixes[rar];
                for (let fId of fishIds) {
                    txt += `┃ ⟫ ${produtos[fId].nome} (${rar})\n`;
                }
            }
            txt += "┃\n";
        }
        txt += "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯";

        await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg });
    }
};
