const fs = require('fs');

const path = './database.json';
let db = JSON.parse(fs.readFileSync(path, 'utf8'));
let limpou = 0;

for (let id in db) {
    if (db[id].empresas) {
        db[id].empresas.forEach(emp => {
            // 1. Limpar Caixa (Zera se for infinito, arredonda se for decimal)
            if (emp.caixa > 1000000000000000 || String(emp.caixa).includes('e')) {
                emp.caixa = 0;
                limpou++;
            } else {
                emp.caixa = Math.floor(Number(emp.caixa) || 0);
            }

            // 2. Limpar Materiais
            if (emp.materiais) {
                for (let mat in emp.materiais) {
                    if (emp.materiais[mat] > 1000000000000000 || String(emp.materiais[mat]).includes('e')) {
                        emp.materiais[mat] = 0;
                        limpou++;
                    } else {
                        emp.materiais[mat] = Math.floor(Number(emp.materiais[mat]) || 0);
                    }
                }
            }

            // 3. Limpar Estoque
            if (emp.estoqueModelos) {
                for (let est in emp.estoqueModelos) {
                    if (emp.estoqueModelos[est] > 1000000000000000 || String(emp.estoqueModelos[est]).includes('e')) {
                        emp.estoqueModelos[est] = 0;
                        limpou++;
                    } else {
                        emp.estoqueModelos[est] = Math.floor(Number(emp.estoqueModelos[est]) || 0);
                    }
                }
            }
        });
    }
}

fs.writeFileSync(path, JSON.stringify(db, null, 2));
console.log(`✅ Sucesso! Empresas sanitizadas. Decimais arredondados e ${limpou} anomalias deletadas.`);
