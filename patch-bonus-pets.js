const fs = require('fs');

// 1. Atualizar pets.js com todos os IDs e bônus corretos
const petsData = {
    "Bolinha": { icone: "🐶", bonus: 500 }, "Mimi": { icone: "🐶", bonus: 750 }, "Nino": { icone: "🐶", bonus: 1000 }, "Pipoca": { icone: "🐶", bonus: 1250 }, "Floquinho": { icone: "🐶", bonus: 1500 },
    "Pingo": { icone: "🐶", bonus: 1750 }, "Tico": { icone: "🐶", bonus: 2000 }, "Fofuxo": { icone: "🐶", bonus: 2250 }, "Lili": { icone: "🐶", bonus: 2500 }, "Totó": { icone: "🐶", bonus: 3000 },
    "Luna": { icone: "🦊", bonus: 4000 }, "Kiko": { icone: "🦊", bonus: 5000 }, "Nuvem": { icone: "🦊", bonus: 6000 }, "Mel": { icone: "🦊", bonus: 7000 }, "Choco": { icone: "🦊", bonus: 8000 },
    "Pandora": { icone: "🦊", bonus: 9000 }, "Blue": { icone: "🦊", bonus: 10000 }, "Amora": { icone: "🦊", bonus: 11000 }, "Mimo": { icone: "🦊", bonus: 12000 }, "Cookie": { icone: "🦊", bonus: 15000 },
    "Fênix": { icone: "🐺", bonus: 20000 }, "Draco": { icone: "🐺", bonus: 25000 }, "Sombra": { icone: "🐺", bonus: 30000 }, "Peludinho": { icone: "🐺", bonus: 35000 }, "Sol": { icone: "🐺", bonus: 40000 },
    "Douradinho": { icone: "🐺", bonus: 45000 }, "Fumaça": { icone: "🐺", bonus: 50000 }, "Kiwi": { icone: "🐺", bonus: 55000 }, "Branquinho": { icone: "🐺", bonus: 60000 }, "Jacozinho": { icone: "🐺", bonus: 70000 },
    "Astra": { icone: "✨", bonus: 100000 }, "Noa": { icone: "✨", bonus: 120000 }, "Luar": { icone: "✨", bonus: 140000 }, "Selene": { icone: "✨", bonus: 160000 }, "Spike": { icone: "✨", bonus: 180000 },
    "Orion": { icone: "✨", bonus: 200000 }, "Ursozinho": { icone: "✨", bonus: 220000 }, "Vento": { icone: "✨", bonus: 240000 }, "Léo": { icone: "✨", bonus: 260000 }, "Pratinha": { icone: "✨", bonus: 300000 },
    "Imperador": { icone: "👑", bonus: 400000 }, "Fenrir": { icone: "👑", bonus: 450000 }, "Pedrinho": { icone: "👑", bonus: 500000 }, "Solzinho": { icone: "👑", bonus: 550000 }, "Levi": { icone: "👑", bonus: 600000 },
    "Kirin": { icone: "👑", bonus: 650000 }, "Abismo": { icone: "👑", bonus: 700000 }, "Cosmos": { icone: "👑", bonus: 800000 }, "Vácuo": { icone: "🌌", bonus: 1000000 }, "Titanzinho": { icone: "🌌", bonus: 1500000 },
    "Cerberus": { icone: "🐕‍🦺", bonus: 5000000 }, "Quimera": { icone: "🦁", bonus: 10000000 }, "Kraken": { icone: "🦑", bonus: 20000000 }, "Bahamut": { icone: "🐉", bonus: 35000000 }, "Cthulhu": { icone: "🐙", bonus: 50000000 },
    "Anúbis": { icone: "🐺", bonus: 80000000 }, "Shenlong": { icone: "🐲", bonus: 150000000 }, "Ifrit": { icone: "🌋", bonus: 250000000 }, "Corvo Supremo": { icone: "🦅", bonus: 400000000 }, "Infinity": { icone: "🌌", bonus: 800000000 }
};

fs.writeFileSync('./data/pets.js', 'module.exports = ' + JSON.stringify(petsData, null, 4) + ';');
console.log("✅ Pets e bônus normalizados.");

// 2. Corrigir lógica no trabalhar.js
let trab = fs.readFileSync('./commands/trabalhar.js', 'utf8');
const novaLogica = `        // 🐾 LÓGICA DO PET: Achar o melhor pet na mochila do jogador
        let bonusPet = 0;
        let nomePet = "";
        let iconePet = "";

        if (user.inventario) {
            for (let itemNome of user.inventario) {
                if (petsDb[itemNome]) {
                    if (petsDb[itemNome].bonus > bonusPet) {
                        bonusPet = petsDb[itemNome].bonus;
                        nomePet = itemNome;
                        iconePet = petsDb[itemNome].icone;
                    }
                }
            }
        }`;

// Substitui o bloco de lógica antiga pelo novo blindado
const regex = /\/\/ 🐾 LÓGICA DO PET:.*?\}/s;
if (trab.match(regex)) {
    trab = trab.replace(regex, novaLogica);
    fs.writeFileSync('./commands/trabalhar.js', trab);
    console.log("✅ Lógica de cálculo de bônus corrigida.");
}
