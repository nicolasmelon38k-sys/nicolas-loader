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
    name: 'cassino',
    execute: async (sock, msg, args) => {
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);

        if (activeLocks.has(id)) return await sock.sendMessage(remetente, { react: { text: "⏳", key: msg.key } });

        let user = db.obterUsuario(id);
        if (!user) return;

        const aposta = parseInt(args[0]);
        const formaPgto = args[1]?.toLowerCase();
        const qualCartao = args[2]?.toLowerCase();
        let usouCartao = false;
        let nomeCartaoUsado = "";

        if (isNaN(aposta) || aposta < 100) {
            return await sock.sendMessage(remetente, { text: "❌ *Erro:* A aposta mínima é R$ 100." }, { quoted: msg });
        }

        if (formaPgto === 'cartao' || formaPgto === 'cartão') {
            if (!user.faturas) user.faturas = {};
            let cartaoUsado = user.cartaoAtivo || "Nenhum";
            if (qualCartao && tabelaCartoes[qualCartao]) {
                if (!user.meusCartoes?.includes(qualCartao)) return sock.sendMessage(remetente, { text: `❌ Você não tem o cartão ${qualCartao}.` });
                cartaoUsado = qualCartao;
            }
            if (cartaoUsado === "Nenhum" || !tabelaCartoes[cartaoUsado]) return sock.sendMessage(remetente, { text: "❌ Você não tem um Cartão equipado!" });

            const limiteBase = tabelaCartoes[cartaoUsado].limite;
            const limiteBonus = (user.limitesBonus && user.limitesBonus[cartaoUsado]) ? user.limitesBonus[cartaoUsado] : 0;
            const faturaAtual = Number(user.faturas[cartaoUsado] || 0);
            const limiteDisponivel = (limiteBase + limiteBonus) - faturaAtual;

            if (aposta > limiteDisponivel) return sock.sendMessage(remetente, { text: `❌ *Cartão Recusado!* Limite insuficiente.` });
            user.faturas[cartaoUsado] = faturaAtual + aposta;
            usouCartao = true;
            nomeCartaoUsado = tabelaCartoes[cartaoUsado].nome;
        } else {
            if ((user.dinheiro || 0) < aposta) return await sock.sendMessage(remetente, { text: "❌ *Saldo insuficiente na carteira!*\n_Dica: Use !cassino valor cartao_" });
            user.dinheiro -= aposta;
        }

        activeLocks.add(id);

        try {
            db.salvar(id, user);

            const emojis = ['🍒', '🍋', '🍉', '🍇', '🔔', '⭐', '💎', '7️⃣'];
            const coracoes = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤'];
            const chance = Math.random() * 100;
            let multiplicador = 0;
            let finalSlots = [];

            if (chance < 2) { multiplicador = 10; finalSlots = ['7️⃣', '7️⃣', '7️⃣']; }
            else if (chance < 10) { multiplicador = 3; finalSlots = ['💎', '💎', '💎']; }
            else if (chance < 25) { multiplicador = 2; const e = emojis[Math.floor(Math.random() * 4)]; finalSlots = [e, e, e]; }
            else if (chance < 45) {
                multiplicador = 1;
                const e = emojis[Math.floor(Math.random() * emojis.length)];
                let e2 = emojis[Math.floor(Math.random() * emojis.length)];
                while(e === e2) e2 = emojis[Math.floor(Math.random() * emojis.length)];
                finalSlots = [e, e, e2].sort(() => Math.random() - 0.5);
            } else {
                multiplicador = 0;
                while(finalSlots.length < 3) {
                    const e = emojis[Math.floor(Math.random() * emojis.length)];
                    if(!finalSlots.includes(e)) finalSlots.push(e);
                }
            }

            const ganho = aposta * multiplicador;
            const metodoTxt = usouCartao ? `💳 *Pago com:* ${nomeCartaoUsado}` : `💵 *Pago em:* Dinheiro Físico`;
            const buildLayout = (s1, s2, s3, statusTexto) => `
╭━━━━━━━『 🎰 𝑪𝑨𝑺𝑺𝑰𝑵𝑶 』━━━━━━━╮
┃
┃   [ ${s1} | ${s2} | ${s3} ]
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 👤 *Apostador:* ${msg.pushName || "Jogador"}
┃ 💸 *Aposta:* R$ ${aposta.toLocaleString('pt-BR')}
┃ ${metodoTxt}
┃
┃ ${statusTexto}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

            const sentMsg = await sock.sendMessage(remetente, { text: buildLayout('🔄', '🔄', '🔄', "⏳ *RODANDO OS SLOTS...*") }, { quoted: msg });
            for (let i = 0; i < 4; i++) {
                const coracao = coracoes[Math.floor(Math.random() * coracoes.length)];
                await sock.sendMessage(remetente, { react: { text: coracao, key: sentMsg.key } });
                await new Promise(r => setTimeout(r, 400));
                const r1 = emojis[Math.floor(Math.random() * emojis.length)];
                const r2 = emojis[Math.floor(Math.random() * emojis.length)];
                const r3 = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(remetente, { text: buildLayout(r1, r2, r3, "⏳ *RODANDO OS SLOTS...*"), edit: sentMsg.key });
            }

            let userFinal = db.obterUsuario(id);
            if (ganho > 0) {
                userFinal.dinheiro += ganho;
                db.salvar(id, userFinal);
            }

            let statusFinal = "";
            let emojiFinal = "";
            if (multiplicador === 0) {
                statusFinal = usouCartao ? `❌ *PERDEU!* A fatura chora.` : `❌ *PERDEU TUDO!*\nA casa sempre ganha.`;
                emojiFinal = "💀";
            } else if (multiplicador === 1) {
                statusFinal = `⚖️ *EMPATE!*\nPrêmio na Carteira: R$ ${ganho.toLocaleString('pt-BR')}.`;
                emojiFinal = "⚖️";
            } else {
                statusFinal = `🎉 *GANHOU ${multiplicador}X!*\n💰 *Prêmio na Carteira:* R$ ${ganho.toLocaleString('pt-BR')}`;
                emojiFinal = "💰";
            }

            statusFinal += `\n💵 *Saldo Físico:* R$ ${userFinal.dinheiro.toLocaleString('pt-BR')}`;
            await sock.sendMessage(remetente, { react: { text: emojiFinal, key: sentMsg.key } });
            await new Promise(r => setTimeout(r, 300));
            
            // Correção iOS: Envia uma nova mensagem citando a animação anterior
            await sock.sendMessage(remetente, { text: buildLayout(finalSlots[0], finalSlots[1], finalSlots[2], statusFinal) }, { quoted: sentMsg });
        } catch (error) {
            console.log("❌ Erro no Cassino:", error);
        } finally {
            activeLocks.delete(id);
        }
    }
};
