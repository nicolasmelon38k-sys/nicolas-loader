const fs = require('fs');

const dbPath = './database.json';
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

for (let id in db) {
    if (db[id].sacosOuro !== undefined) {
        delete db[id].sacosOuro;
    }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log("💰 Todos os Sacos de Ouro foram varridos do sistema!");
