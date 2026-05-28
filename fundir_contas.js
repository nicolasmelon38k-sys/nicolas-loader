const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.json');

if (fs.existsSync(dbPath)) {
    let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    const idPrincipal = "161830827753644"; // Seu perfil forte
    const idFantasma = "55489666925549";  // Seu clone do grupo

    if (db[idPrincipal] && db[idFantasma]) {
        // Resgata a chave PIX do fantasma e joga na principal
        if (db[idFantasma].chavePix !== "Não gerada") {
            db[idPrincipal].chavePix = db[idFantasma].chavePix;
        }
        
        // Deleta o clone
        delete db[idFantasma];
        
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
        console.log('✅ FUSÃO CONCLUÍDA! O clone foi deletado e a Chave PIX tá salva na conta rica!');
    } else {
        console.log('As contas já foram organizadas ou não existem.');
    }
}
