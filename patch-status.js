const fs = require('fs');
const dbPath = './database.json';

let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
let atualizados = 0;

for (let id in db) {
    if (db[id].mana === undefined) {
        db[id].mana = 60;
        db[id].manaMax = 60;
        db[id].ataqueBase = 10;
        db[id].defesaBase = 10;
        db[id].velocidadeBase = 10;
        db[id].criticoBase = 5;
        atualizados++;
    }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`\n\x1b[36m⚙️ PATCH APLICADO! ${atualizados} jogadores receberam atributos base de combate.\x1b[0m\n`);
