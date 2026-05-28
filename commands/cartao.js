const db = require('../db');

const tabelaCartoes = {
    "basico": { nome: "💳 Básico", limite: 500, preco: 0 },
    "gold": { nome: "💳 Gold", limite: 2500, preco: 5000 },
    "platinum": { nome: "💳 Platinum", limite: 10000, preco: 15000 },
    "infinite": { nome: "💳 Infinite", limite: 50000, preco: 50000 },
    "black": { nome: "💳 BLACK", limite: 200000, preco: 150000 }
};

module.exports = {
    name: 'cartao',
    tabelaCartoes,
    execute: async (sock, msg, args) => {
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);
        let user = db.obterUsuario(id);

        if (!user) return;

        // Inicialização de segurança
        if (!user.meusCartoes) user.meusCartoes = ["basico"];
        if (!user.faturas) user.faturas = {};
        if (!user.limitesBonus) user.limitesBonus = {};
        if (!user.cartaoAtivo) user.cartaoAtivo = "basico";

        const acao = args[0]?.toLowerCase();

        // 🛒 COMPRAR OU PEDIR CARTÃO
        if (acao === 'resgatar' || acao === 'pedir' || acao === 'comprar') {
            const tipo = args[1]?.toLowerCase();
            const card = tabelaCartoes[tipo];

            if (!card) return sock.sendMessage(remetente, { text: "❌ Cartão não existe! Opções: gold, platinum, infinite, black." }, { quoted: msg });
            if (user.meusCartoes.includes(tipo)) return sock.sendMessage(remetente, { text: "⚠️ Você já possui este cartão!" }, { quoted: msg });
            if (user.dinheiro < card.preco) return sock.sendMessage(remetente, { text: `❌ Saldo insuficiente! O ${card.nome} custa R$ ${card.preco.toLocaleString('pt-BR')} na carteira.` }, { quoted: msg });

            user.dinheiro -= card.preco;
            user.meusCartoes.push(tipo);
            db.salvar(id, user);
            return sock.sendMessage(remetente, { text: `✅ Sucesso! Você comprou o ${card.nome}!\nUse *!cartao usar ${tipo}* para ativar.` }, { quoted: msg });
        }

        // 🔄 USAR OU ATIVAR CARTÃO
        if (acao === 'usar' || acao === 'ativar') {
            const tipo = args[1]?.toLowerCase();
            if (!user.meusCartoes.includes(tipo)) return sock.sendMessage(remetente, { text: "❌ Você não possui esse cartão! Compre primeiro com !cartao comprar [nome]" }, { quoted: msg });

            user.cartaoAtivo = tipo;
            db.salvar(id, user);
            return sock.sendMessage(remetente, { text: `💳 Cartão ${tabelaCartoes[tipo].nome} ativado com sucesso!` }, { quoted: msg });
        }

        // 🧾 PAGAR FATURA
        if (acao === 'pagar') {
            const c = user.cartaoAtivo;
            const faturaAtual = user.faturas[c] || 0;
            
            if (faturaAtual <= 0) return sock.sendMessage(remetente, { text: "✅ Sua fatura já está zerada!" }, { quoted: msg });

            let valorPagar = 0;
            if (args[1]?.toLowerCase() === 'tudo') {
                valorPagar = faturaAtual;
            } else {
                valorPagar = parseFloat(args[1]);
                if (isNaN(valorPagar) || valorPagar <= 0) return sock.sendMessage(remetente, { text: "❌ Valor inválido! Ex: !cartao pagar 1000 ou !cartao pagar tudo" }, { quoted: msg });
            }

            if (valorPagar > faturaAtual) valorPagar = faturaAtual;

            // Prioriza tirar do Banco, se não tiver, tira da Carteira
            if (user.banco >= valorPagar) {
                user.banco -= valorPagar;
            } else if (user.dinheiro >= valorPagar) {
                user.dinheiro -= valorPagar;
            } else {
                return sock.sendMessage(remetente, { text: "❌ Saldo insuficiente na Carteira e no Banco para pagar essa fatura." }, { quoted: msg });
            }

            user.faturas[c] -= valorPagar;
            db.salvar(id, user);
            return sock.sendMessage(remetente, { text: `🧾 Pagamento de R$ ${valorPagar.toLocaleString('pt-BR')} efetuado com sucesso!\nFatura restante: R$ ${(user.faturas[c]).toLocaleString('pt-BR')}` }, { quoted: msg });
        }

        // 📈 AUMENTAR LIMITE
        if (acao === 'aumentar') {
            const valor = parseFloat(args[1]);
            if (isNaN(valor) || valor <= 0) return sock.sendMessage(remetente, { text: "❌ Valor inválido! Ex: !cartao aumentar 1000 (Usa saldo da carteira)" }, { quoted: msg });
            if (user.dinheiro < valor) return sock.sendMessage(remetente, { text: "❌ Saldo insuficiente na carteira para investir em limite." }, { quoted: msg });
            
            user.dinheiro -= valor;
            user.limitesBonus[user.cartaoAtivo] = (user.limitesBonus[user.cartaoAtivo] || 0) + valor;
            db.salvar(id, user);
            return sock.sendMessage(remetente, { text: `📈 Limite do seu cartão aumentado em R$ ${valor.toLocaleString('pt-BR')}!` }, { quoted: msg });
        }

        // 📊 MENU PRINCIPAL DO CARTÃO
        let cartaoPrincipal = tabelaCartoes[user.cartaoAtivo] || tabelaCartoes["basico"];
        let faturaPrincipal = user.faturas[user.cartaoAtivo] || 0;
        let limiteTotal = cartaoPrincipal.limite + (user.limitesBonus[user.cartaoAtivo] || 0);
        let limiteDisponivel = limiteTotal - faturaPrincipal;

        let texto = `╭━━━━━━━『 💳 𝑫𝑨𝑬𝑴𝑶𝑵 𝑪𝑨𝑹𝑫𝑺 』━━━━━━━╮\n┃\n`;
        texto += `┃ 🏧 *Ativo:* ${cartaoPrincipal.nome}\n`;
        texto += `┃ 📈 *Limite Total:* R$ ${limiteTotal.toLocaleString('pt-BR')}\n`;
        texto += `┃ 🟢 *Limite Disp:* R$ ${limiteDisponivel.toLocaleString('pt-BR')}\n`;
        texto += `┃ 💸 *Fatura:* R$ ${faturaPrincipal.toLocaleString('pt-BR')}\n┃\n`;
        texto += `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n┃ 🗃️ *SUA CARTEIRA:*\n`;

        user.meusCartoes.forEach(c => {
            const nomeC = tabelaCartoes[c] ? tabelaCartoes[c].nome : c;
            texto += `┃ ↳ ${nomeC}${user.cartaoAtivo === c ? " ✅" : ""}\n`;
        });

        texto += `┃\n┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n┃ ⚙️ *COMANDOS:*\n`;
        texto += `┃ ✧ !cartao comprar [nome]\n`;
        texto += `┃ ✧ !cartao usar [nome]\n`;
        texto += `┃ ✧ !cartao pagar [valor / tudo]\n`;
        texto += `┃ ✧ !cartao aumentar [valor]\n`;
        texto += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(remetente, { text: texto }, { quoted: msg });
    }
};
