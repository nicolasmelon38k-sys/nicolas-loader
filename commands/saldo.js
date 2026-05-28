const db = require('../db');
const { tabelaCartoes } = require('./cartao');

function money(valor) { return `R$ ${Number(valor || 0).toLocaleString('pt-BR')}`; }
function barraXp(xpAtual, xpNecessario) {
    if (xpAtual === "MÁXIMO") return '████████████████████';
    const total = 20;
    const pct = xpNecessario > 0 ? Math.min(100, Math.max(0, (xpAtual / xpNecessario) * 100)) : 0;
    const cheio = Math.round((pct / 100) * total);
    return '█'.repeat(cheio) + '░'.repeat(total - cheio);
}

module.exports = {
    name: 'saldo',
    execute: async (sock, msg, args) => {
        const alvoBruto = args.join(' ').trim();
        const id = alvoBruto ? db.normalizarId(alvoBruto) : db.normalizarId(msg.key.participant || msg.key.remoteJid);
        const user = db.obterUsuario(id);

        if (!user) return sock.sendMessage(msg.key.remoteJid, { text: "❌ SALDO NÃO ENCONTRADO." }, { quoted: msg });

        const nome = msg.pushName || user.nome || 'Usuário';
        const dinheiro = Number(user.dinheiro || 0);
        const banco = Number(user.banco || 0);
        const level = Number(user.level || 1);
        const xpAtual = user.xp === "MÁXIMO" ? "MÁXIMO" : Number(user.xp || 0);
        const xpNecessario = 100 * (level * level);

        const cartaoAtivo = user.cartaoAtivo || "Nenhum";
        const fatura = user.faturas && user.faturas[cartaoAtivo] ? Number(user.faturas[cartaoAtivo]) : 0;
        let limiteTotal = 0; let nomeCartao = "Sem Cartão";

        if (cartaoAtivo !== "Nenhum" && tabelaCartoes[cartaoAtivo]) {
            limiteTotal = tabelaCartoes[cartaoAtivo].limite;
            nomeCartao = tabelaCartoes[cartaoAtivo].nome;
        }
        const limiteDisponivel = Math.max(0, limiteTotal - fatura);
        const xpDisplay = xpAtual === "MÁXIMO" ? "MAX" : `${xpAtual.toLocaleString('pt-BR')} / ${xpNecessario.toLocaleString('pt-BR')}`;

        const texto = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃           💎 𝑺𝑨𝑳𝑫𝑶 𝑹𝑬𝑨𝑳 💎           ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
👤 𝑼𝒔𝒖́𝒂𝒓𝒊𝒐: ${nome}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 𝑪𝒂𝒓𝒕𝒆𝒊𝒓𝒂 (Físico): ${money(dinheiro)}
🏦 𝑩𝒂𝒏𝒄𝒐 (Corrente): ${money(banco)}
💳 𝑪𝒂𝒓𝒕𝒂̃𝒐 𝒅𝒆 𝑪𝒓𝒆́𝒅𝒊𝒕𝒐: ${nomeCartao}
📈 𝑳𝒊𝒎𝒊𝒕𝒆 𝑫𝒊𝒔𝒑𝒐𝒏𝒊́𝒗𝒆𝒍: ${money(limiteDisponivel)}
🧾 𝑭𝒂𝒕𝒖𝒓𝒂 𝑨𝒕𝒖𝒂𝒍: ${money(fatura)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ 𝑳𝒆𝒗𝒆𝒍: ${level} / 4000
✨ 𝑿𝑷: ${xpDisplay}
⏳ [${barraXp(xpAtual, xpNecessario)}]
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};