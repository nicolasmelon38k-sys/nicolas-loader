const fs = require('fs');

console.log("🛠️ CONSERTANDO COMPRA DE PETS DIVINOS...");

// 1. ARRUMAR PRODUTOS.JS (Garantir que a exportação está certa)
let prodPath = './data/produtos.js';
let prodRaw = fs.readFileSync(prodPath, 'utf8');

// Se o script antigo quebrou a sintaxe ou deixou solto, a gente arruma aqui
if (prodRaw.includes('Cerberus') && !prodRaw.includes('"651"')) {
    console.log("⚠️ Detectei erro de sintaxe nos produtos, refazendo a injeção...");
    // Remove qualquer resíduo mal formatado
    prodRaw = prodRaw.replace(/\/\/ 🌌 PETS DIVINOS[\s\S]*/, '');
    prodRaw = prodRaw.replace(/};\s*$/, '');
    
    prodRaw += `,\n    // 🌌 PETS DIVINOS (IDs 651 - 660)
    "651": { nome: "Cerberus", preco: 15000000 },
    "652": { nome: "Quimera", preco: 30000000 },
    "653": { nome: "Kraken", preco: 50000000 },
    "654": { nome: "Bahamut", preco: 80000000 },
    "655": { nome: "Cthulhu", preco: 120000000 },
    "656": { nome: "Anúbis", preco: 200000000 },
    "657": { nome: "Shenlong", preco: 350000000 },
    "658": { nome: "Ifrit", preco: 500000000 },
    "659": { nome: "Corvo Supremo", preco: 800000000 },
    "660": { nome: "Infinity", preco: 1500000000 }\n};\n`;
    fs.writeFileSync(prodPath, prodRaw);
} else if (!prodRaw.includes('"651"')) {
    // Injeção limpa
    prodRaw = prodRaw.replace(/};\s*$/, '');
    prodRaw += `,\n    // 🌌 PETS DIVINOS (IDs 651 - 660)
    "651": { nome: "Cerberus", preco: 15000000 },
    "652": { nome: "Quimera", preco: 30000000 },
    "653": { nome: "Kraken", preco: 50000000 },
    "654": { nome: "Bahamut", preco: 80000000 },
    "655": { nome: "Cthulhu", preco: 120000000 },
    "656": { nome: "Anúbis", preco: 200000000 },
    "657": { nome: "Shenlong", preco: 350000000 },
    "658": { nome: "Ifrit", preco: 500000000 },
    "659": { nome: "Corvo Supremo", preco: 800000000 },
    "660": { nome: "Infinity", preco: 1500000000 }\n};\n`;
    fs.writeFileSync(prodPath, prodRaw);
}

// 2. FORÇAR REESCRITA DO INVENTÁRIO (Pra garantir que vai pro lugar certo)
let invPath = './commands/inventario.js';
let invRaw = fs.readFileSync(invPath, 'utf8');

const regexPets = /"🐾 Pets": \[(.*?)\]/s;
const listaPetsCorreta = `"🐾 Pets": ["Bolinha", "Mimi", "Nino", "Pipoca", "Floquinho", "Pingo", "Tico", "Fofuxo", "Lili", "Totó", "Luna", "Kiko", "Nuvem", "Mel", "Choco", "Pandora", "Blue", "Amora", "Mimo", "Cookie", "Fênix", "Draco", "Sombra", "Peludinho", "Sol", "Douradinho", "Fumaça", "Kiwi", "Branquinho", "Jacozinho", "Astra", "Noa", "Luar", "Selene", "Spike", "Orion", "Ursozinho", "Vento", "Léo", "Pratinha", "Imperador", "Fenrir", "Pedrinho", "Solzinho", "Levi", "Kirin", "Abismo", "Cosmos", "Vácuo", "Titanzinho", "Cerberus", "Quimera", "Kraken", "Bahamut", "Cthulhu", "Anúbis", "Shenlong", "Ifrit", "Corvo Supremo", "Infinity"]`;

if (invRaw.match(regexPets)) {
    invRaw = invRaw.replace(regexPets, listaPetsCorreta);
    fs.writeFileSync(invPath, invRaw);
}

console.log("🎯 FEITO! Agora os pets de ID 651 a 660 podem ser comprados.");
