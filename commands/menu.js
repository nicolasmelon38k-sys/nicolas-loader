const db = require('../db');
const fs = require('fs');
const path = require('path');
const { tabelaCartoes } = require('./cartao');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendSafe(sock, jid, content, options = {}) {
    for (let tentativa = 0; tentativa < 2; tentativa++) {
        try {
            return await sock.sendMessage(jid, content, options);
        } catch (e) {
            const msg = String(e?.message || e || '');
            const reconectando = /Connection Closed|Precondition Required|Connection lost|socket closed|not connected/i.test(msg);

            if (!reconectando || tentativa === 1) {
                throw e;
            }

            await delay(1200 * (tentativa + 1));
        }
    }
}

module.exports = {
    name: 'menu',
    execute: async (sock, msg, args) => {
        try {
            const remetente = msg.key.remoteJid;
            const idRaw = msg.key.participant || msg.key.remoteJid;
            const id = db.normalizarId(idRaw);

            const reis = ['554896669255'];
            const isDono = reis.some(num => id.startsWith(num));

            const user = db.obterUsuario(id) || {
                level: 1,
                banco: 0,
                dinheiro: 0,
                cartaoAtivo: "basico"
            };

            const cartaoAtivo = user.cartaoAtivo || "basico";
            const nomeCartao = (tabelaCartoes && tabelaCartoes[cartaoAtivo]) ? tabelaCartoes[cartaoAtivo].nome : "💳 Básico";

            const videoPath = path.join(__dirname, '../Menu.mp4');
            const linkConta = "https://colleges-favourites-impossible-amount.trycloudflare.com";

            let texto =
`╭━━━━━━━『 𝑫𝑨𝑬𝑴𝑶𝑵-𝑿𝑩𝑶𝑻 』━━━━━━━╮
┃ 👤 *USER:* ${msg.pushName || "User"}
┃ 💵 *CASH:* R$ ${(user.dinheiro || 0).toLocaleString('pt-BR')}
┃ 💳 *CARD:* ${nomeCartao}
┃ 🌐 *ACCOUNT:* ${linkConta}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 🛡️ 『 𝑨𝑫𝑴𝑰𝑵 & 𝑮𝑬𝑹𝑨𝑳 』
┃ ✧ !menu
┃ ✧ !marcar
┃ ✧ !ban
┃ ✧ !adv
┃ ✧ !remover-adv
┃ ✧ !mutar
┃ ✧ !desmutar
┃ ✧ !anti-link
┃ ✧ !anti-spam
┃ ✧ !soa-adm
┃ ✧ !limpar-status
┃ ✧ !afk
┃ ✧ !rename
┃
┃ 💎 『 𝑷𝑬𝑹𝑭𝑰𝑳 & 𝑺𝑻𝑨𝑻𝑼𝑺 』
┃ ✧ !perfil
┃ ✧ !ajudar
┃ ✧ !rank
┃ ✧ !saldo
┃ ✧ !banco
┃ ✧ !inventario
┃ ✧ !ver-empresa
┃ ✧ !verpet
┃
┃ 💰 『 𝑬𝑪𝑶𝑵𝑶𝑴𝑰𝑨 & 𝑱𝑶𝑩𝑺 』
┃ ✧ !trabalhar
┃ ✧ !empregos
┃ ✧ !cargo
┃ ✧ !abandonar
┃ ✧ !depositar
┃ ✧ !sacar
┃ ✧ !pix
┃ ✧ !gerarchave
┃ ✧ !cartao
┃ ✧ !pagarfatura
┃ ✧ !pagar-divida
┃ ✧ !converter
┃
┃ 🛒 『 𝑳𝑶𝑱𝑨𝑺 & 𝑰𝑻𝑬𝑵𝑺 』
┃ ✧ !loja
┃ ✧ !loja2
┃ ✧ !loja3
┃ ✧ !loja-pets
┃ ✧ !loja-peixes
┃ ✧ !loja-minerios
┃ ✧ !comprar
┃ ✧ !vender
┃ ✧ !comer
┃ ✧ !fazer
┃ ✧ !manual-receitas
┃
┃ ⛏️ 『 𝑴𝑰𝑵𝑬𝑹𝑨Ç𝑨̃𝑶 & 𝑷𝑬𝑺𝑪𝑨 』
┃ ✧ !minerar
┃ ✧ !pescar
┃ ✧ !loja-biomas
┃ ✧ !comprar-bioma
┃ ✧ !ver-bioma
┃ ✧ !loja-mares
┃ ✧ !comprar-mar
┃ ✧ !peixes-biomas
┃
┃ 🥂 『 𝑨𝑳𝑰𝑨𝑵Ç𝑨𝑺 & 𝑺𝑶𝑪𝑰𝑨𝑳 』
┃ ✧ !namorar
┃ ✧ !casar
┃ ✧ !aceitar-namoro
┃ ✧ !recusar-namoro
┃ ✧ !aceitar-casamento
┃ ✧ !recusar-casamento
┃ ✧ !terminar-namoro
┃ ✧ !terminar-casamento
┃
┃ 👨‍👩‍👧‍👦 『 𝑭𝑨𝑴𝑰́𝑳𝑰𝑨 』
┃ ✧ !ser-pai
┃ ✧ !ser-mae
┃ ✧ !adotar
┃ ✧ !aceitar-entrar-familia
┃ ✧ !pedir-tio
┃ ✧ !aceitar-tio
┃ ✧ !editar-idade
┃ ✧ !abandonar-familia
┃
┃ 🎰 『 𝑱𝑶𝑮𝑶𝑺 & 𝑨𝑷𝑶𝑺𝑻𝑨𝑺 』
┃ ✧ !tigrinho
┃ ✧ !cassino
┃ ✧ !ppp
┃
┃ 🔫 『 𝑪𝑹𝑰𝑴𝑬𝑺 & 𝑨Ç𝑨̃𝑶 』
┃ ✧ !roubar-banco
┃ ✧ !roubar-carro-forte
┃ ✧ !aceitar-roubo
┃
┃ 🤖 『 𝑰𝑨 & 𝑴𝑰́𝑫𝑰𝑨𝑺 』
┃ ✧ !ai
┃ ✧ !configai
┃ ✧ !play
┃ ✧ !baixar
┃ ✧ !video4k
┃ ✧ !s
┃ ✧ !f`;

            if (isDono) {
                texto +=
`
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 🔐 『 𝑶𝑾𝑵𝑬𝑹 𝑽𝑰𝑷 』
┃ ✧ !money
┃ ✧ !remover-money
┃ ✧ !level
┃ ✧ !remover-level`;
            }

            texto +=
`
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ ⚙️ _v3.0 - Ocean Update_
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

            if (fs.existsSync(videoPath)) {
                try {
                    await sendSafe(sock, remetente, {
                        video: fs.readFileSync(videoPath),
                        caption: texto,
                        gifPlayback: true
                    }, { quoted: msg });
                } catch (e) {
                    await sendSafe(sock, remetente, { text: texto }, { quoted: msg });
                }
            } else {
                await sendSafe(sock, remetente, { text: texto }, { quoted: msg });
            }
        } catch (error) {
            console.log("❌ Erro no Menu:", error);
        }
    }
};
