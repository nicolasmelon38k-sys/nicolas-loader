const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
    name: 'rename',
    execute: async (sock, msg, args) => {
        try {
            const remetente = msg.key.remoteJid;

            // Pega a mensagem que você respondeu
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted || !quoted.stickerMessage) {
                return await sock.sendMessage(remetente, { text: "⚠️ *DAEMON-XBOT:* Tu precisa responder a uma figurinha com o comando `!rename [novo nome]`." }, { quoted: msg });
            }

            const novoNome = args.join(' ').trim();
            
            if (!novoNome) {
                return await sock.sendMessage(remetente, { text: "⚠️ *DAEMON-XBOT:* Digita um nome pra figurinha! Exemplo: `!rename Sapo Louco`" }, { quoted: msg });
            }

            await sock.sendMessage(remetente, { react: { text: "⏳", key: msg.key } });

            // Baixa a figurinha original
            const target = quoted.stickerMessage;
            const stream = await downloadContentFromMessage(target, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

            const workDir = process.cwd();
            const timestamp = Date.now();
            const input = path.join(workDir, `temp_stick_in_${timestamp}.webp`);
            const output = path.join(workDir, `temp_stick_out_${timestamp}.webp`);
            const exif = path.join(workDir, `temp_meta_${timestamp}.exif`);

            fs.writeFileSync(input, buffer);

            // ✍️ ESCREVENDO A NOVA ASSINATURA (Nome dinâmico do usuário + Bot Fixo)
            const nomeUsuario = msg.pushName || "Aventureiro";
            const exifData = {
                "sticker-pack-id": "daemonx.bot.rename",
                "sticker-pack-name": novoNome,
                "sticker-pack-publisher": `${nomeUsuario} | DAEMON-XBOT`
            };

            const exifHeader = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer = Buffer.from(JSON.stringify(exifData), 'utf8');
            const exifFinal = Buffer.concat([exifHeader, jsonBuffer]);
            exifFinal.writeUIntLE(jsonBuffer.length, 14, 4);
            fs.writeFileSync(exif, exifFinal);

            // Troca apenas o arquivo de texto oculto (exif) e mantém os pixels intactos
            await execPromise(`webpmux -set exif "${exif}" "${input}" -o "${output}"`);

            // Envia de volta pro chat
            await sock.sendMessage(remetente, { sticker: fs.readFileSync(output) }, { quoted: msg });
            await sock.sendMessage(remetente, { react: { text: "✅", key: msg.key } });

            // Joga os arquivos temporários no lixo pra não entupir a memória
            setTimeout(() => {
                [input, output, exif].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
            }, 3000);

        } catch (e) {
            console.error("ERRO NO RENAME:", e.message);
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ *DAEMON-XBOT:* Falha ao renomear a figurinha." }, { quoted: msg });
        }
    }
};
