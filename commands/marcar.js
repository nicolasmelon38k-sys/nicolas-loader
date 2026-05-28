module.exports = {
    name: 'marcar',
    execute: async (sock, msg, args) => {
        try {
            const remetente = msg.key.remoteJid;

            // Verifica se é um grupo
            if (!remetente.endsWith('@g.us')) {
                return await sock.sendMessage(remetente, { text: "❌ Este comando só funciona em grupos!" }, { quoted: msg });
            }

            // Puxa os dados do grupo
            const groupMetadata = await sock.groupMetadata(remetente);
            const participants = groupMetadata.participants;

            let texto = `📢 *CHAMADA GERAL - DAEMON*\n\n`;
            let mentions = [];

            // Monta a lista de @
            participants.forEach(member => {
                texto += ` @${member.id.split('@')[0]}`;
                mentions.push(member.id);
            });

            texto += `\n\n💬 *Mensagem:* ${args.join(' ') || 'Sem aviso específico.'}`;

            // Envia a mensagem marcando todo mundo
            await sock.sendMessage(remetente, { 
                text: texto, 
                mentions: mentions 
            }, { quoted: msg });

        } catch (error) {
            console.log("❌ Erro ao marcar todos:", error);
            await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Erro ao obter lista de membros." });
        }
    }
};
