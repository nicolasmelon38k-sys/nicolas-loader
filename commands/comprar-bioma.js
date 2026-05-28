const db = require('../db');
const biomas = require('../data/biomas');

module.exports = {
    name: 'comprar-bioma',
    execute: async (sock, msg, args) => {
        const idBioma = args[0];
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(id);

        if (!user) return;
        
        const bioma = biomas[idBioma];
        if (!bioma) {
            return sock.sendMessage(remetente, { text: "❌ ID de Bioma inválido! Use !loja-biomas." }, { quoted: msg });
        }

        if ((user.dinheiro || 0) < bioma.preco) {
            return sock.sendMessage(remetente, { text: "❌ Dinheiro físico insuficiente na carteira!\nFalta R$ " + (bioma.preco - (user.dinheiro || 0)).toLocaleString('pt-BR') }, { quoted: msg });
        }

        user.dinheiro -= bioma.preco;
        user.biomaAtivo = idBioma; // Equipa o bioma no perfil do usuário
        db.salvar(id, user);

        const txt = "✅ *BIOMA ADQUIRIDO COM SUCESSO!*\n\n" +
                    "Você comprou a propriedade *[" + bioma.nome + "]* por R$ " + bioma.preco.toLocaleString('pt-BR') + "!\n" +
                    "🌍 _Sua base de mineração foi movida para lá automaticamente. Use !ver-bioma para conferir!_";
                    
        await sock.sendMessage(remetente, { text: txt }, { quoted: msg });
    }
};
