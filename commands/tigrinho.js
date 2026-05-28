const db = require('../db');

const tabelaCartoes = {
    "basico": { nome: "💳 Básico", limite: 500 },
    "gold": { nome: "💳 Gold", limite: 2500 },
    "platinum": { nome: "💳 Platinum", limite: 10000 },
    "infinite": { nome: "💳 Infinite", limite: 50000 },
    "black": { nome: "💳 BLACK", limite: 200000 }
};

const activeLocks = new Set();

module.exports = {
    name: 'tigrinho',
    execute: async (sock, msg, args) => {
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);

        if (activeLocks.has(id)) {
            return await sock.sendMessage(remetente, { react: { text: "⏳", key: msg.key } });
        }

        let user = db.obterUsuario(id);
        if (!user) return;

        const aposta = parseInt(args[0]);
        const formaPgto = args[1]?.toLowerCase();
        const qualCartao = args[2]?.toLowerCase();
        let usouCartao = false;
        let nomeCartaoUsado = "";

        if (isNaN(aposta) || aposta < 50) {
            return await sock.sendMessage(remetente, { text: "❌ *Mínimo:* R$ 50 para girar a plataforma." }, { quoted: msg });
        }

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

            const limiteBase = tabelaCartoes[cartaoUsado].limite;
            const limiteBonus = (user.limitesBonus && user.limitesBonus[cartaoUsado]) ? user.limitesBonus[cartaoUsado] : 0;
            const faturaAtual = Number(user.faturas[cartaoUsado] || 0);
            const limiteDisponivel = (limiteBase + limiteBonus) - faturaAtual;

            if (aposta > limiteDisponivel) {
                return sock.sendMessage(remetente, { text: `❌ *Cartão Recusado!* Limite insuficiente no ${tabelaCartoes[cartaoUsado].nome}.` }, { quoted: msg });
            }

            user.faturas[cartaoUsado] = faturaAtual + aposta;
            usouCartao = true;
            nomeCartaoUsado = tabelaCartoes[cartaoUsado].nome;
        } else {
            if ((user.dinheiro || 0) < aposta) {
                return await sock.sendMessage(remetente, { text: "❌ *O Tigre recusa fiado! Saldo insuficiente na carteira.*\n_Dica: Se quiser usar o limite, digite !tigrinho valor cartao_" }, { quoted: msg });
            }
            user.dinheiro -= aposta;
        }

        activeLocks.add(id);

        try {
            user.jogadasTigrinho = (user.jogadasTigrinho || 0) + 1;
            db.salvar(id, user);

            const emojis = ['🍊', '🏮', '🧨', '💰', '🧧', '🐯'];
            const getRandom = () => emojis[Math.floor(Math.random() * emojis.length)];

            let multiplicador = 0;
            let soltouCartinha = false;
            let chance = Math.random() * 100;

            if (user.jogadasTigrinho <= 3) {
                if (chance < 40) multiplicador = 2;
                else if (chance < 70) multiplicador = 1.5;
                else multiplicador = 0;
            } else {
                if (chance < 2) {
                    multiplicador = 10;
                    soltouCartinha = true;
                    user.jogadasTigrinho = 0;
                } else if (chance < 15) {
                    multiplicador = 1.5;
                } else {
                    multiplicador = 0;
                }
            }

            if (user.jogadasTigrinho > 15 && Math.random() < 0.2) user.jogadasTigrinho = 0;

            const ganho = Math.floor(aposta * multiplicador);

            let slotsFinal = [];
            if (soltouCartinha) {
                slotsFinal = [['🧧', '🐯', '🧧'], ['🐯', '💰', '🐯'], ['🧧', '🐯', '🧧']];
            } else if (multiplicador > 0) {
                const e = getRandom();
                slotsFinal = [[getRandom(), getRandom(), getRandom()], [e, e, e], [getRandom(), getRandom(), getRandom()]];
            } else {
                slotsFinal = [[getRandom(), getRandom(), getRandom()], [getRandom(), getRandom(), getRandom()], [getRandom(), getRandom(), getRandom()]];
            }

            const formatGrid = (grid) => `[ ${grid[0].join(' | ')} ]\n┃   [ ${grid[1].join(' | ')} ]\n┃   [ ${grid[2].join(' | ')} ]`;
            const metodoTxt = usouCartao ? `💳 *Pago com:* ${nomeCartaoUsado}` : `💵 *Pago em:* Dinheiro Físico`;

            const buildLayout = (gridText, statusTexto) => `
╭━━━━━━━『 🐯 𝑭𝑶𝑹𝑻𝑼𝑵𝑬 𝑻𝑰𝑮𝑬𝑹 』━━━━━━━╮
┃
┃   ${gridText}
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 💸 *Aposta:* R$ ${aposta.toLocaleString('pt-BR')}
┃ ${metodoTxt}
┃
┃ ${statusTexto}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

            const sentMsg = await sock.sendMessage(remetente, {
                text: buildLayout(formatGrid([['🔄', '🔄', '🔄'], ['🔄', '🐯', '🔄'], ['🔄', '🔄', '🔄']]), "🔥 *O TIGRE TÁ GIRANDO...*")
            }, { quoted: msg });

            for (let i = 0; i < 4; i++) {
                await new Promise(r => setTimeout(r, 500));
                let animGrid = [[getRandom(), getRandom(), getRandom()], [getRandom(), '🐯', getRandom()], [getRandom(), getRandom(), getRandom()]];
                let aviso = soltouCartinha ? "⚠️ *O TIGRE TÁ AMEAÇANDO!*" : "🔥 *O TIGRE TÁ GIRANDO...*";
                await sock.sendMessage(remetente, { text: buildLayout(formatGrid(animGrid), aviso), edit: sentMsg.key });
            }

            let userFinal = db.obterUsuario(id);
            if (ganho > 0) {
                userFinal.dinheiro += ganho;
                db.salvar(id, userFinal);
            }

            let statusFinal = "";
            let emojiReacao = "";
            if (soltouCartinha) {
                statusFinal = `🐅 *SOLTOU A CARTINHA!!! MEGA GANHO!*\n💰 *Prêmio na Carteira:* R$ ${ganho.toLocaleString('pt-BR')}`;
                emojiReacao = "🧧";
            } else if (multiplicador > 0) {
                statusFinal = `🎉 *GANHOU ${multiplicador}X!*\n💰 *Prêmio na Carteira:* R$ ${ganho.toLocaleString('pt-BR')}`;
                emojiReacao = "🤑";
            } else {
                statusFinal = usouCartao ? `❌ *O TIGRE LEVOU!* A fatura chorou.` : `❌ *O TIGRE LEVOU TUDO!*`;
                emojiReacao = "🤡";
            }

            statusFinal += `\n💵 *Saldo Físico Atual:* R$ ${userFinal.dinheiro.toLocaleString('pt-BR')}`;
            await sock.sendMessage(remetente, { react: { text: emojiReacao, key: sentMsg.key } });
            await new Promise(r => setTimeout(r, 400));
            
            // Correção iOS: Envia uma nova mensagem citando a animação anterior
            await sock.sendMessage(remetente, { text: buildLayout(formatGrid(slotsFinal), statusFinal) }, { quoted: sentMsg });
        } catch (error) {
            console.log("❌ Erro no Tigrinho:", error);
        } finally {
            activeLocks.delete(id);
        }
    }
};
