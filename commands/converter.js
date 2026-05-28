const db = require('../db');
const cartaoModule = require('./cartao');

// Fallback de segurança para os cartões caso o require falhe
const fallbackCartoes = {
    "basico": { nome: "💳 Básico", limite: 500 },
    "gold": { nome: "💳 Gold", limite: 2500 },
    "platinum": { nome: "💳 Platinum", limite: 10000 },
    "infinite": { nome: "💳 Infinite", limite: 50000 },
    "black": { nome: "💳 BLACK", limite: 200000 }
};

module.exports = {
    name: 'converter',
    execute: async (sock, msg, args) => {
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(id);

        if (!user) return;

        const qtdText = args[0];
        const metodo = args[1]?.toLowerCase();

        // Se o cara digitar errado ou não botar a quantidade
        if (!qtdText || isNaN(qtdText) || parseInt(qtdText) <= 0) {
            const ajuda = "╭━━━━━━━『 🪙 𝑪𝑨̂𝑴𝑩𝑰𝑶 』━━━━━━━╮\n" +
                          "┃ 💰 *1 Moeda = R$ 1.000*\n" +
                          "┃\n" +
                          "┃ 💡 *Como comprar:*\n" +
                          "┃ `!converter [quantidade] [forma]`\n" +
                          "┃\n" +
                          "┃ 💳 *Formas aceitas:*\n" +
                          "┃ • carteira\n" +
                          "┃ • banco\n" +
                          "┃ • cartao\n" +
                          "┃\n" +
                          "┃ 📌 *Exemplo:* `!converter 5 banco`\n" +
                          "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯";
            return sock.sendMessage(remetente, { text: ajuda }, { quoted: msg });
        }

        const qtd = parseInt(qtdText);
        const custoTotal = qtd * 1000;

        if (!metodo || !['carteira', 'banco', 'cartao', 'cartão'].includes(metodo)) {
            return sock.sendMessage(remetente, { text: `❌ Forma de pagamento inválida!\nUse: *carteira*, *banco* ou *cartao*.\nExemplo: \`!converter ${qtd} carteira\`` }, { quoted: msg });
        }

        // Pagamento via Carteira
        if (metodo === 'carteira') {
            if ((user.dinheiro || 0) < custoTotal) {
                return sock.sendMessage(remetente, { text: `❌ Dinheiro insuficiente na carteira!\nFalta R$ ${(custoTotal - (user.dinheiro || 0)).toLocaleString('pt-BR')}` }, { quoted: msg });
            }
            user.dinheiro -= custoTotal;
        } 
        
        // Pagamento via Banco
        else if (metodo === 'banco') {
            if ((user.banco || 0) < custoTotal) {
                return sock.sendMessage(remetente, { text: `❌ Saldo insuficiente no banco!\nFalta R$ ${(custoTotal - (user.banco || 0)).toLocaleString('pt-BR')}` }, { quoted: msg });
            }
            user.banco -= custoTotal;
        } 
        
        // Pagamento via Cartão de Crédito
        else if (metodo === 'cartao' || metodo === 'cartão') {
            let cartaoAtivo = user.cartaoAtivo || "Nenhum";
            let tabelaCartoes = cartaoModule.tabelaCartoes || fallbackCartoes;
            
            if (cartaoAtivo === "Nenhum" || !tabelaCartoes[cartaoAtivo]) {
                return sock.sendMessage(remetente, { text: "❌ Você não tem um cartão ativo! Equipe um para usar essa função." }, { quoted: msg });
            }
            
            let infoCard = tabelaCartoes[cartaoAtivo];
            const limiteTotal = infoCard.limite + (user.limitesBonus?.[cartaoAtivo] || 0);
            const faturaAtual = Number(user.faturas?.[cartaoAtivo] || 0);
            const limiteDisponivel = limiteTotal - faturaAtual;

            if (custoTotal > limiteDisponivel) {
                return sock.sendMessage(remetente, { text: `❌ Limite do cartão insuficiente!\n💳 Limite Disponível: R$ ${limiteDisponivel.toLocaleString('pt-BR')}` }, { quoted: msg });
            }

            if (!user.faturas) user.faturas = {};
            user.faturas[cartaoAtivo] = faturaAtual + custoTotal;
        }

        // Adiciona as moedas na conta do usuário
        user.moedas = (user.moedas || 0) + qtd;
        db.salvar(id, user);

        const txtSucesso = "╭━━━━━━━━『 🪙 𝑪𝑨̂𝑴𝑩𝑰𝑶 』━━━━━━━╮\n" +
                           "┃ ✅ *Conversão Concluída!*\n" +
                           "┃ 🛒 Adquirido: +" + qtd.toLocaleString('pt-BR') + " 🪙\n" +
                           "┃ 💸 Pago: R$ " + custoTotal.toLocaleString('pt-BR') + " (" + metodo.toUpperCase() + ")\n" +
                           "┃ 💳 Seu saldo VIP: " + user.moedas.toLocaleString('pt-BR') + " 🪙\n" +
                           "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯";
        
        await sock.sendMessage(remetente, { text: txtSucesso }, { quoted: msg });
    }
};
