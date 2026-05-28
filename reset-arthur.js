const fs = require('fs');

let db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));

// 1. Apaga a conta lixo que ele criou sem querer
if(db["555596676629"]) {
    delete db["555596676629"];
    console.log("🗑️ Conta lixo 555596676629 apagada.");
}

// 2. Destrava a conta verdadeira do Arthur (A dos 100 Milhões)
const idArthur = "3620808478792";
if(db[idArthur]) {
    db[idArthur].auth = {
        email: null,
        password: null,
        verified: false
    };
    console.log(`🔓 Conta bilionária do Arthur (${idArthur}) destravada!`);
    console.log("Ele já pode ir na aba de Registro do site de novo.");
}

fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));
console.log("✅ Reset concluído com sucesso.");
