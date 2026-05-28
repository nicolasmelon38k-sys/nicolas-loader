const db = require('../db');
const produtos = require('../data/produtos');
const receitas = require('../data/receitas');

const tabelaCartoes = {
    "basico": { nome: "💳 Básico", limite: 500, anuidade: 0 },
    "gold": { nome: "💳 Gold", limite: 2500, anuidade: 50 },
    "platinum": { nome: "💳 Platinum", limite: 10000, anuidade: 200 },
    "infinite": { nome: "💳 Infinite", limite: 50000, anuidade: 1000 },
    "black": { nome: "💳 BLACK", limite: 200000, anuidade: 5000 }
};

module.exports = {
    name: 'comprar',
    execute: async (sock, msg, args) => {
        const idItem = args[0];
        const formaPgto = args[1]?.toLowerCase(); // "cartao", "debito", "aproximacao"
        const qualCartao = args[2]?.toLowerCase();
        const remetente = msg.key.remoteJid;
        const userId = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(userId);

        let item = produtos[idItem];
        let isPrato = false;
        let precoItem = 0;

        if (!item && receitas[idItem]) {
            item = receitas[idItem];
            isPrato = true;
            let custo = 0;
            item.ingredientes.forEach(ingNome => {
                const ingId = Object.keys(produtos).find(k => produtos[k] && produtos[k].nome === ingNome);
                if (ingId && produtos[ingId].preco) custo += produtos[ingId].preco;
            });
            precoItem = Math.floor(custo * 2);
            if (precoItem === 0) precoItem = 30;
        } else if (item) {
            precoItem = item.preco;
        }

        if (!item) return sock.sendMessage(remetente, { text: "❌ ID de produto inválido! Veja a !loja." }, { quoted: msg });

        if (!user.inventario) user.inventario = [];

        // 💳 1. SE FOR PAGAR NO DÉBITO (APROXIMAÇÃO)
        if (formaPgto === 'debito' || formaPgto === 'débito' || formaPgto === 'aproximacao' || formaPgto === 'aproximação') {
            const cartaoUsado = user.cartaoAtivo || "Nenhum";
            if (cartaoUsado === "Nenhum" || !tabelaCartoes[cartaoUsado]) {
                return sock.sendMessage(remetente, { text: "❌ Você não tem um Cartão equipado para usar a aproximação! Use *!cartao usar [nome]*." }, { quoted: msg });
            }

            if ((user.banco || 0) < precoItem) {
                return sock.sendMessage(remetente, { text: `❌ Transação Recusada! Saldo insuficiente na conta bancária (Débito).\n🏦 *Saldo Atual:* R$ ${(user.banco || 0).toLocaleString('pt-BR')}` }, { quoted: msg });
            }

            user.banco -= precoItem;
            user.inventario.push(item.nome);
            db.salvar(userId, user);

            let txt = isPrato
                ? `💳 🔊 *BIP! Pagamento Aprovado!*\nVocê encostou o *${tabelaCartoes[cartaoUsado].nome}* na maquininha e levou o prato *${item.nome}* por R$ ${precoItem.toLocaleString('pt-BR')} (Débito).`
                : `💳 🔊 *BIP! Pagamento Aprovado!*\nVocê encostou o *${tabelaCartoes[cartaoUsado].nome}* na maquininha e comprou *${item.nome}* por R$ ${precoItem.toLocaleString('pt-BR')} (Débito).`;
            return sock.sendMessage(remetente, { text: txt }, { quoted: msg });
        }

        // 💳 2. SE FOR PAGAR NO CARTÃO DE CRÉDITO
        if (formaPgto === 'cartao' || formaPgto === 'cartão') {
            if (!user.faturas) user.faturas = {};
            let cartaoUsado = user.cartaoAtivo || "Nenhum";

            if (qualCartao && tabelaCartoes[qualCartao]) {
                if (!user.meusCartoes?.includes(qualCartao)) return sock.sendMessage(remetente, { text: `❌ Você não tem o cartão ${qualCartao}.` }, { quoted: msg });
                cartaoUsado = qualCartao;
            }

            if (cartaoUsado === "Nenhum" || !tabelaCartoes[cartaoUsado]) {
                return sock.sendMessage(remetente, { text: "❌ Você não tem um Cartão equipado!" }, { quoted: msg });
            }

            const limiteTotal = tabelaCartoes[cartaoUsado].limite + (user.limitesBonus?.[cartaoUsado] || 0);
            const faturaAtual = Number(user.faturas[cartaoUsado] || 0);
            const limiteDisponivel = limiteTotal - faturaAtual;

            if (precoItem > limiteDisponivel) {
                return sock.sendMessage(remetente, { text: `❌ Cartão Recusado! Limite insuficiente no ${tabelaCartoes[cartaoUsado].nome}.\n💳 *Limite Disponível:* R$ ${limiteDisponivel.toLocaleString('pt-BR')}` }, { quoted: msg });
            }

            user.faturas[cartaoUsado] = faturaAtual + precoItem;
            user.inventario.push(item.nome);
            db.salvar(userId, user);

            let txt = isPrato
                ? `💳 *COMPRA NO CRÉDITO (${tabelaCartoes[cartaoUsado].nome})!*\nVocê comprou o prato *${item.nome}* por R$ ${precoItem.toLocaleString('pt-BR')}!\n_O valor foi para a fatura desse cartão._`
                : `💳 *COMPRA NO CRÉDITO (${tabelaCartoes[cartaoUsado].nome})!*\nVocê comprou *${item.nome}* por R$ ${precoItem.toLocaleString('pt-BR')}!`;
            return sock.sendMessage(remetente, { text: txt }, { quoted: msg });
        }

        // 💵 3. SE FOR PAGAR NO DINHEIRO FÍSICO
        if ((user.dinheiro || 0) < precoItem) {
            return sock.sendMessage(remetente, { text: `❌ Saldo insuficiente na carteira! Custa R$ ${precoItem.toLocaleString('pt-BR')}.\n_Dica: Se quiser usar débito, digite !comprar ${idItem} aproximacao_` }, { quoted: msg });
        }

        user.dinheiro -= precoItem;
        user.inventario.push(item.nome);
        db.salvar(userId, user);

        let txt = isPrato
            ? `🍱 *COMPRA NO DINHEIRO!*\nVocê pagou em espécie o prato *${item.nome}* por R$ ${precoItem.toLocaleString('pt-BR')}!`
            : `✅ *COMPRA NO DINHEIRO!*\nVocê pagou em espécie *${item.nome}* por R$ ${precoItem.toLocaleString('pt-BR')}!`;

        await sock.sendMessage(remetente, { text: txt }, { quoted: msg });
    }
};
