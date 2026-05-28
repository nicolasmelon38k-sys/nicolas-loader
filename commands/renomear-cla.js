const db = require('../db');
const claUtils = require('../lib/cla_utils');

module.exports = {
    name: 'renomear-clã',
    execute: async (sock, msg, args) => {
        try {
            const remetente = msg.key.remoteJid;
            const id = db.normalizarId(msg.key.participant || remetente);
            let user = db.obterUsuario(id);
            if (!user || !user.cla) return sock.sendMessage(remetente, { text: "❌ Você não está em nenhum clã!" }, { quoted: msg });

            const clas = claUtils.lerClas();
            const meuCla = clas[user.cla];
            if (!meuCla || meuCla.dono !== id) return sock.sendMessage(remetente, { text: "❌ Apenas o dono do clã pode renomear!" }, { quoted: msg });

            const novoNome = args.join(' ').normalize('NFKC').trim();
            if (!/^[a-zA-ZÀ-ÿ0-9 ]{3,20}$/.test(novoNome)) return sock.sendMessage(remetente, { text: "❌ Nome inválido! Use apenas letras e números (3 a 20 chars)." }, { quoted: msg });

            const nomeBusca = novoNome.toLowerCase();
            const existeDuplicado = Object.values(clas).find(c => c.id !== meuCla.id && c.nomeOriginal.toLowerCase() === nomeBusca);
            if (existeDuplicado) return sock.sendMessage(remetente, { text: "❌ Já existe um clã com esse nome!" }, { quoted: msg });

            const preco = 5000000;
            if ((user.dinheiro || 0) < preco) return sock.sendMessage(remetente, { text: "❌ Custa R$ 5.000.000 para renomear o clã." }, { quoted: msg });

            user.dinheiro -= preco;
            db.salvar(id, user);

            meuCla.nomeOriginal = novoNome;
            // ATENÇÃO: Como usamos o ID fixo, não precisamos mais atualizar todos os membros nem convites!
            claUtils.salvarClas(clas);

            await sock.sendMessage(remetente, { text: `✅ Clã renomeado para *${novoNome}*!\n💸 Taxa: R$ 5.000.000` }, { quoted: msg });
        } catch (e) { console.error(e); }
    }
};
