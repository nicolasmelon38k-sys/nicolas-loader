const db = require('../db');

function money(valor) {
    return `R$ ${Number(valor || 0).toLocaleString('pt-BR')}`;
}

function barraXp(xpAtual, xpNecessario) {
    const total = 20;
    const pct = xpNecessario > 0 ? Math.min(100, Math.max(0, (xpAtual / xpNecessario) * 100)) : 0;
    const cheio = Math.round((pct / 100) * total);
    return '█'.repeat(cheio) + '░'.repeat(total - cheio);
}

module.exports = {
    name: 'banco',
    execute: async (sock, msg, args) => {
        const id = db.normalizarId(args.join(' ').trim() || (msg.key.participant || msg.key.remoteJid));
        const user = db.obterUsuario(id);
        if (!user) return sock.sendMessage(msg.key.remoteJid, { text: "❌ Usuário não registrado." });

        const level = Number(user.level || 1);
        const xpAtual = Number(user.xp || 0);
        const xpNecessario = 100 * (level * level);
        
        // --- TOQUE CIRÚRGICO: LEVEL DINÂMICO ---
        const metaLevel = level <= 100 ? 100 : 200; 

        const texto = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃           🏦 𝑩𝑨𝑵𝑪𝑶 𝑹𝑬𝑨𝑳 🏦           ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

👤 𝑼𝒔𝒖́𝒂𝒓𝒊𝒐: ${user.nome || 'Usuário'}
💼 𝑬𝒎𝒑𝒓𝒆𝒈𝒐: ${user.emprego || 'Desempregado'}

💰 𝑪𝒂𝒓𝒕𝒆𝒊𝒓𝒂: ${money(user.dinheiro)}
🏦 𝑩𝒂𝒏𝒄𝒐: ${money(user.banco)}
💎 𝑻𝒐𝒕𝒂𝒍: ${money((user.dinheiro || 0) + (user.banco || 0))}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⭐ 𝑳𝒆𝒗𝒆𝒍: ${level} / ${metaLevel}
✨ 𝑿𝑷: ${xpAtual.toLocaleString('pt-BR')} / ${xpNecessario.toLocaleString('pt-BR')}
⏳ 𝑷𝒓𝒐𝒈𝒓𝒆𝒔𝒔𝒐: [${barraXp(xpAtual, xpNecessario)}]

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};
