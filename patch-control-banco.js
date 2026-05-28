const fs = require('fs');
const path = require('path');

console.log("🛠️ INICIANDO INJEÇÃO CIRÚRGICA NO SYSTEM CONTROL...");

// 1. INJETANDO NO FRONT-END (views/os.html)
const osPath = path.join(__dirname, 'views', 'os.html');
let osHtml = fs.readFileSync(osPath, 'utf8');

if (!osHtml.includes("id=\"btn-add_banco\"")) {
    const alvoHtml = `<div class="act-btn apple-btn-active" id="btn-rem_level" onclick="selectAction('rem_level')">📉 Tirar Level</div>`;
    
    const botoesNovos = alvoHtml + `
            <div class="act-btn apple-btn-active" id="btn-add_banco" onclick="selectAction('add_banco')">🏦 Add Banco</div>
            <div class="act-btn apple-btn-active" id="btn-rem_banco" onclick="selectAction('rem_banco')">🏦 Tirar Banco</div>`;
            
    osHtml = osHtml.replace(alvoHtml, botoesNovos);

    // Ajustando o balão de notificação (bal-title) para aceitar os novos comandos
    const alvoBalao = `'rem_level':'REBAIXAMENTO DE LEVEL'}`;
    const novoBalao = `'rem_level':'REBAIXAMENTO DE LEVEL', 'add_banco':'INJEÇÃO NO BANCO', 'rem_banco':'CONFISCO NO BANCO'}`;
    osHtml = osHtml.replace(alvoBalao, novoBalao);

    fs.writeFileSync(osPath, osHtml);
    console.log("✅ FRONT-END (os.html) atualizado com os novos botões do Banco.");
} else {
    console.log("⚠️ Botões do Banco já existiam no os.html.");
}

// 2. INJETANDO NO BACK-END (rotas_web/sistema.js)
const sisPath = path.join(__dirname, 'rotas_web', 'sistema.js');
let sisJs = fs.readFileSync(sisPath, 'utf8');

if (!sisJs.includes("action === 'add_banco'")) {
    const alvoJs = `if (action === 'rem_level') database[targetId].level = Math.max(1, (database[targetId].level || 1) - val);`;
    
    const logicaNova = alvoJs + `
        if (action === 'add_banco') database[targetId].banco = (database[targetId].banco || 0) + val;
        if (action === 'rem_banco') database[targetId].banco = Math.max(0, (database[targetId].banco || 0) - val);`;

    sisJs = sisJs.replace(alvoJs, logicaNova);
    fs.writeFileSync(sisPath, sisJs);
    console.log("✅ BACK-END (sistema.js) atualizado com a matemática do Banco.");
} else {
    console.log("⚠️ A lógica do Banco já existia no sistema.js.");
}

console.log("🚀 OPERAÇÃO CONCLUÍDA! Reinicie o servidor com 'node web'.");
