const db = require('../db');

function formatarValor(valor) {
    const n = Number(valor || 0);
    return `R$ ${n.toLocaleString('pt-BR')}`;
}

async function pegarNome(sock, id) {
    const chave = db.normalizarId(id);
    const user = db.obterUsuario(chave);

    if (user?.nome && String(user.nome).trim()) {
        return String(user.nome).trim().replace(/\s+/g, ' ');
    }

    try {
        const jid = db.toMentionJid(chave);
        if (sock?.getName) {
            const nomeContato = await sock.getName(jid);
            if (nomeContato && String(nomeContato).trim()) {
                return String(nomeContato).trim().replace(/\s+/g, ' ');
            }
        }
    } catch (_) {}

    return 'Usuário';
}

function linhaBarra(titulo) {
    return `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃ ${titulo}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
}

module.exports = { formatarValor, pegarNome, linhaBarra };
