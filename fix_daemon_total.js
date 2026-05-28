const fs = require('fs');
const path = './views/os.html';
let html = fs.readFileSync(path, 'utf8');

console.log("🛠️ Iniciando Operação Cirúrgica Daemon Total...");

// 1. CSS: UNIFICAÇÃO DA FÍSICA DE MOLA E ESTILOS ROBUSTOS
const cssAlvo = '<style>';
const cssNovo = `<style>
    /* 🚀 UNIFICAÇÃO DA FÍSICA DE MOLA (MOLA MÁGICA EM TUDO) */
    .apple-btn-active { transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important; cursor: pointer; }
    .apple-btn-active:active { transform: scale(0.92) !important; opacity: 0.8; border-color: rgba(255,255,255,0.2) !important; }

    /* 🛡️ MODAIS ABSOLUTOS E BLINDADOS */
    .app-modal { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; background: #000; z-index: 2000; transform: translateY(100%); transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; overflow: hidden; }
    .app-modal.active { transform: translateY(0); }
    
    /* 🍎 GLASSMORPHISM / APPLE UI STYLES */
    #empresa-app, #empregos-app { background: rgba(10, 10, 12, 0.95); backdrop-filter: blur(25px); }
    .apple-header { padding: 30px 20px 15px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .apple-title { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .apple-subtitle { font-size: 13px; color: #888; font-weight: 500; }
    .apple-content { padding: 20px; overflow-y: auto; flex: 1; height: calc(100vh - 100px); }
    .apple-card { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; padding: 20px; margin-bottom: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .apple-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 5px; }
    .apple-value { font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -1px; }
    .btn-spring { width: 100%; border: none; padding: 16px; border-radius: 18px; font-size: 13px; font-weight: 800; cursor: pointer; transition: 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; justify-content: center; align-items: center; gap: 8px;}
    .btn-spring:active { transform: scale(0.92); opacity: 0.8; }
    
    .rh-scroll { display: flex; overflow-x: auto; gap: 15px; padding-bottom: 20px; scroll-snap-type: x mandatory; }
    .rh-scroll::-webkit-scrollbar { display: none; }
    .rh-widget { flex: 0 0 140px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 15px; scroll-snap-align: start; text-align: center; }
    .dot-live { width: 10px; height: 10px; background: #32d74b; border-radius: 50%; display: inline-block; box-shadow: 0 0 12px #32d74b; animation: pulseApple 2s infinite; }
    @keyframes pulseApple { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }
`;
html = html.replace(cssAlvo, cssAlvo + cssNovo);

// 2. HTML: INJEÇÃO DO MODAL DE INPUT DE SAQUE (MATA A CAIXA QUADRADA DO GOOGLE)
const closeModalScript = '</body>';
const modalWithdrawHTML = `
  <div id="wd-box" class="app-modal apple-modal" style="z-index: 99999; background: rgba(5, 5, 7, 0.9);">
    <div class="apple-header" style="border:none;">
        <div>
            <div class="apple-title" style="color: #bf5af2;"><i class="fas fa-hand-holding-usd"></i> Sacar Cash</div>
            <div class="apple-subtitle">Taxa de 5% sobre o valor</div>
        </div>
        <div style="background: rgba(255,255,255,0.1); width: 36px; height: 36px; border-radius: 18px; display: grid; place-items: center; cursor: pointer;" onclick="closeWithdrawBox()">
            <i class="fas fa-times" style="color: #fff; font-size: 16px;"></i>
        </div>
    </div>
    
    <div class="apple-content" style="padding: 20px; text-align: center;">
        <i class="fas fa-money-bill-wave" style="font-size: 40px; color: #32d74b; margin-bottom: 20px;"></i>
        <div class="apple-label">VALOR DO SAQUE DO CAIXA</div>
        <input type="number" id="wd-input" placeholder="R$ 0,00" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 25px; border-radius: 24px; color: #fff; font-size: 28px; font-weight: 800; margin-bottom: 25px; outline: none; text-align: center;">
        
        <button class="btn-spring apple-btn-active" style="background:#bf5af2; color:#fff;" id="wd-confirm-btn" onclick="executeWithdraw()">CONFIRMAR SAQUE</button>
    </div>
  </div>
</body>`;
html = html.replace(closeModalScript, modalWithdrawHTML);

// 3. JAVASCRIPT: LÓGICA DE layered DISPLAY E INPUT DE SAQUE BLINDADO
const inicioJS = '<script>';
const novoJS = `<script>
    const socket = io(); const audio = document.getElementById('player');
    let monitorInterval; let selectedUserId = null; let selectedUserName = null; let selectedAction = null;

    const fmtMoney = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
    const fmtM = (v) => new Intl.NumberFormat('pt-BR', { notation: "compact", maximumFractionDigits: 1 }).format(v || 0);

    function updateClock() { 
        const el = document.getElementById('clock');
        if(el) el.innerText = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}); 
    }
    setInterval(updateClock, 1000); updateClock();

    function showAlerta(msg) {
        const t = document.getElementById('toast'); 
        if(t) {
            document.getElementById('toastMsg').innerText = msg;
            t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3500);
        }
    }

    async function sinc() {
        try {
            const res = await fetch('/api/userinfo'); const data = await res.json();
            if(data.dinheiro !== undefined) {
                const bal = document.getElementById('userBalance');
                if(bal) bal.innerText = fmtMoney(data.dinheiro);
                if(data.isAdmin) {
                    const ic = document.getElementById('adminAppIcon');
                    if(ic) ic.style.display = 'flex';
                }
            }
        } catch(e) {}
    }
    setInterval(sinc, 2000); sinc();

    // ==========================================
    // LÓGICA DO MODAL DE SAQUE (MATA O PROMPT)
    // ==========================================
    function openWithdrawBox() {
        document.getElementById('wd-input').value = '';
        document.getElementById('wd-box').classList.add('active');
        history.pushState({app:'withdraw'}, '');
    }
    function closeWithdrawBox() {
        document.getElementById('wd-box').classList.remove('active');
    }
    async function executeWithdraw() {
        const v = document.getElementById('wd-input').value;
        if(!v || isNaN(v) || v<=0) return showAlerta('Digite um valor válido.');
        
        const btn = document.getElementById('wd-confirm-btn'); btn.innerText = "PROCESSANDO..."; btn.style.opacity="0.7";
        
        const r = await fetch('/api/empresa/recolher', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({valor:Number(v)}) });
        const d = await r.json();
        
        btn.innerText = "CONFIRMAR SAQUE"; btn.style.opacity="1";
        
        showAlerta(d.msg);
        if(d.success) { closeWithdrawBox(); await syncEmp(); sinc(); }
    }

    // ==================
    // ADMIN CONTROL
    // ==================
    async function openControl(isRefresh = false) {
        if(!isRefresh) { document.getElementById('control-app').classList.add('active'); history.pushState({app:'control'}, ''); }
        try {
            const res = await fetch('/api/admin/users');
            if (res.status === 403) { document.getElementById('control-content').style.display = 'none'; document.getElementById('access-denied').style.display = 'flex'; return; }
            document.getElementById('access-denied').style.display = 'none'; document.getElementById('control-content').style.display = 'block';
            const db = await res.json(); let html = '';
            for(let id in db) {
                const u = db[id]; const nomeEscapado = (u.nome || 'Novato').replace(/'/g, "\\\\'");
                html += \`<div class="user-card apple-btn-active \${selectedUserId === id ? 'selected' : ''}" id="card-\${id}" onclick="selectUser('\${id}', '\${nomeEscapado}')"><i class="fas fa-user-astronaut u-icon"></i><div class="u-name">\${u.nome || 'Novato'}</div><div class="u-id">ID: \${id.substring(0,5)}</div><div class="u-saldo">\${fmtM(u.dinheiro)}</div><div class="u-level">Lvl: \${u.level || 1}</div></div>\`;
            }
            document.getElementById('userCarousel').innerHTML = html;
        } catch(e) {}
    }
    function closeControl() { document.getElementById('control-app').classList.remove('active'); selectedUserId = null; selectedUserName = null; selectedAction = null; document.querySelectorAll('.user-card').forEach(c => c.classList.remove('selected')); document.querySelectorAll('.act-btn').forEach(b => b.classList.remove('selected')); document.getElementById('ctrlValue').value = ''; }
    function selectUser(id, nome) { selectedUserId = id; selectedUserName = nome; document.querySelectorAll('.user-card').forEach(c => c.classList.remove('selected')); document.getElementById(\`card-\${id}\`).classList.add('selected'); }
    function selectAction(action) { selectedAction = action; document.querySelectorAll('.act-btn').forEach(b => b.classList.remove('selected')); document.getElementById(\`btn-\${action}\`).classList.add('selected'); }
    function showBalloon(action, value, id, name) {
        const bal = document.getElementById('action-balloon'); const actNames = { 'add_money': 'INJEÇÃO DE CASH', 'rem_money': 'CONFISCO DE CASH', 'set_level': 'DEFINIÇÃO DE LEVEL', 'rem_level': 'REBAIXAMENTO DE LEVEL' };
        let displayVal = action.includes('money') ? fmtMoney(value) : value + ' Lvl';
        let icon = action.includes('add') || action === 'set_level' ? '<i class="fas fa-arrow-up" style="color:#00ff88; text-shadow: 0 0 15px #00ff88;"></i>' : '<i class="fas fa-arrow-down" style="color:#ff0055; text-shadow: 0 0 15px #ff0055;"></i>';
        document.getElementById('bal-icon').innerHTML = icon; document.getElementById('bal-title').innerText = actNames[action]; document.getElementById('bal-target').innerText = name; document.getElementById('bal-id').innerText = id; document.getElementById('bal-val').innerText = displayVal; document.getElementById('bal-val').style.color = action.includes('add') || action === 'set_level' ? '#00ff88' : '#ff0055';
        bal.classList.add('show'); setTimeout(() => bal.classList.remove('show'), 2500);
    }
    async function executeControl() {
        const val = document.getElementById('ctrlValue').value;
        if (!selectedUserId) return showAlerta('Selecione um alvo.'); if (!selectedAction) return showAlerta('Selecione a ação.'); if (!val || val <= 0) return showAlerta('Digite um valor.');
        const btn = document.getElementById('btnExecutar'); btn.innerText = "SINTETIZANDO..."; btn.style.opacity = "0.7";
        try { const res = await fetch('/api/admin/action', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ targetId: selectedUserId, action: selectedAction, amount: val }) }); const data = await res.json(); btn.innerText = "EXECUTAR DIRETRIZ"; btn.style.opacity = "1";
            if(data.success) { document.getElementById('ctrlValue').value = ''; showBalloon(selectedAction, val, selectedUserId, selectedUserName); openControl(true); } else { showAlerta(data.msg); }
        } catch(e) { showAlerta('Erro na Matriz.'); btn.innerText = "EXECUTAR DIRETRIZ"; btn.style.opacity = "1"; }
    }

    // ==================
    // MONITOR / GOD MODE
    // ==================
    function openMonitor() { document.getElementById('monitor-app').classList.add('active'); history.pushState({app:'monitor'}, ''); fetchAdminData(); monitorInterval = setInterval(fetchAdminData, 2000); }
    function closeMonitor() { document.getElementById('monitor-app').classList.remove('active'); clearInterval(monitorInterval); }
    async function fetchAdminData() {
        try {
            const res = await fetch('/api/admin/users'); if(res.status !== 200) return; const db = await res.json(); let html = '';
            for(let id in db) { const u = db[id]; const isO = u.afk && u.afk.status ? '<span style="color:#666">AFK</span>' : '<span style="color:#00ff88">ON</span>'; html += \`<tr><td><strong style="color:#fff">\${u.nome||'Nov'}</strong><br><span style="font-size:8px;color:#888">\${id}</span></td><td><span style="color:#00ff88">\${fmtMoney(u.dinheiro)}</span><br><span style="color:#71dcff">🏦 \${fmtMoney(u.banco)}</span></td><td>\${isO} | Lvl \${u.level||1}</td></tr>\`; }
            document.getElementById('adminTableBody').innerHTML = html;
        } catch(e) {}
    }

    // ==================
    // MUSIC
    // ==================
    function openMusic() { document.getElementById('music-app').classList.add('active'); history.pushState({app:'music'}, ''); }
    function closeMusic() { document.getElementById('music-app').classList.remove('active'); }
    function startDl() { const q = document.getElementById('mInput').value; if(!q) return; socket.emit('download_music', q); document.getElementById('mTitle').innerText = "Buscando..."; }
    socket.on('music_meta', d => { document.getElementById('mTitle').innerText = d.title; });
    socket.on('download_ready', url => { const v = document.getElementById('mThumb'); v.src = url; v.play(); document.getElementById('pIcon').className = 'fas fa-pause'; });
    function toggle() { const v = document.getElementById('mThumb'); if(v.paused) { v.play(); document.getElementById('pIcon').className = 'fas fa-pause'; } else { v.pause(); document.getElementById('pIcon').className = 'fas fa-play'; } }

    // ==========================================
    // LÓGICA DA EMPRESA (LAYERED DISPLAY ENGINE)
    // ==========================================
    let cacheEmp = null; let realCaixa = 0; let realChips = 0;
    
    // 🛡️ Abertura Mestre: Garante que os sub-painéis comecem escondidos
    async function openEmpresa() { 
        document.getElementById('empresa-app').classList.add('active'); 
        history.pushState({app:'empresa'}, ''); 
        
        // Esconde sub-painéis antes de sincronizar
        if(document.getElementById('ap-relatorios')) document.getElementById('ap-relatorios').style.display='none';
        if(document.getElementById('ap-upgrades')) document.getElementById('ap-upgrades').style.display='none';
        
        await syncEmp(); 
    }
    
    function closeEmpresa() { 
        document.getElementById('empresa-app').classList.remove('active'); 
        realCaixa = 0; realChips = 0; // Reseta o cache de render
    }

    async function syncEmp() {
        try {
            const r = await fetch('/api/empresa/info'); const d = await r.json();
            
            // Tratamento anti-negao traidor
            if(!d.hasCompany) { 
                document.getElementById('ap-fundar').style.display='block'; 
                document.getElementById('ap-main').style.display='none'; 
                if(document.getElementById('ap-relatorios')) document.getElementById('ap-relatorios').style.display='none';
                if(document.getElementById('ap-upgrades')) document.getElementById('ap-upgrades').style.display='none';
                return; 
            }
            
            // Só exibe o ap-main se não houver sub-painel ativo
            if (
                (!document.getElementById('ap-relatorios') || document.getElementById('ap-relatorios').style.display === 'none') &&
                (!document.getElementById('ap-upgrades') || document.getElementById('ap-upgrades').style.display === 'none')
            ) {
                document.getElementById('ap-fundar').style.display='none'; 
                document.getElementById('ap-main').style.display='block';
            }
            
            cacheEmp = d; 
            realCaixa = Number(d.empresa.caixa)||0; 
            realChips = Number(d.empresa.estoque["Microchips"])||0;
            
            document.getElementById('ap-name').innerText = d.empresa.nome;
            document.getElementById('ap-lvl').innerText = 'Nível ' + (d.empresa.nivel||1);
            document.getElementById('ap-xp').innerText = (d.empresa.xp||0) + '/' + ((d.empresa.nivel||1)*100);
            document.getElementById('ap-custo').innerText = Number(d.stats.custoManutencaoMinuto)||0;
            document.getElementById('ap-prod').innerText = Number(d.stats.prodPorMinuto)||0;

            let h = ''; 
            for(let k in d.stats.rh) {
                let f = d.stats.rh[k]; let tem = d.empresa.funcionarios.includes(k); let lock = (d.empresa.nivel||1) < f.reqLvl;
                let btn = tem ? '<button class="btn-spring apple-btn-active" style="background:rgba(255,255,255,0.1); color:#888;" disabled>ATIVO</button>' 
                        : lock ? '<button class="btn-spring apple-btn-active" style="background:rgba(255,255,255,0.1); color:#888;" disabled><i class="fas fa-lock"></i> NVL '+f.reqLvl+'</button>' 
                        : '<button class="btn-spring apple-btn-active" style="background:#fff; color:#000;" onclick="cFunc(\\''+k+'\\')">R$ '+(f.salarioHora*5)+'</button>';
                h += '<div class="rh-widget"><i class="fas fa-user-tie" style="font-size:24px; color:#fff; margin-bottom:10px;"></i><b style="font-size:12px; color:#fff;">'+f.nome+'</b><span style="font-size:10px; color:#888; margin-bottom:10px;">'+f.cargo+'</span>'+btn+'</div>';
            }
            const rhCont = document.getElementById('ap-rh');
            if(rhCont) rhCont.innerHTML = h;
            
            // Sincroniza sub-painéis se estiverem ativos
            if(document.getElementById('ap-relatorios') && document.getElementById('ap-relatorios').style.display === 'block') renderizarRelatorio();
            if(document.getElementById('ap-upgrades') && document.getElementById('ap-upgrades').style.display === 'block') renderizarUpgrades();
            
        } catch(e) { console.error("Empresa sync failed", e); }
    }

    setInterval(() => {
        if(cacheEmp && document.getElementById('empresa-app').classList.contains('active')) {
            let custo = Number(cacheEmp.stats.custoManutencaoMinuto)||0; let prod = Number(cacheEmp.stats.prodPorMinuto)||0; let lim = Number(cacheEmp.stats.limiteEstoque)||0;
            realCaixa -= (custo / 60); realChips += (prod / 60); if(realChips > lim) realChips = lim;
            document.getElementById('ap-caixa').innerText = fmtMoney(realCaixa);
            document.getElementById('ap-estoque').innerText = Math.floor(realChips) + ' / ' + lim;
        }
    }, 1000);

    async function fEmpresa() { const n = document.getElementById('ap-in-name').value; if(!n) return; const r = await fetch('/api/empresa/fundar', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({nome:n}) }); const d = await r.json(); showAlerta(d.msg); if(d.success) syncEmp(); }
    async function cFunc(id) { const r = await fetch('/api/empresa/contratar', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({funcId:id}) }); const d = await r.json(); showAlerta(d.msg); if(d.success) syncEmp(); }
    async function vEmpresa() { const r = await fetch('/api/empresa/vender', { method:'POST' }); const d = await r.json(); showAlerta(d.msg); if(d.success) syncEmp(); }
    // Sacramento do Saque nativo
    function rEmpresa() { openWithdrawBox(); }

    // ==================
    // FUNÇÕES DE RELATÓRIOS (BLINDADAS)
    // ==================
    function toggleRelatorio(show) {
        document.getElementById('ap-main').style.display = show ? 'none' : 'block';
        if(document.getElementById('ap-upgrades')) document.getElementById('ap-upgrades').style.display = 'none'; // Anti-atropelo
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

    // ==================
    // FUNÇÕES DE UPGRADES (BLINDADAS)
    // ==================
    function toggleUpgrades(show) {
        document.getElementById('ap-main').style.display = show ? 'none' : 'block';
        if(document.getElementById('ap-relatorios')) document.getElementById('ap-relatorios').style.display = 'none'; // Anti-atropelo
        document.getElementById('ap-upgrades').style.display = show ? 'block' : 'none';
        if(show && cacheEmp) renderizarUpgrades();
    }

    function renderizarUpgrades() {
        if(!cacheEmp) return;
        const upgDB = cacheEmp.stats.upgrades;
        const meusUpgs = cacheEmp.empresa.upgrades || [];
        let h = '';
        for(let k in upgDB) {
            let u = upgDB[k];
            let comprou = meusUpgs.includes(k);
            
            let btn = comprou ? 
                '<button class="btn-spring apple-btn-active" style="background:rgba(255,255,255,0.05); color:#888; width:auto; padding:10px 15px; font-size:10px;" disabled><i class="fas fa-check"></i> OK</button>' : 
                '<button class="btn-spring apple-btn-active" style="background:'+u.cor+'; color:'+(u.cor==='#32d74b'?'#000':'#fff')+'; width:auto; padding:10px 15px; font-size:10px;" onclick="cUpgrade(\\''+k+'\\')">R$ '+u.preco+'</button>';
            
            h += \`<div class="apple-card" style="padding: 15px; margin-bottom:0; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div style="width:40px; height:40px; border-radius:12px; background:rgba(255,255,255,0.05); display:grid; place-items:center;">
                            <i class="\${u.icon}" style="font-size:18px; color:\${u.cor};"></i>
                        </div>
                        <div>
                            <div style="font-weight:800; font-size:13px; color:#fff;">\${u.nome}</div>
                            <div style="font-size:10px; color:#888; margin-top:2px;">\${u.desc}</div>
                        </div>
                    </div>
                    \${btn}
                </div>\`;
        }
        document.getElementById('upg-list').innerHTML = h;
    }

    async function cUpgrade(id) {
        const r = await fetch('/api/empresa/comprar_upgrade', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({upgId:id}) });
        const d = await r.json();
        showAlerta(d.msg);
        if(d.success) { await syncEmp(); renderizarUpgrades(); }
    }

    window.onpopstate = () => { closeMusic(); closeMonitor(); closeControl(); closeEmpresa(); closeJobs(); closeWithdrawBox(); }
    function logout() { document.cookie = 'userId=; Max-Age=0; path=/;'; window.location.href = '/'; }
</script>
</body>
</html>`;
// Arranca o script inteiro antigo travado e pluga o novo
html = html.replace(/<script>\s*let cacheEmp = null;[\s\S]*?<\/script>/, ''); 
html = html.replace('</body>', novoJS + '\n</body>');

// 4. MOLA MÁGICA EM TUDO (REVISÃO DE CLASSES FINAIS)
// Adiciona a classe apple-btn-active na grade de apps e botões de ação
html = html.replace(/<a href="\/(\w+)" class="app-item">/g, '<a href="/$1" class="app-item apple-btn-active">');
html = html.replace(/<button class="btn-spring"/g, '<button class="btn-spring apple-btn-active"');

fs.writeFileSync(path, html);
console.log("✅ SISTEMA DESBUGADO! Molas uniformes, Modal de Saque nativo e Lógica layered ativada.");
