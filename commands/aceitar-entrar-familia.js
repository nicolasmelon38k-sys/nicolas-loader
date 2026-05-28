const db = require('../db');
module.exports = {
    name: 'aceitar-entrar-familia',
    execute: async (sock, msg) => {
        const id = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        const user = db.obterUsuario(id);

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
        if (!quoted) return sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Você precisa RESPONDER diretamente a mensagem do convite de adoção!" }, { quoted: msg });

        const pedido = user.pedidoFamilia;
        if (!pedido || pedido.msgId !== quoted || pedido.tipo !== 'adocao') {
            return sock.sendMessage(msg.key.remoteJid, { text: "❌ Esse convite não é válido ou não é para você." }, { quoted: msg });
        }
        if (Date.now() > pedido.expira) {
            db.salvar(id, { pedidoFamilia: null });
            return sock.sendMessage(msg.key.remoteJid, { text: "⏳ O tempo do convite expirou (5 min)!" }, { quoted: msg });
        }
        if (user.familia && user.familia.pai) {
            return sock.sendMessage(msg.key.remoteJid, { text: "❌ Você já tem uma família! Use `!abandonar-familia` primeiro." }, { quoted: msg });
        }

        const adotanteId = pedido.de;
        const adotante = db.obterUsuario(adotanteId);
        let paiId = adotante.familia?.papel === 'pai' ? adotanteId : null;
        let maeId = adotante.familia?.papel === 'mae' ? adotanteId : null;

        // VERIFICA SE O ADOTANTE É CASADO (Adota o casal inteiro)
        if (adotante.status && adotante.status.startsWith('Casado(a) com @')) {
            const conjugeId = adotante.status.split('@')[1].replace(/[^0-9]/g, '');
            const conjuge = db.obterUsuario(conjugeId);
            if (conjuge && conjuge.familia) {
                if (conjuge.familia.papel === 'pai') paiId = conjugeId;
                if (conjuge.familia.papel === 'mae') maeId = conjugeId;
                
                // Adiciona o filho no parceiro também
                const conjugeFam = conjuge.familia;
                if (!conjugeFam.filhos) conjugeFam.filhos = [];
                if (!conjugeFam.filhos.includes(id)) conjugeFam.filhos.push(id);
                db.salvar(conjugeId, { familia: conjugeFam });
            }
        }

        // Atualiza a criança
        db.salvar(id, { 
            pedidoFamilia: null, 
            familia: { papel: 'filho', pai: paiId, mae: maeId, idade: 1 }
        });

        // Atualiza o Adotante primário
        const adotanteFam = adotante.familia || { filhos: [] };
        if (!adotanteFam.filhos) adotanteFam.filhos = [];
        if (!adotanteFam.filhos.includes(id)) adotanteFam.filhos.push(id);
        db.salvar(adotanteId, { familia: adotanteFam });

        await sock.sendMessage(msg.key.remoteJid, { text: `🎉 Parabéns! Você agora faz parte da família de *${adotante.nome}*.\n\n👶 Sua idade inicial é 1 ano. Use \`!editar-idade [1 a 40]\` para mudar.` }, { quoted: msg });
    }
};
