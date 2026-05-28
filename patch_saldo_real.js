const fs = require('fs');

console.log("Iniciando injeção do Saldo Físico...");

// 1. PATCH NO BACKEND (rotas_web/empresa.js)
let backend = fs.readFileSync('./rotas_web/empresa.js', 'utf8');

// A: Envia o saldo real para o Frontend
backend = backend.replace(
    'res.json({ \n            hasCompany: true, \n            empresa: emp,',
    'res.json({ \n            hasCompany: true, \n            saldoReal: user.dinheiro, \n            empresa: emp,'
);

// B: Contratação debita da Carteira Física (user.dinheiro) e não do Caixa
backend = backend.replace(
    'if (user.empresa.caixa < func.preco) return res.json({ success: false, msg: `Caixa insuficiente (R$ ${func.preco}).` });',
    'if ((user.dinheiro || 0) < func.preco) return res.json({ success: false, msg: `Seu Saldo Físico é insuficiente (R$ ${func.preco}).` });'
).replace(
    'user.empresa.caixa -= func.preco;',
    'user.dinheiro -= func.preco;'
);

// C: Upgrades debitam da Carteira Física (user.dinheiro) e não do Caixa
backend = backend.replace(
    'if (user.empresa.caixa < upg.preco) return res.json({ success: false, msg: `Caixa insuficiente: R$ ${upg.preco}` });',
    'if ((user.dinheiro || 0) < upg.preco) return res.json({ success: false, msg: `Seu Saldo Físico é insuficiente: R$ ${upg.preco}` });'
).replace(
    'user.empresa.caixa -= upg.preco;',
    'user.dinheiro -= upg.preco;'
);

fs.writeFileSync('./rotas_web/empresa.js', backend);
console.log('✅ BACKEND PATCHED: Agora o RH e a Engenharia cobram do seu bolso (user.dinheiro)!');


// 2. PATCH NO FRONTEND (views/tycoon.html)
let frontend = fs.readFileSync('./views/tycoon.html', 'utf8');

// A: Cria a Badge verde do seu Saldo no topo da tela
const headerAntigo = '<div class="level-badge" id="ui-nivel">LVL 1</div>';
const headerNovo = '<div style="display:flex; gap:8px;"><div class="level-badge" style="background:#32d74b; color:#000;" id="ui-saldofisico">R$ 0</div><div class="level-badge" id="ui-nivel">LVL 1</div></div>';

if (frontend.includes(headerAntigo)) {
    frontend = frontend.replace(headerAntigo, headerNovo);
}

// B: Injeta o valor do banco de dados na Badge nova
const renderAntigo = "document.getElementById('ui-nome').innerText = emp.nome;";
const renderNovo = "document.getElementById('ui-nome').innerText = emp.nome;\n            if(document.getElementById('ui-saldofisico')) document.getElementById('ui-saldofisico').innerText = '💳 R$ ' + fmt(d.saldoReal);";

if (frontend.includes(renderAntigo) && !frontend.includes('ui-saldofisico')) {
    frontend = frontend.replace(renderAntigo, renderNovo);
}

fs.writeFileSync('./views/tycoon.html', frontend);
console.log('✅ FRONTEND PATCHED: Seu Saldo da Carteira agora aparece no topo da tela Tycoon!');

