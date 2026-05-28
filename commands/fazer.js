const db = require('../db');
const receitas = require('../data/receitas');

module.exports = {
    name: 'fazer',
    execute: async (sock, msg, args) => {
        const idRec = args[0];
        const rec = receitas[idRec];
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(id);

        if (!rec) return sock.sendMessage(remetente, { text: "❌ ID de receita inválido. Veja o !manual-receitas" });

        // Verifica se tem todos os ingredientes exatos na mochila
        const temTudo = rec.ingredientes.every(ing => user.inventario && user.inventario.includes(ing));

        if (!temTudo) {
            return sock.sendMessage(remetente, { text: `❌ Faltam ingredientes na sua mochila!\n📖 *Você precisa de:* ${rec.ingredientes.join(" + ")}` }, { quoted: msg });
        }

        // Tira 1 unidade de cada ingrediente usado
        rec.ingredientes.forEach(ing => {
            const index = user.inventario.indexOf(ing);
            user.inventario.splice(index, 1);
        });

        // Coloca a porção feita no inventário
        user.inventario.push(rec.nome);
        db.salvar(id, user);

        await sock.sendMessage(remetente, { 
            text: `👨‍🍳 *FOGÃO ACESO!*\n\n✅ Sucesso! Você preparou: *${rec.nome}*!\nO prato já foi guardado no seu inventário e você pode vendê-lo mais caro ou guardar.` 
        }, { quoted: msg });
    }
};
