const fs = require('fs');
const path = './views/os.html';
let html = fs.readFileSync(path, 'utf8');

// Acha onde começa o Javascript e apaga o código bugado pra baixo
const startIdx = html.indexOf('<script>');
if(startIdx !== -1) {
    html = html.substring(0, startIdx);
}

// Injeta o cérebro limpo sem duplicatas
const novoJS = `
<script>
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
                html += \`<div class="user-card \${selectedUserId === id ? 'selected' : ''}" id="card-\${id}" onclick="selectUser('\${id}', '\${nomeEscapado}')"><i class="fas fa-user-astronaut u-icon"></i><div class="u-name">\${u.nome || 'Novato'}</div><div class="u-id">ID: \${id.substring(0,5)}</div><div class="u-saldo">\${fmtM(u.dinheiro)}</div><div class="u-level">Lvl: \${u.level || 1}</div></div>\`;
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
        try { const res = await fetch('/api/admin/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetId: selectedUserId, action: selectedAction, amount: val }) }); const data = await res.json(); btn.innerText = "EXECUTAR DIRETRIZ"; btn.style.opacity = "1";
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

    // ==================
    // EMPRESA (ENGINE APPLE CORRIGIDA 100%)
    // ==================
    let cacheEmp = null; let realCaixa = 0; let realChips = 0;
    
    async function openEmpresa() { document.getElementById('empresa-app').classList.add('active'); history.pushState({app:'empresa'}, ''); await syncEmp(); }
    function closeEmpresa() { document.getElementById('empresa-app').classList.remove('active'); }

    async function syncEmp() {
        try {
            const r = await fetch('/api/empresa/info'); const d = await r.json();
            if(!d.hasCompany) { document.getElementById('ap-fundar').style.display='block'; document.getElementById('ap-main').style.display='none'; return; }
            document.getElementById('ap-fundar').style.display='none'; document.getElementById('ap-main').style.display='block';
            
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
                let btn = tem ? '<button class="btn-spring" style="background:rgba(255,255,255,0.1); color:#888;" disabled>ATIVO</button>' 
                        : lock ? '<button class="btn-spring" style="background:rgba(255,255,255,0.1); color:#888;" disabled><i class="fas fa-lock"></i> NVL '+f.reqLvl+'</button>' 
                        : '<button class="btn-spring" style="background:#fff; color:#000;" onclick="cFunc(\\''+k+'\\')">R$ '+(f.salarioHora*5)+'</button>';
                h += '<div class="rh-widget"><i class="fas fa-user-tie" style="font-size:24px; color:#fff; margin-bottom:10px;"></i><b style="font-size:12px; color:#fff;">'+f.nome+'</b><span style="font-size:10px; color:#888; margin-bottom:10px;">'+f.cargo+'</span>'+btn+'</div>';
            }
            document.getElementById('ap-rh').innerHTML = h;
        } catch(e) {}
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
    async function rEmpresa() { const v = prompt("Quanto sacar? (Taxa 5%)"); if(!v || isNaN(v) || v<=0) return; const r = await fetch('/api/empresa/recolher', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({valor:Number(v)}) }); const d = await r.json(); showAlerta(d.msg); if(d.success) { syncEmp(); sinc(); } }

    // ==================
    // EMPREGOS ENGINE
    // ==================
    async function openJobs() { document.getElementById('empregos-app').classList.add('active'); history.pushState({app:'jobs'}, ''); await attJobs(); }
    function closeJobs() { document.getElementById('empregos-app').classList.remove('active'); }

    async function attJobs() {
        try {
            const res = await fetch('/api/empregos/info'); const data = await res.json();
            document.getElementById('job-atual').innerText = data.cargoAtual;
            let htmlJobs = '';
            for (let k in data.lista) {
                const j = data.lista[k]; const isAtual = data.cargoAtual === j.nome; const locked = data.levelUser < j.reqLvl;
                let btn = isAtual ? '<button class="btn-spring" style="background:rgba(255,255,255,0.1); color:#888;" disabled>TRABALHANDO</button>' 
                        : locked ? '<button class="btn-spring" style="background:rgba(255,255,255,0.1); color:#888;" disabled><i class="fas fa-lock"></i> NVL '+j.reqLvl+'</button>' 
                        : '<button class="btn-spring" style="background:#bc62ff; color:#fff;" onclick="aceitarJob(\\''+k+'\\')">ACEITAR</button>';
                htmlJobs += '<div class="rh-widget"><i class="'+j.icon+'" style="font-size:24px; color:#bc62ff; margin-bottom:10px;"></i><b style="font-size:12px; color:#fff;">'+j.nome+'</b><span style="font-size:10px; color:#32d74b; font-weight:700; margin-bottom:12px; flex:1;">R$ '+j.salario+'/h</span>'+btn+'</div>';
            }
            document.getElementById('job-list').innerHTML = htmlJobs;
        } catch(e) {}
    }
    async function aceitarJob(cargoId) { const res = await fetch('/api/empregos/escolher', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({cargoId}) }); const data = await res.json(); showAlerta(data.msg); if(data.success) attJobs(); }

    window.onpopstate = () => { closeMusic(); closeMonitor(); closeControl(); closeEmpresa(); closeJobs(); }
    function logout() { document.cookie = 'userId=; Max-Age=0; path=/;'; window.location.href = '/'; }
</script>
</body>
</html>
`;

html += novoJS;
fs.writeFileSync(path, html);
console.log("✅ CÉREBRO DESBUGADO! Erro de duplicação removido sem tocar no seu HTML.");
