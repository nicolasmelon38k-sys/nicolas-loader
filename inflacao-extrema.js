const fs = require('fs');

console.log("📈 INICIANDO INFLAÇÃO EXTREMA E NERF DE COMIDA...");

// 1. NERFAR A ENERGIA (comer.js)
let comerPath = './commands/comer.js';
if (fs.existsSync(comerPath)) {
    let comerJs = fs.readFileSync(comerPath, 'utf8');
    
    // Pratos davam 5000, agora dão 1000
    comerJs = comerJs.replace(/recupera = 5000;/g, 'recupera = 1000;');
    // Carnes davam 3000, agora dão 500
    comerJs = comerJs.replace(/recupera = 3000;/g, 'recupera = 500;');
    // Frutas davam 1500, agora dão 200
    comerJs = comerJs.replace(/recupera = 1500;/g, 'recupera = 200;');
    
    fs.writeFileSync(comerPath, comerJs);
    console.log("✅ comer.js atualizado! Pratos = 1000⚡ | Carnes = 500⚡ | Frutas = 200⚡");
}

// 2. AUMENTAR PREÇOS REAIS NO BACKEND (produtos.js)
const FATOR = 1500; // Multiplica tudo por 1500
let prodPath = './data/produtos.js';
if (fs.existsSync(prodPath)) {
    let prodStr = fs.readFileSync(prodPath, 'utf8');
    // Multiplica o valor da chave "preco: X"
    prodStr = prodStr.replace(/preco:\s*([\d.]+)/g, (match, p1) => {
        let novoPreco = Math.floor(Number(p1) * FATOR);
        return `preco: ${novoPreco}`;
    });
    fs.writeFileSync(prodPath, prodStr);
    console.log("✅ Produtos do backend inflacionados em 1500x!");
} else {
    console.log("⚠️ Arquivo data/produtos.js não encontrado.");
}

// 3. AUMENTAR PREÇOS NO VISUAL (loja.js, loja2.js, loja3.js)
const lojas = ['./commands/loja.js', './commands/loja2.js', './commands/loja3.js'];
lojas.forEach(l => {
    if (fs.existsSync(l)) {
        let txt = fs.readFileSync(l, 'utf8');
        // Pega o padrão R$ X.XXX,XX ou R$ X,XX e faz a matemática no texto
        txt = txt.replace(/R\$\s*([\d.,]+)/g, (match, p1) => {
            // Remove pontos e troca vírgula por ponto para o JS entender a matemática
            let numStr = p1.replace(/\./g, '').replace(',', '.');
            let num = parseFloat(numStr);
            let novoNum = Math.floor(num * FATOR);
            return 'R$ ' + novoNum.toLocaleString('pt-BR');
        });
        fs.writeFileSync(l, txt);
        console.log(`✅ Preços visuais atualizados na ${l}`);
    }
});

console.log("🚀 ECONOMIA HARDCORE APLICADA COM SUCESSO!");
