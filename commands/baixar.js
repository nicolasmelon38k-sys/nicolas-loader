const util = require('util');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const execPromise = util.promisify(exec);

module.exports = {
    name: 'baixar',
    execute: async (sock, msg, args) => {
        const remetente = msg.key.remoteJid;
        const url = args[0];

        if (!url) {
            return sock.sendMessage(remetente, { text: "❌ Mande o link do vídeo!\n*Exemplo:* !baixar [link]" }, { quoted: msg });
        }

        // 🛡️ BLOQUEIO ABSOLUTO ANTI-HACKER
        if (url.includes(" ") || /[&;|`$"'<>]/.test(url)) {
            return sock.sendMessage(remetente, { text: "❌ Tentativa de invasão bloqueada. Tenta hackear outro, espertinho!" }, { quoted: msg });
        }

        const waitMsg = await sock.sendMessage(remetente, { text: "⏳ *Extraindo mídia...*\n_Buscando melhor qualidade disponível (H.264)..._ 🚀" }, { quoted: msg });

        const tempFile = path.join(__dirname, '..', `temp_video_${Date.now()}.mp4`);

        try {
            const cmd = `yt-dlp "${url}" -S "vcodec:h264,fps,res,acodec:m4a" --max-filesize 60M --merge-output-format mp4 -o "${tempFile}"`;
            
            await execPromise(cmd);

            if (!fs.existsSync(tempFile)) {
                throw new Error("Falha no download.");
            }

            await sock.sendMessage(remetente, {
                video: fs.readFileSync(tempFile),
                caption: `🎥 *Download Concluído!*\n_DAEMON Video Downloader System_`
            }, { quoted: msg });

            await sock.sendMessage(remetente, { delete: waitMsg.key });
            fs.unlinkSync(tempFile);

        } catch (error) {
            console.error("Erro no downloader:", error);
            let erroMsg = "❌ Erro ao baixar. O link pode ser privado ou o arquivo excede o limite do WhatsApp.";
            await sock.sendMessage(remetente, { text: erroMsg }, { edit: waitMsg.key });
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        }
    }
};
