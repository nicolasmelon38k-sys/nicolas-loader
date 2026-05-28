const db = require('../db');

const tabelaCartoes = {
    "basico": { nome: "💳 Básico", limite: 500, anuidade: 0 },
    "gold": { nome: "💳 Gold", limite: 2500, anuidade: 50 },
    "platinum": { nome: "💳 Platinum", limite: 10000, anuidade: 200 },
    "infinite": { nome: "💳 Infinite", limite: 50000, anuidade: 1000 },
    "black": { nome: "💳 BLACK", limite: 200000, anuidade: 5000 }
};

const queues = new Map();
function enqueue(userId, fn) {
    const prev = queues.get(userId) || Promise.resolve();
    const next = prev.then(fn).catch(() => {}).finally(() => {
        if (queues.get(userId) === next) queues.delete(userId);
    });
    queues.set(userId, next);
    return next;
}
function genTxId() { return Math.random().toString(36).substring(2, 9).toUpperCase(); }

module.exports = {
    name: 'pix',
    execute: async (sock, msg, args) => {
        const remetente = msg.key.remoteJid;
        const senderId = db.normalizarId(msg.key.participant || remetente);

        const chaveDestino = String(args[0] || "").toUpperCase().trim();
        const valorPix = parseFloat(String(args[1] || "").replace(/[^0-9.]/g, ''));
        const formaPgto = args[2]?.toLowerCase(); // "cartao"
        const qualCartao = args[3]?.toLowerCase(); // "black", "gold"

        if (!chaveDestino || isNaN(valorPix) || valorPix <= 0) {
            return await sock.sendMessage(remetente, { text: "❓ *Uso correto:* !pix [Chave] [Valor] [cartao (opcional)] [nome_cartao (opcional)]" }, { quoted: msg });
        }

        return enqueue(senderId, async () => {
            const txId = genTxId();
            const sender = db.obterUsuario(senderId);
            const database = db.ler();

            const recipientEntry = Object.entries(database).find(([id, u]) => u.chavePix === chaveDestino);
            if (!recipientEntry) return await sock.sendMessage(remetente, { text: "❌ Chave PIX não encontrada." });
            const [recipientId, recipient] = recipientEntry;
            if (recipientId === senderId) return await sock.sendMessage(remetente, { text: "❌ Você não pode enviar um PIX para si mesmo." });

            const backupSender = structuredClone(sender);
            const backupRecipient = structuredClone(recipient);

            try {
                // 💳 PIX NO CRÉDITO
                if (formaPgto === 'cartao' || formaPgto === 'cartão') {
                    if (!sender.faturas) sender.faturas = {};
                    
                    let cartaoUsado = sender.cartaoAtivo || "Nenhum";
                    if (qualCartao && tabelaCartoes[qualCartao]) {
                        if (!sender.meusCartoes?.includes(qualCartao)) return await sock.sendMessage(remetente, { text: `❌ Você não tem o cartão ${qualCartao}.` });
                        cartaoUsado = qualCartao;
                    }

                    if (cartaoUsado === "Nenhum" || !tabelaCartoes[cartaoUsado]) return await sock.sendMessage(remetente, { text: "❌ Você precisa de um Cartão equipado." });

                    const limiteDisponivel = tabelaCartoes[cartaoUsado].limite - Number(sender.faturas[cartaoUsado] || 0);
                    const taxaCredito = valorPix * 0.05;
                    const valorComTaxa = valorPix + taxaCredito;

                    if (valorComTaxa > limiteDisponivel) {
                        return await sock.sendMessage(remetente, { text: `❌ Limite de crédito insuficiente (Taxa de 5% inclusa) no ${tabelaCartoes[cartaoUsado].nome}!\n💳 *Necessário:* R$ ${valorComTaxa.toLocaleString('pt-BR')}` });
                    }

                    sender.faturas[cartaoUsado] = Number(((sender.faturas[cartaoUsado] || 0) + valorComTaxa).toFixed(2));
                    recipient.dinheiro = Number(((recipient.dinheiro || 0) + valorPix).toFixed(2));

                    db.registrarTransacao(senderId, { txId, tipo: "pix_credito", para: recipient.nome, valor: valorComTaxa, data: new Date().toISOString() });
                    db.registrarTransacao(recipientId, { txId, tipo: "pix_recebido", de: sender.nome, valor: valorPix, data: new Date().toISOString() });

                    await db.salvar(senderId, sender);
                    await db.salvar(recipientId, recipient);

                    const layout = `
╭━━━━━━━『 💸 𝑫𝑨𝑬𝑴𝑶𝑵-𝑩𝑨𝑵𝑲 』━━━━━━━╮
┃
┃ ✅ *PIX no Crédito Enviado!*
┃ 🆔 *ID:* ${txId}
┃ 💳 *Cartão Usado:* ${tabelaCartoes[cartaoUsado].nome}
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 👤 *Para:* ${recipient.nome}
┃ 💰 *Valor:* R$ ${valorPix.toLocaleString('pt-BR')}
┃ 📉 *Taxa do Cartão:* R$ ${taxaCredito.toLocaleString('pt-BR')}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();
                    await sock.sendMessage(remetente, { text: layout }, { quoted: msg });

                } else {
                    // 💵 PIX NO DINHEIRO
                    if ((sender.dinheiro || 0) < valorPix) return await sock.sendMessage(remetente, { text: "❌ Saldo insuficiente na carteira." });

                    sender.dinheiro = Number(((sender.dinheiro || 0) - valorPix).toFixed(2));
                    recipient.dinheiro = Number(((recipient.dinheiro || 0) + valorPix).toFixed(2));

                    db.registrarTransacao(senderId, { txId, tipo: "pix_enviado", para: recipient.nome, valor: valorPix, data: new Date().toISOString() });
                    db.registrarTransacao(recipientId, { txId, tipo: "pix_recebido", de: sender.nome, valor: valorPix, data: new Date().toISOString() });

                    await db.salvar(senderId, sender);
                    await db.salvar(recipientId, recipient);

                    const layout = `
╭━━━━━━━『 💸 𝑫𝑨𝑬𝑴𝑶𝑵-𝑩𝑨𝑵𝑲 』━━━━━━━╮
┃
┃ ✅ *Transferência Concluída!*
┃ 🆔 *ID:* ${txId}
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 👤 *De:* ${sender.nome}
┃ 👤 *Para:* ${recipient.nome}
┃ 💰 *Valor:* R$ ${valorPix.toLocaleString('pt-BR')}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();
                    await sock.sendMessage(remetente, { text: layout }, { quoted: msg });
                }
            } catch (error) {
                console.error("⚠️ [PIX ERROR]:", error.message);
                await db.salvar(senderId, backupSender);
                await db.salvar(recipientId, backupRecipient);
                await sock.sendMessage(remetente, { text: "❌ Falha crítica na transação. Estorno realizado." });
            }
        });
    }
};
