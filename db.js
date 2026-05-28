const fs = require('fs');

const dbPath = './database.json';
const historicoPath = './historico.json';

if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
if (!fs.existsSync(historicoPath)) fs.writeFileSync(historicoPath, JSON.stringify([], null, 2));

function lerDB() {
    try {
        const raw = fs.readFileSync(dbPath, 'utf8');
        const data = JSON.parse(raw);
        return data && typeof data === 'object' ? data : {};
    } catch {
        return {};
    }
}

function gravarDB(dados) {
    try {
        const tempPath = `${dbPath}.${Date.now()}.${Math.floor(Math.random() * 1000)}.tmp`;
        fs.writeFileSync(tempPath, JSON.stringify(dados, null, 2));
        fs.renameSync(tempPath, dbPath);
    } catch (e) {
        console.error("🔴 ERRO CRÍTICO AO SALVAR DB:", e);
    }
}

function normalizarId(id) {
    if (!id) return '';
    let raw = String(id);

    if (raw.includes('161830827753644')) return '554896669255';

    return raw
        .split('@')[0]
        .split(':')[0]
        .replace(/[^0-9]/g, '');
}

function usuarioPadrao(nome = "Novato") {
    return {
        nome,
        dinheiro: 100,
        banco: 0,
        chavePix: "Não gerada",
        cpf: "Não emitido",
        xp: 0,
        level: 1,
        emprego: "Auxiliar Geral",
        mensagens: 0,
        comandos: 0,
        inventario: [],
        status: "Solteiro(a)",
        ultimoTrabalho: 0,
        divida: 0,
        fome: 10000
    };
}

function obterUsuario(id) {
    const db = lerDB();
    return db[normalizarId(id)] || null;
}

function registrar(id, nome) {
    const db = lerDB();
    const idNorm = normalizarId(id);

    if (!idNorm) return;
    if (db[idNorm]) return;

    db[idNorm] = usuarioPadrao(nome || "Novato");
    gravarDB(db);
}

function salvar(id, novosDados) {
    const db = lerDB();
    const idNorm = normalizarId(id);

    if (!idNorm) return;

    if (!db[idNorm]) {
        db[idNorm] = usuarioPadrao("Recuperado");
    }

    const TETO_MAXIMO = 1000000000000000;

    if (novosDados.dinheiro !== undefined) {
        let val = Number(novosDados.dinheiro);
        if (isNaN(val) || !Number.isFinite(val)) val = 0;
        novosDados.dinheiro = Math.floor(Math.min(Math.max(0, val), TETO_MAXIMO));
    }

    if (novosDados.banco !== undefined) {
        let val = Number(novosDados.banco);
        if (isNaN(val) || !Number.isFinite(val)) val = 0;
        novosDados.banco = Math.floor(Math.min(Math.max(0, val), TETO_MAXIMO));
    }

    db[idNorm] = { ...db[idNorm], ...novosDados };
    gravarDB(db);
}

async function ganharXP(id, xpGanho, sock, msg) {
    const idNorm = normalizarId(id);
    const user = obterUsuario(idNorm);
    if (!user) return;

    let levelAtual = user.level || 1;

    if (levelAtual >= 4000) {
        if (user.xp !== "MÁXIMO") salvar(idNorm, { xp: "MÁXIMO", level: 4000 });
        return;
    }

    let xpAtual = (user.xp === "MÁXIMO" ? 0 : (user.xp || 0)) + xpGanho;
    const xpProximoNivel = 100 * (levelAtual * levelAtual);

    if (xpAtual >= xpProximoNivel) {
        levelAtual += 1;
        xpAtual = 0;

        if (levelAtual >= 4000) {
            levelAtual = 4000;
            xpAtual = "MÁXIMO";
        }

        salvar(idNorm, { xp: xpAtual, level: levelAtual });

        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✨ *LEVEL UP!* @${idNorm} subiu para o *Nível ${levelAtual}*!`,
                mentions: [`${idNorm}@s.whatsapp.net`]
            }, { quoted: msg });
        } catch {}
    } else {
        salvar(idNorm, { xp: xpAtual });
    }
}

function registrarTransacao(id, dadosTransacao) {
    try {
        const historico = JSON.parse(fs.readFileSync(historicoPath, 'utf8'));
        historico.push({ idUsuario: normalizarId(id), ...dadosTransacao });
        fs.writeFileSync(historicoPath, JSON.stringify(historico, null, 2));
    } catch {}
}

module.exports = {
    obterUsuario,
    salvar,
    ganharXP,
    normalizarId,
    registrar,
    registrarTransacao,
    ler: () => lerDB(),
    gravar: (d) => gravarDB(d)
};
