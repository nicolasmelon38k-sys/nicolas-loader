const db = require('../db');
let petsDb = {};
try { petsDb = require('../data/pets'); } catch(e){}

module.exports = {
    name: 'verpet',
    execute: async (sock, msg) => {
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(id);

        if (!user || !user.inventario) return sock.sendMessage(remetente, { text: "❌ Você não tem nenhum pet." }, { quoted: msg });

        let meuPet = null;

        // Vasculha o inventário para encontrar o Pet com o maior bônus
        for (let item of user.inventario) {
            if (petsDb[item]) {
                if (!meuPet || petsDb[item].bonus > meuPet.bonus) {
                    meuPet = petsDb[item];
                    meuPet.nome = item;
                }
            }
        }

        if (!meuPet) return sock.sendMessage(remetente, { text: "❌ Você não tem nenhum pet na mochila!\nCompre um na *!loja-pets*" }, { quoted: msg });

        const layout = `╭━━━━━━━『 🐾 𝑴𝑬𝑼 𝑷𝑬𝑻 』━━━━━━━╮
┃
┃ ${meuPet.icone} *Nome:* ${meuPet.nome}
┃ 🌟 *Raridade:* ${meuPet.raridade}
┃ 💼 *Bônus de Trabalho:* + R$ ${meuPet.bonus.toLocaleString('pt-BR')}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(remetente, { text: layout }, { quoted: msg });
    }
};