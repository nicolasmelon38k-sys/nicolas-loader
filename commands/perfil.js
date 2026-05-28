const db = require('../db');
const { tabelaCartoes } = require('./cartao');

function mascararCPF(cpf) {
    if (!cpf || cpf === "Não emitido") return "Não emitido";
    if (cpf.length >= 11) return cpf.substring(0, 3) + ".***.***-" + cpf.substring(cpf.length - 2);
    return "***.***.***-**";
}

module.exports = {
    name: 'perfil',
    execute: async (sock, msg, args) => {
        try {
            const remetente = msg.key.remoteJid;
            const alvoBruto = args.join(' ').trim();
            const id = db.normalizarId(alvoBruto || msg.key.participant || msg.key.remoteJid);
            const user = db.obterUsuario(id);

            if (!user) return sock.sendMessage(remetente, { text: "❌ Usuário não encontrado no banco de dados." }, { quoted: msg });

            const divida = Number(user.divida || 0);
            const statusDiv = divida > 0 ? `\n🚨 *DÍVIDA SPC:* R$ -${divida.toLocaleString('pt-BR')}` : `\n✅ *SITUAÇÃO:* Nome Limpo`;
            const fomeAtual = user.fome !== undefined ? user.fome : 10000;
            const pix = user.chavePix && user.chavePix !== "Não gerada" ? user.chavePix : "Não gerada";
            const cpfCensurado = mascararCPF(user.cpf);

            const cartaoAtivo = user.cartaoAtivo || "basico";
            const infoCard = (tabelaCartoes && tabelaCartoes[cartaoAtivo]) ? tabelaCartoes[cartaoAtivo] : { nome: "💳 Básico" };
            const fatura = user.faturas && user.faturas[cartaoAtivo] ? Number(user.faturas[cartaoAtivo]) : 0;
            const moedasVip = user.moedas || 0;

            let statusDisplay = user.status || 'Solteiro(a)';
            if (statusDisplay.includes('@')) {
                const parts = statusDisplay.split('@');
                const partnerId = parts[1].replace(/[^0-9]/g, '');
                const partner = db.obterUsuario(partnerId);
                const partnerName = partner && partner.nome ? partner.nome : 'Desconhecido';
                statusDisplay = `${parts[0]}*${partnerName}*`;
            }

            // --- SISTEMA DE FAMÍLIA ---
            const fam = user.familia || {};
            let txtFamilia = "❌ Sem família";
            
            if (fam.papel) {
                let membros = [];
                if (fam.pai) { const p = db.obterUsuario(fam.pai); if(p) membros.push(`👨‍👦 *Pai:* ${p.nome}`); }
                if (fam.mae) { const m = db.obterUsuario(fam.mae); if(m) membros.push(`👩‍👦 *Mãe:* ${m.nome}`); }
                if (fam.idade) membros.push(`🎂 *Idade (Filho/a):* ${fam.idade} anos`);
                if (fam.tios && fam.tios.length > 0) {
                    let tiosNomes = fam.tios.map(t => db.obterUsuario(t)?.nome || 'Desconhecido').join(', ');
                    membros.push(`🧔 *Tio(a):* ${tiosNomes}`);
                }
                if (fam.filhos && fam.filhos.length > 0) {
                    let filhosNomes = fam.filhos.map(f => {
                        let objF = db.obterUsuario(f);
                        return objF ? `${objF.nome} (${objF.familia?.idade || '?'}y)` : 'Desconhecido';
                    }).join(', ');
                    membros.push(`👶 *Filhos:* ${filhosNomes}`);
                }
                if (membros.length > 0) txtFamilia = membros.join('\n');
            }

            const perfilLayout = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃         👤 PERFIL DO USUÁRIO
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

👤 *Nome:* ${user.nome || 'Usuário'}
🆔 *CPF:* ${cpfCensurado}
⭐ *Level:* ${user.level || 1}
✨ *XP:* ${(user.xp || 0).toLocaleString('pt-BR')}
🕊️ *Score Moral:* ${user.reputacao || 0} pts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *FINANÇAS*
💵 *Carteira:* R$ ${(user.dinheiro || 0).toLocaleString('pt-BR')}
🏦 *Banco:* R$ ${(user.banco || 0).toLocaleString('pt-BR')}
🪙 *Moedas VIP:* ${moedasVip.toLocaleString('pt-BR')}
🔑 *Chave Pix:* ${pix}${statusDiv}

💳 *CRÉDITO (Ativo)*
🏧 *Cartão:* ${infoCard.nome}
🧾 *Fatura:* R$ ${fatura.toLocaleString('pt-BR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 *CARREIRA & SOBREVIVÊNCIA*
💼 *Emprego:* ${user.emprego || 'Desempregado'}
🍗 *Energia:* ${fomeAtual.toLocaleString('pt-BR')} / 10.000
💬 *Mensagens:* ${(user.mensagens || 0).toLocaleString('pt-BR')}
💞 *Status:* ${statusDisplay}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏡 *ÁRVORE GENEALÓGICA*
${txtFamilia}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

            await sock.sendMessage(remetente, { text: perfilLayout }, { quoted: msg });
        } catch (e) { console.error("Erro no Perfil:", e); }
    }
};
