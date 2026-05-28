const db = require('../db');

module.exports = {
    name: 'level',
    execute: async (sock, msg, args) => {
        try {
            const remetente = msg.key.remoteJid;
            const idDono = db.normalizarId(msg.key.participant || msg.key.remoteJid);

            if (idDono !== '554896669255') return;

            let alvoRaw = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                          msg.message?.extendedTextMessage?.contextInfo?.participant;

            const alvoId = alvoRaw ? db.normalizarId(alvoRaw) : idDono;
            const userAlvo = db.obterUsuario(alvoId);

            if (!userAlvo) return sock.sendMessage(remetente, { text: "❌ *ERRO:* Usuário não encontrado." }, { quoted: msg });

            const novoLevel = parseInt(args.find(a => !isNaN(a) && a.length <= 4));

            if (isNaN(novoLevel) || novoLevel < 1 || novoLevel > 4000) {
                return sock.sendMessage(remetente, { text: "⚠️ *FORMATO INVÁLIDO*\n\nUse: !level [1-4000] @user" }, { quoted: msg });
            }

            const levelAntigo = userAlvo.level || 1;
            db.salvar(alvoId, { level: novoLevel, xp: 0 });

            const textoSucesso = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃      ⭐ 𝑨𝑳𝑻𝑬𝑹𝑨𝑪̧𝑨̃𝑶 𝑫𝑬 𝑳𝑬𝑽𝑬𝑳      ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
👤 *𝑼𝒔𝒖𝒂́𝒓𝒊𝒐:* @${alvoId}
📊 *𝑺𝒕𝒂𝒕𝒖𝒔:* Modificado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📉 𝑨𝒏𝒕𝒆𝒔: Lvl ${levelAntigo}
📈 𝑨𝒈𝒐𝒓𝒂: Lvl ${novoLevel}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ _O progresso foi atualizado pelo Administrador._
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

            await sock.sendMessage(remetente, { text: textoSucesso, mentions: [alvoId + '@s.whatsapp.net'] }, { quoted: msg });
        } catch (error) { console.log("Erro no comando Level:", error); }
    }
};