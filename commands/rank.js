const db = require('../db');

module.exports = {
    name: 'rank',
    execute: async (sock, msg, args) => {
        const dados = db.ler();
        const ids = Object.keys(dados);
        const listaRank = ids.map(id => ({ id, ...dados[id] }));

        // 👑 Nova Lógica de Ordenação: Quem mandou mais mensagens!
        // Se empatar nas mensagens, quem tiver mais fortuna ganha.
        listaRank.sort((a, b) => {
            const msgsA = a.mensagens || 0;
            const msgsB = b.mensagens || 0;
            
            if (msgsB !== msgsA) return msgsB - msgsA;
            
            const fortunaA = (Number(a.dinheiro) || 0) + (Number(a.banco) || 0);
            const fortunaB = (Number(b.dinheiro) || 0) + (Number(b.banco) || 0);
            return fortunaB - fortunaA;
        });

        const top5 = listaRank.slice(0, 5);

        // Emojis fofos no lugar de medalhas chatas
        const medalhas = ['👑', '🌸', '🎀', '🌷', '🩰'];

        let totalMsgs = 0, totalCmds = 0;
        listaRank.forEach(u => {
            totalMsgs += u.mensagens || 0;
            totalCmds += u.comandos || 0;
        });

        // 💖 LAYOUT SUPER FOFO E DETALHADO 💖
        let layout = `╭━━━━━━･❪ 🎀 𝓡𝓪𝓷𝓴𝓲𝓷𝓰 🎀 ❫･━━━━━━╮\n`;
        layout += `┃\n`;
        layout += `┃ ✨ _𝓞𝓼 𝓶𝓪𝓲𝓼 𝓿𝓲𝓬𝓲𝓪𝓭𝓸𝓼 𝓭𝓸 𝓼𝓲𝓼𝓽𝓮𝓶𝓪!_\n`;
        layout += `┃\n`;

        top5.forEach((user, i) => {
            const fortuna = (Number(user.dinheiro) || 0) + (Number(user.banco) || 0);

            layout += `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            layout += `┃ ${medalhas[i]} 𝓣𝓸𝓹 ${i + 1} ⟫ *${user.nome}*\n`;
            layout += `┃ 💬 𝓜𝓮𝓷𝓼𝓪𝓰𝓮𝓷𝓼: ${user.mensagens || 0}\n`;
            layout += `┃ 🌸 𝓝𝓲́𝓿𝓮𝓵: ${user.level || 1} (✨ ${user.xp || 0} XP)\n`;
            layout += `┃ 💸 𝓕𝓸𝓻𝓽𝓾𝓷𝓪: R$ ${fortuna.toLocaleString('pt-BR')}\n`;
        });

        layout += `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        layout += `┃ 🌷 𝓡𝓮𝓼𝓾𝓶𝓸 𝓭𝓸 𝓢𝓮𝓻𝓿𝓲𝓭𝓸𝓻 🌷\n`;
        layout += `┃ 👥 𝓜𝓮𝓶𝓫𝓻𝓸𝓼: ${ids.length}\n`;
        layout += `┃ 💌 𝓣𝓸𝓽𝓪𝓵 𝓭𝓮 𝓜𝓮𝓷𝓼𝓪𝓰𝓮𝓷𝓼: ${totalMsgs.toLocaleString('pt-BR')}\n`;
        layout += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(msg.key.remoteJid, { text: layout }, { quoted: msg });
    }
}
