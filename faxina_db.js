const fs = require('fs');

const dbPath = './database.json';
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let usersLimpados = 0;

for (let id in db) {
    const user = db[id];
    
    // Lista de fantasmas para exorcizar
    const coisasParaDeletar = [
        'vida', 'vidaMax', 'escudo', 'energia', 'ultimoBoss', 
        'mana', 'manaMax', 'ataqueBase', 'defesaBase', 
        'velocidadeBase', 'criticoBase', 'equipados', 
        'durabilidade', 'buffs', 'poder'
    ];

    coisasParaDeletar.forEach(coisa => {
        if (user[coisa] !== undefined) {
            delete user[coisa];
        }
    });

    // Já garante que todo mundo tenha barriga pra roncar
    if (user.fome === undefined) {
        user.fome = 100;
    }
    
    usersLimpados++;
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`🧹 FAXINA CONCLUÍDA! ${usersLimpados} perfis foram limpos dos status de RPG.`);
