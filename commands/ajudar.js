const db = require('../db');

const acoes = {
    "idosa": { texto: "ajudou uma senhora idosa a atravessar a rua", reputacao: 2 },
    "animal": { texto: "resgatou um cachorrinho abandonado", reputacao: 3 },
    "limpar": { texto: "recolheu lixo da praça central", reputacao: 2 },
    "doar": { texto: "doou roupas e cobertores para um orfanato", reputacao: 4 },
    "ensinar": { texto: "deu aula grátis para uma criança carente", reputacao: 3 }
};

module.exports = {
    name: 'ajudar',
    execute: async (sock, msg, args) => {
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(id);
        if (!user) return;

        const cooldown = 2 * 60 * 1000; // 2 minutos
        const agora = Date.now();
        if (agora - (user.ultimaBoaAcao || 0) < cooldown) {
            const restante = cooldown - (agora - user.ultimaBoaAcao);
            const min = Math.floor(restante / 60000);
            const seg = Math.floor((restante % 60000) / 1000);
            return sock.sendMessage(remetente, { text: `⏳ Você já ajudou a comunidade hoje. Descanse por ${min}m e ${seg}s.` }, { quoted: msg });
        }

        const acaoEscolhida = args[0]?.toLowerCase();

        if (!acaoEscolhida || !acoes[acaoEscolhida]) {
            const layoutOpcoes = `
╭━━━━━━━『 🕊️ 𝑩𝑶𝑨𝑺 𝑨𝑪̧𝑶̃𝑬𝑺 』━━━━━━━╮
┃
┃ Escolha como vai ajudar hoje:
┃ ✧ !ajudar idosa
┃ ✧ !ajudar animal
┃ ✧ !ajudar limpar
┃ ✧ !ajudar doar
┃ ✧ !ajudar ensinar
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ _Ajudar aumenta sua Reputação (Score),_
┃ _liberando mais limite no Cartão de Crédito!_
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();
            return sock.sendMessage(remetente, { text: layoutOpcoes }, { quoted: msg });
        }

        user.ultimaBoaAcao = agora;
        user.dinheiro = (user.dinheiro || 0) + 25;
        user.reputacao = (user.reputacao || 0) + acoes[acaoEscolhida].reputacao;

        db.salvar(id, user);

        const layoutSucesso = `
╭━━━━━━━『 👼 𝑨𝑻𝑶 𝑮𝑬𝑵𝑼𝑰́𝑵𝑶 』━━━━━━━╮
┃
┃ 💖 *Ação:* Você ${acoes[acaoEscolhida].texto}!
┃ 🎁 *Recompensa:* R$ 25 (Gratidão)
┃ ⭐ *Score de Reputação:* +${acoes[acaoEscolhida].reputacao} (Total: ${user.reputacao})
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

        await sock.sendMessage(remetente, { text: layoutSucesso }, { quoted: msg });
    }
};
