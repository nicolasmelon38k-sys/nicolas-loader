const db = require('../db');

async function isGroupAdmin(sock, chatId, jid) {
    if (!chatId?.endsWith('@g.us') || !jid) return false;

    const meta = await sock.groupMetadata(chatId);
    const alvo = db.normalizarId(jid);

    const participant = meta.participants.find(p => db.normalizarId(p.id) === alvo);

    return Boolean(
        participant &&
        (participant.admin === 'admin' || participant.admin === 'superadmin')
    );
}

module.exports = { isGroupAdmin };
