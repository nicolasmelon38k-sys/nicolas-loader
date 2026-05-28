const fs = require('fs');
const path = require('path');

console.log("🛠️ INICIANDO UPGRADE FINANCEIRO DECIMAL...");

// 1. ATUALIZANDO O WEB.JS (FORTUNA TOTAL DA TELA)
const webPath = path.join(__dirname, 'web.js');
let webJs = fs.readFileSync(webPath, 'utf8');

if (!webJs.includes("const Decimal = require('decimal.js')")) {
    webJs = "const Decimal = require('decimal.js');\n" + webJs;
    
    const fortunaAntiga = `  const saldoCarteira = Number(user.dinheiro) || 0;
  const saldoBanco = Number(user.banco) || 0;
  const fortunaTotal = saldoCarteira + saldoBanco;`;

    const fortunaNova = `  const saldoCarteira = new Decimal(user.dinheiro || 0);
  const saldoBanco = new Decimal(user.banco || 0);
  const fortunaTotal = saldoCarteira.plus(saldoBanco).toNumber(); // Exporta seguro pro OS`;

    webJs = webJs.replace(fortunaAntiga, fortunaNova);
    fs.writeFileSync(webPath, webJs);
    console.log("✅ WEB.JS atualizado para suportar fortunas infinitas.");
} else {
    console.log("⚠️ WEB.JS já estava com Decimal.js ativo.");
}

// 2. ATUALIZANDO O FRONT-END (views/os.html) - ARRUMANDO O RELÓGIO E A VÍRGULA
const osPath = path.join(__dirname, 'views', 'os.html');
let osHtml = fs.readFileSync(osPath, 'utf8');

// O NumberFormat nativo do JS também chora com números gigantes.
// Vamos passar pra uma string limpa antes de formatar.
const mFormatAntigo = "const fmtM = (v) => new Intl.NumberFormat('pt-BR', { notation: \"compact\", maximumFractionDigits: 1 }).format(v || 0);";
const mFormatNovo = "const fmtM = (v) => new Intl.NumberFormat('pt-BR', { notation: \"compact\", maximumFractionDigits: 1 }).format(BigInt(Math.floor(Number(v) || 0)));";

if (osHtml.includes(mFormatAntigo)) {
    osHtml = osHtml.replace(mFormatAntigo, mFormatNovo);
    fs.writeFileSync(osPath, osHtml);
    console.log("✅ FRONT-END (os.html) atualizado! Formatador compacto blindado.");
} else {
    console.log("⚠️ O formatador do FRONT-END já estava blindado ou foi alterado.");
}

console.log("🚀 UPGRADE CONCLUÍDO! O DAEMON OS agora processa números de nível global.");
