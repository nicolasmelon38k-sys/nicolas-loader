const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
    name: 'f',
    execute: async (sock, msg, args) => {
        try {
            let messageContent = msg.message;

            if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                messageContent = msg.message.extendedTextMessage.contextInfo.quotedMessage;
            }

            const getMedia = (m) => {
                if (m?.videoMessage) return m.videoMessage;
                if (m?.ptvMessage) return m.ptvMessage;
                return null;
            };

            const target = getMedia(messageContent);

            if (!target) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ *DAEMON-XBOT:* Não achei o vídeo/GIF." }, { quoted: msg });
            }

            if (target.fileLength && Number(target.fileLength) > 15 * 1024 * 1024) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ *ERRO:* Vídeo muito grande." }, { quoted: msg });
            }

            await sock.sendMessage(msg.key.remoteJid, { react: { text: "⏳", key: msg.key } });

            const stream = await downloadContentFromMessage(target, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

            const workDir = process.cwd();
            const timestamp = Date.now();
            const input = path.join(workDir, `temp_vid_in_${timestamp}.mp4`);
            const output = path.join(workDir, `temp_vid_out_${timestamp}.webp`);
            const exif = path.join(workDir, `temp_meta_${timestamp}.exif`);

            fs.writeFileSync(input, buffer);

            // 🔥 CORTAR E PREENCHER (SEM BORDAS) + COMPRESSÃO EXTREMA
            // 'increase' escala até preencher o quadrado, depois 'crop' corta o centro 512x512
            const filter = `"fps=10,scale=512:512:force_original_aspect_ratio=increase,crop=512:512"`;
            // Mantendo compressão agressiva pro Zap aceitar figurinhas com muita ação
            const ffmpegCmd = `ffmpeg -i "${input}" -vcodec libwebp -vf ${filter} -lossless 0 -q:v 15 -loop 0 -preset default -an -vsync 0 -t 00:00:05 "${output}"`;

            await execPromise(ffmpegCmd);

            const nomeUsuario = msg.pushName || "Utilizador";
            const exifData = {
                "sticker-pack-id": "daemonx.bot.video",
                "sticker-pack-name": "DAEMON-XBOT",
                "sticker-pack-publisher": `${nomeUsuario} | DAEMON-XBOT`
            };

            const exifHeader = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer = Buffer.from(JSON.stringify(exifData), 'utf8');
            const exifFinal = Buffer.concat([exifHeader, jsonBuffer]);
            exifFinal.writeUIntLE(jsonBuffer.length, 14, 4);
            fs.writeFileSync(exif, exifFinal);

            await execPromise(`webpmux -set exif "${exif}" "${output}" -o "${output}"`);

            await sock.sendMessage(msg.key.remoteJid, { sticker: fs.readFileSync(output) }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } });

            setTimeout(() => {
                [input, output, exif].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
            }, 3000);

        } catch (e) {
            console.error("ERRO NO STICKER ANIMADO:", e.message);
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ *DAEMON:* O vídeo ficou pesado demais com o corte, tenta um vídeo com menos ação." }, { quoted: msg });
        }
    }
}
