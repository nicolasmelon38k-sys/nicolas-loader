module.exports = {
    name: 'bater',
    execute: async (sock, msg, args) => {
        try {
            let target = null;
            const context = msg.message?.extendedTextMessage?.contextInfo;

            if (context?.quotedMessage) {
                target = context.participant; 
            } else if (context?.mentionedJid?.length > 0) {
                target = context.mentionedJid[0]; 
            }

            if (!target) {
                return await sock.sendMessage(msg.key.remoteJid, { 
                    text: "⚠️ *Mano, você quer bater no vento?* Responda a mensagem de alguém ou marque com @!" 
                }, { quoted: msg });
            }

            const sender = msg.key.participant || msg.key.remoteJid;
            if (target === sender) {
                return await sock.sendMessage(msg.key.remoteJid, { 
                    text: "😂 *Você deu um tapa na própria cara!* Perdeu 5 de QI." 
                }, { quoted: msg });
            }

            const senderName = msg.pushName || "Você";
            const targetFormat = `@${target.split('@')[0]}`;
            const dano = Math.floor(Math.random() * 60) + 10;

            const frases = [
                `deu um soco certeiro na cara de`,
                `acertou uma voadora com os dois pés no peito de`,
                `deu uma rasteira estilo Mortal Kombat em`,
                `lançou um chinelo teleguiado direto na testa de`,
                `deu um gancho de direita de arrancar dente em`,
                `acertou uma panelada na cabeça de`,
                `deu um chute bem na ponta da canela de`,
                `aplicou um golpe de judô que amassou o(a)`,
                `deu um tapa com as costas da mão na cara de`,
                `mandou um Hadouken de fogo em`,
                `deu um empurrão que fez rolar escada abaixo o(a)`,
                `acertou uma tijolada voadora no meio da testa de`,
                `deu um golpe de karatê no pescoço de`,
                `desceu uma cadeira de aço nas costas de`,
                `jogou uma bigorna (estilo Pica-Pau) na cabeça de`,
                `deu um bicudo bem na costela de`,
                `acertou um pedregulho no dedinho do pé de`,
                `deu um cascudo que afundou o crânio de`,
                `mandou um combo de 10 hits de fliperama em`
            ];

            const fraseEscolhida = frases[Math.floor(Math.random() * frases.length)];
            const textoFinal = `🥊 *BRIGA BRIGA BRIGA!*\n\n*${senderName}* ${fraseEscolhida} ${targetFormat}!\n🩸 *Dano causado:* -${dano} de HP (Vida Fake)`;

            await sock.sendMessage(msg.key.remoteJid, {
                text: textoFinal,
                mentions: [target] 
            }, { quoted: msg });

        } catch (e) {
            console.error("Erro no comando !bater:", e.message);
        }
    }
}
