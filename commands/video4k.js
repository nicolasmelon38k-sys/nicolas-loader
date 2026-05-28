const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'video4k',
    execute: async (sock, msg, args) => {
        // Caminho exato do Armazenamento Interno principal do Android
        const caminhoVideos = '/storage/emulated/0/videos_bot';

        try {
            // 1. CHECAGEM DA PASTA
            if (!fs.existsSync(caminhoVideos)) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "📂 *DAEMON-X:* A pasta 'videos_bot' não foi encontrada no Armazenamento Interno do celular." });
            }

            const arquivos = fs.readdirSync(caminhoVideos).filter(file => file.endsWith('.mp4'));
            
            if (arquivos.length === 0) {
                return await sock.sendMessage(msg.key.remoteJid, { text: "📂 *DAEMON-X:* A base de dados está limpa. Nenhum vídeo .mp4 encontrado." });
            }

            // 2. SELEÇÃO E PREPARAÇÃO
            const videoSorteado = arquivos[Math.floor(Math.random() * arquivos.length)];
            const videoPath = path.join(caminhoVideos, videoSorteado);

            // Manda o aviso de carregamento estiloso
            await sock.sendMessage(msg.key.remoteJid, { text: "⏳ 〈 𝐈𝐍𝐈𝐂𝐈𝐀𝐍𝐃𝐎 𝐏𝐑𝐎𝐓𝐎𝐂𝐎𝐋𝐎 𝟒𝐊 〉\n_Renderizando mídia em alta performance..._" });

            // 3. A INTERFACE SUPER LINDA (LEGENDA)
            const layoutPremium = `
╭━━━〈 🎦 𝐃𝐀𝐄𝐌𝐎𝐍-𝐗 𝐒𝐓𝐔𝐃𝐈𝐎𝐒 〉━━━╮
┃
┃ 🎬 ⧼ 𝟒𝐊 𝐔𝐋𝐓𝐑𝐀 𝐇𝐃 𝐏𝐑𝐄𝐒𝐄𝐍𝐓 ⧽
┃ 
┃ 🏷️ *Título:* ${videoSorteado.replace('.mp4', '')}
┃ 📊 *Resolução:* 3840x2160p
┃ 🎞️ *Framerate:* 60 FPS
┃ ⚙️ *Codec:* H.264 (AVC1)
┃ 🚀 *Host:* Galaxy A16 Server
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

            // 4. ENVIO DO VÍDEO PARA TOCAR NO ZAP
            await sock.sendMessage(msg.key.remoteJid, { 
                video: fs.readFileSync(videoPath), 
                caption: layoutPremium,
                mimetype: 'video/mp4'
            }, { quoted: msg });

        } catch (error) {
            console.error("Erro no processamento interno:", error);
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ *ERRO CRÍTICO:* Falha ao processar o arquivo de mídia." });
        }
    }
}
