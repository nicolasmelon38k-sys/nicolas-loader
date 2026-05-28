const { downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
    name: 's',
    execute: async (sock, msg, args) => {
        try {
            // 1. EXTRAÇÃO DIRETA DA MENSAGEM
            let messageContent = msg.message;
            
            // Se for resposta (Quoted), foca no que foi respondido
            if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                messageContent = msg.message.extendedTextMessage.contextInfo.quotedMessage;
            }

            // Função para localizar a imagem ignorando camadas de Visualização Única
            const getMedia = (m) => {
                if (m?.imageMessage) return m.imageMessage;
                if (m?.viewOnceMessageV2?.message?.imageMessage) return m.viewOnceMessageV2.message.imageMessage;
                if (m?.viewOnceMessageV2Extension?.message?.imageMessage) return m.viewOnceMessageV2Extension.message.imageMessage;
                return null;
            };

            const target = getMedia(messageContent);

            if (!target) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ *DAEMON-XBOT:* Não achei a foto. Tente responder a imagem novamente." });
            }

            // ⚡ TRAVA DE SEGURANÇA: Verifica se a chave de criptografia ainda existe
            if (!target.mediaKey) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "❌ *ERRO:* O WhatsApp já apagou a chave dessa mídia. Peça para mandarem a foto de novo!" });
            }

            await sock.sendMessage(msg.key.remoteJid, { react: { text: "⏳", key: msg.key } });

            // 2. DOWNLOAD PARA A MEMÓRIA DO BOT
            const stream = await downloadContentFromMessage(target, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

            const workDir = process.cwd();
            const timestamp = Date.now();
            const input = path.join(workDir, `temp_in_${timestamp}.jpg`);
            const output = path.join(workDir, `temp_out_${timestamp}.webp`);
            const exif = path.join(workDir, `temp_meta_${timestamp}.exif`);

            fs.writeFileSync(input, buffer);

            // 3. CONVERSÃO FFmpeg (Transparência Total)
            const filter = `"format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000"`;
            const ffmpegCmd = `ffmpeg -i "${input}" -vcodec libwebp -vf ${filter} -loop 0 -preset default -an -fps_mode vfr "${output}"`;
            
            await execPromise(ffmpegCmd);

            // 4. METADADOS DO AUTOR
            const nomeUsuario = msg.pushName || "Utilizador";
            const exifData = { 
                "sticker-pack-id": "daemonx.bot", 
                "sticker-pack-name": "DAEMON-XBOT", 
                "sticker-pack-publisher": `${nomeUsuario} | DAEMON-XBOT` 
            };
            
            const exifHeader = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer = Buffer.from(JSON.stringify(exifData), 'utf8');
            const exifFinal = Buffer.concat([exifHeader, jsonBuffer]);
            exifFinal.writeUIntLE(jsonBuffer.length, 14, 4);
            fs.writeFileSync(exif, exifFinal);

            await execPromise(`webpmux -set exif "${exif}" "${output}" -o "${output}"`);

            // 5. ENVIO E LIMPEZA
            await sock.sendMessage(msg.key.remoteJid, { sticker: fs.readFileSync(output) }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } });

            setTimeout(() => {
                [input, output, exif].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
            }, 3000);

        } catch (e) {
            console.error("ERRO NO STICKER:", e.message);
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ *DAEMON-XBOT:* Falha crítica no processamento da imagem." });
        }
    }
}
