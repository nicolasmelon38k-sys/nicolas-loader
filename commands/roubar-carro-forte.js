const db = require('../db');
const { executarRoubo } = require('../systems/heist');

module.exports = {
    name: 'roubar-carro-forte',
    execute: async (sock, msg, args) => {
        const senderId = msg.key.participant;
        const user = db.obterUsuario(senderId);
        const remetente = msg.key.remoteJid;

        const cooldown = 3 * 60 * 1000; // 3 minutos
        const agora = Date.now();
        if (agora - (user.ultimoCarroForte || 0) < cooldown) {
            const restante = cooldown - (agora - user.ultimoCarroForte);
            const min = Math.floor(restante / 60000);
            const seg = Math.floor((restante % 60000) / 1000);
            return sock.sendMessage(remetente, { text: `⏳ A polícia está na área! Espere ${min}m ${seg}s para roubar outro carro-forte.` }, { quoted: msg });
        }

        db.salvar(senderId, { ultimoCarroForte: agora }); // Aplica o cooldown

        // Extrai menções (Ignora a si mesmo e pega no máximo 2 parceiros)
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const convidadosRaw = [...new Set(mentions)].filter(id => id !== senderId).slice(0, 2);

        if (convidadosRaw.length === 0) {
            // ROUBO SOLO (Sem marcar ninguém)
            return await executarRoubo(sock, remetente, 'carro', [senderId]);
        }

        // ROUBO EM EQUIPE
        const convidadosIds = convidadosRaw.map(id => db.normalizarId(id));
        const nomesConvidados = convidadosIds.map(id => db.obterUsuario(id)?.nome || 'Aventureiro');

        const texto = `🚨 *CONVITE DE ASSALTO!* 🚨\n\n👤 *${user.nome}* está montando uma equipe para emboscar um Carro-Forte!\n\n👥 *Convocados:* ${nomesConvidados.join(', ')}\n\n👉 *Como entrar:* Respondam a esta exata mensagem com o comando:\n!aceitar-roubo`;

        const sentMsg = await sock.sendMessage(remetente, { text: texto, mentions: convidadosRaw }, { quoted: msg });

        // Cria a sessão temporária na memória global
        global.activeHeists = global.activeHeists || new Map();
        global.activeHeists.set(sentMsg.key.id, {
            tipo: 'carro',
            lider: senderId,
            convidados: convidadosIds,
            aceitos: [senderId], // Lider já entra aceito
            chatId: remetente,
            timer: setTimeout(() => {
                if (global.activeHeists.has(sentMsg.key.id)) {
                    sock.sendMessage(remetente, { text: `⏳ O Carro-Forte escapou! O tempo de preparação esgotou.` }, { quoted: sentMsg });
                    global.activeHeists.delete(sentMsg.key.id);
                }
            }, 5 * 60 * 1000) // Convite dura 5 minutos
        });
    }
};
