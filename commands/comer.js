const db = require('../db');
const produtos = require('../data/produtos');
const receitas = require('../data/receitas');

module.exports = {
    name: 'comer',
    execute: async (sock, msg, args) => {
        const idItem = args[0];
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(id);

        if (!user || !user.inventario) return;

        let item = produtos[idItem];
        let isPrato = false;

        if (!item && receitas[idItem]) {
            item = receitas[idItem];
            isPrato = true;
        }

        if (!item) return sock.sendMessage(remetente, { text: "❌ ID inválido. Olhe os IDs no !inventario." }, { quoted: msg });

        const index = user.inventario.indexOf(item.nome);
        if (index === -1) {
            return sock.sendMessage(remetente, { text: `❌ Você não tem *${item.nome}* na mochila!` }, { quoted: msg });
        }

        let fomeAtual = user.fome !== undefined ? user.fome : 10000;
        if (fomeAtual >= 10000) {
            return sock.sendMessage(remetente, { text: `🛑 Você já está de barriga cheia! (10.000/10.000)` }, { quoted: msg });
        }

        // Tira 1 da mochila
        user.inventario.splice(index, 1);

        // 🛡️ LÓGICA CORRIGIDA: Tudo de 31 a 85 (Tech, Lar, Skincare) não é de comer!
        const idNum = parseInt(idItem);
        const isInedible = (idNum >= 31 && idNum <= 85);

        if (isInedible) {
            let multa = 500;
            let cobrado = 0;
            if ((user.dinheiro || 0) >= multa) {
                user.dinheiro -= multa;
                cobrado = multa;
            } else {
                cobrado = user.dinheiro || 0;
                let resto = multa - cobrado;
                user.dinheiro = 0;
                user.divida = (user.divida || 0) + resto;
            }
            db.salvar(id, user);
            return sock.sendMessage(remetente, { text: `🤢 *ECA!* Você tentou mastigar *${item.nome}* e passou mal / quebrou os dentes!\n\n🏥 *Conta do Hospital/Dentista:* R$ 500,00\n💸 Dinheiro cobrado na hora: R$ ${cobrado}\n🚨 Dívida pendente (SPC): R$ ${multa - cobrado}` }, { quoted: msg });
        }

        // 😋 Recuperação de Fome Dinâmica
        let recupera = 0;
        if (idNum >= 517 && idNum <= 530) recupera = 8000; // 👑 Pratos VIPs enchem quase tudo na hora!
        else if (isPrato) recupera = 1000; // Pratos Restauram Metade da fome
        else if (idNum >= 11 && idNum <= 20) recupera = 500; // Carnes
        else recupera = 200; // Frutas e Hortifruti

        fomeAtual = Math.min(10000, fomeAtual + recupera);
        user.fome = fomeAtual;
        db.salvar(id, user);

        let luxo = (idNum >= 517 && idNum <= 530) ? "👑 Você jantou como um magnata!" : "😋 Você saboreou sua refeição!";
        await sock.sendMessage(remetente, { text: `${luxo}\n🍽️ Prato: *${item.nome}*\n🍗 Fome saciada: +${recupera}\n📊 Fome atual: ${fomeAtual.toLocaleString('pt-BR')}/10.000` }, { quoted: msg });
    }
};
