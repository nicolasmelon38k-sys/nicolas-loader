const db = require('../db');
const fs = require('fs');
const path = require('path');
const { tabelaCartoes } = require('./cartao');

module.exports = {
    name: 'menu',
    execute: async (sock, msg, args) => {
        try {
            const remetente = msg.key.remoteJid;
            const idRaw = msg.key.participant || remetente;
            const id = db.normalizarId(idRaw);

            const reis = ['554896669255'];
            const isDono = reis.some(num => id.startsWith(num));

            let user = db.obterUsuario(id) || { level: 1, banco: 0, dinheiro: 0, cartaoAtivo: "basico" };
            const cartaoAtivo = user.cartaoAtivo || "basico";
            const nomeCartao = (tabelaCartoes && tabelaCartoes[cartaoAtivo]) ? tabelaCartoes[cartaoAtivo].nome : "💳 Básico";

            // Corrigido aqui para "Menu.mp4" com M maiúsculo para bater com o arquivo da raiz
            const videoPath = path.join(__dirname, '../Menu.mp4');
            const linkConta = "https://colleges-favourites-impossible-amount.trycloudflare.com";

            let texto = `╭━━━━━━━『 𝑫𝑨𝑬𝑴𝑶𝑵-𝑿𝑩𝑶𝑻 』━━━━━━━╮
┃ 👤 *USER:* ${msg.pushName || "User"}
┃ 💵 *CASH:* R$ ${(user.dinheiro || 0).toLocaleString('pt-BR')}
┃ 💳 *CARD:* ${nomeCartao}
┃ 🌐 *ACCOUNT:* ${linkConta}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 🛡️ 『 𝑨𝑫𝑴𝑰𝑵𝑰𝑺𝑻𝑹𝑨𝑪̧𝑨̃𝑶 』
┃ ✧ !anti-link [1/0] - Segurança
┃ ✧ !ban - Remover membros
┃ ✧ !marcar - Chamada geral
┃
┃ 💎 『 𝑷𝑬𝑹𝑭𝑰𝑳 & 𝑹𝑷𝑮 』
┃ ✧ !perfil - Status da account
┃ ✧ !rank - Top globais
┃ ✧ !inventario - Seus itens
┃ ✧ !comer [ID] - Saciar fome
┃ ✧ !afk - Modo ausente
┃
┃ 💖 『 𝑹𝑶𝑴𝑨𝑵𝑪𝑬 』
┃ ✧ !namorar / !casar
┃ ✧ !terminar-namoro
┃ ✧ !terminar-casamento
┃
┃ 💰 『 𝑬𝑪𝑶𝑵𝑶𝑴𝑰𝑨 』
┃ ✧ !ver-empresa - Seu império
┃ ✧ !trabalhar - Ganhar grana
┃ ✧ !empregos - Lista de jobs
┃ ✧ !banco - Saldo total
┃ ✧ !depositar/!sacar - Gestão
┃ ✧ !pix - Transferir
┃ ✧ !pagarfatura - Quitar cartão
┃
┃ 🎰 『 𝑨𝑷𝑶𝑺𝑻𝑨𝑺 』
┃ ✧ !tigrinho - Slots 3x3
┃ ✧ !cassino - Sorte/Azar
┃
┃ 🔫 『 𝑪𝑹𝑰𝑴𝑬𝑺 』
┃ ✧ !roubar-banco - Assalto
┃ ✧ !roubar-carro-forte - Comboio
┃
┃ 🤖 『 𝑴𝑬́𝑫𝑰𝑨 & 𝑰𝑨 』
┃ ✧ !ai - Inteligência Artificial
┃ ✧ !play/!baixar - Download
┃ ✧ !s/!f - Figurinhas
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

            if (isDono) {
                texto += `\n┃ 🔐 『 𝑶𝑾𝑵𝑬𝑹 𝑽𝑰𝑷 』
┃ ✧ !money - Alterar saldo
┃ ✧ !remover-money - Retirar cash
┃ ✧ !level - Alterar nível
┃ ✧ !remover-level - Resetar XP
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
            }

            texto += `\n┃ ⚙️ _v2.6 - Romance Update_
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

            if (fs.existsSync(videoPath)) {
                await sock.sendMessage(remetente, {
                    video: fs.readFileSync(videoPath),
                    caption: texto,
                    gifPlayback: true
                }, { quoted: msg });
            } else {
                await sock.sendMessage(remetente, { text: texto }, { quoted: msg });
            }
        } catch (error) {
            console.log("❌ Erro no Menu:", error);
        }
    }
};

