const fs = require('fs');
console.log("🚀 Iniciando Injeção Tycoon V7 (Revolução Industrial)...");

// ==========================================
// 1. MOTOR BACKEND (Múltiplas Linhas, Auto-Compra e Demissão)
// ==========================================
const backendV7 = `module.exports = function(app, checkAuth, db, configWeb) {
    const path = require('path');
    app.get('/tycoon', checkAuth, (req, res) => { res.sendFile(path.join(__dirname, '../views/tycoon.html')); });

    const rhDB = {
        "op_junior": { nome: "Operário de Montagem", preco: 2500, salarioMin: 50, reqLvl: 1, icon: "fas fa-hard-hat" },
        "eng_quimico": { nome: "Engenheiro Químico", preco: 15000, salarioMin: 450, reqLvl: 5, icon: "fas fa-flask" },
        "tec_cmp": { nome: "Técnico de Planarização", preco: 60000, salarioMin: 2000, reqLvl: 10, icon: "fas fa-layer-group" },
        "esp_litografia": { nome: "Especialista EUV", preco: 250000, salarioMin: 10000, reqLvl: 15, icon: "fas fa-microscope" },
        "phd_quantico": { nome: "Físico Quântico (PhD)", preco: 1500000, salarioMin: 55000, reqLvl: 30, icon: "fas fa-atom" }
    };
    const upgradesDB = {
        "esteira": { nome: "Esteiras Magnéticas", desc: "Base para produção", preco: 80000, icon: "fas fa-cogs", cor: "#ff9f0a" },
        "forno_dif": { nome: "Forno de Difusão", desc: "Dopagem térmica", preco: 500000, icon: "fas fa-fire", cor: "#ff453a" },
        "maquina_cmp": { nome: "Máquina CMP", desc: "Polimento Químico", preco: 2500000, icon: "fas fa-compact-disc", cor: "#32d74b" },
        "lito_euv": { nome: "Litografia EUV", desc: "Impressão a laser (3nm/2nm)", preco: 15000000, icon: "fas fa-hdd", cor: "#0a84ff" },
        "high_na_euv": { nome: "High-NA EUV", desc: "Precisão sub-atômica (1nm)", preco: 150000000, icon: "fas fa-satellite-dish", cor: "#bf5af2" }
    };
    const matDB = {
        "silicio": { nome: "Silício Puro", preco: 2, icon: "fas fa-cube", cor: "#aaa" },
        "cobre": { nome: "Cobre (Fiação)", preco: 8, icon: "fas fa-drum-steelpan", cor: "#d97736" },
        "fosforo": { nome: "Fósforo (Dopagem)", preco: 15, icon: "fas fa-vial", cor: "#bf5af2" },
        "ouro": { nome: "Ouro (Contatos)", preco: 350, icon: "fas fa-coins", cor: "#ffd700" },
        "neodimio": { nome: "Neodímio (Terras Raras)", preco: 1200, icon: "fas fa-gem", cor: "#00ff88" }
    };
    const chipsDB = {
        "basic": { nome: "Transistor 100nm", transistores: "100 Mil", reqFunc: ["op_junior"], reqUpg: ["esteira"], mats: {silicio: 5}, preco: 45 },
        "micro": { nome: "Microcontrolador 14nm", transistores: "50 Milhões", reqFunc: ["eng_quimico"], reqUpg: ["esteira", "forno_dif"], mats: {silicio: 15, fosforo: 2, cobre: 5}, preco: 550 },
        "gpu_2nm": { nome: "GPU Tensor 2nm", transistores: "120 Bilhões", reqFunc: ["tec_cmp", "esp_litografia"], reqUpg: ["maquina_cmp", "lito_euv"], mats: {silicio: 40, fosforo: 8, cobre: 20, ouro: 3}, preco: 12500 },
        "neural_1nm": { nome: "Chip Neural 1nm", transistores: "300 Bilhões", reqFunc: ["esp_litografia", "phd_quantico"], reqUpg: ["lito_euv", "high_na_euv"], mats: {silicio: 80, fosforo: 15, cobre: 50, ouro: 12, neodimio: 4}, preco: 85000 }
    };

    function addLog(emp, msg, tipo) {
        if (!emp.liveLogs) emp.liveLogs = [];
        let time = new Date().toLocaleTimeString('pt-BR', {hour12: false});
        emp.liveLogs.unshift({ t: time, m: msg, c: tipo });
        if (emp.liveLogs.length > 8) emp.liveLogs.pop();
    }

    app.get('/api/empresa/info', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const user = db.obterUsuario(idLimpo);
        if (!user || !user.empresa) return res.json({ hasCompany: false });

        let emp = user.empresa;
        if (!emp.materiais) emp.materiais = { silicio: emp.materia||0, fosforo: emp.fosforo||0, cobre: 0, ouro: 0, neodimio: 0 };
        if (emp.pausado === undefined) emp.pausado = false;
        if (!emp.linhasAtivas) { emp.linhasAtivas = {}; if(emp.chipAtual && chipsDB[emp.chipAtual]) emp.linhasAtivas[emp.chipAtual] = true; }
        if (!emp.estoqueModelos) emp.estoqueModelos = {"basic": 0, "micro": 0, "gpu_2nm": 0, "neural_1nm": 0};
        if (!emp.liveLogs) emp.liveLogs = [];
        if (emp.autoCompra === undefined) emp.autoCompra = false;

        let folhaPagamentoMin = 0;
        for (let fId in (emp.equipe||{})) { if(rhDB[fId]) folhaPagamentoMin += (rhDB[fId].salarioMin * emp.equipe[fId]); }

        const agora = Date.now();
        const segPassados = Math.floor((agora - (emp.ultimaProducao || agora)) / 1000);

        if (segPassados >= 1) {
            let limitador = Math.min(segPassados, 30);
            
            for(let i=0; i<limitador; i++) {
                let custoSeg = folhaPagamentoMin / 60;
                
                // COMPRA AUTOMÁTICA INTELIGENTE (Logística)
                if(emp.autoCompra && !emp.pausado) {
                    let reqPorSeg = {};
                    // Calcula tudo que gasta por segundo nas linhas ativas
                    for (let c in emp.linhasAtivas) {
                        if (emp.linhasAtivas[c] && chipsDB[c]) {
                            for (let m in chipsDB[c].mats) {
                                reqPorSeg[m] = (reqPorSeg[m]||0) + chipsDB[c].mats[m];
                            }
                        }
                    }
                    // Verifica o limite e compra
                    for (let m in reqPorSeg) {
                        let gasto = reqPorSeg[m];
                        if (gasto > 0 && emp.materiais[m] < gasto * 15) { // Se tiver menos de 15 segundos de estoque
                            let qtdComprar = gasto * 60; // Compra pra garantir 1 minuto de rodagem
                            let custo = qtdComprar * matDB[m].preco;
                            if (emp.caixa >= custo) {
                                emp.caixa -= custo; emp.materiais[m] += qtdComprar;
                            } else {
                                // Alerta crítico (Só avisa a cada 1 min pra não sujar o terminal)
                                if (agora - (emp.ultimoAvisoLogistica||0) > 60000) {
                                    addLog(emp, \`ALERTA CRÍTICO: Caixa sem dinheiro para Auto-Comprar \${matDB[m].nome}!\`, "red");
                                    emp.ultimoAvisoLogistica = agora;
                                }
                            }
                        }
                    }
                }

                // PRODUÇÃO E SALÁRIOS
                if (emp.caixa >= custoSeg) {
                    emp.caixa -= custoSeg;
                    if (!emp.pausado && Object.keys(emp.equipe||{}).length > 0) {
                        
                        // Passa por todas as linhas de montagem ATIVAS
                        for (let c in emp.linhasAtivas) {
                            if (!emp.linhasAtivas[c] || !chipsDB[c]) continue;
                            let proj = chipsDB[c];
                            let temFuncs = proj.reqFunc.every(f => (emp.equipe[f] > 0));
                            let temUpgs = proj.reqUpg.every(u => emp.upgrades.includes(u));
                            
                            if (temFuncs && temUpgs) {
                                let temMats = true;
                                for (let m in proj.mats) { if ((emp.materiais[m]||0) < proj.mats[m]) temMats = false; }
                                
                                if (temMats) {
                                    for (let m in proj.mats) { emp.materiais[m] -= proj.mats[m]; }
                                    emp.estoqueModelos[c] = (emp.estoqueModelos[c]||0) + 1;
                                    addLog(emp, \`Fabricou 1x \${proj.nome}\`, "green");
                                } else {
                                    if(Math.random() < 0.1) addLog(emp, \`\${proj.nome} Parado: Falta Matéria-Prima.\`, "gold");
                                }
                            }
                        }
                    }
                } else if (!emp.pausado) {
                    if(Math.random() < 0.1) addLog(emp, "GREVE! Salários Atrasados.", "red");
                }
            }
            emp.ultimaProducao = agora;
            db.salvar(idLimpo, user);
        }

        res.json({ 
            hasCompany: true, saldoReal: user.dinheiro, empresa: emp, levelUser: user.level || 1,
            bancoDados: { rh: rhDB, upgrades: upgradesDB, chips: chipsDB, materiais: matDB }, folhaPagamentoMin
        });
    });

    app.post('/api/empresa/acao', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        if (!user.empresa) return res.json({ success: false });

        const { tipo, valor, valStr } = req.body;
        let emp = user.empresa;

        if (tipo === 'toggle_pause') {
            emp.pausado = !emp.pausado;
            addLog(emp, emp.pausado ? "Fábrica PAUSADA." : "Fábrica RETOMADA.", 'blue');
        }
        else if (tipo === 'toggle_autocompra') {
            emp.autoCompra = !emp.autoCompra;
            addLog(emp, emp.autoCompra ? "Logística Automática ON" : "Logística Automática OFF", 'blue');
        }
        else if (tipo === 'investir') {
            if (valor <= 0 || (user.dinheiro||0) < valor) return res.json({erro: "Saldo Físico insuficiente."});
            user.dinheiro -= valor; emp.caixa += valor;
            addLog(emp, \`Injeção de Capital: +R$ \${valor}\`, 'blue');
        }
        else if (tipo === 'sacar') {
            if (valor <= 0 || emp.caixa < valor) return res.json({erro: "Caixa CNPJ insuficiente."});
            let liq = valor * 0.95; user.dinheiro += liq; emp.caixa -= valor;
            addLog(emp, \`Sócio sacou R$ \${liq.toFixed(0)}.\`, 'gold');
        }
        else if (tipo === 'comprar_mat') {
            let info = matDB[valStr]; let custoTotal = valor * info.preco;
            if (valor <= 0 || emp.caixa < custoTotal) return res.json({erro: \`Faltou Caixa (R$ \${custoTotal})\`});
            emp.caixa -= custoTotal; emp.materiais[valStr] = (emp.materiais[valStr]||0) + valor;
            addLog(emp, \`Compras: +\${valor}g de \${info.nome}\`, 'white');
        }
        else if (tipo === 'toggle_linha') {
            if (!emp.linhasAtivas) emp.linhasAtivas = {};
            emp.linhasAtivas[valStr] = !emp.linhasAtivas[valStr];
            addLog(emp, \`Linha \${chipsDB[valStr].nome}: \${emp.linhasAtivas[valStr] ? 'LIGADA' : 'DESLIGADA'}\`, 'white');
        }
        else if (tipo === 'vender') {
            let lucro = 0; let totalChips = 0;
            for(let key in emp.estoqueModelos) {
                let qtd = emp.estoqueModelos[key] || 0;
                if(qtd > 0) { lucro += (qtd * chipsDB[key].preco); totalChips += qtd; emp.estoqueModelos[key] = 0; }
            }
            if(totalChips <= 0) return res.json({erro: "Estoque vazio."});
            emp.caixa += lucro; addLog(emp, \`Exportou \${totalChips} chips. Lucro: R$ \${lucro}\`, 'green');
        }
        else if (tipo === 'contratar') {
            let prof = rhDB[valStr];
            if ((user.dinheiro||0) < prof.preco) return res.json({erro: "Saldo Físico insuficiente."});
            user.dinheiro -= prof.preco;
            if(!emp.equipe) emp.equipe = {}; emp.equipe[valStr] = (emp.equipe[valStr]||0) + 1;
            addLog(emp, \`Contratou: \${prof.nome}\`, 'white');
        }
        else if (tipo === 'demitir') {
            if (emp.equipe && emp.equipe[valStr] > 0) {
                emp.equipe[valStr] -= 1;
                addLog(emp, \`Demitido: 1x \${rhDB[valStr].nome}\`, 'red');
            } else { return res.json({erro: "Nenhum funcionário desse tipo para demitir."}); }
        }
        else if (tipo === 'upgrade') {
            let upg = upgradesDB[valStr];
            if ((user.dinheiro||0) < upg.preco) return res.json({erro: "Saldo Físico insuficiente."});
            if (emp.upgrades.includes(valStr)) return res.json({erro: "Já instalado."});
            user.dinheiro -= upg.preco; emp.upgrades.push(valStr);
            addLog(emp, \`Instalou \${upg.nome}\`, 'blue');
        }
        db.salvar(idLimpo, user); res.json({ success: true, msg: "OK" });
    });
};`;
fs.writeFileSync('./rotas_web/empresa.js', backendV7);

// ==========================================
// 2. TELA FRONTEND (Múltiplas Linhas, Demissão e Logística)
// ==========================================
const frontendV7 = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>DaemonTech V7</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root { --bg: #050505; --card: #121215; --gold: #ffd700; --green: #32d74b; --blue: #0a84ff; --purple: #bf5af2; --red: #ff453a; --text: #fff; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; -webkit-tap-highlight-color: transparent; }
        body { background: var(--bg); color: var(--text); height: 100vh; display: flex; flex-direction: column; overflow: hidden;}
        
        .header { padding: 15px; background: rgba(5,5,5,0.9); border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
        .tabs { display: flex; padding: 0; border-bottom: 1px solid #222; overflow-x: auto; white-space: nowrap; scrollbar-width: none; }
        .tab { flex: 0 0 auto; text-align: center; padding: 12px 15px; font-size: 10px; font-weight: 900; color: #666; cursor: pointer; border-bottom: 2px solid transparent; display:flex; flex-direction:column; align-items:center; gap:3px;}
        .tab i { font-size: 14px; }
        .tab.active { color: #fff; border-bottom: 2px solid var(--blue); }
        .content { flex: 1; overflow-y: auto; padding: 15px; padding-bottom: 30px; }
        .section { display: none; flex-direction: column; gap: 12px; }
        .section.active { display: flex; }

        .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .card { background: var(--card); border: 1px solid #222; border-radius: 12px; padding: 12px; }
        .c-title { font-size: 9px; color: #888; text-transform: uppercase; font-weight: 800; margin-bottom: 5px; display:flex; justify-content:space-between; align-items:center;}
        .c-val { font-size: 16px; font-weight: 900; }

        .terminal-box { background: #000; border: 1px solid #333; border-radius: 12px; padding: 10px; height: 140px; overflow-y: auto; font-family: monospace; font-size: 11px; box-shadow: inset 0 0 10px rgba(0,255,0,0.05); }
        .log-line { margin-bottom: 4px; padding-bottom: 4px; border-bottom: 1px dashed #111; }

        .btn { padding: 12px; border-radius: 12px; border: none; font-weight: 900; font-size: 11px; cursor: pointer; color: #000; text-transform:uppercase; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        .btn-sacar { background: linear-gradient(45deg, #ffd700, #ffaa00); color: #000; width: 100%; font-size: 13px; margin-top: 10px; }
        
        .list-item { background: var(--card); border: 1px solid #222; padding: 15px; border-radius: 15px; display: flex; flex-direction:column; gap: 10px; }
        .li-top { display:flex; justify-content:space-between; align-items:center; }
        .li-info { font-size: 10px; color: #888; display:flex; gap:10px; flex-wrap:wrap;}
        .li-badge { background: #222; padding: 3px 8px; border-radius: 6px; font-weight:bold; color:#fff;}

        .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(5px); z-index: 999; justify-content: center; align-items: center; }
        .modal-box { background: var(--card); border: 1px solid #333; width: 85%; max-width: 350px; padding: 25px; border-radius: 20px; text-align: center; }
        .modal-input { width: 100%; padding: 15px; background: #000; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 16px; margin: 15px 0; text-align: center; outline:none; }
        #toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: var(--blue); padding: 10px 20px; border-radius: 20px; font-size: 12px; font-weight: bold; opacity: 0; transition: 0.3s; z-index: 9999; }
    </style>
</head>
<body>
    <div class="header">
        <a href="/os" style="color:#fff;"><i class="fa-solid fa-chevron-left"></i></a>
        <div style="text-align:center;"><b id="ui-nome" style="font-size:16px;">DaemonTech</b><div style="font-size:9px; color:#888;">NÍVEL <span id="ui-lvl"></span></div></div>
        <div style="background:var(--green); color:#000; padding:5px 10px; border-radius:10px; font-weight:900; font-size:11px;" id="ui-saldo">R$ 0</div>
    </div>

    <div class="tabs">
        <div class="tab active" onclick="switchTab('painel')"><i class="fas fa-chart-pie"></i> PAINEL</div>
        <div class="tab" onclick="switchTab('projetos')"><i class="fas fa-microchip"></i> PROJETOS (MULTI)</div>
        <div class="tab" onclick="switchTab('materiais')"><i class="fas fa-cubes"></i> MATERIAIS</div>
        <div class="tab" onclick="switchTab('rh')"><i class="fas fa-users"></i> EQUIPE</div>
        <div class="tab" onclick="switchTab('maquinas')"><i class="fas fa-server"></i> MÁQUINAS</div>
    </div>

    <div class="content">
        <div class="section active" id="sec-painel">
            <div class="dash-grid">
                <div class="card" style="border-color:var(--green);"><div class="c-title">Caixa (CNPJ) <button onclick="openMod('investir')" style="background:none;border:none;color:var(--blue);"><i class="fas fa-plus"></i></button></div><div class="c-val" style="color:var(--green);" id="ui-caixa">R$ 0</div></div>
                <div class="card"><div class="c-title">Salários (Fixos)</div><div class="c-val" style="color:var(--red);" id="ui-folha">R$ 0 / min</div></div>
            </div>

            <div class="card" style="margin-top:10px; border-color:var(--blue); display:flex; justify-content:space-between; align-items:center;">
                <div><div class="c-title">STATUS DA FÁBRICA</div><div class="c-val" style="color:var(--blue); font-size:14px;" id="ui-status">RODANDO</div></div>
                <button class="btn" id="btn-pause" onclick="execAcao('toggle_pause')" style="background:var(--red); color:#fff; padding:8px 12px;"><i class="fas fa-stop"></i> PARAR</button>
            </div>

            <div style="font-size: 10px; color: #888; font-weight: 800; margin-top:15px; margin-bottom:5px;"><i class="fas fa-terminal"></i> Terminal ao Vivo</div>
            <div class="terminal-box" id="ui-logs"></div>

            <button class="btn btn-sacar" onclick="execAcao('vender')"><i class="fas fa-truck"></i> EXPORTAR E VENDER ESTOQUE</button>
            <button class="btn" style="background:#222; color:#fff; width:100%; margin-top:10px;" onclick="openMod('sacar')"><i class="fas fa-wallet"></i> SACAR LUCRO PARA CARTEIRA</button>
        </div>

        <div class="section" id="sec-projetos">
            <div style="font-size:11px; color:#888; text-align:center;">Ligue múltiplas linhas de produção simultaneamente.</div>
            <div id="list-chips"></div>
        </div>

        <div class="section" id="sec-materiais">
            <button class="btn" id="btn-autocompra" onclick="execAcao('toggle_autocompra')" style="width:100%; margin-bottom:10px; border:1px solid #333;">🤖 AUTO-COMPRA INTELIGENTE [OFF]</button>
            <div style="font-size:11px; color:#888; text-align:center;">Compre suprimentos químicos. O custo debita do Caixa (CNPJ).</div>
            <div id="list-materiais" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;"></div>
        </div>

        <div class="section" id="sec-rh">
            <div style="font-size:11px; color:#888; text-align:center;">Contrate e demita especialistas.</div>
            <div id="list-rh"></div>
        </div>

        <div class="section" id="sec-maquinas">
            <div id="list-maquinas"></div>
        </div>
    </div>

    <div class="modal-overlay" id="modal">
        <div class="modal-box">
            <h3 id="m-title" style="margin-bottom:5px;">Ação</h3>
            <p id="m-desc" style="font-size:12px; color:#888;">Detalhes</p>
            <input type="number" id="m-input" class="modal-input" placeholder="0">
            <div style="display:flex; gap:10px;">
                <button class="btn" style="flex:1; background:#222; color:#fff;" onclick="document.getElementById('modal').style.display='none'">CANCELAR</button>
                <button class="btn" style="flex:1; background:var(--blue); color:#fff;" onclick="sendInputAcao()">CONFIRMAR</button>
            </div>
        </div>
    </div>
    <div id="toast">Notificação</div>

    <script>
        const fmt = v => new Intl.NumberFormat('pt-BR').format(v||0);
        let mType = ''; let mArg = '';

        function showMsg(m) { const t=document.getElementById('toast'); t.innerText=m; t.style.opacity=1; setTimeout(()=>t.style.opacity=0,2500); }
        function switchTab(t) { document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); document.querySelectorAll('.section').forEach(x=>x.classList.remove('active')); event.currentTarget.classList.add('active'); document.getElementById('sec-'+t).classList.add('active'); }

        async function loop() { try { const r = await fetch('/api/empresa/info'); const d = await r.json(); if(d.hasCompany) render(d); } catch(e) {} }
        setInterval(loop, 1000); loop();

        function render(d) {
            const e = d.empresa; const db = d.bancoDados;
            document.getElementById('ui-nome').innerText = e.nome || 'DaemonTech';
            document.getElementById('ui-lvl').innerText = d.levelUser;
            document.getElementById('ui-saldo').innerText = '💳 R$ ' + fmt(d.saldoReal);
            document.getElementById('ui-caixa').innerText = 'R$ ' + fmt(e.caixa);
            document.getElementById('ui-folha').innerText = 'R$ ' + fmt(d.folhaPagamentoMin) + ' / min';
            
            // Status Pause & Auto-Compra
            const sEl = document.getElementById('ui-status'); const bEl = document.getElementById('btn-pause');
            if(e.pausado) { sEl.innerText = 'PAUSADA'; sEl.style.color = 'var(--red)'; bEl.innerHTML = '<i class="fas fa-play"></i> RETOMAR'; bEl.style.background = 'var(--green)'; }
            else { sEl.innerText = 'RODANDO'; sEl.style.color = 'var(--blue)'; bEl.innerHTML = '<i class="fas fa-stop"></i> PARAR'; bEl.style.background = 'var(--red)'; }

            const aBtn = document.getElementById('btn-autocompra');
            if(e.autoCompra) { aBtn.style.background = 'var(--blue)'; aBtn.style.color = '#fff'; aBtn.innerText = '🤖 AUTO-COMPRA INTELIGENTE [ON]'; }
            else { aBtn.style.background = '#111'; aBtn.style.color = '#888'; aBtn.innerText = '🤖 AUTO-COMPRA INTELIGENTE [OFF]'; }

            // Logs
            let htmlLogs = '';
            (e.liveLogs||[]).forEach(l => {
                let color = l.c === 'red' ? '#ff453a' : l.c === 'green' ? '#32d74b' : l.c === 'gold' ? '#ffd700' : l.c === 'blue' ? '#0a84ff' : '#fff';
                htmlLogs += \`<div class="log-line"><span style="color:#555;">[\${l.t}]</span> <span style="color:\${color}">\${l.m}</span></div>\`;
            });
            document.getElementById('ui-logs').innerHTML = htmlLogs;

            // Render Materiais
            let htmlMats = '';
            for(let key in db.materiais) {
                let m = db.materiais[key]; let qtd = e.materiais[key]||0;
                htmlMats += \`<div class="card" style="display:flex; flex-direction:column; align-items:center; text-align:center;">
                    <i class="\${m.icon}" style="font-size:24px; color:\${m.cor}; margin-bottom:5px;"></i><b style="font-size:12px;">\${m.nome}</b>
                    <div style="font-size:14px; font-weight:900; margin-bottom:10px;">\${fmt(qtd)}g</div>
                    <button class="btn" style="background:#222; color:#fff; width:100%; font-size:10px;" onclick="openMod('comprar_mat', '\${key}')">R$\${m.preco}/g</button>
                </div>\`;
            }
            document.getElementById('list-materiais').innerHTML = htmlMats;

            // Render Projetos (Multi-Linha)
            let htmlChips = '';
            for(let key in db.chips) {
                let c = db.chips[key]; let isAtivo = e.linhasAtivas && e.linhasAtivas[key];
                let btn = isAtivo ? \`<button class="btn" style="background:var(--red); color:#fff;" onclick="execAcao('toggle_linha', 0, '\${key}')">DESLIGAR LINHA</button>\` : \`<button class="btn" style="background:var(--green); color:#000;" onclick="execAcao('toggle_linha', 0, '\${key}')">LIGAR LINHA</button>\`;
                let reqMatsList = Object.keys(c.mats).map(m => \`<span style="color:\${db.materiais[m].cor}"><i class="\${db.materiais[m].icon}"></i> \${c.mats[m]}g</span>\`).join(' ');

                htmlChips += \`<div class="list-item" style="\${isAtivo ? 'border-color:var(--green);' : ''}">
                    <div class="li-top"><b style="font-size:14px; color:\${isAtivo ? 'var(--green)' : '#fff'}">\${c.nome}</b> <span class="li-badge">Estoque: \${fmt(e.estoqueModelos[key]||0)}</span></div>
                    <div class="li-info" style="font-size:11px;"><span><i class="fas fa-atom"></i> \${c.transistores}</span> <span style="color:var(--gold);"><i class="fas fa-tag"></i> R$ \${fmt(c.preco)}</span></div>
                    <div class="li-info"><b>Materiais:</b> \${reqMatsList}</div>
                    \${btn}
                </div>\`;
            }
            document.getElementById('list-chips').innerHTML = htmlChips;

            // Render RH (Com botão de Demissão)
            let htmlRH = '';
            for(let key in db.rh) {
                let f = db.rh[key]; let lck = d.levelUser < f.reqLvl; let qtd = (e.equipe||{})[key] || 0;
                let btnContratar = lck ? \`<button class="btn" style="background:#222; color:#555; flex:1;" disabled>LVL \${f.reqLvl}</button>\` : \`<button class="btn" style="background:var(--blue); color:#fff; flex:1;" onclick="execAcao('contratar', 0, '\${key}')">CONTRATAR (R$ \${fmt(f.preco)})</button>\`;
                let btnDemitir = qtd > 0 ? \`<button class="btn" style="background:var(--red); color:#fff; padding:12px 15px;" onclick="execAcao('demitir', 0, '\${key}')" title="Demitir Funcionário"><i class="fas fa-user-minus"></i></button>\` : '';
                
                htmlRH += \`<div class="list-item">
                    <div class="li-top"><b style="font-size:14px;"><i class="\${f.icon}"></i> \${f.nome} \${qtd>0 ? '<span style="color:var(--green)">x'+qtd+'</span>' : ''}</b></div>
                    <div class="li-info">Salário: R$ \${fmt(f.salarioMin)} / min</div>
                    <div style="display:flex; gap:10px;">\${btnContratar}\${btnDemitir}</div>
                </div>\`;
            }
            document.getElementById('list-rh').innerHTML = htmlRH;

            // Render Máquinas
            let htmlMaq = '';
            for(let key in db.upgrades) {
                let u = db.upgrades[key]; let tem = (e.upgrades||[]).includes(key);
                let btn = tem ? \`<button class="btn" style="background:#222; color:#888;" disabled>INSTALADO</button>\` : \`<button class="btn" style="background:\${u.cor}; color:#fff;" onclick="execAcao('upgrade', 0, '\${key}')">COMPRAR (R$ \${fmt(u.preco)})</button>\`;
                htmlMaq += \`<div class="list-item"><div class="li-top"><b style="font-size:14px;"><i class="\${u.icon}" style="color:\${u.cor}"></i> \${u.nome}</b></div>\${btn}</div>\`;
            }
            document.getElementById('list-maquinas').innerHTML = htmlMaq;
        }

        function openMod(tipo, arg='') {
            mType = tipo; mArg = arg; document.getElementById('m-input').value = '';
            document.getElementById('modal').style.display = 'flex';
            if(tipo === 'investir') { document.getElementById('m-title').innerText = 'Injetar Capital'; document.getElementById('m-desc').innerText = 'De: Carteira -> Para: Caixa (CNPJ)'; }
            if(tipo === 'sacar') { document.getElementById('m-title').innerText = 'Sacar Lucro'; document.getElementById('m-desc').innerText = 'De: Caixa -> Para: Carteira (Taxa 5%)'; }
            if(tipo === 'comprar_mat') { document.getElementById('m-title').innerText = 'Comprar Material'; document.getElementById('m-desc').innerText = 'Digite a qtd em gramas (Debita do Caixa)'; }
        }

        async function sendInputAcao() {
            let v = Number(document.getElementById('m-input').value)||0;
            document.getElementById('modal').style.display = 'none'; execAcao(mType, v, mArg);
        }

        async function execAcao(tipo, valor=0, valStr='') {
            const r = await fetch('/api/empresa/acao', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({tipo, valor, valStr})});
            const res = await r.json(); if(res.erro) showMsg(res.erro); else loop();
        }
    </script>
</body>
</html>`;
fs.writeFileSync('./views/tycoon.html', frontendV7);
console.log('✅ FRONTEND V7 OK: Multi-Linhas, Botões de Demissão e Auto-Compra Integrados!');

