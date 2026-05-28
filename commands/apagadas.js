const fs = require('fs');
const db = require('../db');
const { isGroupAdmin } = require('../lib/permissoes');

module.exports = {
    name: 'apagadas',
    execute: async (sock, msg, args) => {
        const chatId = msg.key.remoteJid;
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: "❌ Comando apenas para grupos." }, { quoted: msg });
        }

        const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;
        const isAdmin = await isGroupAdmin(sock, chatId, senderJid);
        const isDonoBot = db.normalizarId(senderJid) === '554896669255';

        if (!isAdmin && !isDonoBot && !msg.key.fromMe) {
            return await sock.sendMessage(chatId, { text: "🚫 *Acesso Negado:* Apenas Admins podem mexer no monitoramento." }, { quoted: msg });
        }

        const acao = (args[0] || '').trim();
        const gruposPath = './grupos.json';
        if (!fs.existsSync(gruposPath)) fs.writeFileSync(gruposPath, JSON.stringify({}));
        const grupos = JSON.parse(fs.readFileSync(gruposPath, 'utf8'));

        if (acao === '1') {
            grupos[chatId] = { ...grupos[chatId], apagadas: true };
            fs.writeFileSync(gruposPath, JSON.stringify(grupos, null, 2));
            return await sock.sendMessage(chatId, { text: "👁️ *Monitoramento Ativado!* \nTudo que apagarem será salvo no meu banco de dados secreto." }, { quoted: msg });
        } else if (acao === '0') {
            grupos[chatId] = { ...grupos[chatId], apagadas: false };
            fs.writeFileSync(gruposPath, JSON.stringify(grupos, null, 2));
            return await sock.sendMessage(chatId, { text: "🙈 *Monitoramento Desativado!* \nParei de registrar as mensagens." }, { quoted: msg });
        }

        return await sock.sendMessage(chatId, { text: "⚙️ Uso:\n*!apagadas 1* (Ligar)\n*!apagadas 0* (Desligar)" }, { quoted: msg });
    }
};
