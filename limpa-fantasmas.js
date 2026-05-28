const fs = require('fs');
let db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
let apagados = 0;

for (let id in db) {
    if (db[id].nome === "Usuário" || db[id].nome === "Usuário Web") {
        console.log(`🗑️ Removendo fantasma: ID ${id}`);
        delete db[id];
        apagados++;
    }
}

fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));
console.log(`✅ Limpeza concluída! ${apagados} conta(s) removida(s).`);
