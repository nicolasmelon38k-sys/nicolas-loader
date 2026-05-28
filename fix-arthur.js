const fs = require('fs');
let db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));

// ID real do Arthur no Zap
const idArthur = "3620808478792";

if (db[idArthur]) {
    db[idArthur].auth = {
        email: "arthur@daemon.com",
        password: "123",
        verified: true
    };
    console.log("✅ Acesso do Arthur injetado na conta verdadeira (100 Milhões)!");
}

// Faxina: apaga as contas "Usuário Web" zeradas que ele criou erradas agora
let apagados = 0;
for (let id in db) {
    if (db[id].nome === "Usuário Web" && id !== "554896669255") {
        delete db[id];
        apagados++;
    }
}

fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));
console.log(`🗑️ Limpeza feita: ${apagados} conta(s) fantasma removida(s).`);
