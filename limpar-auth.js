const fs = require('fs');

let db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
let contasLimpas = 0;

for (let id in db) {
    if (db[id].auth) {
        db[id].auth = {
            email: null,
            password: null,
            verified: false
        };
        contasLimpas++;
    }
}

fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));
console.log(`✅ Limpeza concluída! ${contasLimpas} acessos Web foram resetados.`);
console.log(`Todo mundo (incluindo você e o Arthur) já pode criar a conta de novo!`);
