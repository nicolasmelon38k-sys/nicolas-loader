const fs = require('fs');

const path = './database.json';
// O parênteses que faltava foi adicionado aqui no final 👇
let db = JSON.parse(fs.readFileSync(path, 'utf8'));

const arthurId = "3620808478792";

if (db[arthurId] && db[arthurId].empresas) {
    let resetou = false;
    db[arthurId].empresas.forEach(emp => {
        if (emp.nome === "Thur burguer") {
            // 1. Zera o dinheiro do caixa
            emp.caixa = 0;
            
            // 2. Remove todos os buffs mágicos (poções)
            emp.pacoesAtivas = [];
            
            // 3. Demite toda a equipe
            emp.equipe = {};
            
            // 4. Joga todo o estoque no lixo
            for (let est in emp.estoqueModelos) {
                emp.estoqueModelos[est] = 0;
            }
            
            // 5. Joga todos os materiais no lixo
            for (let mat in emp.materiais) {
                emp.materiais[mat] = 0;
            }
            
            // 6. Desliga todas as linhas de montagem pra parar a produção
            for (let linha in emp.linhasAtivas) {
                emp.linhasAtivas[linha] = false;
            }

            // 7. Zera os custos pra não bugar
            emp.custoAutoSegundo = 0;
            emp.custoMinuto = 0;
            
            console.log("💥 NUKE EXECUTADO! Empresa 'Thur burguer' totalmente resetada.");
            resetou = true;
        }
    });

    if (resetou) {
        fs.writeFileSync(path, JSON.stringify(db, null, 2));
        console.log("✅ Banco de dados salvo com sucesso!");
    } else {
        console.log("⚠️ A empresa 'Thur burguer' não foi encontrada.");
    }
} else {
    console.log("❌ O jogador Arthur não foi encontrado no banco de dados.");
}
