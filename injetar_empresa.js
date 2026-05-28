const fs = require('fs');
const path = './views/os.html';

let html = fs.readFileSync(path, 'utf8');

if (html.includes('id="empresa-app"')) {
    console.log("⚠️ A Empresa já foi injetada no sistema!");
    process.exit();
}

console.log("🛠️ Injetando Empresa no Daemon OS...");

// 1. Injetar o Ícone
const iconHtml = `
    <div class="app-item" onclick="openEmpresa()">
        <div class="icon-wrapper" style="background: linear-gradient(145deg, #001f3f, #0074D9); border: 1px solid #7FDBFF; box-shadow: 0 0 15px rgba(0, 116, 217, 0.4);"><i class="fas fa-city" style="color: #7FDBFF;"></i></div>
        <div class="app-name">Empresa</div>
    </div>
`;
html = html.replace('<div class="app-item" onclick="openMusic()">', iconHtml + '    <div class="app-item" onclick="openMusic()">');

// 2. Injetar o CSS e a Janela da Empresa (Sem usar crases na lógica interna JS)
const empresaUI = `
<style>
    #empresa-app { background: #020813; z-index: 1500; padding: 0; }
    .corp-header { background: linear-gradient(180deg, #001f3f, transparent); padding: 25px 20px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(127, 219, 255, 0.2); }
    .corp-title { font-size: 20px; font-weight: 900; color: #7FDBFF; letter-spacing: 2px; }
    .corp-badge { background: rgba(127, 219, 255, 0.1); border: 1px solid #7FDBFF; padding: 3px 8px; border-radius: 10px; font-size: 9px; font-weight: bold; color: #7FDBFF; }
    .corp-content { padding: 20px; overflow-y: auto; flex: 1; height: calc(100vh - 80px); }
    #corp-fundar-panel { display: none; text-align: center; margin-top: 50px; }
    .corp-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(127,219,255,0.3); border-radius: 15px; padding: 15px; color: #fff; font-size: 16px; margin-bottom: 20px; outline: none; transition: 0.3s; }
    .corp-input:focus { border-color: #7FDBFF; box-shadow: 0 0 15px rgba(127,219,255,0.2); }
    #corp-main-panel { display: none; }
    .corp-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
    .corp-stat-box { background: rgba(0, 31, 63, 0.4); border: 1px solid rgba(127,219,255,0.2); border-radius: 15px; padding: 15px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.5) inset; }
    .stat-label { font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
    .stat-value { font-size: 18px; font-weight: 900; color: #fff; }
    .rh-carousel { display: flex; overflow-x: auto; gap: 12px; padding-bottom: 15px; scroll-snap-type: x mandatory; margin-bottom: 20px; }
    .rh-carousel::-webkit-scrollbar { display: none; }
    .func-card { flex: 0 0 140px; background: rgba(0, 31, 63, 0.3); border: 1px solid rgba(127,219,255,0.2); border-radius: 15px; padding: 15px; scroll-snap-align: start; display: flex; flex-direction: column; }
    .btn-corp { width: 100%; background: linear-gradient(145deg, #0074D9, #001f3f); color: #fff; border: 1px solid #7FDBFF; padding: 12px; border-radius: 10px; font-size: 11px; font-weight: 900; letter-spacing: 1px; cursor: pointer; transition: 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 5px 15px rgba(0, 116, 217, 0.3); margin-top: 10px;}
    .btn-corp:active { transform: scale(0.92); box-shadow: 0 2px 5px rgba(0, 116, 217, 0.2); }
    .btn-corp.disabled { background: #111; border-color: #333; color: #555; box-shadow: none; }
    .btn-corp.disabled:active { transform: none; }
</style>

<div id="empresa-app" class="app-modal">
    <div class="corp-header">
        <div>
            <div class="corp-title" id="emp-nome-header">Enterprise</div>
            <div style="font-size: 10px; color: #888; margin-top: 5px;">Management System</div>
        </div>
        <i class="fas fa-times" onclick="closeEmpresa()" style="font-size:24px; cursor: pointer; color: #7FDBFF;"></i>
    </div>
    
    <div class="corp-content">
        <div id="corp-fundar-panel">
            <i class="fas fa-city" style="font-size: 60px; color: #7FDBFF; margin-bottom: 20px;"></i>
            <h2 style="margin-bottom: 10px;">Crie seu Império</h2>
            <p style="font-size: 11px; color: #888; margin-bottom: 30px;">Licença corporativa: R$ 2.500</p>
            <input type="text" id="inputNomeEmpresa" class="corp-input" placeholder="Nome da Empresa (ex: DaemonTech)">
            <button class="btn-corp" onclick="fundarEmpresa()">FUNDAR EMPRESA</button>
        </div>

        <div id="corp-main-panel">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div><span class="corp-badge" id="emp-nivel">Nível 1</span> <span class="corp-badge" style="border-color:#ff4a7a; color:#ff4a7a;" id="emp-rep">Rep: 10</span></div>
                <div style="font-size: 10px; color:#888;">XP: <span id="emp-xp" style="color:#fff">0</span></div>
            </div>

            <div class="corp-stats-grid">
                <div class="corp-stat-box"><div class="stat-label">Caixa Empresa</div><div class="stat-value" style="color:#00ff88" id="emp-caixa">R$ 0</div></div>
                <div class="corp-stat-box"><div class="stat-label">Estoque (Chips)</div><div class="stat-value" style="color:#7FDBFF" id="emp-estoque">0 / 0</div></div>
            </div>
            
            <div style="display:flex; justify-content:space-between; margin-bottom: 15px; font-size:10px; color:#888;">
                <span id="emp-custo">Custo: R$ 0/min</span>
                <span id="emp-prod">Prod: 0/min</span>
            </div>

            <div class="rh-carousel" id="rh-container"></div>
            
            <button class="btn-corp" style="background: linear-gradient(145deg, #00ff88, #00b3ff); border:none; color:#000;" onclick="venderEstoque()"><i class="fas fa-truck"></i> VENDER ESTOQUE (R$ 15/un)</button>
        </div>
    </div>
</div>

<script>
    async function openEmpresa() {
        document.getElementById('empresa-app').classList.add('active');
        history.pushState({app:'empresa'}, '');
        await attEmpresa();
    }
    function closeEmpresa() { document.getElementById('empresa-app').classList.remove('active'); }

    async function attEmpresa() {
        try {
            const res = await fetch('/api/empresa/info'); const data = await res.json();
            if (!data.hasCompany) {
                document.getElementById('corp-main-panel').style.display = 'none';
                document.getElementById('corp-fundar-panel').style.display = 'block';
            } else {
                document.getElementById('corp-fundar-panel').style.display = 'none';
                document.getElementById('corp-main-panel').style.display = 'block';
                
                const emp = data.empresa; const st = data.stats;
                document.getElementById('emp-nome-header').innerText = emp.nome.toUpperCase();
                document.getElementById('emp-nivel').innerText = 'Nível ' + emp.nivel;
                document.getElementById('emp-rep').innerText = 'Rep: ' + emp.reputacao;
                document.getElementById('emp-xp').innerText = emp.xp;
                document.getElementById('emp-caixa').innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(emp.caixa);
                document.getElementById('emp-estoque').innerText = (emp.estoque["Microchips"] || 0) + ' / ' + st.limiteEstoque;
                document.getElementById('emp-custo').innerText = 'Custo: R$ ' + st.custoManutencaoMinuto + '/min';
                document.getElementById('emp-prod').innerText = 'Prod: ' + st.prodPorMinuto + '/min';

                let htmlRH = '';
                for (let k in st.rh) {
                    const f = st.rh[k]; const tem = emp.funcionarios.includes(k); const locked = emp.nivel < f.reqLvl;
                    let btn = tem ? '<button class="btn-corp disabled">ATIVO</button>' : locked ? '<button class="btn-corp disabled"><i class="fas fa-lock"></i> NVL ' + f.reqLvl + '</button>' : '<button class="btn-corp" onclick="contratar(\\'' + k + '\\')">CONTRATAR (R$ ' + (f.salarioHora * 5) + ')</button>';
                    htmlRH += '<div class="func-card"><i class="fas fa-user-tie" style="font-size:20px; color:#7FDBFF; margin-bottom:5px;"></i><b style="font-size:11px">' + f.nome + '</b><div style="font-size:9px; color:#888">' + f.cargo + '</div><div style="font-size:8px; color:#aaa; margin:5px 0 10px;">' + f.efeito + '</div>' + btn + '</div>';
                }
                document.getElementById('rh-container').innerHTML = htmlRH;
            }
        } catch(e) {}
    }

    async function fundarEmpresa() {
        const nome = document.getElementById('inputNomeEmpresa').value;
        if (!nome) return showAlerta("Digite um nome!");
        const res = await fetch('/api/empresa/fundar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome }) });
        const data = await res.json(); showAlerta(data.msg); if (data.success) attEmpresa();
    }
    
    async function contratar(funcId) {
        const res = await fetch('/api/empresa/contratar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ funcId }) });
        const data = await res.json(); showAlerta(data.msg); if (data.success) attEmpresa();
    }

    async function venderEstoque() {
        const res = await fetch('/api/empresa/vender', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const data = await res.json(); showAlerta(data.msg); if (data.success) attEmpresa();
    }
    
    setInterval(() => { if(document.getElementById('empresa-app').classList.contains('active')) attEmpresa(); }, 5000);
</script>
`;

html = html.replace('</body>', empresaUI + '\n</body>');
fs.writeFileSync(path, html);
console.log("✅ INJEÇÃO CONCLUÍDA! Seu 'os.html' foi modificado com sucesso via telepatia estrutural.");
