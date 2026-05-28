const fs = require('fs');
console.log("🚀 Iniciando Injeção Tycoon V5 (Silicon Valley)...");

// ==========================================
// 1. MOTOR BACKEND (Semicondutores V5)
// ==========================================
const backendV5 = `module.exports = function(app, checkAuth, db, configWeb) {
    const path = require('path');

    app.get('/tycoon', checkAuth, (req, res) => { res.sendFile(path.join(__dirname, '../views/tycoon.html')); });

    // 👨‍🔬 RH COM SALÁRIO AUTOMÁTICO
    const rhDB = {
        "op_junior": { nome: "Operário de Montagem", preco: 2500, salarioMin: 50, reqLvl: 1, icon: "fas fa-hard-hat" },
        "eng_quimico": { nome: "Engenheiro Químico", preco: 15000, salarioMin: 450, reqLvl: 5, icon: "fas fa-flask" },
        "esp_litografia": { nome: "Especialista EUV", preco: 150000, salarioMin: 10000, reqLvl: 15, icon: "fas fa-microscope" }
    };

    // 🏭 MÁQUINAS E UPGRADES
    const upgradesDB = {
        "esteira": { nome: "Esteiras Magnéticas", desc: "Produz 2x mais rápido", preco: 80000, icon: "fas fa-cogs", cor: "#ff9f0a" },
        "litografia_euv": { nome: "Máquina Litografia EUV", desc: "Permite fabricar chips de 3nm", preco: 1000000, icon: "fas fa-hdd", cor: "#0a84ff" }
    };

    // 💾 PROJETOS DE CHIPS
    const chipsDB = {
        "basic": { nome: "Transistor 100nm", silicio: 5, fosforo: 0, transistores: "100 Mil", reqFunc: "op_junior", reqUpg: null, preco: 45 },
        "micro": { nome: "Microcontrolador 14nm", silicio: 15, fosforo: 2, transistores: "50 Milhões", reqFunc: "eng_quimico", reqUpg: null, preco: 250 },
        "quantum": { nome: "Processador Quântico 3nm", silicio: 50, fosforo: 10, transistores: "150 Bilhões", reqFunc: "esp_litografia", reqUpg: "litografia_euv", preco: 8500 }
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
        if (!emp.materia) emp.materia = 0;
        if (!emp.fosforo) emp.fosforo = 0;
        if (!emp.estoqueModelos) emp.estoqueModelos = {"basic": 0, "micro": 0, "quantum": 0};
        if (!emp.chipAtual) emp.chipAtual = "basic";
        if (!emp.liveLogs) emp.liveLogs = [];

        // Calcula Folha de Pagamento Total
        let folhaPagamentoMin = 0;
        for (let fId in (emp.equipe||{})) {
            if(rhDB[fId]) folhaPagamentoMin += (rhDB[fId].salarioMin * emp.equipe[fId]);
        }

        // Analisa o Chip e Requisitos
        let chipProjeto = chipsDB[emp.chipAtual];
        let hasFunc = (emp.equipe && emp.equipe[chipProjeto.reqFunc] > 0);
        let hasUpg = (!chipProjeto.reqUpg || (emp.upgrades && emp.upgrades.includes(chipProjeto.reqUpg)));
        let producaoX = (emp.upgrades && emp.upgrades.includes("esteira")) ? 2 : 1;

        // MOTOR REAL-TIME (1 SEGUNDO)
        const agora = Date.now();
        const segPassados = Math.floor((agora - (emp.ultimaProducao || agora)) / 1000);

        if (segPassados >= 1) {
            let limitador = Math.min(segPassados, 30); // máx 30s pra nao explodir processador
            
            for(let i=0; i<limitador; i++) {
                // Pagar Salário (por segundo)
                let custoSeg = folhaPagamentoMin / 60;
                if (emp.caixa >= custoSeg) {
                    emp.caixa -= custoSeg;
                    
                    // Verifica se a empresa tem NINGUÉM
                    if(Object.keys(emp.equipe||{}).length === 0) {
                        addLog(emp, "Fábrica fantasma! Contrate alguém no RH.", "gold");
                    } 
                    // Verifica Requisitos do Projeto
                    else if (!hasFunc) {
                        addLog(emp, \`Falta \${rhDB[chipProjeto.reqFunc].nome} para o \${chipProjeto.nome}!\`, "red");
                    }
                    else if (!hasUpg) {
                        addLog(emp, \`Falta a \${upgradesDB[chipProjeto.reqUpg].nome}!\`, "red");
                    }
                    // Tenta Fabricar
                    else if (emp.materia >= chipProjeto.silicio && emp.fosforo >= chipProjeto.fosforo) {
                        emp.materia -= chipProjeto.silicio;
                        emp.fosforo -= chipProjeto.fosforo;
                        emp.estoqueModelos[emp.chipAtual] = (emp.estoqueModelos[emp.chipAtual]||0) + producaoX;
                        addLog(emp, \`Fabricou \${producaoX}x \${chipProjeto.nome} [\${chipProjeto.transistores}]\`, "green");
                    } else {
                        addLog(emp, "Falta Silício ou Fósforo!", "gold");
                    }
                } else {
                    addLog(emp, "CAIXA ZERADO! Trabalhadores em Greve!", "red");
                }
            }
            emp.ultimaProducao = agora;
            db.salvar(idLimpo, user);
        }

        res.json({ 
            hasCompany: true, saldoReal: user.dinheiro, empresa: emp, levelUser: user.level || 1,
            bancoDados: { rh: rhDB, upgrades: upgradesDB, chips: chipsDB }, folhaPagamentoMin
        });
    });

    app.post('/api/empresa/acao', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        if (!user.empresa) return res.json({ success: false });

        const { tipo, valor, valStr } = req.body;
        let emp = user.empresa;

        if (tipo === 'investir') {
            if (valor <= 0 || (user.dinheiro||0) < valor) return res.json({erro: "Saldo Físico insuficiente."});
            user.dinheiro -= valor; emp.caixa += valor;
            addLog(emp, \`Injeção de Capital: +R$ \${valor}\`, 'blue');
        }
        else if (tipo === 'sacar') {
            if (valor <= 0 || emp.caixa < valor) return res.json({erro: "Caixa CNPJ insuficiente."});
            let liq = valor * 0.95;
            user.dinheiro += liq; emp.caixa -= valor;
            addLog(emp, \`Sócio sacou R$ \${liq.toFixed(0)} (5% taxa).\`, 'gold');
        }
        else if (tipo === 'comprar_silicio') {
            if (valor <= 0 || emp.caixa < valor) return res.json({erro: "Caixa insuficiente."});
            emp.caixa -= valor; emp.materia += valor;
            addLog(emp, \`Estoque: +\${valor}g de Silício\`, 'white');
        }
        else if (tipo === 'comprar_fosforo') {
            let precoFosforo = valor * 10; // Fósforo é caro (R$ 10 a grama)
            if (valor <= 0 || emp.caixa < precoFosforo) return res.json({erro: \`Fósforo custa R$ 10/g. Faltou caixa.\`});
            emp.caixa -= precoFosforo; emp.fosforo = (emp.fosforo||0) + valor;
            addLog(emp, \`Estoque: +\${valor}g de Fósforo Químico\`, 'white');
        }
        else if (tipo === 'mudar_chip') {
            if(!chipsDB[valStr]) return res.json({erro: "Projeto inválido."});
            emp.chipAtual = valStr;
            addLog(emp, \`Linha de Produção alterada: \${chipsDB[valStr].nome}\`, 'blue');
        }
        else if (tipo === 'vender') {
            let lucro = 0; let totalChips = 0;
            for(let key in emp.estoqueModelos) {
                let qtd = emp.estoqueModelos[key] || 0;
                if(qtd > 0) {
                    lucro += (qtd * chipsDB[key].preco);
                    totalChips += qtd;
                    emp.estoqueModelos[key] = 0;
                }
            }
            if(totalChips <= 0) return res.json({erro: "Estoque vazio."});
            emp.caixa += lucro;
            addLog(emp, \`Exportou \${totalChips} chips. Lucro: R$ \${lucro}\`, 'green');
        }
        else if (tipo === 'contratar') {
            let prof = rhDB[valStr];
            if ((user.dinheiro||0) < prof.preco) return res.json({erro: "Saldo Físico insuficiente."});
            user.dinheiro -= prof.preco;
            if(!emp.equipe) emp.equipe = {};
            emp.equipe[valStr] = (emp.equipe[valStr]||0) + 1;
            addLog(emp, \`Contratou: \${prof.nome}\`, 'white');
        }
        else if (tipo === 'upgrade') {
            let upg = upgradesDB[valStr];
            if ((user.dinheiro||0) < upg.preco) return res.json({erro: "Saldo Físico insuficiente."});
            if (emp.upgrades.includes(valStr)) return res.json({erro: "Já instalado."});
            user.dinheiro -= upg.preco; emp.upgrades.push(valStr);
            addLog(emp, \`Instalou \${upg.nome}\`, 'blue');
        }
        
        db.salvar(idLimpo, user);
        res.json({ success: true, msg: "Concluído!" });
    });
};`;
fs.writeFileSync('./rotas_web/empresa.js', backendV5);

// ==========================================
// 2. TELA FRONTEND (Silicon Valley UI)
// ==========================================
const frontendV5 = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>DaemonTech V5</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root { --bg: #050505; --card: #121215; --gold: #ffd700; --green: #32d74b; --blue: #0a84ff; --purple: #bf5af2; --text: #fff; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; -webkit-tap-highlight-color: transparent; }
        body { background: var(--bg); color: var(--text); height: 100vh; display: flex; flex-direction: column; overflow: hidden;}
        
        .header { padding: 15px; background: rgba(5,5,5,0.9); border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
        
        .tabs { display: flex; gap: 5px; padding: 0 10px; border-bottom: 1px solid #222; }
        .tab { flex: 1; text-align: center; padding: 12px 0; font-size: 11px; font-weight: 900; color: #666; cursor: pointer; border-bottom: 2px solid transparent; display:flex; flex-direction:column; align-items:center; gap:3px;}
        .tab i { font-size: 14px; }
        .tab.active { color: #fff; border-bottom: 2px solid var(--blue); }

        .content { flex: 1; overflow-y: auto; padding: 15px; padding-bottom: 30px; }
        .section { display: none; flex-direction: column; gap: 12px; }
        .section.active { display: flex; }

        .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .card { background: var(--card); border: 1px solid #222; border-radius: 12px; padding: 12px; }
        .c-title { font-size: 9px; color: #888; text-transform: uppercase; font-weight: 800; margin-bottom: 5px; display:flex; justify-content:space-between;}
        .c-val { font-size: 16px; font-weight: 900; }

        .terminal-box { background: #000; border: 1px solid #333; border-radius: 12px; padding: 10px; height: 140px; overflow-y: auto; font-family: monospace; font-size: 11px; box-shadow: inset 0 0 10px rgba(0,255,0,0.05); }
        .log-line { margin-bottom: 4px; padding-bottom: 4px; border-bottom: 1px dashed #111; }

        .btn { padding: 12px; border-radius: 12px; border: none; font-weight: 900; font-size: 11px; cursor: pointer; color: #000; text-transform:uppercase; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        
        /* O Botão de Sacar Luxuoso */
        .btn-sacar { background: linear-gradient(45deg, #ffd700, #ffaa00); color: #000; width: 100%; font-size: 13px; margin-top: 10px; box-shadow: 0 5px 20px rgba(255,215,0,0.3); border: 1px solid rgba(255,255,255,0.3); }
        
        .list-item { background: var(--card); border: 1px solid #222; padding: 15px; border-radius: 15px; display: flex; flex-direction:column; gap: 10px; }
        .li-top { display:flex; justify-content:space-between; align-items:center; }
        .li-info { font-size: 10px; color: #888; display:flex; gap:10px; flex-wrap:wrap;}
        .li-badge { background: #222; padding: 3px 8px; border-radius: 6px; font-weight:bold; color:#fff;}

        /* MODAL */
        .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(5px); z-index: 999; justify-content: center; align-items: center; }
        .modal-box { background: var(--card); border: 1px solid #333; width: 85%; max-width: 350px; padding: 25px; border-radius: 20px; text-align: center; }
        .modal-input { width: 100%; padding: 15px; background: #000; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 16px; margin: 15px 0; text-align: center; outline:none; }
        #toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: var(--blue); padding: 10px 20px; border-radius: 20px; font-size: 12px; font-weight: bold; opacity: 0; transition: 0.3s; z-index: 9999; }
    </style>
</head>
<body>
    <div class="header">
        <a href="/os" style="color:#fff;"><i class="fa-solid fa-chevron-left"></i></a>
        <div style="text-align:center;">
            <b id="ui-nome" style="font-size:16px;">DaemonTech</b>
            <div style="font-size:9px; color:#888;">NÍVEL <span id="ui-lvl"></span></div>
        </div>
        <div style="background:var(--green); color:#000; padding:5px 10px; border-radius:10px; font-weight:900; font-size:11px;" id="ui-saldo">R$ 0</div>
    </div>

    <div class="tabs">
        <div class="tab active" onclick="switchTab('painel')"><i class="fas fa-chart-pie"></i> PAINEL</div>
        <div class="tab" onclick="switchTab('projetos')"><i class="fas fa-microchip"></i> PROJETOS</div>
        <div class="tab" onclick="switchTab('rh')"><i class="fas fa-users"></i> EQUIPE</div>
        <div class="tab" onclick="switchTab('maquinas')"><i class="fas fa-server"></i> MÁQUINAS</div>
    </div>

    <div class="content">
        <div class="section active" id="sec-painel">
            <div class="dash-grid">
                <div class="card" style="border-color:var(--green);"><div class="c-title">Caixa (CNPJ) <button onclick="openMod('investir')" style="background:none;border:none;color:var(--blue);"><i class="fas fa-plus"></i></button></div><div class="c-val" style="color:var(--green);" id="ui-caixa">R$ 0</div></div>
                <div class="card"><div class="c-title">Folha de Pagamento</div><div class="c-val" style="color:var(--red);" id="ui-folha">R$ 0 / min</div></div>
                <div class="card"><div class="c-title">Silício (R$ 1/g) <button onclick="openMod('comprar_silicio')" style="background:none;border:none;color:var(--blue);"><i class="fas fa-shopping-cart"></i></button></div><div class="c-val" style="color:#fff;" id="ui-silicio">0g</div></div>
                <div class="card"><div class="c-title">Fósforo (R$ 10/g) <button onclick="openMod('comprar_fosforo')" style="background:none;border:none;color:var(--blue);"><i class="fas fa-shopping-cart"></i></button></div><div class="c-val" style="color:#fff;" id="ui-fosforo">0g</div></div>
            </div>

            <div class="card" style="margin-top:10px; border-color:var(--blue);">
                <div class="c-title">PROJETO ATUAL NA LINHA DE MONTAGEM</div>
                <div class="c-val" style="color:var(--blue); font-size:14px;" id="ui-projeto-atual">Carregando...</div>
            </div>

            <div style="font-size: 10px; color: #888; font-weight: 800; margin-top:15px; margin-bottom:5px;"><i class="fas fa-terminal"></i> Terminal da Fábrica</div>
            <div class="terminal-box" id="ui-logs"></div>

            <button class="btn btn-sacar" onclick="execAcao('vender')"><i class="fas fa-truck"></i> VENDER TODOS OS CHIPS DO ESTOQUE</button>
            <button class="btn" style="background:#222; color:#fff; width:100%; margin-top:10px;" onclick="openMod('sacar')"><i class="fas fa-wallet"></i> SACAR DO CAIXA PARA CARTEIRA</button>
        </div>

        <div class="section" id="sec-projetos">
            <div style="font-size:11px; color:#888; text-align:center;">Selecione o modelo do chip para a fábrica produzir.</div>
            <div id="list-chips"></div>
        </div>

        <div class="section" id="sec-rh">
            <div style="font-size:11px; color:#888; text-align:center;">Eles recebem salário por minuto direto do Caixa (CNPJ).</div>
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
        let mType = '';

        function showMsg(m) { const t=document.getElementById('toast'); t.innerText=m; t.style.opacity=1; setTimeout(()=>t.style.opacity=0,2500); }
        function switchTab(t) { document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); document.querySelectorAll('.section').forEach(x=>x.classList.remove('active')); event.currentTarget.classList.add('active'); document.getElementById('sec-'+t).classList.add('active'); }

        async function loop() { try { const r = await fetch('/api/empresa/info'); const d = await r.json(); if(d.hasCompany) render(d); } catch(e) {} }
        setInterval(loop, 1000); loop();

        function render(d) {
            const e = d.empresa; const db = d.bancoDados;
            document.getElementById('ui-nome').innerText = e.nome || 'Empresa';
            document.getElementById('ui-lvl').innerText = d.levelUser;
            document.getElementById('ui-saldo').innerText = '💳 R$ ' + fmt(d.saldoReal);
            document.getElementById('ui-caixa').innerText = 'R$ ' + fmt(e.caixa);
            document.getElementById('ui-folha').innerText = 'R$ ' + fmt(d.folhaPagamentoMin) + ' / min';
            document.getElementById('ui-silicio').innerText = fmt(e.materia) + 'g';
            document.getElementById('ui-fosforo').innerText = fmt(e.fosforo) + 'g';
            document.getElementById('ui-projeto-atual').innerText = db.chips[e.chipAtual].nome;

            // Logs
            let htmlLogs = '';
            (e.liveLogs||[]).forEach(l => {
                let color = l.c === 'red' ? '#ff453a' : l.c === 'green' ? '#32d74b' : l.c === 'gold' ? '#ffd700' : l.c === 'blue' ? '#0a84ff' : '#fff';
                htmlLogs += \`<div class="log-line"><span style="color:#555;">[\${l.t}]</span> <span style="color:\${color}">\${l.m}</span></div>\`;
            });
            document.getElementById('ui-logs').innerHTML = htmlLogs;

            // Render Projetos (Chips)
            let htmlChips = '';
            for(let key in db.chips) {
                let c = db.chips[key];
                let isAtivo = (e.chipAtual === key);
                let btn = isAtivo ? \`<button class="btn" style="background:var(--green); color:#000;" disabled>PRODUZINDO</button>\` : \`<button class="btn" style="background:#fff; color:#000;" onclick="execAcao('mudar_chip', 0, '\${key}')">FABRICAR ESSE</button>\`;
                let reqF = db.rh[c.reqFunc].nome;
                let reqM = c.reqUpg ? db.upgrades[c.reqUpg].nome : "Nenhuma";
                let qtdEstoque = e.estoqueModelos[key] || 0;
                
                htmlChips += \`<div class="list-item" style="\${isAtivo ? 'border-color:var(--green);' : ''}">
                    <div class="li-top"><b style="font-size:14px; color:\${isAtivo ? 'var(--green)' : '#fff'}">\${c.nome}</b> <span class="li-badge">Estoque: \${fmt(qtdEstoque)}</span></div>
                    <div class="li-info">
                        <span><i class="fas fa-atom"></i> \${c.transistores} Transist.</span>
                        <span><i class="fas fa-cube"></i> \${c.silicio}g Silício</span>
                        <span style="color:var(--purple);"><i class="fas fa-vial"></i> \${c.fosforo}g Fósforo</span>
                        <span style="color:var(--gold);"><i class="fas fa-tag"></i> R$ \${c.preco} (Venda)</span>
                    </div>
                    <div class="li-info" style="color:#aa4444;">Requere: \${reqF} | Máquina: \${reqM}</div>
                    \${btn}
                </div>\`;
            }
            document.getElementById('list-chips').innerHTML = htmlChips;

            // Render RH
            let htmlRH = '';
            for(let key in db.rh) {
                let f = db.rh[key]; let lck = d.levelUser < f.reqLvl; let qtd = (e.equipe||{})[key] || 0;
                let btn = lck ? \`<button class="btn" style="background:#222; color:#555;" disabled>REQ LVL \${f.reqLvl}</button>\` : \`<button class="btn" style="background:var(--blue); color:#fff;" onclick="execAcao('contratar', 0, '\${key}')">CONTRATAR (R$ \${fmt(f.preco)})</button>\`;
                htmlRH += \`<div class="list-item">
                    <div class="li-top"><b style="font-size:14px;"><i class="\${f.icon}"></i> \${f.nome} \${qtd>0 ? '<span style="color:var(--green)">x'+qtd+'</span>' : ''}</b></div>
                    <div class="li-info">Salário: R$ \${fmt(f.salarioMin)} / min (Debita do Caixa)</div>
                    \${btn}
                </div>\`;
            }
            document.getElementById('list-rh').innerHTML = htmlRH;

            // Render Máquinas
            let htmlMaq = '';
            for(let key in db.upgrades) {
                let u = db.upgrades[key]; let tem = (e.upgrades||[]).includes(key);
                let btn = tem ? \`<button class="btn" style="background:#222; color:#888;" disabled>INSTALADO</button>\` : \`<button class="btn" style="background:\${u.cor}; color:#fff;" onclick="execAcao('upgrade', 0, '\${key}')">COMPRAR MÁQUINA (R$ \${fmt(u.preco)})</button>\`;
                htmlMaq += \`<div class="list-item">
                    <div class="li-top"><b style="font-size:14px;"><i class="\${u.icon}" style="color:\${u.cor}"></i> \${u.nome}</b></div>
                    <div class="li-info">\${u.desc}</div>
                    \${btn}
                </div>\`;
            }
            document.getElementById('list-maquinas').innerHTML = htmlMaq;
        }

        function openMod(tipo) {
            mType = tipo; document.getElementById('m-input').value = '';
            document.getElementById('modal').style.display = 'flex';
            if(tipo === 'investir') { document.getElementById('m-title').innerText = 'Injetar Capital'; document.getElementById('m-desc').innerText = 'De: Carteira -> Para: Caixa (CNPJ)'; }
            if(tipo === 'sacar') { document.getElementById('m-title').innerText = 'Sacar Lucro'; document.getElementById('m-desc').innerText = 'De: Caixa -> Para: Carteira (Taxa 5%)'; }
            if(tipo === 'comprar_silicio') { document.getElementById('m-title').innerText = 'Comprar Silício'; document.getElementById('m-desc').innerText = 'Digite as Gramas (R$ 1/g - Debita do Caixa)'; }
            if(tipo === 'comprar_fosforo') { document.getElementById('m-title').innerText = 'Comprar Fósforo'; document.getElementById('m-desc').innerText = 'Digite as Gramas (R$ 10/g - Debita do Caixa)'; }
        }

        async function sendInputAcao() {
            let v = Number(document.getElementById('m-input').value)||0;
            document.getElementById('modal').style.display = 'none';
            execAcao(mType, v);
        }

        async function execAcao(tipo, valor=0, valStr='') {
            const r = await fetch('/api/empresa/acao', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({tipo, valor, valStr})});
            const res = await r.json(); if(res.erro) showMsg(res.erro); else loop();
        }
    </script>
</body>
</html>`;
fs.writeFileSync('./views/tycoon.html', frontendV5);
console.log('✅ FRONTEND V5 OK: Abas independentes, RH Profissional e Sistema de Dopagem Quântica!');

