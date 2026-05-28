function baseJid(jid) {
    return String(jid || '')
        .trim()
        .split('@')[0]
        .split(':')[0];
}

function getSenderJid(msg, sock) {
    if (!msg || !msg.key) return '';
    if (msg.key.fromMe) return sock?.user?.id || msg.key.remoteJid || '';
    return msg.key.participant || msg.key.author || msg.key.remoteJid || msg.participant || '';
}

function getSenderId(msg, sock, db) {
    const senderJid = getSenderJid(msg, sock);
    if (db && typeof db.normalizarId === 'function') {
        return db.normalizarId(senderJid);
    }
    return baseJid(senderJid);
}

function sameJid(a, b) {
    return baseJid(a) === baseJid(b);
}

function isGroupAdmin(groupMetadata, userJid) {
    const target = baseJid(userJid);
    const participant = groupMetadata?.participants?.find(p => {
        const id = baseJid(p.id || p.jid || p.phoneNumber || p.lid);
        return id && id === target;
    });

    return participant?.admin === 'admin' || participant?.admin === 'superadmin';
}

module.exports = {
    baseJid,
    getSenderJid,
    getSenderId,
    sameJid,
    isGroupAdmin
};
