const db = require('../db');
const { pegarNome, formatarValor } = require('../utils/_util');

module.exports = {
    name: 'money',
    execute: async (sock, msg, args) => {
        const reis = ['554896669255', '161830827753644'];
        const remetente = db.normalizarId(msg.key.participant || msg.key.remoteJid);

        if (!reis.includes(remetente)) return;

        const info = msg.message?.extendedTextMessage?.contextInfo || {};
        let alvoId, valorBruto;

        if (info?.quotedMessage) {
            alvoId = db.normalizarId(info.participant);
            valorBruto = args[0];
        } else if (info?.mentionedJid?.[0]) {
            alvoId = db.normalizarId(info.mentionedJid[0]);
            valorBruto = args[1];
        } else {
            alvoId = remetente;
            valorBruto = args[0];
        }

        if (!valorBruto) return;

        const valor = Number(String(valorBruto).replace(/\D/g, '').slice(0, 15));
        if (!Number.isFinite(valor) || valor <= 0) return;

        const user = db.obterUsuario(alvoId);
        if (!user) return;

        const nome = await pegarNome(sock, alvoId);

        db.salvar(alvoId, { dinheiro: (user.dinheiro || 0) + valor });

        const texto =
`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃         💰 SALDO ATUALIZADO
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

👤 Usuário: ${nome}
➕ Valor: ${formatarValor(valor)}
📌 Status: operação concluída
✨ Resultado: saldo aumentado`;

        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};
