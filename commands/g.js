const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { isGroupAdmin } = require('../lib/permissoes');

module.exports = {
    name: 'g',
    execute: async (sock, msg, args) => {
        try {
            const chatId = msg.key.remoteJid;
            const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;

            const isAdmin = await isGroupAdmin(sock, chatId, senderJid);

            if (!isAdmin) {
                return await sock.sendMessage(chatId, {
                    text: "🚫 *Acesso Negado:* Comando exclusivo para Admins do grupo."
                }, { quoted: msg });
            }

            let messageContent = msg.message;

            if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                messageContent = msg.message.extendedTextMessage.contextInfo.quotedMessage;
            }

            const getMediaAndType = (m) => {
                const viewOnce =
                    m.viewOnceMessageV2?.message ||
                    m.viewOnceMessageV2Extension?.message ||
                    m.viewOnceMessageV3?.message;

                const target = viewOnce || m;

                if (target.imageMessage) return { type: 'image', media: target.imageMessage };
                if (target.videoMessage) return { type: 'video', media: target.videoMessage };
                return null;
            };

            const targetData = getMediaAndType(messageContent);

            if (!targetData) {
                return await sock.sendMessage(chatId, {
                    text: "⚠️ Responda uma imagem ou vídeo com o comando !g."
                }, { quoted: msg });
            }

            const { type, media } = targetData;

            if (!media.mediaKey) {
                return await sock.sendMessage(chatId, {
                    text: "❌ Esta mídia não está mais disponível."
                }, { quoted: msg });
            }

            await sock.sendMessage(chatId, { react: { text: "⏳", key: msg.key } });

            const stream = await downloadContentFromMessage(media, type);
            let buffer = Buffer.from([]);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const payload = {};
            payload[type] = buffer;
            payload.caption = "✅ Capturado com sucesso!";

            await sock.sendMessage(chatId, payload, { quoted: msg });

            await sock.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

        } catch (e) {
            console.error("ERRO NO G:", e.message);

            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Erro ao processar mídia."
            }, { quoted: msg });
        }
    }
};
