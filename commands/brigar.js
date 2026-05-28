const db = require('../db');

module.exports = {
    name: 'brigar',
    execute: async (sock, msg, args) => {
        const sId = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        const user = db.obterUsuario(sId);
        const nomeSender = user?.nome || "Usuário";

        let aJid = null;
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentions.length > 0) aJid = mentions[0];
        else if (msg.message?.extendedTextMessage?.contextInfo?.participant) aJid = msg.message.extendedTextMessage.contextInfo.participant;

        if (!aJid) {
            return sock.sendMessage(msg.key.remoteJid, { text: "🤬 Tá lutando com o vento? Marque ou responda alguém pra brigar!" }, { quoted: msg });
        }

        const aId = db.normalizarId(aJid);
        if (sId === aId) {
            return sock.sendMessage(msg.key.remoteJid, { text: "🤕 Batendo em si mesmo? Você precisa de terapia, não de briga!" }, { quoted: msg });
        }

        const vitimaTag = `@${aJid.split('@')[0]}`;

        const frases = [
            `acabou de dar um soco na boca do estômago de ${vitimaTag}, deixando o desgraçado sem ar!`,
            `meteu uma voadora com os dois pés no peito de ${vitimaTag}! Que porrada absurda!`,
            `pegou ${vitimaTag} pelo pescoço e jogou direto contra a parede! A estrutura até tremeu!`,
            `deu um cruzado de direita na cara de ${vitimaTag}, que caiu babando no chão!`,
            `perdeu a paciência e quebrou uma cadeira de madeira nas costas de ${vitimaTag}!`,
            `puxou o cabelo de ${vitimaTag} e esfregou a cara no asfalto quente!`,
            `deu uma rasteira violenta em ${vitimaTag} e finalizou com um pisão no peito!`,
            `acertou um gancho de esquerda tão forte que ${vitimaTag} vai comer de canudinho por um mês!`,
            `montou em cima de ${vitimaTag} e começou a descer a porrada na cara sem dó nem piedade!`,
            `meteu uma cotovelada no nariz de ${vitimaTag}! Sangue pra todo lado!`,
            `catou ${vitimaTag} pelo colarinho e arremessou na lata de lixo mais próxima!`,
            `deu um chute bem no meio das pernas de ${vitimaTag}... Essa doeu até em mim!`,
            `rodou ${vitimaTag} no ar e cravou no chão com um pilão destruidor!`,
            `cravou os dentes no braço de ${vitimaTag} e depois deu um soco na nuca! Briga de cachorro louco!`,
            `jogou areia no olho de ${vitimaTag} e desceu um chute na costela. Jogo sujo e dolorido!`
        ];

        const fraseEscolhida = frases[Math.floor(Math.random() * frases.length)];

        const txt = `╭━━『 🥊 𝑩𝑹𝑰𝑮𝑨 𝑭𝑬𝑰𝑨 🥊 』━━╮\n┃\n┃ 🤬 *${nomeSender}* ${fraseEscolhida}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(msg.key.remoteJid, {
            text: txt,
            mentions: [aJid]
        }, { quoted: msg });
    }
};
