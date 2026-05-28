const fs = require('fs');

const invPath = './commands/inventario.js';
let invTxt = fs.readFileSync(invPath, 'utf8');

// Pega aquela lista gigante errada que ficou solta no categorias e limpa ela
const regexErro = /"🐾 Pets": \["Bolinha".*?"Titanzinho"\],\s*"📦 Outros": \[\]/s;

if (invTxt.match(regexErro)) {
    invTxt = invTxt.replace(regexErro, '"🐾 Pets": [], "📦 Outros": []');
    fs.writeFileSync(invPath, invTxt);
    console.log("✅ Bug do inventário corrigido! A aba Pets agora tá limpa e vai seguir o padrão [ID] Nome (xQtd).");
} else {
    console.log("⚠️ Não encontrei o erro, parece que já foi arrumado.");
}
