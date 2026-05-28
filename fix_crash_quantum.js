const fs = require('fs');
console.log("🛠️ Iniciando Resgate do Tycoon...");

// 1. CONSERTANDO O BANCO DE DADOS
let db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));

for (let id in db) {
    if (db[id].empresa) {
        let emp = db[id].empresa;
        
        // Vende os chips quantum presos e joga o dinheiro no Caixa
        if (emp.estoqueModelos && emp.estoqueModelos.quantum > 0) {
            let qtd = emp.estoqueModelos.quantum;
            let valorPreso = qtd * 8500;
            emp.caixa += valorPreso;
            delete emp.estoqueModelos.quantum;
            console.log(`✅ ${qtd} Chips fantasmas convertidos em R$ ${valorPreso} pro Caixa!`);
        }

        // Se tiver o chip fantasma selecionado na máquina, reseta pro basic
        if (emp.chipAtual === 'quantum') {
            emp.chipAtual = 'basic';
            emp.pausado = false; // Arranca o Pause
            console.log(`✅ Máquinas destravadas e resetadas para a linha básica.`);
        }
    }
}
fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));

// 2. BLINDANDO O SERVIDOR NO EMPRESA.JS
let backend = fs.readFileSync('./rotas_web/empresa.js', 'utf8');

// Troca a linha vulnerável por uma linha com trava de segurança
const linhaQuebrada = 'let chipProjeto = chipsDB[emp.chipAtual];';
const linhaSegura = `if(!chipsDB[emp.chipAtual]) emp.chipAtual = "basic";\n        let chipProjeto = chipsDB[emp.chipAtual];`;

if (backend.includes(linhaQuebrada)) {
    backend = backend.replace(linhaQuebrada, linhaSegura);
    fs.writeFileSync('./rotas_web/empresa.js', backend);
    console.log("✅ BACKEND BLINDADO! Anti-Crash instalado com sucesso.");
} else {
    console.log("⚠️ Backend já estava seguro ou linha não encontrada.");
}
