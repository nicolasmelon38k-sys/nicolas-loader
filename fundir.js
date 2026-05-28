const fs = require('fs');
const dbPath = './database.json';

let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Pega a sua conta braba Level 3
const contaLevel3 = db["161830827753644"];

if (contaLevel3) {
    // Mescla as informações de RPG que faltavam nela (vida, energia, etc)
    const statusRPG = {
        sacosOuro: 0,
        inventario: contaLevel3.inventario || [],
        vida: 100,
        vidaMax: 100,
        escudo: 0,
        energia: 100,
        ultimoTrabalho: 0,
        ultimoBoss: 0
    };

    // Joga tudo pro seu ID limpo supremo
    db["554896669255"] = { ...contaLevel3, ...statusRPG };

    // Apaga os clones do multiverso
    delete db["161830827753644"];
    delete db["554896669255@s.whatsapp.net"];

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log("\n\x1b[32m🔥 FUSÃO CONCLUÍDA! O Nicolas Supremo agora é Level 3 e tem R$ 1070!\x1b[0m\n");
} else {
    console.log("\n⚠️ A conta Level 3 não foi encontrada ou já foi fundida.\n");
}
