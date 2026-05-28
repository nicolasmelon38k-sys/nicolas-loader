const receitas = require('../data/receitas');

module.exports = {
    name: 'manual-receitas',
    execute: async (sock, msg) => {
        let texto = `╭━━━━━━━『 👨‍🍳 𝑴𝑨𝑵𝑼𝑨𝑳 𝑫𝑬 𝑪𝑼𝑳𝑰𝑵𝑨́𝑹𝑰𝑨 』━━━━━━━╮\n┃\n┃ ✨ *Cozinhe suas compras e lucre mais!*\n┃ Use: !fazer-receita [ID]\n┃\n┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n┃\n`;
        
        for (const [id, r] of Object.entries(receitas)) {
            texto += `┃ ⟫ *[${id}] ${r.nome}*\n┃ 📦 _Gasta:_ ${r.ingredientes.join(" + ")}\n┃\n`;
        }
        
        texto += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};
