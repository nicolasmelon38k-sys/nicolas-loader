const fs = require('fs');
const dbPath = './database.json';

let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let atualizados = 0;

for (let id in db) {
    // Se o jogador não tem "vida" registrada, significa que é da versão antiga
    if (db[id].vida === undefined) {
        db[id].sacosOuro = db[id].sacosOuro || 0;
        db[id].inventario = db[id].inventario || [];
        db[id].vida = 100;
        db[id].vidaMax = 100;
        db[id].escudo = 0;
        db[id].energia = 100;
        db[id].ultimoTrabalho = db[id].ultimoTrabalho || 0;
        db[id].ultimoBoss = 0;
        
        atualizados++;
    }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`\n\x1b[36m⚙️ PATCH APLICADO! ${atualizados} jogadores antigos receberam os status de RPG!\x1b[0m\n`);
