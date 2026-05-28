const fs = require('fs');

const path = './database.json';
let db = JSON.parse(fs.readFileSync(path, 'utf8'));
let modificado = false;

// 1. Alvo específico: Empresa do Arthur
const arthurId = "3620808478792";
if (db[arthurId] && db[arthurId].empresas) {
    db[arthurId].empresas.forEach(emp => {
        if (emp.nome === "Thur burguer") {
            emp.custoAutoSegundo = 100000; // Força para 100 mil
            if (emp.custoMinuto > 99999999999999) {
                emp.custoMinuto = 100000;
            }
            console.log(`✅ Empresa 'Thur burguer' corrigida! Custo pendente resetado para 100.000.`);
            modificado = true;
        }
    });
}

// 2. Varredura global de segurança (Garante limite de 14 dígitos em qualquer empresa)
for (let id in db) {
    if (db[id].empresas) {
        db[id].empresas.forEach(emp => {
            // Se o custo por segundo passar de 14 dígitos ou usar notação científica 'e+'
            if (emp.custoAutoSegundo > 99999999999999 || String(emp.custoAutoSegundo).includes('e')) {
                emp.custoAutoSegundo = 100000;
                modificado = true;
            }
            if (emp.custoMinuto > 99999999999999 || String(emp.custoMinuto).includes('e')) {
                emp.custoMinuto = 100000;
                modificado = true;
            }
        });
    }
}

if (modificado) {
    fs.writeFileSync(path, JSON.stringify(db, null, 2));
    console.log("🔒 Banco de dados salvo e blindado contra valores acima de 14 dígitos.");
} else {
    console.log("⚠️ Nenhuma anomalia encontrada nas empresas.");
}
