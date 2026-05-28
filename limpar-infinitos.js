const fs = require('fs');

const path = './database.json';
let db = JSON.parse(fs.readFileSync(path, 'utf8'));
let corrigidos = 0;

for (let id in db) {
    // Verifica se o dinheiro estourou o limite seguro ou virou notação científica
    if (db[id].dinheiro > 9007199254740991 || String(db[id].dinheiro).includes('e')) {
        console.log(`[!] Carteira corrompida detectada no ID ${id}. Resetando para 0.`);
        db[id].dinheiro = 0;
        corrigidos++;
    }
    
    // Verifica os caixas das empresas
    if (db[id].empresas) {
        db[id].empresas.forEach(emp => {
            if (emp.caixa > 9007199254740991 || String(emp.caixa).includes('e')) {
                console.log(`[!] Caixa corrompido na empresa '${emp.nome}' do ID ${id}. Resetando para 0.`);
                emp.caixa = 0;
                corrigidos++;
            }
        });
    }
}

fs.writeFileSync(path, JSON.stringify(db, null, 2));

if (corrigidos > 0) {
    console.log(`✅ Sucesso! ${corrigidos} valores infinitos foram exterminados do banco de dados.`);
} else {
    console.log("✅ O banco já estava limpo, nenhum número infinito encontrado.");
}
