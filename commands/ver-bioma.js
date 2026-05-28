const db = require('../db');
const biomas = require('../data/biomas');

module.exports = {
    name: 'ver-bioma',
    execute: async (sock, msg) => {
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(id);

        const biomaAtual = user?.biomaAtivo ? biomas[user.biomaAtivo] : null;
        
        let txt = "╭━━━━━━━━『 🌍 𝑺𝑬𝑼 𝑩𝑰𝑶𝑴𝑨 𝑨𝑻𝑼𝑨𝑳 』━━━━━━━╮\n┃\n";
        
        if (biomaAtual) {
            txt += "┃ 📍 *LOCAL:* " + biomaAtual.nome + "\n" +
                   "┃ 👑 *STATUS:* Proprietário\n" +
                   "┃ 📈 *BÔNUS ATIVO:* " + (biomaAtual.bonus * 100) + "% no loot (" + biomaAtual.buff + ")\n";
        } else {
            txt += "┃ 📍 *LOCAL:* SUPERFÍCIE COMUM\n" +
                   "┃ 👑 *STATUS:* Minerador Novato\n" +
                   "┃ 📈 *BÔNUS ATIVO:* Nenhum\n" +
                   "┃\n┃ _Compre áreas exclusivas em !loja-biomas_\n";
        }
        
        txt += "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯";
        await sock.sendMessage(remetente, { text: txt }, { quoted: msg });
    }
};
