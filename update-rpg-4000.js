const fs = require('fs');

console.log("🚀 INICIANDO MEGA ATUALIZAÇÃO: LEVEL 4000 E NOVAS PROFISSÕES...");

// ==========================================
// 1. ATUALIZAR LISTA GERAL DE CARGOS (cargo.js)
// ==========================================
const cargoJs = `const db = require('../db');
const config = require('../config.json');

const listaCargos = {
    // LEGAIS (14)
    lixeiro: { nome: 'Lixeiro', lvl: 1 },
    atendente: { nome: 'Atendente', lvl: 5 },
    padeiro: { nome: 'Padeiro', lvl: 12 },
    motorista: { nome: 'Motorista', lvl: 20 },
    jardineiro: { nome: 'Jardineiro', lvl: 28 },
    mecanico: { nome: 'Mecânico', lvl: 35 },
    cozinheiro: { nome: 'Cozinheiro', lvl: 45 },
    professor: { nome: 'Professor', lvl: 60 },
    enfermeiro: { nome: 'Enfermeiro', lvl: 80 },
    cientista: { nome: 'Cientista', lvl: 100 },
    'piloto de aviao': { nome: 'Piloto de Avião', lvl: 250 },
    'cirurgiao chefe': { nome: 'Cirurgião Chefe', lvl: 400 },
    'juiz federal': { nome: 'Juiz Federal', lvl: 800 },
    ceo: { nome: 'CEO', lvl: 2000 },

    // ILEGAIS (13)
    pivete: { nome: 'Pivete', lvl: 8 },
    batedor: { nome: 'Batedor', lvl: 15 },
    'vigia de boca': { nome: 'Vigia de Boca', lvl: 25 },
    aviaozinho: { nome: 'Aviãozinho', lvl: 35 },
    clonador: { nome: 'Clonador', lvl: 50 },
    assaltante: { nome: 'Assaltante', lvl: 70 },
    hacker: { nome: 'Hacker', lvl: 85 },
    mercenario: { nome: 'Mercenário', lvl: 110 },
    contrabandista: { nome: 'Contrabandista', lvl: 140 },
    'dono de morro': { nome: 'Dono de Morro', lvl: 180 },
    'barao do po': { nome: 'Barão do Pó', lvl: 600 },
    mafioso: { nome: 'Mafioso', lvl: 1500 },
    'imperador do crime': { nome: 'Imperador do Crime', lvl: 4000 },

    // UNDERGROUND (13)
    'entregador sus': { nome: 'Entregador Sus', lvl: 10 },
    cobrador: { nome: 'Cobrador', lvl: 18 },
    seguranca: { nome: 'Segurança', lvl: 30 },
    job: { nome: 'Job', lvl: 40 },
    agiota: { nome: 'Agiota', lvl: 55 },
    'gerente cassino': { nome: 'Gerente Cassino', lvl: 75 },
    falsificador: { nome: 'Falsificador', lvl: 95 },
    informante: { nome: 'Informante', lvl: 120 },
    politico: { nome: 'Político', lvl: 160 },
    'agente sombra': { nome: 'Agente Sombra', lvl: 200 },
    prostituta: { nome: 'Prostituta', lvl: 300 },
    'hacker de elite': { nome: 'Hacker de Elite', lvl: 1000 },
    'dono da deep web': { nome: 'Dono da Deep Web', lvl: 3000 }
};

function normalizar(texto) {
    return String(texto || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').trim();
}

module.exports = {
    name: 'cargo',
    execute: async (sock, msg, args) => {
        const id = msg.key.participant || msg.key.remoteJid;
        const user = db.obterUsuario(id);
        const prefix = config.prefix || '!';

        if (!user) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Registro não encontrado.' });

        const escolha = normalizar(args.join(' '));
        const userLvl = user.level || 1;

        if (!escolha) {
            return sock.sendMessage(msg.key.remoteJid, { text: \`💼 Use *\${prefix}empregos* para ver a lista.\` });
        }

        const temEmpregoReal = user.emprego && user.emprego !== 'Auxiliar Geral' && user.emprego !== 'Desempregado';

        if (temEmpregoReal) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: \`❌ Você já é *\${user.emprego}*.\\n\\nUse *\${prefix}abandonar* para poder pegar um novo cargo!\`
            }, { quoted: msg });
        }

        const cargo = listaCargos[escolha];
        if (!cargo) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Cargo não encontrado! Digite o nome exato do menu.' });

        if (userLvl < cargo.lvl) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: \`🚫 *NÍVEL INSUFICIENTE*\\n\\nVocê precisa de nível *\${cargo.lvl}* para ser *\${cargo.nome}*.\\nSeu nível atual: *\${userLvl}*\`
            }, { quoted: msg });
        }

        db.salvar(id, { emprego: cargo.nome });
        await sock.sendMessage(msg.key.remoteJid, {
            text: \`🎉 *PARABÉNS!*\\n\\nAgora você é o novo *\${cargo.nome.toUpperCase()}* do Daemon.\`
        }, { quoted: msg });
    }
};`;
fs.writeFileSync('./commands/cargo.js', cargoJs);

// ==========================================
// 2. ATUALIZAR MENU VISUAL (empregos.js)
// ==========================================
const empregosJs = `const config = require('../config.json');

module.exports = {
    name: 'empregos',
    execute: async (sock, msg) => {
        const p = config.prefix || '!';

        const menuEmpregos = \`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃             💼 \${p}EMPREGOS 💼              ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🏙️ 『 𝑳𝑬𝑮𝑨𝑰𝑺 』
🪠 [Lvl 1] Lixeiro         ⟫ R$ 400-800
🛍️ [Lvl 5] Atendente       ⟫ R$ 700-1.400
🥖 [Lvl 12] Padeiro        ⟫ R$ 1.800-3.200
🚚 [Lvl 20] Motorista      ⟫ R$ 2.500-4.800
🌻 [Lvl 28] Jardineiro     ⟫ R$ 3.800-6.200
🔧 [Lvl 35] Mecânico       ⟫ R$ 5.500-8.500
👨‍🍳 [Lvl 45] Cozinheiro      ⟫ R$ 8.000-12.000
📚 [Lvl 60] Professor      ⟫ R$ 12.000-18.000
🏥 [Lvl 80] Enfermeiro     ⟫ R$ 18.000-28.000
🧬 [Lvl 100] Cientista      ⟫ R$ 35K-55K
✈️ [Lvl 250] Piloto de Avião ⟫ R$ 60K-100K
🩺 [Lvl 400] Cirurgião Chefe ⟫ R$ 200K-400K
⚖️ [Lvl 800] Juiz Federal   ⟫ R$ 800K-1.5M
🏢 [Lvl 2000] CEO           ⟫ R$ 6M-15M

🔥 『 𝑰𝑳𝑬𝑮𝑨𝑰𝑺 』
🥷 [Lvl 8] Pivete          ⟫ R$ 900-2.000
👛 [Lvl 15] Batedor        ⟫ R$ 1.500-3.500
👀 [Lvl 25] Vigia de Boca  ⟫ R$ 3.000-6.000
🚲 [Lvl 35] Aviãozinho     ⟫ R$ 5.500-9.000
💳 [Lvl 50] Clonador       ⟫ R$ 10.000-18.000
🔫 [Lvl 70] Assaltante     ⟫ R$ 18.000-32.000
💻 [Lvl 85] Hacker         ⟫ R$ 30.000-50.000
⚔️ [Lvl 110] Mercenário     ⟫ R$ 55.000-90.000
📦 [Lvl 140] Contrabandista ⟫ R$ 90.000-160.000
👑 [Lvl 180] Dono de Morro  ⟫ R$ 250K-500K
❄️ [Lvl 600] Barão do Pó    ⟫ R$ 500K-900K
🕴️ [Lvl 1500] Mafioso       ⟫ R$ 3M-6M
🌍 [Lvl 4000] Imperador do Crime ⟫ R$ 40M-100M

🕶️ 『 𝑼𝑵𝑫𝑬𝑹𝑮𝑹𝑶𝑼𝑵𝑫 』
📦 [Lvl 10] Entregador Sus  ⟫ R$ 1.200-2.500
💢 [Lvl 18] Cobrador       ⟫ R$ 2.200-4.200
🛡️ [Lvl 30] Segurança      ⟫ R$ 4.500-7.800
✨ [Lvl 40] Job            ⟫ R$ 8.000-14.000
💰 [Lvl 55] Agiota         ⟫ R$ 12.000-22.000
🎰 [Lvl 75] Gerente Cassino⟫ R$ 25K-42K
📄 [Lvl 95] Falsificador   ⟫ R$ 40K-68K
🕵️ [Lvl 120] Informante     ⟫ R$ 75K-120K
🏛️ [Lvl 160] Político      ⟫ R$ 180K-350K
🌑 [Lvl 200] Agente Sombra  ⟫ R$ 500K-900K
💄 [Lvl 300] Prostituta     ⟫ R$ 150K-300K
🕸️ [Lvl 1000] Hacker de Elite ⟫ R$ 1.5M-3M
🌌 [Lvl 3000] Dono da Deep Web ⟫ R$ 15M-35M

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Use: \${p}cargo nome-do-cargo
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\`.trim();

        await sock.sendMessage(msg.key.remoteJid, { text: menuEmpregos }, { quoted: msg });
    }
};`;
fs.writeFileSync('./commands/empregos.js', empregosJs);

// ==========================================
// 3. ATUALIZAR SALÁRIOS GIGANTES (trabalhar.js)
// ==========================================
const trabalharJs = `const db = require('../db');
let petsDb = {};
try { petsDb = require('../data/pets'); } catch(e){}

const salarios = {
    // LEGAIS
    "Lixeiro": { min: 400, max: 800, xp: 20 },
    "Atendente": { min: 700, max: 1400, xp: 25 },
    "Padeiro": { min: 1800, max: 3200, xp: 35 },
    "Motorista": { min: 2500, max: 4800, xp: 45 },
    "Jardineiro": { min: 3800, max: 6200, xp: 55 },
    "Mecânico": { min: 5500, max: 8500, xp: 65 },
    "Cozinheiro": { min: 8000, max: 12000, xp: 80 },
    "Professor": { min: 12000, max: 18000, xp: 100 },
    "Enfermeiro": { min: 18000, max: 28000, xp: 130 },
    "Cientista": { min: 35000, max: 55000, xp: 180 },
    "Piloto de Avião": { min: 60000, max: 100000, xp: 300 },
    "Cirurgião Chefe": { min: 200000, max: 400000, xp: 500 },
    "Juiz Federal": { min: 800000, max: 1500000, xp: 1200 },
    "CEO": { min: 6000000, max: 15000000, xp: 4000 },
    
    // ILEGAIS
    "Pivete": { min: 900, max: 2000, xp: 30 },
    "Batedor": { min: 1500, max: 3500, xp: 40 },
    "Vigia de Boca": { min: 3000, max: 6000, xp: 60 },
    "Aviãozinho": { min: 5500, max: 9000, xp: 80 },
    "Clonador": { min: 10000, max: 18000, xp: 110 },
    "Assaltante": { min: 18000, max: 32000, xp: 150 },
    "Hacker": { min: 30000, max: 50000, xp: 200 },
    "Mercenário": { min: 55000, max: 90000, xp: 280 },
    "Contrabandista": { min: 90000, max: 160000, xp: 400 },
    "Dono de Morro": { min: 250000, max: 500000, xp: 800 },
    "Barão do Pó": { min: 500000, max: 900000, xp: 800 },
    "Mafioso": { min: 3000000, max: 6000000, xp: 2500 },
    "Imperador do Crime": { min: 40000000, max: 100000000, xp: 15000 },
    
    // UNDERGROUND
    "Entregador Sus": { min: 1200, max: 2500, xp: 35 },
    "Cobrador": { min: 2200, max: 4200, xp: 50 },
    "Segurança": { min: 4500, max: 7800, xp: 75 },
    "Job": { min: 8000, max: 14000, xp: 110 },
    "Agiota": { min: 12000, max: 22000, xp: 160 },
    "Gerente Cassino": { min: 25000, max: 42000, xp: 220 },
    "Falsificador": { min: 40000, max: 68000, xp: 300 },
    "Informante": { min: 75000, max: 120000, xp: 450 },
    "Político": { min: 180000, max: 350000, xp: 700 },
    "Agente Sombra": { min: 500000, max: 900000, xp: 1200 },
    "Prostituta": { min: 150000, max: 300000, xp: 400 },
    "Hacker de Elite": { min: 1500000, max: 3000000, xp: 1800 },
    "Dono da Deep Web": { min: 15000000, max: 35000000, xp: 8000 }
};

function gerarBarra(pct) {
    const total = 20;
    const cheio = Math.round((pct / 100) * total);
    return '█'.repeat(cheio) + '░'.repeat(total - cheio);
}

module.exports = {
    name: 'trabalhar',
    execute: async (sock, msg, args) => {
        const id = msg.key.participant || msg.key.remoteJid;
        const remetente = msg.key.remoteJid;
        const user = db.obterUsuario(id);

        if (!user) return;

        const cooldown = 5 * 60 * 1000;
        const agora = Date.now();
        if (agora - (user.ultimoTrabalho || 0) < cooldown) {
            const falta = cooldown - (agora - user.ultimoTrabalho);
            const m = Math.floor(falta/60000), s = Math.floor((falta%60000)/1000);
            return sock.sendMessage(remetente, { text: \`⏳ *DESCANSE!* Você já trabalhou demais.\\nVolte em: *\${m}m \${s}s*\` }, { quoted: msg });
        }

        const nome = user.nome || msg.pushName || "Usuário";
        const emp = user.emprego || "Lixeiro";
        const info = salarios[emp] || salarios["Lixeiro"];

        const ganhoBase = Math.floor(Math.random() * (info.max - info.min + 1)) + info.min;
        const prod = Math.floor(Math.random() * 21) + 75;
        const barra = gerarBarra(prod);

        let bonusPet = 0;
        let nomePet = "";
        let iconePet = "";

        if (user.inventario) {
            for (let item of user.inventario) {
                if (petsDb && petsDb[item]) {
                    if (petsDb[item].bonus > bonusPet) {
                        bonusPet = petsDb[item].bonus;
                        nomePet = item;
                        iconePet = petsDb[item].icone;
                    }
                }
            }
        }

        const ganhoFinal = ganhoBase + bonusPet;

        await db.ganharXP(id, info.xp, sock, msg);
        db.salvar(id, { dinheiro: (user.dinheiro || 0) + ganhoFinal, ultimoTrabalho: agora });

        const txtBonus = bonusPet > 0 ? \`\\n🐾 𝑩𝒐̂𝒏𝒖𝒔 𝑷𝒆𝒕 (\${iconePet} \${nomePet}): + R$ \${bonusPet.toLocaleString('pt-BR')}\` : "";

        const texto = \`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃           💼 !𝑻𝑹𝑨𝑩𝑨𝑳𝑯𝑨𝑹 💼            ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

👤 𝑼𝒔𝒖𝒂́𝒓𝒊𝒐: \${nome}
💼 𝑬𝒎𝒑𝒓𝒆𝒈𝒐: \${emp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏳ 𝑻𝒓𝒂𝒃𝒂𝒍𝒉𝒂𝒏𝒅𝒐...
\${barra} \${prod}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 𝑮𝒂𝒏𝒉𝒐𝒔:

💵 𝑺𝒂𝒍𝒂́𝒓𝒊𝒐 𝑩𝒂𝒔𝒆: R$ \${ganhoBase.toLocaleString('pt-BR')}\${txtBonus}
✨ 𝑿𝑷: +\${info.xp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 𝑺𝒕𝒂𝒕𝒖𝒔:
✔ 𝑻𝒓𝒂𝒃𝒂𝒍𝒉𝒐 𝒄𝒐𝒏𝒄𝒍𝒖́𝒅𝒐
🔥 𝑷𝒓𝒐𝒅𝒖𝒕𝒊𝒗𝒊𝒅𝒂𝒅𝒆 𝒂𝒍𝒕𝒂
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\`;

        await sock.sendMessage(remetente, { text: texto }, { quoted: msg });
    }
};`;
fs.writeFileSync('./commands/trabalhar.js', trabalharJs);

// ==========================================
// 4. ATUALIZAR LIMITE COMANDO LEVEL (level.js)
// ==========================================
const levelJs = `const db = require('../db');

module.exports = {
    name: 'level',
    execute: async (sock, msg, args) => {
        try {
            const remetente = msg.key.remoteJid;
            const idDono = db.normalizarId(msg.key.participant || msg.key.remoteJid);

            if (idDono !== '554896669255') return;

            let alvoRaw = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                          msg.message?.extendedTextMessage?.contextInfo?.participant;

            const alvoId = alvoRaw ? db.normalizarId(alvoRaw) : idDono;
            const userAlvo = db.obterUsuario(alvoId);

            if (!userAlvo) return sock.sendMessage(remetente, { text: "❌ *ERRO:* Usuário não encontrado." }, { quoted: msg });

            const novoLevel = parseInt(args.find(a => !isNaN(a) && a.length <= 4));

            if (isNaN(novoLevel) || novoLevel < 1 || novoLevel > 4000) {
                return sock.sendMessage(remetente, { text: "⚠️ *FORMATO INVÁLIDO*\\n\\nUse: !level [1-4000] @user" }, { quoted: msg });
            }

            const levelAntigo = userAlvo.level || 1;
            db.salvar(alvoId, { level: novoLevel, xp: 0 });

            const textoSucesso = \`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃      ⭐ 𝑨𝑳𝑻𝑬𝑹𝑨𝑪̧𝑨̃𝑶 𝑫𝑬 𝑳𝑬𝑽𝑬𝑳      ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
👤 *𝑼𝒔𝒖𝒂́𝒓𝒊𝒐:* @\${alvoId}
📊 *𝑺𝒕𝒂𝒕𝒖𝒔:* Modificado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📉 𝑨𝒏𝒕𝒆𝒔: Lvl \${levelAntigo}
📈 𝑨𝒈𝒐𝒓𝒂: Lvl \${novoLevel}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ _O progresso foi atualizado pelo Administrador._
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\`.trim();

            await sock.sendMessage(remetente, { text: textoSucesso, mentions: [alvoId + '@s.whatsapp.net'] }, { quoted: msg });
        } catch (error) { console.log("Erro no comando Level:", error); }
    }
};`;
fs.writeFileSync('./commands/level.js', levelJs);

// ==========================================
// 5. ATUALIZAR REBAIXAMENTOS (remover-level.js)
// ==========================================
const removerLevelJs = `const db = require('../db');
const { pegarNome } = require('../utils/_util');

// Traz a lista sincronizada para não errar demissões
const listaCargos = {
    "Lixeiro": 1, "Atendente": 5, "Padeiro": 12, "Motorista": 20, "Jardineiro": 28, "Mecânico": 35,
    "Cozinheiro": 45, "Professor": 60, "Enfermeiro": 80, "Cientista": 100, "Piloto de Avião": 250,
    "Cirurgião Chefe": 400, "Juiz Federal": 800, "CEO": 2000, "Pivete": 8, "Batedor": 15,
    "Vigia de Boca": 25, "Aviãozinho": 35, "Clonador": 50, "Assaltante": 70, "Hacker": 85,
    "Mercenário": 110, "Contrabandista": 140, "Dono de Morro": 180, "Barão do Pó": 600,
    "Mafioso": 1500, "Imperador do Crime": 4000, "Entregador Sus": 10, "Cobrador": 18,
    "Segurança": 30, "Job": 40, "Agiota": 55, "Gerente Cassino": 75, "Falsificador": 95,
    "Informante": 120, "Político": 160, "Agente Sombra": 200, "Prostituta": 300,
    "Hacker de Elite": 1000, "Dono da Deep Web": 3000
};

module.exports = {
    name: 'remover-level',
    execute: async (sock, msg, args) => {
        const reis = ['554896669255', '161830827753644'];
        const rem = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        if (!reis.includes(rem)) return;

        const info = msg.message?.extendedTextMessage?.contextInfo || {};
        let alvoId, valorBruto;

        if (info?.quotedMessage) { alvoId = db.normalizarId(info.participant); valorBruto = args[0]; }
        else if (info?.mentionedJid?.[0]) { alvoId = db.normalizarId(info.mentionedJid[0]); valorBruto = args[1]; }
        else { alvoId = rem; valorBruto = args[0]; }

        const user = db.obterUsuario(alvoId);
        if (!user) return;

        const lvlParaRemover = Number(String(valorBruto).replace(/\\D/g, '').slice(0, 15));
        if (!lvlParaRemover || lvlParaRemover <= 0) return;

        const oldLevel = Number(user.level || 1);
        const novoLevel = Math.max(1, oldLevel - lvlParaRemover);
        const nome = user.nome || await pegarNome(sock, alvoId);

        let cargoFinal = user.emprego || "Auxiliar Geral";
        let avisoCargo = "Mantido";

        let lvlExigido = listaCargos[user.emprego];
        if (lvlExigido && novoLevel < lvlExigido) {
            cargoFinal = "Auxiliar Geral";
            avisoCargo = "⚠️ PERDIDO (Nível insuficiente)";
        }

        db.salvar(alvoId, { level: novoLevel, xp: 0, emprego: cargoFinal });

        const texto = \`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃      📉 𝑹𝑬𝑩𝑨𝑰𝑿𝑨𝑴𝑬𝑵𝑻𝑶 📉      ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
👤 *𝑼𝒔𝒖𝒂́𝒓𝒊𝒐:* \${nome}
⚠️ *𝑺𝒕𝒂𝒕𝒖𝒔:* Punição Administrativa
📉 *𝑯𝑰𝑺𝑻𝑶́𝑹𝑰𝑪𝑶:*
• Level Anterior: \${oldLevel}
• Removidos: -\${lvlParaRemover}
• Level Atual: \${novoLevel}
💼 *𝑶𝑪𝑼𝑷𝑨𝑪̧𝑨̃𝑶:*
• Cargo Final: \${cargoFinal}
• Motivo: \${avisoCargo}
📊 *𝑺𝑻𝑨𝑻𝑼𝑺:*
• XP: Resetado para 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ _Justiça do bot aplicada com sucesso._\`;

        await sock.sendMessage(msg.key.remoteJid, { text: texto, mentions: [\`\${alvoId}@s.whatsapp.net\`] }, { quoted: msg });
    }
};`;
fs.writeFileSync('./commands/remover-level.js', removerLevelJs);

// ==========================================
// 6. ATUALIZAR INTERFACE SALDO (saldo.js)
// ==========================================
const saldoJs = `const db = require('../db');
const { tabelaCartoes } = require('./cartao');

function money(valor) { return \`R$ \${Number(valor || 0).toLocaleString('pt-BR')}\`; }
function barraXp(xpAtual, xpNecessario) {
    if (xpAtual === "MÁXIMO") return '████████████████████';
    const total = 20;
    const pct = xpNecessario > 0 ? Math.min(100, Math.max(0, (xpAtual / xpNecessario) * 100)) : 0;
    const cheio = Math.round((pct / 100) * total);
    return '█'.repeat(cheio) + '░'.repeat(total - cheio);
}

module.exports = {
    name: 'saldo',
    execute: async (sock, msg, args) => {
        const alvoBruto = args.join(' ').trim();
        const id = alvoBruto ? db.normalizarId(alvoBruto) : db.normalizarId(msg.key.participant || msg.key.remoteJid);
        const user = db.obterUsuario(id);

        if (!user) return sock.sendMessage(msg.key.remoteJid, { text: "❌ SALDO NÃO ENCONTRADO." }, { quoted: msg });

        const nome = msg.pushName || user.nome || 'Usuário';
        const dinheiro = Number(user.dinheiro || 0);
        const banco = Number(user.banco || 0);
        const level = Number(user.level || 1);
        const xpAtual = user.xp === "MÁXIMO" ? "MÁXIMO" : Number(user.xp || 0);
        const xpNecessario = 100 * (level * level);

        const cartaoAtivo = user.cartaoAtivo || "Nenhum";
        const fatura = user.faturas && user.faturas[cartaoAtivo] ? Number(user.faturas[cartaoAtivo]) : 0;
        let limiteTotal = 0; let nomeCartao = "Sem Cartão";

        if (cartaoAtivo !== "Nenhum" && tabelaCartoes[cartaoAtivo]) {
            limiteTotal = tabelaCartoes[cartaoAtivo].limite;
            nomeCartao = tabelaCartoes[cartaoAtivo].nome;
        }
        const limiteDisponivel = Math.max(0, limiteTotal - fatura);
        const xpDisplay = xpAtual === "MÁXIMO" ? "MAX" : \`\${xpAtual.toLocaleString('pt-BR')} / \${xpNecessario.toLocaleString('pt-BR')}\`;

        const texto = \`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃           💎 𝑺𝑨𝑳𝑫𝑶 𝑹𝑬𝑨𝑳 💎           ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
👤 𝑼𝒔𝒖́𝒂𝒓𝒊𝒐: \${nome}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 𝑪𝒂𝒓𝒕𝒆𝒊𝒓𝒂 (Físico): \${money(dinheiro)}
🏦 𝑩𝒂𝒏𝒄𝒐 (Corrente): \${money(banco)}
💳 𝑪𝒂𝒓𝒕𝒂̃𝒐 𝒅𝒆 𝑪𝒓𝒆́𝒅𝒊𝒕𝒐: \${nomeCartao}
📈 𝑳𝒊𝒎𝒊𝒕𝒆 𝑫𝒊𝒔𝒑𝒐𝒏𝒊́𝒗𝒆𝒍: \${money(limiteDisponivel)}
🧾 𝑭𝒂𝒕𝒖𝒓𝒂 𝑨𝒕𝒖𝒂𝒍: \${money(fatura)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ 𝑳𝒆𝒗𝒆𝒍: \${level} / 4000
✨ 𝑿𝑷: \${xpDisplay}
⏳ [\${barraXp(xpAtual, xpNecessario)}]
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\`;

        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};`;
fs.writeFileSync('./commands/saldo.js', saldoJs);

// ==========================================
// 7. INJETAR TRAVA DE XP 4000 NO (db.js)
// ==========================================
let dbFile = fs.readFileSync('./db.js', 'utf8');

// Regex para encontrar a função ganharXP antiga e substituir pela blindada
const regexXP = /async function ganharXP\(id, xpGanho, sock, msg\).*?\}\s*else\s*\{\s*salvar\(idNorm, \{ xp: xpAtual \}\);\s*\}\s*\}/s;

const novaFuncaoXP = `async function ganharXP(id, xpGanho, sock, msg) {
    const idNorm = normalizarId(id);
    const user = obterUsuario(idNorm);
    if (!user) return;

    let levelAtual = user.level || 1;
    if (levelAtual >= 4000) {
        if (user.xp !== "MÁXIMO") salvar(idNorm, { xp: "MÁXIMO", level: 4000 });
        return; // Bloqueia subir além de 4000
    }

    let xpAtual = (user.xp === "MÁXIMO" ? 0 : (user.xp || 0)) + xpGanho;
    let xpProximoNivel = 100 * (levelAtual * levelAtual);

    if (xpAtual >= xpProximoNivel) {
        levelAtual += 1;
        xpAtual = 0;
        if (levelAtual >= 4000) { levelAtual = 4000; xpAtual = "MÁXIMO"; }
        
        salvar(idNorm, { xp: xpAtual, level: levelAtual });
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: \`✨ *LEVEL UP!* @\${idNorm} subiu para o *Nível \${levelAtual}*!\`,
                mentions: [\`\${idNorm}@s.whatsapp.net\`]
            }, { quoted: msg });
        } catch (e) {}
    } else {
        salvar(idNorm, { xp: xpAtual });
    }
}`;

if (dbFile.match(regexXP)) {
    dbFile = dbFile.replace(regexXP, novaFuncaoXP);
    fs.writeFileSync('./db.js', dbFile);
}

console.log("🎯 SUCESSO! NOVA ECONOMIA, PROFISSÕES E CAP LEVEL 4000 INSTALADOS!");
