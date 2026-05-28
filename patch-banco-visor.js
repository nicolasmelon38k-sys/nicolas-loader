const fs = require('fs');
const path = require('path');

console.log("🛠️ INICIANDO ATUALIZAÇÃO VISUAL NO SYSTEM CONTROL...");

const osPath = path.join(__dirname, 'views', 'os.html');
let osHtml = fs.readFileSync(osPath, 'utf8');

// O pedaço exato do código que desenha o dinheiro e o level na tela
const alvo = "${fmtM(u.dinheiro)}</div><div class=\"u-level\">Lvl: ${u.level||1}</div>";

// O novo pedaço injetando o saldo do banco no meio
const novo = "${fmtM(u.dinheiro)}</div><div style=\"font-size: 9px; color: #71dcff; font-weight: 800; margin-bottom: 3px;\">🏦 ${fmtM(u.banco||0)}</div><div class=\"u-level\">Lvl: ${u.level||1}</div>";

if (osHtml.includes(alvo)) {
    osHtml = osHtml.replace(alvo, novo);
    fs.writeFileSync(osPath, osHtml);
    console.log("✅ FRONT-END (os.html) atualizado! Saldo do banco adicionado aos cards.");
} else if (osHtml.includes("🏦 ${fmtM(u.banco||0)}")) {
    console.log("⚠️ O saldo do banco já estava na interface.");
} else {
    console.log("❌ Erro: Não achei o código alvo pra substituir.");
}

console.log("🚀 OPERAÇÃO CONCLUÍDA! Pode reiniciar o servidor.");
