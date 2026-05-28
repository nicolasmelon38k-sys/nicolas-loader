const fs = require('fs');
const bcrypt = require('bcryptjs');

let db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
let atualizados = 0;

for (let id in db) {
    if (db[id].auth && db[id].auth.password) {
        // Se a senha não começar com $2 (que é o padrão do bcrypt), ele criptografa
        if (!db[id].auth.password.startsWith('$2')) {
            const salt = bcrypt.genSaltSync(8);
            db[id].auth.password = bcrypt.hashSync(db[id].auth.password, salt);
            atualizados++;
            console.log(`🔒 Senha do ID ${id} criptografada com sucesso.`);
        }
    }
}

// Salva o banco atualizado
const tempPath = './database.json.tmp';
fs.writeFileSync(tempPath, JSON.stringify(db, null, 2));
fs.renameSync(tempPath, './database.json');

console.log(`✅ Migração concluída! ${atualizados} contas antigas foram blindadas.`);
