const db = require('../db');

module.exports = {
    name: 'gerarchave',
    execute: async (sock, msg, args) => {
        const remetente = msg.key.remoteJid;
        
        // Agora o bot sabe quem é você de verdade
        let quemEnviouRaw = msg.key.fromMe ? sock.user.id : (msg.key.participant || remetente);
        const userId = db.normalizarId(quemEnviouRaw);
        
        let user = db.obterUsuario(userId);
        if (!user) return;

        // Se a chave existe E não é o texto "Não gerada", ele bloqueia
        if (user.chavePix && user.chavePix !== "Não gerada") {
            return await sock.sendMessage(remetente, { 
                text: `❌ Você já possui uma chave PIX registrada: *${user.chavePix}*` 
            }, { quoted: msg });
        }

        const caracteres = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let chaveGerada = '';
        let chaveExiste = true;

        const usuarios = db.ler();
        while (chaveExiste) {
            chaveGerada = '';
            for (let i = 0; i < 6; i++) {
                chaveGerada += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
            }
            chaveExiste = Object.values(usuarios).some(u => u.chavePix === chaveGerada);
        }

        db.salvar(userId, { chavePix: chaveGerada });

        const layout = `
╭━━━━━━━『 🔑 𝑷𝑰𝑿-𝑲𝑬𝒀 』━━━━━━━╮
┃
┃ ✅ *Chave Gerada com Sucesso!*
┃ 👤 *Titular:* ${user.nome}
┃ 🔑 *Chave:* ${chaveGerada}
┃ 
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ ⚠️ *Atenção:* Esta chave é única e 
┃ vinculada ao seu perfil para sempre.
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

        await sock.sendMessage(remetente, { text: layout }, { quoted: msg });
    }
};
