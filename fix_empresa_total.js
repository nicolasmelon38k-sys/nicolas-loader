const fs = require('fs');
const path = './views/os.html';
let html = fs.readFileSync(path, 'utf8');

// LIMPEZA: Remove qualquer vestígio de injeções antigas da empresa
html = html.replace(/<style>[\s\S]*?\/\* CSS EXCLUSIVO DA EMPRESA \*\/[\s\S]*?<\/style>/g, '');
html = html.replace(/<div id="empresa-app"[\s\S]*?<\/div>\s*?<\/div>\s*?<\/div>/g, '');
html = html.replace(/<script>[\s\S]*?\/\/ LÓGICA DA EMPRESA[\s\S]*?<\/script>/g, '');
html = html.replace(/<script>[\s\S]*?\/\/ 🧠 MOTOR DE TEMPO REAL[\s\S]*?<\/script>/g, '');

// A NOVA INTERFACE PREMIUM VIVA
const novaEmpresaInterface = `
<style>
    #empresa-app { background: #020813; z-index: 1500; padding: 0; }
    .corp-header { background: linear-gradient(180deg, #001f3f, transparent); padding: 25px 20px; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(127, 219, 255, 0.2); }
    .corp-title { font-size: 20px; font-weight: 900; color: #7FDBFF; letter-spacing: 2px; }
    .live-indicator { width: 8px; height: 8px; background: #00ff88; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px #00ff88; animation: pulseLive 1.5s infinite; margin-right: 5px; }
    @keyframes pulseLive { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
    .corp-content { padding: 20px; overflow-y: auto; flex: 1; }
    .glass-stat { background: rgba(0, 31, 63, 0.6); backdrop-filter: blur(10px); border: 1px solid rgba(127, 219, 255, 0.3); border-radius: 20px; padding: 20px; margin-bottom: 15px; }
    .ticker { font-family: monospace; font-size: 24px; font-weight: 900; margin-top: 5px; }
    .xp-bg { background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; margin-top: 10px; overflow: hidden; }
    .xp-fill { background: #ff4a7a; height: 100%; transition: width 0.5s; }
    .rh-car { display: flex; overflow-x: auto; gap: 12px; padding-bottom: 15px; }
    .rh-car::-webkit-scrollbar { display: none; }
    .card-rh { flex: 0 0 140px; background: rgba(0,31,63,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 15px; padding: 15px; display: flex; flex-direction: column; text-align: center; }
    .btn-apple { width: 100%; background: linear-gradient(145deg, #0074D9, #001f3f); border: 1px solid #7FDBFF; padding: 12px; border-radius: 12px; font-size: 11px; font-weight: 900; transition: 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); margin-top: 10px; color: #fff; cursor: pointer; }
    .btn-apple:active { transform: scale(0.9); }
    .btn-apple.disabled { opacity: 0.3; pointer-events: none; }
</style>

<div id="empresa-app" class="app-modal">
    <div class="corp-header">
        <div><div class="corp-title" id="e-name">DAEMONTECH</div><div style="font-size:10px; color:#7FDBFF"><span class="live-indicator"></span> SISTEMA ONLINE</div></div>
        <i class="fas fa-times" onclick="closeEmpresa()" style="font-size:24px; color:#7FDBFF"></i>
    </div>
    <div class="corp-content">
        <div id="p-fundar" style="display:none; text-align:center; padding-top:50px;">
            <i class="fas fa-building" style="font-size:60px; color:#7FDBFF; margin-bottom:20px"></i>
            <h2>Abra sua Empresa</h2>
            <p style="color:#888; font-size:12px; margin-bottom:30px">Taxa de abertura: R$ 2.500</p>
            <input type="text" id="in-name" class="corp-input" placeholder="Nome da Empresa" style="width:100%; background:#111; border:1px solid #333; padding:15px; border-radius:15px; color:#fff; margin-bottom:20px">
            <button class="btn-apple" onclick="fEmpresa()">FUNDAR EMPRESA</button>
        </div>
        <div id="p-main" style="display:none">
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:10px">
                <b id="e-lvl" style="color:#7FDBFF">Nível 1</b>
                <span id="e-xp-txt" style="font-size:10px; color:#888">XP: 0/100</span>
            </div>
            <div class="xp-bg"><div class="xp-fill" id="e-xp-bar"></div></div>
            <br>
            <div class="glass-stat">
                <div style="font-size:10px; color:#888">CAIXA DA EMPRESA (CNPJ)</div>
                <div class="ticker" style="color:#00ff88" id="e-caixa">R$ 0,00</div>
                <div style="font-size:9px; color:#ff4a7a; margin-top:5px" id="e-custo">Custo: R$ 0/min</div>
            </div>
            <div class="glass-stat">
                <div style="font-size:10px; color:#888">ESTOQUE DE MICROCHIPS</div>
                <div class="ticker" style="color:#7FDBFF" id="e-estoque">0 / 0</div>
                <div style="font-size:9px; color:#00ff88; margin-top:5px" id="e-prod">Produção: 0/min</div>
            </div>
            <div class="rh-car" id="e-rh"></div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px">
                <button class="btn-apple" style="background:#00ff88; color:#000; border:none" onclick="vEmpresa()">VENDER ESTOQUE</button>
                <button class="btn-apple" style="background:#ffb300; color:#000; border:none" onclick="rEmpresa()">RECOLHER LUCRO</button>
            </div>
        </div>
    </div>
</div>

<script>
    let cacheEmp = null; let fakeCaixa = 0; let cacheChips = 0;
    async function openEmpresa() { document.getElementById('empresa-app').classList.add('active'); history.pushState({app:'empresa'}, ''); await syncEmp(); }
    function closeEmpresa() { document.getElementById('empresa-app').classList.remove('active'); }
    async function syncEmp() {
        const r = await fetch('/api/empresa/info'); const d = await r.json();
        if(!d.hasCompany) { document.getElementById('p-fundar').style.display='block'; document.getElementById('p-main').style.display='none'; return; }
        document.getElementById('p-fundar').style.display='none'; document.getElementById('p-main').style.display='block';
        cacheEmp = d; fakeCaixa = d.empresa.caixa; cacheChips = d.empresa.estoque["Microchips"] || 0;
        document.getElementById('e-name').innerText = d.empresa.nome.toUpperCase();
        document.getElementById('e-lvl').innerText = 'Nível ' + d.empresa.nivel;
        document.getElementById('e-xp-txt').innerText = 'XP: ' + d.empresa.xp + '/' + (d.empresa.nivel * 100);
        document.getElementById('e-xp-bar').style.width = (d.empresa.xp / (d.empresa.nivel * 100) * 100) + '%';
        document.getElementById('e-custo').innerText = 'Custo Manutenção: R$ ' + d.stats.custoManutencaoMinuto + '/min';
        document.getElementById('e-prod').innerText = 'Produção: ' + d.stats.prodPorMinuto + '/min';
        let h = ''; for(let k in d.stats.rh) {
            let f = d.stats.rh[k]; let tem = d.empresa.funcionarios.includes(k); let lock = d.empresa.nivel < f.reqLvl;
            let b = tem ? '<button class="btn-apple disabled">NA EQUIPE</button>' : lock ? '<button class="btn-apple disabled">NVL '+f.reqLvl+'</button>' : '<button class="btn-apple" onclick="cFunc(\\''+k+'\\')">CONTRATAR R$ '+(f.salarioHora*5)+'</button>';
            h += '<div class="card-rh"><i class="fas fa-user-tie" style="color:#7FDBFF; font-size:20px"></i><b style="font-size:11px; margin:5px 0">'+f.nome+'</b><span style="font-size:8px; color:#888">'+f.cargo+'</span><span style="font-size:8px; color:#aaa; margin-top:5px">'+f.efeito+'</span>'+b+'</div>';
        }
        document.getElementById('e-rh').innerHTML = h;
    }
    setInterval(() => {
        if(cacheEmp && document.getElementById('empresa-app').classList.contains('active')) {
            fakeCaixa -= (cacheEmp.stats.custoManutencaoMinuto / 60);
            cacheChips += (cacheEmp.stats.prodPorMinuto / 60);
            if(cacheChips > cacheEmp.stats.limiteEstoque) cacheChips = cacheEmp.stats.limiteEstoque;
            document.getElementById('e-caixa').innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fakeCaixa);
            document.getElementById('e-estoque').innerText = Math.floor(cacheChips) + ' / ' + cacheEmp.stats.limiteEstoque;
        }
    }, 1000);
    async function fEmpresa() { const n = document.getElementById('in-name').value; if(!n) return; const r = await fetch('/api/empresa/fundar', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({nome:n}) }); const d = await r.json(); showAlerta(d.msg); if(d.success) syncEmp(); }
    async function cFunc(id) { const r = await fetch('/api/empresa/contratar', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({funcId:id}) }); const d = await r.json(); showAlerta(d.msg); if(d.success) syncEmp(); }
    async function vEmpresa() { const r = await fetch('/api/empresa/vender', { method:'POST' }); const d = await r.json(); showAlerta(d.msg); if(d.success) syncEmp(); }
    async function rEmpresa() { const v = prompt("Quanto sacar?"); if(!v) return; const r = await fetch('/api/empresa/recolher', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({valor:v}) }); const d = await r.json(); showAlerta(d.msg); if(d.success) { syncEmp(); sinc(); } }
</script>
`;

html = html.replace('</body>', novaEmpresaInterface + '\n</body>');
fs.writeFileSync(path, html);
console.log("✅ SISTEMA DAEMONTECH RECONSTRUÍDO! Abra o site e veja a mágica.");
