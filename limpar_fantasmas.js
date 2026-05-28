const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let apagados = 0;

for (let id in db) {
    const user = db[id];
    // Se o cara tem 0 comandos, ou se o ID tem mais de 15 números (ID de Grupo do Whats)
    if (user.comandos === 0 || id.length > 15) {
        delete db[id];
        apagados++;
    }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
console.log(`\n✅ FAXINA CONCLUÍDA! Foram apagados ${apagados} fantasmas/grupos do seu Banco de Dados.\n`);
