const db = require('../db');
const claUtils = require('../lib/cla_utils');

module.exports = {
    name: 'criar-clã',
    execute: async (sock, msg, args) => {
        try {
            const remetente = msg.key.remoteJid;
            const id = db.normalizarId(msg.key.participant || remetente);
            let user = db.obterUsuario(id);
            if (!user) return;

            if (user.cla) return sock.sendMessage(remetente, { text: "❌ Você já pertence a um clã!" }, { quoted: msg });

            // Normaliza para evitar exploits de Unicode e limpa espaços extras
            let nomeCla = args.join(' ').normalize('NFKC').trim();
            
            // Regex restrita: Apenas letras, números, acentos e espaços (Sem símbolos invisíveis)
            if (!/^[a-zA-ZÀ-ÿ0-9 ]{3,20}$/.test(nomeCla)) {
                return sock.sendMessage(remetente, { text: "❌ Nome inválido! Use apenas letras e números (3 a 20 caracteres)." }, { quoted: msg });
            }

            const clas = claUtils.lerClas();
            
            // Verifica se o NOME já existe (buscando pelo valor)
            const nomeBusca = nomeCla.toLowerCase();
            const existeDuplicado = Object.values(clas).find(c => c.nomeOriginal.toLowerCase() === nomeBusca);
            if (existeDuplicado) return sock.sendMessage(remetente, { text: "❌ Já existe um clã com esse nome!" }, { quoted: msg });

            const preco = 100000000;
            if ((user.dinheiro || 0) < preco) return sock.sendMessage(remetente, { text: `❌ Você precisa de R$ 100.000.000 para criar um clã!` }, { quoted: msg });

            const claId = claUtils.gerarId(); // O ID é fixo (ex: cla_8f2js), o nome é só visual!
            
            user.dinheiro -= preco;
            user.cla = claId;
            db.salvar(id, user);

            clas[claId] = { id: claId, nomeOriginal: nomeCla, dono: id, membros: [id], dataCriacao: Date.now() };
            claUtils.salvarClas(clas);

            const txt = `╭━━━━━━━『 🛡️ 𝑪𝑳𝑨̃ 𝑪𝑹𝑰𝑨𝑫𝑶 』━━━━━━━╮\n┃ 🎉 Parabéns! O clã *${nomeCla}* foi fundado!\n┃ 💸 Custou: R$ 100.000.000\n┃ 👑 Você agora é o Líder Supremo!\n┃ 💡 Use !convidar-clã para recrutar.\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(remetente, { text: txt }, { quoted: msg });
        } catch (e) {
            console.error(e);
        }
    }
};
