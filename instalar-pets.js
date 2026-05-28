const fs = require('fs');

console.log("🐾 INICIANDO INSTALAÇÃO DO SISTEMA DE PETS...");

// ==========================================
// 1. BANCO DE DADOS DOS PETS
// ==========================================
const petsData = [
    { id: 601, nome: "Bolinha", preco: 500, bonus: 50, raridade: "Comum", icone: "🐶" },
    { id: 602, nome: "Mimi", preco: 1000, bonus: 75, raridade: "Comum", icone: "🐶" },
    { id: 603, nome: "Nino", preco: 1500, bonus: 100, raridade: "Comum", icone: "🐶" },
    { id: 604, nome: "Pipoca", preco: 2000, bonus: 125, raridade: "Comum", icone: "🐶" },
    { id: 605, nome: "Floquinho", preco: 2500, bonus: 150, raridade: "Comum", icone: "🐶" },
    { id: 606, nome: "Pingo", preco: 3000, bonus: 175, raridade: "Comum", icone: "🐶" },
    { id: 607, nome: "Tico", preco: 3500, bonus: 200, raridade: "Comum", icone: "🐶" },
    { id: 608, nome: "Fofuxo", preco: 4000, bonus: 225, raridade: "Comum", icone: "🐶" },
    { id: 609, nome: "Lili", preco: 4500, bonus: 250, raridade: "Comum", icone: "🐶" },
    { id: 610, nome: "Totó", preco: 5000, bonus: 300, raridade: "Comum", icone: "🐶" },
    { id: 611, nome: "Luna", preco: 7500, bonus: 400, raridade: "Incomum", icone: "🦊" },
    { id: 612, nome: "Kiko", preco: 9000, bonus: 500, raridade: "Incomum", icone: "🦊" },
    { id: 613, nome: "Nuvem", preco: 10500, bonus: 600, raridade: "Incomum", icone: "🦊" },
    { id: 614, nome: "Mel", preco: 12000, bonus: 700, raridade: "Incomum", icone: "🦊" },
    { id: 615, nome: "Choco", preco: 13500, bonus: 800, raridade: "Incomum", icone: "🦊" },
    { id: 616, nome: "Pandora", preco: 15000, bonus: 900, raridade: "Incomum", icone: "🦊" },
    { id: 617, nome: "Blue", preco: 17500, bonus: 1000, raridade: "Incomum", icone: "🦊" },
    { id: 618, nome: "Amora", preco: 20000, bonus: 1100, raridade: "Incomum", icone: "🦊" },
    { id: 619, nome: "Mimo", preco: 22500, bonus: 1200, raridade: "Incomum", icone: "🦊" },
    { id: 620, nome: "Cookie", preco: 25000, bonus: 1500, raridade: "Incomum", icone: "🦊" },
    { id: 621, nome: "Fênix", preco: 30000, bonus: 2000, raridade: "Raro", icone: "🐺" },
    { id: 622, nome: "Draco", preco: 35000, bonus: 2500, raridade: "Raro", icone: "🐺" },
    { id: 623, nome: "Sombra", preco: 40000, bonus: 3000, raridade: "Raro", icone: "🐺" },
    { id: 624, nome: "Peludinho", preco: 45000, bonus: 3500, raridade: "Raro", icone: "🐺" },
    { id: 625, nome: "Sol", preco: 50000, bonus: 4000, raridade: "Raro", icone: "🐺" },
    { id: 626, nome: "Douradinho", preco: 55000, bonus: 4500, raridade: "Raro", icone: "🐺" },
    { id: 627, nome: "Fumaça", preco: 60000, bonus: 5000, raridade: "Raro", icone: "🐺" },
    { id: 628, nome: "Kiwi", preco: 65000, bonus: 5500, raridade: "Raro", icone: "🐺" },
    { id: 629, nome: "Branquinho", preco: 70000, bonus: 6000, raridade: "Raro", icone: "🐺" },
    { id: 630, nome: "Jacozinho", preco: 75000, bonus: 7000, raridade: "Raro", icone: "🐺" },
    { id: 631, nome: "Astra", preco: 90000, bonus: 10000, raridade: "Épico", icone: "✨" },
    { id: 632, nome: "Noa", preco: 110000, bonus: 12000, raridade: "Épico", icone: "✨" },
    { id: 633, nome: "Luar", preco: 130000, bonus: 14000, raridade: "Épico", icone: "✨" },
    { id: 634, nome: "Selene", preco: 150000, bonus: 16000, raridade: "Épico", icone: "✨" },
    { id: 635, nome: "Spike", preco: 175000, bonus: 18000, raridade: "Épico", icone: "✨" },
    { id: 636, nome: "Orion", preco: 200000, bonus: 20000, raridade: "Épico", icone: "✨" },
    { id: 637, nome: "Ursozinho", preco: 225000, bonus: 22000, raridade: "Épico", icone: "✨" },
    { id: 638, nome: "Vento", preco: 250000, bonus: 24000, raridade: "Épico", icone: "✨" },
    { id: 639, nome: "Léo", preco: 275000, bonus: 26000, raridade: "Épico", icone: "✨" },
    { id: 640, nome: "Pratinha", preco: 300000, bonus: 30000, raridade: "Épico", icone: "✨" },
    { id: 641, nome: "Imperador", preco: 400000, bonus: 40000, raridade: "Lendário", icone: "👑" },
    { id: 642, nome: "Fenrir", preco: 500000, bonus: 45000, raridade: "Lendário", icone: "👑" },
    { id: 643, nome: "Pedrinho", preco: 650000, bonus: 50000, raridade: "Lendário", icone: "👑" },
    { id: 644, nome: "Solzinho", preco: 800000, bonus: 55000, raridade: "Lendário", icone: "👑" },
    { id: 645, nome: "Levi", preco: 1000000, bonus: 60000, raridade: "Lendário", icone: "👑" },
    { id: 646, nome: "Kirin", preco: 1250000, bonus: 65000, raridade: "Lendário", icone: "👑" },
    { id: 647, nome: "Abismo", preco: 1600000, bonus: 70000, raridade: "Lendário", icone: "👑" },
    { id: 648, nome: "Cosmos", preco: 2000000, bonus: 80000, raridade: "Lendário", icone: "👑" },
    { id: 649, nome: "Vácuo", preco: 3500000, bonus: 100000, raridade: "Secreto", icone: "🌌" },
    { id: 650, nome: "Titanzinho", preco: 5000000, bonus: 150000, raridade: "Secreto", icone: "🌌" }
];

let petsFileContent = "module.exports = {\n";
petsData.forEach(p => {
    petsFileContent += `  "${p.nome}": { id: ${p.id}, preco: ${p.preco}, bonus: ${p.bonus}, raridade: "${p.raridade}", icone: "${p.icone}" },\n`;
});
petsFileContent += "};\n";
fs.writeFileSync('./data/pets.js', petsFileContent);
console.log("✅ data/pets.js (Motor de Status dos Pets) criado!");

// ==========================================
// 2. COMANDO !VERPET E !LOJA-PETS
// ==========================================
const lojaPetsJs = `module.exports = {
    name: 'loja-pets',
    execute: async (sock, msg) => {
        const texto = \`╭━━━━━━━『 🐾 𝑫𝑨𝑬𝑴𝑶𝑵-𝑷𝑬𝑻𝑺 』━━━━━━━╮
┃
┃ 🌸 *𝑷𝒆𝒕𝒔 𝑭𝒐𝒇𝒊𝒏𝒉𝒐𝒔 & 𝑩𝒐̂𝒏𝒖𝒔* 🌸
┃
┃ 🐶 *𝐶𝑜𝑚𝑢𝑚*
┃ ⟫ 601. Bolinha — R$ 500 — +R$ 50
┃ ⟫ 602. Mimi — R$ 1.000 — +R$ 75
┃ ⟫ 603. Nino — R$ 1.500 — +R$ 100
┃ ⟫ 604. Pipoca — R$ 2.000 — +R$ 125
┃ ⟫ 605. Floquinho — R$ 2.500 — +R$ 150
┃ ⟫ 606. Pingo — R$ 3.000 — +R$ 175
┃ ⟫ 607. Tico — R$ 3.500 — +R$ 200
┃ ⟫ 608. Fofuxo — R$ 4.000 — +R$ 225
┃ ⟫ 609. Lili — R$ 4.500 — +R$ 250
┃ ⟫ 610. Totó — R$ 5.000 — +R$ 300
┃
┃ 🦊 *𝐼𝑛𝑐𝑜𝑚𝑢𝑚*
┃ ⟫ 611. Luna — R$ 7.500 — +R$ 400
┃ ⟫ 612. Kiko — R$ 9.000 — +R$ 500
┃ ⟫ 613. Nuvem — R$ 10.500 — +R$ 600
┃ ⟫ 614. Mel — R$ 12.000 — +R$ 700
┃ ⟫ 615. Choco — R$ 13.500 — +R$ 800
┃ ⟫ 616. Pandora — R$ 15.000 — +R$ 900
┃ ⟫ 617. Blue — R$ 17.500 — +R$ 1.000
┃ ⟫ 618. Amora — R$ 20.000 — +R$ 1.100
┃ ⟫ 619. Mimo — R$ 22.500 — +R$ 1.200
┃ ⟫ 620. Cookie — R$ 25.000 — +R$ 1.500
┃
┃ 🐺 *𝑹𝒂𝒓𝒐*
┃ ⟫ 621. Fênix — R$ 30.000 — +R$ 2.000
┃ ⟫ 622. Draco — R$ 35.000 — +R$ 2.500
┃ ⟫ 623. Sombra — R$ 40.000 — +R$ 3.000
┃ ⟫ 624. Peludinho — R$ 45.000 — +R$ 3.500
┃ ⟫ 625. Sol — R$ 50.000 — +R$ 4.000
┃ ⟫ 626. Douradinho — R$ 55.000 — +R$ 4.500
┃ ⟫ 627. Fumaça — R$ 60.000 — +R$ 5.000
┃ ⟫ 628. Kiwi — R$ 65.000 — +R$ 5.500
┃ ⟫ 629. Branquinho — R$ 70.000 — +R$ 6.000
┃ ⟫ 630. Jacozinho — R$ 75.000 — +R$ 7.000
┃
┃ ✨ *𝑬́𝒑𝒊𝒄𝒐*
┃ ⟫ 631. Astra — R$ 90.000 — +R$ 10.000
┃ ⟫ 632. Noa — R$ 110.000 — +R$ 12.000
┃ ⟫ 633. Luar — R$ 130.000 — +R$ 14.000
┃ ⟫ 634. Selene — R$ 150.000 — +R$ 16.000
┃ ⟫ 635. Spike — R$ 175.000 — +R$ 18.000
┃ ⟫ 636. Orion — R$ 200.000 — +R$ 20.000
┃ ⟫ 637. Ursozinho — R$ 225.000 — +R$ 22.000
┃ ⟫ 638. Vento — R$ 250.000 — +R$ 24.000
┃ ⟫ 639. Léo — R$ 275.000 — +R$ 26.000
┃ ⟫ 640. Pratinha — R$ 300.000 — +R$ 30.000
┃
┃ 👑 *𝑳𝒆𝒏𝒅𝒂́𝒓𝒊𝒐*
┃ ⟫ 641. Imperador — R$ 400.000 — +R$ 40.000
┃ ⟫ 642. Fenrir — R$ 500.000 — +R$ 45.000
┃ ⟫ 643. Pedrinho — R$ 650.000 — +R$ 50.000
┃ ⟫ 644. Solzinho — R$ 800.000 — +R$ 55.000
┃ ⟫ 645. Levi — R$ 1.000.000 — +R$ 60.000
┃ ⟫ 646. Kirin — R$ 1.250.000 — +R$ 65.000
┃ ⟫ 647. Abismo — R$ 1.600.000 — +R$ 70.000
┃ ⟫ 648. Cosmos — R$ 2.000.000 — +R$ 80.000
┃
┃ 🌌 *𝑺𝒆𝒄𝒓𝒆𝒕𝒐*
┃ ⟫ 649. Vácuo — R$ 3.500.000 — +R$ 100.000
┃ ⟫ 650. Titanzinho — R$ 5.000.000 — +R$ 150.000
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 💡 *Como comprar:* !comprar [ID]
┃ ✨ *Exemplo:* !comprar 601
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\`;
        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};`;

const verpetJs = `const db = require('../db');
let petsDb = {};
try { petsDb = require('../data/pets'); } catch(e){}

module.exports = {
    name: 'verpet',
    execute: async (sock, msg) => {
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(id);

        if (!user || !user.inventario) return sock.sendMessage(remetente, { text: "❌ Você não tem nenhum pet." }, { quoted: msg });

        let meuPet = null;

        // Vasculha o inventário para encontrar o Pet com o maior bônus
        for (let item of user.inventario) {
            if (petsDb[item]) {
                if (!meuPet || petsDb[item].bonus > meuPet.bonus) {
                    meuPet = petsDb[item];
                    meuPet.nome = item;
                }
            }
        }

        if (!meuPet) return sock.sendMessage(remetente, { text: "❌ Você não tem nenhum pet na mochila!\\nCompre um na *!loja-pets*" }, { quoted: msg });

        const layout = \`╭━━━━━━━『 🐾 𝑴𝑬𝑼 𝑷𝑬𝑻 』━━━━━━━╮
┃
┃ \${meuPet.icone} *Nome:* \${meuPet.nome}
┃ 🌟 *Raridade:* \${meuPet.raridade}
┃ 💼 *Bônus de Trabalho:* + R$ \${meuPet.bonus.toLocaleString('pt-BR')}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\`;

        await sock.sendMessage(remetente, { text: layout }, { quoted: msg });
    }
};`;

fs.writeFileSync('./commands/loja-pets.js', lojaPetsJs);
fs.writeFileSync('./commands/verpet.js', verpetJs);
console.log("✅ Comandos !loja-pets e !verpet criados!");

// ==========================================
// 3. ATUALIZAR TRABALHAR.JS (Motor do Bônus)
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
    "Agente Sombra": { min: 500000, max: 900000, xp: 1200 }
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

        // 🐾 LÓGICA DO PET: Achar o melhor pet na mochila do jogador
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
        db.salvar(id, {
            dinheiro: (user.dinheiro || 0) + ganhoFinal,
            ultimoTrabalho: agora
        });

        // Só mostra o bônus na tela se a pessoa tiver um Pet
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
console.log("✅ trabalhar.js injetado com o motor de Pets!");

// ==========================================
// 4. INJETAR PREÇOS NO data/produtos.js
// ==========================================
let prodPath = './data/produtos.js';
if (fs.existsSync(prodPath)) {
    let prodTxt = fs.readFileSync(prodPath, 'utf8');
    let petInjections = `\n    // 🐾 SISTEMA DE PETS (IDs 601 - 650)\n`;
    petsData.forEach(p => {
        petInjections += `    "${p.id}": { nome: "${p.nome}", preco: ${p.preco} },\n`;
    });
    
    if (!prodTxt.includes('"Bolinha"')) {
        prodTxt = prodTxt.replace(/(module\.exports\s*=\s*\{)/, `$1${petInjections}`);
        fs.writeFileSync(prodPath, prodTxt);
        console.log("✅ data/produtos.js atualizado com as caixas de Pets!");
    } else {
        console.log("⚠️ Os Pets já estavam no produtos.js");
    }
}

// ==========================================
// 5. ATUALIZAR O INVENTARIO.JS (Nova aba)
// ==========================================
let invPath = './commands/inventario.js';
if (fs.existsSync(invPath)) {
    let invTxt = fs.readFileSync(invPath, 'utf8');
    let arrNames = petsData.map(p => `"${p.nome}"`).join(', ');
    
    if (!invTxt.includes('"🐾 Pets"')) {
        // Injeta a categoria nas configs
        invTxt = invTxt.replace(/"🎣 Peixes": \[.*?\],/g, (match) => {
            return match + `\n    "🐾 Pets": [${arrNames}],`;
        });

        // Prepara o render visual pra aba dos Pets
        invTxt = invTxt.replace(/"🎣 Peixes": \[\], "📦 Outros": \[\]/g, '"🎣 Peixes": [], "🐾 Pets": [], "📦 Outros": []');
        fs.writeFileSync(invPath, invTxt);
        console.log("✅ inventario.js atualizado com a aba de Pets!");
    } else {
         console.log("⚠️ A aba de Pets já estava no inventário.");
    }
}

console.log("🎯 SISTEMA DE PETS INSTALADO COM SUCESSO!");
