const os = require('os');
const db = require('../db');

module.exports = {
    name: 'teste',
    execute: async (sock, msg, args) => {
        const reis = ['554896669255', '161830827753644'];
        const remetente = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        if (!reis.includes(remetente)) return;

        const memTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const memLivre = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const memUsada = (memTotal - memLivre).toFixed(2);
        const uptimeSegundos = os.uptime();
        const horas = Math.floor(uptimeSegundos / 3600);
        const minutos = Math.floor((uptimeSegundos % 3600) / 60);

        const statusTexto = `📊 *HARDWARE STATUS*\n\n✅ *Uptime:* ${horas}h ${minutos}m\n📈 *RAM:* ${memUsada}GB / ${memTotal}GB\n⚙️ *Arch:* ${os.arch()}\n🟢 Conexão: Estável`;
        await sock.sendMessage(msg.key.remoteJid, { text: statusTexto }, { quoted: msg });
    }
}
