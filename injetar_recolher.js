const fs = require('fs');
const path = './views/os.html';

let html = fs.readFileSync(path, 'utf8');

if (html.includes('recolherLucro()')) {
    console.log("⚠️ O Botão de Recolher já existe no sistema!");
    process.exit();
}

console.log("🛠️ Injetando o Botão de Recolher Dinheiro...");

// 1. Substitui o botão único por uma Div com 2 botões
const antigoBotao = '<button class="btn-corp" style="background: linear-gradient(145deg, #00ff88, #00b3ff); border:none; color:#000;" onclick="venderEstoque()"><i class="fas fa-truck"></i> VENDER ESTOQUE (R$ 15/un)</button>';
const novosBotoes = `
            <div style="display:flex; gap:10px; margin-top: 20px;">
                <button class="btn-corp" style="background: linear-gradient(145deg, #00ff88, #00b3ff); border:none; color:#000;" onclick="venderEstoque()"><i class="fas fa-truck"></i> VENDER ESTOQUE</button>
                <button class="btn-corp" style="background: linear-gradient(145deg, #ff0055, #ffb300); border:none; color:#fff;" onclick="recolherLucro()"><i class="fas fa-hand-holding-usd"></i> RECOLHER CAIXA</button>
            </div>
`;
html = html.replace(antigoBotao, novosBotoes);

// 2. Injeta a função de Recolher no Script (usando replace seguro)
const scriptAntigo = 'setInterval(() => { if(document.getElementById(\'empresa-app\').classList.contains(\'active\')) attEmpresa(); }, 5000);';
const scriptNovo = `
    async function recolherLucro() {
        const val = prompt("Quanto deseja sacar do Caixa da Empresa (CNPJ) para sua Carteira (CPF)?\\nSerá cobrada uma taxa de 5% de imposto.");
        if(!val || isNaN(val) || val <= 0) return;
        
        const res = await fetch('/api/empresa/recolher', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor: Number(val) }) });
        const data = await res.json(); 
        showAlerta(data.msg); 
        if (data.success) { attEmpresa(); sinc(); } // O sinc() atualiza o saldo na barra de cima na mesma hora!
    }
    
    setInterval(() => { if(document.getElementById('empresa-app').classList.contains('active')) attEmpresa(); }, 5000);
`;
html = html.replace(scriptAntigo, scriptNovo);

fs.writeFileSync(path, html);
console.log("✅ INJEÇÃO CONCLUÍDA! Botão de Saque e 30 Funcionários prontos para operar.");
