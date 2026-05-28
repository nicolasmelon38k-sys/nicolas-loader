const db = require('../db');
const produtos = require('../data/produtos');
const receitas = require('../data/receitas');

module.exports = {
    name: 'vender',
    execute: async (sock, msg, args) => {
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(id);

        if (!user || !user.inventario || user.inventario.length === 0) {
            return sock.sendMessage(remetente, { text: "❌ Seu inventário está vazio!" }, { quoted: msg });
        }

        const param = args.join(' ').toLowerCase();
        if (!param) return sock.sendMessage(remetente, { text: "❌ Diga o que vender! (Ex: `!vender 31`, `!vender 517` ou `!vender tudo`)" }, { quoted: msg });

        let lucroTotal = 0;
        let itensRemovidos = 0;
        let novosItens = [];

        // Função auxiliar robusta para pegar o preço de revenda de qualquer coisa
        const getPrecoRevenda = (nomeItem) => {
            let pId = Object.keys(produtos).find(k => produtos[k].nome.toLowerCase() === nomeItem.toLowerCase());
            if (pId && produtos[pId].preco) return Math.floor(produtos[pId].preco * 0.5);

            let rId = Object.keys(receitas).find(k => receitas[k].nome.toLowerCase() === nomeItem.toLowerCase());
            if (rId) {
                let rec = receitas[rId];
                if (rec.preco) return Math.floor(rec.preco * 0.5);
                
                // Se o prato não tiver preço fixo, calcula baseado nos ingredientes
                let custo = 0;
                if (rec.ingredientes) {
                    rec.ingredientes.forEach(ing => {
                        let iId = Object.keys(produtos).find(k => produtos[k].nome === ing);
                        if (iId && produtos[iId].preco) custo += produtos[iId].preco;
                    });
                }
                let precoVenda = Math.floor(custo * 2);
                if (precoVenda === 0) precoVenda = 30; // Segurança
                return Math.floor(precoVenda * 0.5);
            }
            return 0; // Se não for produto nem receita, não tem valor (NaN evitado!)
        };

        if (param === 'tudo') {
            for (let item of user.inventario) {
                let precoItem = getPrecoRevenda(item);
                if (precoItem > 0) {
                    lucroTotal += precoItem;
                    itensRemovidos++;
                } else {
                    novosItens.push(item);
                }
            }
        } else {
            let itemAlvo = null;
            let precoRevenda = 0;

            // Tenta achar por ID
            if (produtos[param]) {
                itemAlvo = produtos[param].nome;
                precoRevenda = getPrecoRevenda(itemAlvo);
            } else if (receitas[param]) {
                itemAlvo = receitas[param].nome;
                precoRevenda = getPrecoRevenda(itemAlvo);
            } else {
                // Tenta achar por Nome
                let idProd = Object.keys(produtos).find(k => produtos[k].nome.toLowerCase() === param);
                let idRec = Object.keys(receitas).find(k => receitas[k].nome.toLowerCase() === param);
                if (idProd) { itemAlvo = produtos[idProd].nome; precoRevenda = getPrecoRevenda(itemAlvo); }
                if (idRec) { itemAlvo = receitas[idRec].nome; precoRevenda = getPrecoRevenda(itemAlvo); }
            }

            if (!itemAlvo) return sock.sendMessage(remetente, { text: "❌ Item não existe." }, { quoted: msg });
            if (precoRevenda === 0) return sock.sendMessage(remetente, { text: `❌ Não é possível vender ${itemAlvo}.` }, { quoted: msg });

            for (let item of user.inventario) {
                if (item === itemAlvo) {
                    lucroTotal += precoRevenda;
                    itensRemovidos++;
                } else {
                    novosItens.push(item);
                }
            }
        }

        if (itensRemovidos === 0) {
            return sock.sendMessage(remetente, { text: "❌ Você não tem esse item no inventário." }, { quoted: msg });
        }

        // Previne qualquer vazamento de NaN
        if (isNaN(lucroTotal)) lucroTotal = 0;

        user.inventario = novosItens;
        user.dinheiro = (user.dinheiro || 0) + lucroTotal;
        db.salvar(id, user);

        const txt = `╭━━━━━━━━『 💰 𝑽𝑬𝑵𝑫𝑨𝑺 』━━━━━━━╮\n┃\n┃ ✅ Venda concluída!\n┃ 📦 Itens vendidos: ${itensRemovidos}\n┃ 📉 (Taxa de Revenda: -50% do valor de loja)\n┃ 💵 Lucro obtido: R$ ${lucroTotal.toLocaleString('pt-BR')}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
        await sock.sendMessage(remetente, { text: txt }, { quoted: msg });
    }
};
