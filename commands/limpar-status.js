const { isGroupAdmin } = require('../lib/permissoes');

module.exports = {
    name: 'limpar-status',

    execute: async (sock, msg) => {
        const chatId = msg.key.remoteJid;
        if (!chatId.endsWith('@g.us')) return;

        const senderJid =
            msg.key.participant ||
            msg.participant ||
            msg.key.remoteJid;

        const isAdmin = await isGroupAdmin(sock, chatId, senderJid);

        if (!isAdmin) {
            return sock.sendMessage(chatId, {
                text: '🚫 Apenas administradores.'
            }, { quoted: msg });
        }

        try {
            // NÃO mexe na descrição (não apaga regras)
            await sock.groupSettingUpdate(chatId, 'locked');

            await sock.sendMessage(chatId, {
                text: '🔒 Grupo protegido sem alterar regras.'
            }, { quoted: msg });

        } catch (e) {
            await sock.sendMessage(chatId, {
                text: '❌ Erro: ' + e.message
            }, { quoted: msg });
        }
    }
};
