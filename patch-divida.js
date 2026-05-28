const fs = require('fs');
const dbPath = './database.json';

let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
let atualizados = 0;

for (let id in db) {
    if (db[id].divida === undefined) {
        db[id].divida = 0;
        atualizados++;
    }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`\n\x1b[36m⚙️ PATCH APLICADO! ${atualizados} jogadores agora podem ter dívidas.\x1b[0m\n`);
