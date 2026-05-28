const fs = require('fs');
const path = './views/os.html';
let html = fs.readFileSync(path, 'utf8');

// 🧹 1. FAXINA BRUTA: Corta fora o app da empresa antigo pra não dar conflito
const inicioApp = html.indexOf('<div id="empresa-app"');
if (inicioApp !== -1) {
    const fimApp = html.indexOf('<div id="control-app"'); 
    const fimAppAlt = html.indexOf('<div id="monitor-app"');
    const fimCerto = fimApp !== -1 ? fimApp : (fimAppAlt !== -1 ? fimAppAlt : html.indexOf('<div class="dock"'));
    
    if (fimCerto !== -1) {
        html = html.substring(0, inicioApp) + html.substring(fimCerto);
    }
}
// Limpa os scripts soltos antigos
html = html.replace(/<script>\s*let cacheEmp = null;[\s\S]*?<\/script>/g, '');
html = html.replace(/<style>[\s\S]*?#empresa-app[\s\S]*?<\/style>/g, '');

// 🍎 2. A NOVA INTERFACE ESTILO APPLE (VIDRO, MOLA E CLEAN)
const appleUI = `
<style>
    /* DESIGN APPLE / iOS */
    #empresa-app { 
        background: rgba(10, 10, 12, 0.85); 
        backdrop-filter: blur(25px); 
        -webkit-backdrop-filter: blur(25px); 
        z-index: 1500; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .apple-header { 
        padding: 30px 20px 15px; display: flex; justify-content: space-between; align-items: flex-start;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .apple-title { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .apple-subtitle { font-size: 13px; color: #888; font-weight: 500; }
    
    .apple-content { padding: 20px; overflow-y: auto; flex: 1; height: calc(100vh - 100px); }
    
    /* CARDS DE VIDRO (GLASSMORPHISM FINO) */
    .apple-card { 
        background: rgba(255, 255, 255, 0.04); 
        border: 1px solid rgba(255, 255, 255, 0.08); 
        border-radius: 24px; padding: 20px; margin-bottom: 15px; 
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    .apple-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 5px; }
    .apple-value { font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -1px; }
    .apple-subvalue { font-size: 12px; font-weight: 600; margin-top: 5px; }

    /* BOTÕES COM FÍSICA DE MOLA */
    .btn-spring { 
        width: 100%; border: none; padding: 16px; border-radius: 18px; 
        font-size: 14px; font-weight: 700; cursor: pointer; color: #000;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        display: flex; justify-content: center; align-items: center; gap: 8px;
    }
    .btn-spring:active { transform: scale(0.92); opacity: 0.8; }
    .btn-primary { background: #fff; color: #000; }
    .btn-success { background: #32d74b; color: #000; }
    .btn-danger { background: #ff453a; color: #fff; }
    .btn-disabled { background: rgba(255,255,255,0.1); color: #666; pointer-events: none; }

    /* CARROSSEL TIPO WIDGETS DO IPHONE */
    .rh-scroll { display: flex; overflow-x: auto; gap: 15px; padding-bottom: 20px; scroll-snap-type: x mandatory; }
    .rh-scroll::-webkit-scrollbar { display: none; }
    .rh-widget { 
        flex: 0 0 160px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); 
        border-radius: 24px; padding: 20px 15px; scroll-snap-align: start; 
        display: flex; flex-direction: column; align-items: center; text-align: center;
    }
    
    .dot-live { 
        width: 10px; height: 10px; background: #32d74b; border-radius: 50%; display: inline-block; 
        box-shadow: 0 0 12px #32d74b; animation: pulseApple 2s infinite; 
    }
    @keyframes pulseApple { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }
</style>

<div id="empresa-app" class="app-modal">
    <div class="apple-header">
        <div>
            <div class="apple-title" id="ap-name">Empresa</div>
            <div class="apple-subtitle"><span class="dot-live"></span> Sistema Ativo</div>
        </div>
        <div style="background: rgba(255,255,255,0.1); width: 36px; height: 36px; border-radius: 18px; display: grid; place-items: center; cursor: pointer;" onclick="closeEmpresa()">
            <i class="fas fa-times" style="color: #fff; font-size: 16px;"></i>
        </div>
    </div>
    
    <div class="apple-content">
        <div id="ap-fundar" style="display:none; text-align:center; padding-top: 40px;">
            <div style="background: rgba(255,255,255,0.05); width: 100px; height: 100px; border-radius: 30px; display: grid; place-items: center; margin: 0 auto 20px;">
                <i class="fas fa-building" style="font-size: 40px; color: #fff;"></i>
            </div>
            <h2 style="font-weight: 800; font-size: 24px; margin-bottom: 10px;">Nova Empresa</h2>
            <p style="color: #888; font-size: 14px; margin-bottom: 30px;">Licença corporativa custa R$ 2.500</p>
            
            <input type="text" id="ap-in-name" placeholder="Nome da sua empresa" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 18px; border-radius: 18px; color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 20px; outline: none; text-align: center;">
            <button class="btn-spring btn-primary" onclick="fEmpresa()"><i class="fas fa-check"></i> Fundar</button>
        </div>

        <div id="ap-main" style="display:none;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="background: rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 700;" id="ap-lvl">Nível 1</div>
                <div style="font-size: 12px; font-weight: 700; color: #888;">XP: <span id="ap-xp" style="color:#fff;">0/100</span></div>
            </div>

            <div class="apple-card">
                <div class="apple-label">Caixa (CNPJ)</div>
                <div class="apple-value" id="ap-caixa" style="color: #32d74b;">R$ 0,00</div>
                <div class="apple-subvalue" style="color: #ff453a;"><i class="fas fa-arrow-down"></i> Custo: R$ <span id="ap-custo">0</span>/min</div>
            </div>

            <div class="apple-card">
                <div class="apple-label">Estoque (Chips)</div>
                <div class="apple-value" id="ap-estoque">0</div>
                <div class="apple-subvalue" style="color: #0a84ff;"><i class="fas fa-arrow-up"></i> Produção: <span id="ap-prod">0</span>/min</div>
            </div>

            <div class="apple-label" style="margin-top: 30px; margin-bottom: 15px;">Equipe (Recursos Humanos)</div>
            <div class="rh-scroll" id="ap-rh"></div>

            <div style="display: flex; gap: 12px; margin-top: 10px;">
                <button class="btn-spring btn-success" onclick="vEmpresa()"><i class="fas fa-box-open"></i> Vender</button>
                <button class="btn-spring btn-primary" onclick="rEmpresa()"><i class="fas fa-wallet"></i> Sacar</button>
            </div>
        </div>
    </div>
</div>

<script>
    // 🧠 ANTI-NAN SCRIPT E LÓGICA DE TEMPO REAL
    let cacheEmp = null; 
    let realCaixa = 0; 
    let realChips = 0;

    async function openEmpresa() { 
        document.getElementById('empresa-app').classList.add('active'); 
        history.pushState({app:'empresa'}, ''); 
        await syncEmp(); 
    }
    
    function closeEmpresa() { 
        document.getElementById('empresa-app').classList.remove('active'); 
    }

    async function syncEmp() {
        try {
            const r = await fetch('/api/empresa/info'); 
            const d = await r.json();
            
            if(!d.hasCompany) { 
                document.getElementById('ap-fundar').style.display = 'block'; 
                document.getElementById('ap-main').style.display = 'none'; 
                return; 
            }
            
            document.getElementById('ap-fundar').style.display = 'none'; 
            document.getElementById('ap-main').style.display = 'block';
            
            cacheEmp = d; 
            
            // 🔥 PROTEÇÃO CONTRA NaN (Força a conversão pra número)
            realCaixa = Number(d.empresa.caixa) || 0;
            realChips = Number(d.empresa.estoque["Microchips"]) || 0;
            
            let custo = Number(d.stats.custoManutencaoMinuto) || 0;
            let prod = Number(d.stats.prodPorMinuto) || 0;
            let lim = Number(d.stats.limiteEstoque) || 0;

            document.getElementById('ap-name').innerText = d.empresa.nome;
            document.getElementById('ap-lvl').innerText = 'Nível ' + (d.empresa.nivel || 1);
            document.getElementById('ap-xp').innerText = (d.empresa.xp || 0) + '/' + ((d.empresa.nivel || 1) * 100);
            
            document.getElementById('ap-custo').innerText = custo;
            document.getElementById('ap-prod').innerText = prod;

            let h = ''; 
            for(let k in d.stats.rh) {
                let f = d.stats.rh[k]; 
                let tem = d.empresa.funcionarios.includes(k); 
                let lock = (d.empresa.nivel || 1) < f.reqLvl;
                
                let btn = tem ? '<button class="btn-spring btn-disabled" style="padding:10px; font-size:10px;">ATIVO</button>' 
                        : lock ? '<button class="btn-spring btn-disabled" style="padding:10px; font-size:10px;"><i class="fas fa-lock"></i> NVL '+f.reqLvl+'</button>' 
                        : '<button class="btn-spring btn-primary" style="padding:10px; font-size:10px;" onclick="cFunc(\\''+k+'\\')">R$ '+(f.salarioHora*5)+'</button>';
                
                h += '<div class="rh-widget"><div style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.1);display:grid;place-items:center;margin-bottom:10px;"><i class="fas fa-user-tie" style="color:#fff; font-size:18px;"></i></div><b style="font-size:13px; color:#fff; margin-bottom:2px;">'+f.nome+'</b><span style="font-size:10px; color:#888; margin-bottom:8px;">'+f.cargo+'</span><span style="font-size:9px; color:#0a84ff; font-weight:700; margin-bottom:12px; flex:1;">'+f.efeito+'</span>'+btn+'</div>';
            }
            document.getElementById('ap-rh').innerHTML = h;
        } catch(e) { console.log(e); }
    }

    // MOTOR QUE MOVE OS NÚMEROS
    setInterval(() => {
        if(cacheEmp && document.getElementById('empresa-app').classList.contains('active')) {
            let custo = Number(cacheEmp.stats.custoManutencaoMinuto) || 0;
            let prod = Number(cacheEmp.stats.prodPorMinuto) || 0;
            let lim = Number(cacheEmp.stats.limiteEstoque) || 0;

            realCaixa -= (custo / 60);
            realChips += (prod / 60);
            if(realChips > lim) realChips = lim;
            
            // Formata bonito pra tela
            document.getElementById('ap-caixa').innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(realCaixa);
            document.getElementById('ap-estoque').innerText = Math.floor(realChips) + ' / ' + lim;
        }
    }, 1000);

    async function fEmpresa() { const n = document.getElementById('ap-in-name').value; if(!n) return; const r = await fetch('/api/empresa/fundar', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({nome:n}) }); const d = await r.json(); showAlerta(d.msg); if(d.success) syncEmp(); }
    async function cFunc(id) { const r = await fetch('/api/empresa/contratar', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({funcId:id}) }); const d = await r.json(); showAlerta(d.msg); if(d.success) syncEmp(); }
    async function vEmpresa() { const r = await fetch('/api/empresa/vender', { method:'POST' }); const d = await r.json(); showAlerta(d.msg); if(d.success) syncEmp(); }
    async function rEmpresa() { const v = prompt("Quanto deseja sacar? (Taxa 5%)"); if(!v || isNaN(v) || v<=0) return; const r = await fetch('/api/empresa/recolher', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({valor:Number(v)}) }); const d = await r.json(); showAlerta(d.msg); if(d.success) { syncEmp(); sinc(); } }
</script>
`;

html = html.replace('</body>', appleUI + '\n</body>');
fs.writeFileSync(path, html);
console.log("✅ UPGRADE APPLE CONCLUÍDO! Adeus NaN, Olá Molas Mágicas!");
