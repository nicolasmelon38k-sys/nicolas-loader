const db = require('../db');
const claUtils = require('../lib/cla_utils');

const niveisCla = [
    { level: 1, req: 0 }, { level: 2, req: 5000 }, { level: 3, req: 15000 }, { level: 4, req: 35000 },
    { level: 5, req: 75000 }, { level: 6, req: 150000 }, { level: 7, req: 300000 }, { level: 8, req: 600000 },
    { level: 9, req: 1000000 }, { level: 10, req: 2000000 }
];

module.exports = {
    name: 'ver-clã',
    execute: async (sock, msg, args) => {
        try {
            const remetente = msg.key.remoteJid;
            const id = db.normalizarId(msg.key.participant || remetente);
            const user = db.obterUsuario(id);
            const clas = claUtils.lerClas();

            let meuCla = null;

            if (args.length > 0) {
                // Busca por nome (Varrendo a lista)
                const nomeBusca = args.join(' ').normalize('NFKC').toLowerCase().trim();
                meuCla = Object.values(clas).find(c => c.nomeOriginal.toLowerCase() === nomeBusca);
            } else if (user && user.cla) {
                meuCla = clas[user.cla];
            }

            if (!meuCla) return sock.sendMessage(remetente, { text: "❌ Clã não encontrado. Use `!ver-clã [nome]`." }, { quoted: msg });

            let totalMoedas = 0;
            let membrosDados = [];
            
            // [...new Set()] garante que, mesmo que o JSON bugue, a view mostra 1x só
            const membrosUnicos = [...new Set(meuCla.membros)]; 

            for (let membroId of membrosUnicos) {
                let mUser = db.obterUsuario(membroId) || {};
                let mMoedas = mUser.moedas || 0;
                let mNome = mUser.nome || membroId.split('@')[0];
                totalMoedas += mMoedas;
                membrosDados.push({ id: membroId, nome: mNome, moedas: mMoedas });
            }

            membrosDados.sort((a, b) => b.moedas - a.moedas);

            let membrosFormatados = [];
            for (let m of membrosDados) {
                let tag = (m.id === meuCla.dono) ? "👑 Dono" : "👤";
                membrosFormatados.push(`┃ ⟫ [${tag}] ${m.nome} — ${m.moedas.toLocaleString('pt-BR')} 🪙`);
            }

            let levelAtual = 1;
            let proxReq = niveisCla[1].req;
            for (let i = 0; i < niveisCla.length; i++) {
                if (totalMoedas >= niveisCla[i].req) {
                    levelAtual = niveisCla[i].level;
                    proxReq = niveisCla[i+1] ? niveisCla[i+1].req : "MAX";
                }
            }

            let barra = `Rumo ao Lv ${levelAtual + 1}: ${totalMoedas.toLocaleString('pt-BR')} / ${typeof proxReq === 'number' ? proxReq.toLocaleString('pt-BR') : proxReq} 🪙`;
            if (levelAtual === 10) barra = `🔥 NÍVEL MÁXIMO 🔥 (${totalMoedas.toLocaleString('pt-BR')} 🪙)`;

            const txt = `╭━━━━━━━『 🛡️ 𝑪𝑳𝑨̃: ${meuCla.nomeOriginal} 』━━━━━━━╮\n` +
                        `┃ 📊 Nível do Clã: ${levelAtual} 🌟\n` +
                        `┃ 📈 Progresso: ${barra}\n` +
                        `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `┃ 👥 *Membros (${membrosUnicos.length}/50):*\n` +
                        membrosFormatados.join("\n") + "\n" +
                        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

            await sock.sendMessage(remetente, { text: txt }, { quoted: msg });
        } catch(e) { console.error(e); }
    }
};
