const fs = require('fs');
const path = './views/os.html';
let html = fs.readFileSync(path, 'utf8');

if (html.includes('id="ap-relatorios"')) {
    console.log("⚠️ Os Relatórios já foram instalados no OS!");
    process.exit();
}

console.log("🛠️ Injetando Módulo de Relatórios e Livro Caixa...");

// 1. Adiciona o botão roxo "Dados" do lado do botão de Expansão
const alvoBotao = '<button class="btn-spring" style="background:#ff9f0a; color:#fff; font-size:11px; padding:12px;" onclick="toggleUpgrades(true)"><i class="fas fa-rocket"></i> Expansão</button>';
const comBotaoNovo = alvoBotao + '\n                <button class="btn-spring" style="background:#bf5af2; color:#fff; font-size:11px; padding:12px;" onclick="toggleRelatorio(true)"><i class="fas fa-chart-pie"></i> Dados</button>';
html = html.replace(alvoBotao, comBotaoNovo);

// 2. Injeta a Tela de Relatórios logo antes da Tela de Upgrades
const alvoTela = '';
const telaRelatorios = `
        <div id="ap-relatorios" style="display:none; padding-top: 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                <h3 style="font-weight:800; font-size:20px; color:#bf5af2;"><i class="fas fa-chart-pie"></i> Financeiro</h3>
                <button class="btn-spring" style="background:rgba(255,255,255,0.1); color:#fff; width:auto; padding:8px 15px; font-size:11px;" onclick="toggleRelatorio(false)"><i class="fas fa-arrow-left"></i> Voltar</button>
            </div>
            
            <div class="apple-card" style="padding:15px; background:rgba(191, 90, 242, 0.05); border-color:rgba(191, 90, 242, 0.2);">
                <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                    <span style="color:#888; font-size:11px; font-weight:800; letter-spacing:1px;">LUCRO TOTAL GERADO</span>
                    <span id="rel-lucro" style="color:#32d74b; font-weight:900;">R$ 0</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                    <span style="color:#888; font-size:11px; font-weight:800; letter-spacing:1px;">CUSTO TOTAL PAGO</span>
                    <span id="rel-custo" style="color:#ff453a; font-weight:900;">R$ 0</span>
                </div>
                <div style="display:flex; justify-content:space-between; border-top:1px dashed rgba(255,255,255,0.1); padding-top:12px;">
                    <span style="color:#888; font-size:11px; font-weight:800; letter-spacing:1px;">RETIRADO PELO DONO</span>
                    <span id="rel-retirado" style="color:#0a84ff; font-weight:900;">R$ 0</span>
                </div>
            </div>

            <div class="apple-label" style="margin-top:25px; margin-bottom:10px;">Histórico de Eventos (Logs)</div>
            <div id="rel-logs" style="display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; padding-right:5px;">
                </div>
        </div>

        `;
html = html.replace(alvoTela, telaRelatorios + alvoTela);

// 3. Injeta a Lógica Javascript de gerar os relatórios
const alvoJS = '// FUNÇÕES DE UPGRADES';
const jsRelatorios = `
    // FUNÇÕES DE RELATÓRIOS
    function toggleRelatorio(show) {
        document.getElementById('ap-main').style.display = show ? 'none' : 'block';
        document.getElementById('ap-relatorios').style.display = show ? 'block' : 'none';
        if(show && cacheEmp) renderizarRelatorio();
    }

    function renderizarRelatorio() {
        if(!cacheEmp) return;
        let emp = cacheEmp.empresa;
        
        document.getElementById('rel-lucro').innerText = fmtMoney(emp.lucroAcumulado || 0);
        document.getElementById('rel-custo').innerText = fmtMoney(emp.custoAcumulado || 0);
        document.getElementById('rel-retirado').innerText = fmtMoney(emp.retiradoDono || 0);
        
        let htmlLogs = '';
        let logs = emp.logs || [];
        
        if(logs.length === 0) {
            htmlLogs = '<div style="color:#666; font-size:11px; text-align:center; padding:20px;">Nenhum evento registrado ainda.</div>';
        } else {
            logs.forEach(l => {
                let d = new Date(l.data);
                let hora = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
                
                let corIcone = '#888'; let icone = 'fas fa-info-circle';
                if(l.acao === 'VENDA') { corIcone = '#32d74b'; icone = 'fas fa-money-bill-wave'; }
                if(l.acao === 'CRISE') { corIcone = '#ff453a'; icone = 'fas fa-exclamation-triangle'; }
                if(l.acao === 'UPGRADE') { corIcone = '#ff9f0a'; icone = 'fas fa-rocket'; }
                if(l.acao === 'SAQUE_DONO') { corIcone = '#0a84ff'; icone = 'fas fa-hand-holding-usd'; }
                if(l.acao === 'FUNDAÇÃO') { corIcone = '#bf5af2'; icone = 'fas fa-building'; }
                
                htmlLogs += \`
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:12px; display:flex; gap:12px; align-items:center;">
                    <div style="width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,0.05); display:grid; place-items:center; flex-shrink:0;">
                        <i class="\${icone}" style="color:\${corIcone}; font-size:14px;"></i>
                    </div>
                    <div style="flex:1;">
                        <div style="font-weight:800; font-size:12px; color:#fff; display:flex; justify-content:space-between;">
                            \${l.acao} <span style="color:#666; font-size:9px; font-weight:normal;">\${hora}</span>
                        </div>
                        <div style="font-size:10px; color:#aaa; margin-top:4px; line-height:1.3;">\${l.detalhe}</div>
                    </div>
                </div>\`;
            });
        }
        document.getElementById('rel-logs').innerHTML = htmlLogs;
    }

    `;
html = html.replace(alvoJS, jsRelatorios + alvoJS);

fs.writeFileSync(path, html);
console.log("✅ RELATÓRIOS INJETADOS! O Livro Caixa da empresa já está operante.");
