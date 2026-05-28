const fs = require('fs');
let db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));

// ID real do Arthur no Zap
const idArthur = "3620808478792";

// Credenciais Blindadas
const emailForte = "arthur@daemon.com";
const senhaForte = "Thur#8291@DMN";

if (db[idArthur]) {
    db[idArthur].auth = {
        email: emailForte,
        password: senhaForte,
        verified: true
    };
    console.log("✅ Acesso de Alta Segurança injetado para o Arthur!");
    console.log(`📧 Email: ${emailForte}`);
    console.log(`🔑 Senha: ${senhaForte}`);
}

// Faxina de segurança pra tirar as contas lixo de novo
let apagados = 0;
for (let id in db) {
    if (db[id].nome === "Usuário Web" && id !== "554896669255") {
        delete db[id];
        apagados++;
    }
}

fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));
console.log(`🗑️ Limpeza feita: ${apagados} conta(s) fantasma removida(s).`);
