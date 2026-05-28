const db = require('../db');

module.exports = {
    name: 'dados',
    execute: async (sock, msg, args) => {
        // 👑 Agora só tem o seu número real aqui
        const reis = ['554896669255'];

        let quemPediuRaw = msg.key.fromMe ? sock.user.id : (msg.key.participant || msg.key.remoteJid);
        const remetente = db.normalizarId(quemPediuRaw);

        const isDono = reis.some(numeroBase => remetente.startsWith(numeroBase));

        if (!isDono) return;

        try {
            const dados = db.ler();
            const alvoBruto = args.join(' ').trim();
            const alvoId = alvoBruto ? db.normalizarId(alvoBruto) : null;

            const limparUser = (u) => {
                if (!u) return null;
                const limpo = { ...u };
                delete limpo.ultimoDaily;
                delete limpo.jogadasTigrinho;
                delete limpo.tempoAtivo;
                delete limpo.ledger;
                return limpo;
            };

            if (alvoId) {
                const chaveExata = Object.keys(dados).find(key => key.startsWith(alvoId));
                const user = chaveExata ? dados[chaveExata] : null;

                if (!user) {
                    return sock.sendMessage(msg.key.remoteJid, {
                        text: '❌ Usuário não encontrado no DB.'
                    }, { quoted: msg });
                }

                return sock.sendMessage(msg.key.remoteJid, {
                    text: JSON.stringify(limparUser(user), null, 2)
                }, { quoted: msg });
            }

            const dbLimpo = {};
            for (let id in dados) {
                dbLimpo[id] = limparUser(dados[id]);
            }

            await sock.sendMessage(msg.key.remoteJid, {
                text: JSON.stringify(dbLimpo, null, 2)
            }, { quoted: msg });

        } catch (err) {
            console.error('Erro no !dados:', err);
        }
    }
};
