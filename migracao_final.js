const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.json');

if (fs.existsSync(dbPath)) {
    let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    const idEstranho = "161830827753644"; // O perfil rico
    const idReal = "554896669255";        // O seu número de verdade

    if (db[idEstranho]) {
        // Transfere absolutamente TUDO pro seu número real
        db[idReal] = db[idEstranho];
        
        // Deleta o ID bizarro pra sempre
        delete db[idEstranho];
        
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
        console.log('\n✅ TRANSPLANTE CONCLUÍDO!');
        console.log('Sua conta rica agora está ligada ao seu número real de telefone!\n');
    } else {
        console.log('A migração já foi feita, o ID estranho não existe mais.');
    }
}
