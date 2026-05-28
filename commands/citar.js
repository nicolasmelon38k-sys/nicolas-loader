const { getSenderJid, isGroupAdmin } = require('../lib/jid');

module.exports = {
    name: 'citar',
    execute: async (sock, msg, args) => {
        const remetente = msg.key.remoteJid;
        const senderJid = getSenderJid(msg, sock);

        if (!remetente?.endsWith('@g.us')) {
            return sock.sendMessage(remetente, { text: '❌ Apenas em grupos.' }, { quoted: msg });
        }

        try {
            const textoParaCitar = args.join(' ').trim();
            if (!textoParaCitar) {
                return sock.sendMessage(remetente, { text: '❌ Digite o texto!' }, { quoted: msg });
            }

            const groupMetadata = await sock.groupMetadata(remetente);

            if (!isGroupAdmin(groupMetadata, senderJid)) {
                return sock.sendMessage(remetente, {
                    text: '❌ Apenas administradores podem usar este comando.'
                }, { quoted: msg });
            }

            const botIsAdmin = isGroupAdmin(groupMetadata, sock.user?.id);
            if (!botIsAdmin) {
                return sock.sendMessage(remetente, {
                    text: '❌ O bot precisa ser Admin para deletar mensagens.'
                }, { quoted: msg });
            }

            try {
                await sock.sendMessage(remetente, { delete: msg.key });
            } catch (err) {
                console.log('Não consegui deletar a mensagem:', err?.message || err);
            }

            await sock.sendMessage(remetente, { text: textoParaCitar });
        } catch (e) {
            console.error('Erro no citar:', e);
            await sock.sendMessage(remetente, { text: '❌ Erro ao executar o comando.' }, { quoted: msg });
        }
    }
};
