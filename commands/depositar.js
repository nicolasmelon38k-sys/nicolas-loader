const db = require('../db');

function money(valor) {
    return `R$ ${Number(valor || 0).toLocaleString('pt-BR')}`;
}

module.exports = {
    name: 'depositar',
    execute: async (sock, msg, args) => {
        const id = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        const user = db.obterUsuario(id);
        if (!user) return;

        const valorBruto = args[0];
        if (!valorBruto) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃         ❌ DEPÓSITO INVÁLIDO
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

Use assim:
!depositar 1000`
            }, { quoted: msg });
        }

        const valor = Number(String(valorBruto).replace(/\D/g, '').slice(0, 15));
        if (!Number.isFinite(valor) || valor <= 0) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃         ❌ VALOR INVÁLIDO
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

Digite um número maior que zero.`
            }, { quoted: msg });
        }

        const carteira = Number(user.dinheiro || 0);
        const banco = Number(user.banco || 0);

        if (valor > carteira) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃         ❌ SALDO INSUFICIENTE
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

💰 Carteira: ${money(carteira)}
🏦 Banco: ${money(banco)}

Você não tem esse valor na carteira.`
            }, { quoted: msg });
        }

        const novoDinheiro = carteira - valor;
        const novoBanco = banco + valor;

        db.salvar(id, {
            dinheiro: novoDinheiro,
            banco: novoBanco
        });

        const texto =
`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃           💳 𝑫𝑬𝑷Ó𝑺𝑰𝑻𝑶 𝑹𝑬𝑨𝑳
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

👤 Usuário: ${user.nome || msg.pushName || 'Usuário'}
➕ Depositado: ${money(valor)}
💰 Carteira: ${money(novoDinheiro)}
🏦 Banco: ${money(novoBanco)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✔ Operação concluída com sucesso`;

        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};
