const fs = require('fs');
const path = require('path');

console.log("🛠️ CORRIGINDO O BALÃO DO SYSTEM CONTROL...");

const osPath = path.join(__dirname, 'views', 'os.html');
let osHtml = fs.readFileSync(osPath, 'utf8');

// A regra antiga que só lia "money"
const regraAntiga = "let displayVal = action.includes('money') ? fmtMoney(value) : value + ' Lvl';";

// A regra nova que lê "money" ou "banco"
const regraNova = "let displayVal = (action.includes('money') || action.includes('banco')) ? fmtMoney(value) : value + ' Lvl';";

if (osHtml.includes(regraAntiga)) {
    osHtml = osHtml.replace(regraAntiga, regraNova);
    fs.writeFileSync(osPath, osHtml);
    console.log("✅ FRONT-END (os.html) corrigido! O balão do Banco agora mostra R$ perfeitamente.");
} else if (osHtml.includes(regraNova)) {
    console.log("⚠️ O balão já estava corrigido.");
} else {
    console.log("❌ Erro: Não achei a linha exata no código. Tente verificar manualmente.");
}

console.log("🚀 OPERAÇÃO CONCLUÍDA! Reinicie o servidor com 'node web'.");
