const db = require('../db');
const { pegarNome, formatarValor } = require('../utils/_util');

module.exports = {
    name: 'remover-money',
    execute: async (sock, msg, args) => {
        const reis = ['554896669255', '161830827753644'];
        const rem = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        if (!reis.includes(rem)) return;

        const info = msg.message?.extendedTextMessage?.contextInfo || {};
        let alvoId, valorBruto;

        if (info?.quotedMessage) {
            alvoId = db.normalizarId(info.participant);
            valorBruto = args[0];
        } else if (info?.mentionedJid?.[0]) {
            alvoId = db.normalizarId(info.mentionedJid[0]);
            valorBruto = args[1];
        } else {
            alvoId = rem;
            valorBruto = args[0];
        }

        const valor = Number(String(valorBruto).replace(/\D/g, '').slice(0, 15));
        if (!Number.isFinite(valor) || valor <= 0) return;

        const user = db.obterUsuario(alvoId);
        if (!user) return;

        const nome = await pegarNome(sock, alvoId);
        const novoSaldo = Math.max(0, (user.dinheiro || 0) - valor);

        db.salvar(alvoId, { dinheiro: novoSaldo });

        const texto =
`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃         💸 SALDO AJUSTADO
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

👤 Usuário: ${nome}
➖ Valor: ${formatarValor(valor)}
🏦 Saldo atual: ${formatarValor(novoSaldo)}
🔒 Status: confisco concluído`;

        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};
