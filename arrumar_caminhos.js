const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'commands');
const files = fs.readdirSync(dir);

let arrumados = 0;

for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let mudou = false;

    // Arruma o caminho do util
    if (content.includes("require('./_util')") || content.includes("require(\"./_util\")")) {
        content = content.replace(/require\(['"]\.\/_util['"]\)/g, "require('../utils/_util')");
        mudou = true;
    }
    
    // Arruma o caminho dos produtos
    if (content.includes("require('./produtos')") || content.includes("require(\"./produtos\")")) {
        content = content.replace(/require\(['"]\.\/produtos['"]\)/g, "require('../data/produtos')");
        mudou = true;
    }

    if (mudou) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ \x1b[32m${file} corrigido!\x1b[0m`);
        arrumados++;
    }
}

console.log(`\n🚀 \x1b[36mSucesso! ${arrumados} comandos foram atualizados com os novos caminhos das pastas.\x1b[0m`);
