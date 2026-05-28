const util = require('util');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const execPromise = util.promisify(exec);

module.exports = {
    name: 'play',
    execute: async (sock, msg, args) => {
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(msg.key.remoteJid, { text: "❌ *ERRO:* Diz o nome da música, mano!" });
        }

        // Bloqueio de caracteres de terminal perigosos
        if (/[&;|`$<>!]/.test(query)) {
            return await sock.sendMessage(msg.key.remoteJid, { text: "❌ *BLOQUEADO:* Caractere inválido detectado." });
        }

        const fileName = `music_${Date.now()}.mp3`;
        const tempFile = path.resolve(__dirname, '..', fileName);

        try {
            await sock.sendMessage(msg.key.remoteJid, { react: { text: "⏳", key: msg.key } });

            // Busca metadados - Adicionado --no-playlist para não bugar
            const metaCmd = `yt-dlp "ytsearch1:${query}" --no-playlist --print "%(title)s|%(thumbnail)s" --no-warnings`;
            const { stdout: metaOut } = await execPromise(metaCmd);
            const [tituloReal, urlCapa] = metaOut.trim().split('|');

            const layoutAudio = `
╭━━━━━〈 🎧 𝐃𝐀𝐄𝐌𝐎𝐍-𝐗 𝐌𝐔𝐒𝐈𝐂 〉━━━━━╮
┃
┃ 🎵 *Faixa:* ${tituloReal || query}
┃ 🔊 *Qualidade:* 320kbps
┃ ⚙️ *Status:* Extraindo áudio...
┃ 🚀 *Host:* Galaxy A16 Server
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

            if (urlCapa) {
                await sock.sendMessage(msg.key.remoteJid, { image: { url: urlCapa }, caption: layoutAudio }, { quoted: msg });
            } else {
                await sock.sendMessage(msg.key.remoteJid, { text: layoutAudio }, { quoted: msg });
            }

            // DOWNLOAD FORÇADO: --no-playlist e --geo-bypass (ajuda com músicas BR bloqueadas)
            const downloadCmd = `yt-dlp "ytsearch1:${query}" --no-playlist --geo-bypass --extract-audio --audio-format mp3 --audio-quality 0 --force-overwrites -o "${tempFile}"`;
            await execPromise(downloadCmd);

            if (!fs.existsSync(tempFile)) {
                throw new Error("Arquivo não encontrado após download.");
            }

            await sock.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } });

            await sock.sendMessage(msg.key.remoteJid, {
                audio: fs.readFileSync(tempFile),
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: msg });

            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

        } catch (error) {
            console.error("🔴 Erro no Play:", error.message);
            await sock.sendMessage(msg.key.remoteJid, { react: { text: "❌", key: msg.key } });
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ *FALHA:* O YouTube recusou essa busca ou o arquivo é muito grande. Tenta outro nome!" });
            
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        }
    }
}
