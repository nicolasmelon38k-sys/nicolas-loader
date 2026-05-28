const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT, 'apagadas-db.jsonl');
const MEDIA_DIR = path.join(ROOT, 'apagadas-media');

function ensure() {
    if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '');
}

function appendJsonl(filePath, data) {
    fs.appendFileSync(filePath, JSON.stringify(data) + '\n');
}

function readJsonl(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
    const out = [];

    for (const line of lines) {
        try {
            out.push(JSON.parse(line));
        } catch {}
    }

    return out;
}

function saveIncoming(record) {
    ensure();
    appendJsonl(DB_PATH, { kind: 'inbox', ...record });
}

function saveDeleted(record) {
    ensure();
    appendJsonl(DB_PATH, { kind: 'deleted', ...record });
}

function listDeleted(chatId) {
    ensure();
    return readJsonl(DB_PATH).filter(r => r.kind === 'deleted' && r.chatId === chatId);
}

function findOriginal(chatId, messageId) {
    const all = readJsonl(DB_PATH).filter(r => r.kind === 'inbox' && r.chatId === chatId);
    for (let i = all.length - 1; i >= 0; i--) {
        if (all[i].messageId === messageId) return all[i];
    }
    return null;
}

function alreadyDeleted(chatId, messageId) {
    const all = readJsonl(DB_PATH).filter(r => r.kind === 'deleted' && r.chatId === chatId);
    return all.some(r => r.messageId === messageId);
}

function clearAll() {
    ensure();
    fs.writeFileSync(DB_PATH, '');

    if (fs.existsSync(MEDIA_DIR)) {
        for (const file of fs.readdirSync(MEDIA_DIR)) {
            fs.rmSync(path.join(MEDIA_DIR, file), { force: true, recursive: true });
        }
    }
}

module.exports = {
    MEDIA_DIR,
    saveIncoming,
    saveDeleted,
    listDeleted,
    findOriginal,
    alreadyDeleted,
    clearAll
};
