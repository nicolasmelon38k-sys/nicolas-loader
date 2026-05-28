const fs = require('fs');
console.log("🚀 Iniciando Injeção Tycoon V4 (Real-Time)...");

// ==========================================
// 1. MOTOR BACKEND (1 Segundo + Random Events)
// ==========================================
const backendV4 = `module.exports = function(app, checkAuth, db, configWeb) {
    const path = require('path');

    app.get('/tycoon', checkAuth, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/tycoon.html'));
    });

    const rhDB = {
        "op_junior": { id: "op_junior", nome: "Operário Jr.", preco: 500, reqLvl: 1, desc: "+1 Chip/seg", buff_prod: 1, icon: "fas fa-hard-hat" },
        "tec_pleno": { id: "tec_pleno", nome: "Técnico Pleno", preco: 2500, reqLvl: 2, desc: "+3 Chips/seg", buff_prod: 3, icon: "fas fa-wrench" },
        "eng_senior": { id: "eng_senior", nome: "Eng. Sênior", preco: 8000, reqLvl: 4, desc: "+10 Chips/seg", buff_prod: 10, icon: "fas fa-laptop-code" }
    };

    const upgradesDB = {
        "auto_1": { nome: "Esteiras Rápidas", desc: "Produção +20%", preco: 25000, tipo: "prod_pct", valor: 20, icon: "fas fa-cogs", cor: "#ff9f0a" },
        "gestao_1": { nome: "Controle de Qualidade", desc: "Reduz Erros", preco: 30000, tipo: "qualidade", valor: 10, icon: "fas fa-microscope", cor: "#32d74b" },
        "venda_1": { nome: "Contratos VIP", desc: "+R$ 10 por Chip", preco: 50000, tipo: "venda_flat", valor: 10, icon: "fas fa-handshake", cor: "#bf5af2" }
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
        if (!emp.estoque) emp.estoque = {"Microchips": 0};
        if (!emp.liveLogs) emp.liveLogs = [];

        // Matemática Base
        let prodPorSeg = 1; // 1 chip por seg inicial
        let chanceErro = 0.15; // 15% chance de erro
        let precoChip = 25;

        // Buffs
        for (let fId in (emp.equipe||{})) {
            if(rhDB[fId]) prodPorSeg += (rhDB[fId].buff_prod * emp.equipe[fId]);
        }
        (emp.upgrades||[]).forEach(uId => {
            let u = upgradesDB[uId];
            if(u && u.tipo === "prod_pct") prodPorSeg = Math.floor(prodPorSeg * (1 + (u.valor/100)));
            if(u && u.tipo === "qualidade") chanceErro = Math.max(0.01, chanceErro - (u.valor/100));
            if(u && u.tipo === "venda_flat") precoChip += u.valor;
        });

        // MOTOR REAL-TIME (Calcula por SEGUNDOS passados)
        const agora = Date.now();
        const segPassados = Math.floor((agora - (emp.ultimaProducao || agora)) / 1000);

        if (segPassados >= 1) {
            let limitadorLoop = Math.min(segPassados, 60); // Calcula no max 60s por vez pra n travar
            
            for(let i=0; i<limitadorLoop; i++) {
                if (emp.materia > 0) {
                    let consumir = Math.min(emp.materia, prodPorSeg);
                    emp.materia -= consumir;
                    
                    let chips = consumir;
                    let rng = Math.random();
                    
                    if (rng < chanceErro) {
                        let perdidos = Math.max(1, Math.floor(chips * 0.4));
                        chips -= perdidos;
                        addLog(emp, \`Erro de fabricação! Perdemos \${perdidos} unidades.\`, 'red');
                    } else if (rng > 0.90) {
                        let extra = Math.max(1, Math.floor(chips * 0.5));
                        chips += extra;
                        addLog(emp, \`Otimização perfeita! +\${extra} chips extras!\`, 'green');
                    } else {
                        addLog(emp, \`Processou \${chips} chips com sucesso.\`, 'white');
                    }
                    
                    emp.estoque["Microchips"] += chips;
                }
            }
            emp.ultimaProducao = agora;
            db.salvar(idLimpo, user);
        }

        res.json({ 
            hasCompany: true, saldoReal: user.dinheiro, empresa: emp, levelUser: user.level || 1,
            stats: { prodPorSeg, precoChip, chanceErro, rh: rhDB, upgrades: upgradesDB } 
        });
    });

    app.post('/api/empresa/acao', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        if (!user.empresa) return res.json({ success: false });

        const { tipo, valor, valStr } = req.body;
        let emp = user.empresa;

        if (tipo === 'renomear') {
            if(!valStr || valStr.length < 3) return res.json({erro: "Nome muito curto!"});
            emp.nome = valStr;
            addLog(emp, \`Empresa renomeada para \${valStr}\`, 'gold');
        }
        else if (tipo === 'investir') {
            if (valor <= 0 || (user.dinheiro||0) < valor) return res.json({erro: "Saldo Físico insuficiente."});
            user.dinheiro -= valor; emp.caixa += valor;
            addLog(emp, \`Sócio injetou R$ \${valor} no caixa.\`, 'blue');
        }
        else if (tipo === 'comprar_materia') {
            if (valor <= 0 || emp.caixa < valor) return res.json({erro: "Caixa CNPJ insuficiente."});
            emp.caixa -= valor; emp.materia += valor; // 1 R$ = 1 Silício
            addLog(emp, \`Comprou \${valor}g de Silício bruto.\`, 'gold');
        }
        else if (tipo === 'vender') {
            let chips = Math.floor(emp.estoque["Microchips"]||0);
            if (chips <= 0) return res.json({erro: "Estoque vazio."});
            let lucro = chips * valor; // valor = precoChip enviado do front
            emp.estoque["Microchips"] = 0; emp.caixa += lucro;
            addLog(emp, \`EXPORTAÇÃO: Lote vendido por R$ \${lucro}\`, 'green');
        }
        
        db.salvar(idLimpo, user);
        res.json({ success: true, msg: "Ação concluída!" });
    });
};`;
fs.writeFileSync('./rotas_web/empresa.js', backendV4);
console.log('✅ BACKEND V4 OK: Ciclo por Segundos e Random Events!');


// ==========================================
// 2. TELA FRONTEND (Terminal Live Feed)
// ==========================================
const frontendV4 = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>DaemonTech V4</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root { --bg: #050505; --card: #121215; --gold: #ffd700; --green: #32d74b; --blue: #0a84ff; --red: #ff453a; --text: #fff; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; -webkit-tap-highlight-color: transparent; }
        body { background: var(--bg); color: var(--text); height: 100vh; display: flex; flex-direction: column; overflow: hidden;}
        
        .header { padding: 15px; background: rgba(5,5,5,0.9); border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
        .btn-rename { background: none; border: none; color: #888; margin-left: 10px; cursor: pointer; }
        
        .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 15px; }
        .card { background: var(--card); border: 1px solid #222; border-radius: 12px; padding: 15px; }
        .c-title { font-size: 10px; color: #888; text-transform: uppercase; font-weight: 800; margin-bottom: 5px; }
        .c-val { font-size: 18px; font-weight: 900; }
        
        /* TERMINAL AO VIVO */
        .terminal-box { background: #000; border: 1px solid #333; border-radius: 12px; margin: 0 15px; padding: 10px; height: 160px; overflow-y: auto; display: flex; flex-direction: column; font-family: monospace; font-size: 11px; box-shadow: inset 0 0 10px rgba(0,255,0,0.05); }
        .log-line { margin-bottom: 4px; padding-bottom: 4px; border-bottom: 1px dashed #111; }
        .log-time { color: #555; margin-right: 5px; }

        .btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 15px; }
        .btn { padding: 15px; border-radius: 12px; border: none; font-weight: 900; font-size: 12px; cursor: pointer; color: #fff; display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .btn i { font-size: 18px; }

        .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(5px); z-index: 999; justify-content: center; align-items: center; }
        .modal-box { background: var(--card); border: 1px solid #333; width: 85%; max-width: 350px; padding: 25px; border-radius: 20px; text-align: center; }
        .modal-input { width: 100%; padding: 15px; background: #000; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 16px; margin: 15px 0; text-align: center; outline: none; }
        
        #toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: var(--blue); padding: 10px 20px; border-radius: 20px; font-size: 12px; font-weight: bold; opacity: 0; transition: 0.3s; z-index: 9999; }
    </style>
</head>
<body>
    <div class="header">
        <a href="/os" style="color:#fff;"><i class="fa-solid fa-chevron-left"></i></a>
        <div style="display:flex; align-items:center;">
            <b id="ui-nome" style="font-size:18px;">Empresa</b>
            <button class="btn-rename" onclick="openMod('renomear')"><i class="fas fa-edit"></i></button>
        </div>
        <div style="background:var(--green); color:#000; padding:5px 10px; border-radius:10px; font-weight:900; font-size:11px;" id="ui-saldo">💳 R$ 0</div>
    </div>

    <div class="dash-grid">
        <div class="card"><div class="c-title">Caixa (CNPJ)</div><div class="c-val" style="color:var(--green);" id="ui-caixa">R$ 0</div></div>
        <div class="card"><div class="c-title">Silício (Bruto)</div><div class="c-val" style="color:var(--gold);" id="ui-materia">0g</div></div>
        <div class="card" style="grid-column: span 2; display:flex; justify-content:space-between; align-items:center;">
            <div><div class="c-title">Estoque Chips</div><div class="c-val" style="color:var(--blue);" id="ui-estoque">0 und</div></div>
            <div style="text-align:right;"><div class="c-title">Ritmo Fabril</div><div class="c-val" style="font-size:14px;" id="ui-ritmo">0/seg</div></div>
        </div>
    </div>

    <div style="padding: 0 15px 5px 15px; font-size: 10px; color: #888; text-transform: uppercase; font-weight: 800;"><i class="fas fa-terminal"></i> Log da Fábrica (Ao Vivo)</div>
    <div class="terminal-box" id="ui-logs"></div>

    <div class="btn-grid">
        <button class="btn" style="background:var(--blue);" onclick="openMod('investir')"><i class="fas fa-coins"></i> Injetar Capital</button>
        <button class="btn" style="background:var(--gold); color:#000;" onclick="openMod('comprar_materia')"><i class="fas fa-box-open"></i> Comprar Silício</button>
        <button class="btn" style="background:var(--green); color:#000; grid-column: span 2;" onclick="vender()"><i class="fas fa-truck-loading"></i> Exportar Chips (Vender)</button>
    </div>

    <div class="modal-overlay" id="modal">
        <div class="modal-box">
            <h3 id="m-title" style="margin-bottom:5px;">Ação</h3>
            <p id="m-desc" style="font-size:12px; color:#888;">Detalhes</p>
            <input type="text" id="m-input" class="modal-input" placeholder="...">
            <div style="display:flex; gap:10px;">
                <button class="btn" style="flex:1; background:#222;" onclick="document.getElementById('modal').style.display='none'">Sair</button>
                <button class="btn" style="flex:1; background:var(--blue);" id="m-btn" onclick="execMod()">Confirmar</button>
            </div>
        </div>
    </div>

    <div id="toast">Notificação</div>

    <script>
        const fmt = v => new Intl.NumberFormat('pt-BR').format(v||0);
        let currPreco = 25; let mType = '';

        function showMsg(m) { const t=document.getElementById('toast'); t.innerText=m; t.style.opacity=1; setTimeout(()=>t.style.opacity=0,2500); }

        async function loop() {
            try {
                const r = await fetch('/api/empresa/info'); const d = await r.json();
                if(d.hasCompany) render(d);
            } catch(e) {}
        }
        setInterval(loop, 1000); // ATUALIZA A CADA 1 SEGUNDO!
        loop();

        function render(d) {
            const e = d.empresa; currPreco = d.stats.precoChip;
            document.getElementById('ui-nome').innerText = e.nome || 'Empresa';
            document.getElementById('ui-saldo').innerText = '💳 R$ ' + fmt(d.saldoReal);
            document.getElementById('ui-caixa').innerText = 'R$ ' + fmt(e.caixa);
            document.getElementById('ui-materia').innerText = fmt(e.materia) + 'g';
            document.getElementById('ui-estoque').innerText = fmt(e.estoque["Microchips"]||0) + ' und';
            document.getElementById('ui-ritmo').innerText = fmt(d.stats.prodPorSeg) + ' / seg';

            // Renderiza Terminal
            let htmlLogs = '';
            (e.liveLogs||[]).forEach(l => {
                let color = l.c === 'red' ? '#ff453a' : l.c === 'green' ? '#32d74b' : l.c === 'gold' ? '#ffd700' : '#fff';
                htmlLogs += \`<div class="log-line"><span class="log-time">[\${l.t}]</span> <span style="color:\${color}">\${l.m}</span></div>\`;
            });
            document.getElementById('ui-logs').innerHTML = htmlLogs;
        }

        function openMod(tipo) {
            mType = tipo; document.getElementById('m-input').value = '';
            document.getElementById('m-input').type = tipo === 'renomear' ? 'text' : 'number';
            
            if(tipo === 'renomear') {
                document.getElementById('m-title').innerText = 'Renomear Empresa';
                document.getElementById('m-desc').innerText = 'Digite o novo nome (Grátis)';
            } else if (tipo === 'investir') {
                document.getElementById('m-title').innerText = 'Injetar Capital';
                document.getElementById('m-desc').innerText = 'Tira dinheiro da sua Carteira Física e joga no Caixa do CNPJ.';
            } else if (tipo === 'comprar_materia') {
                document.getElementById('m-title').innerText = 'Comprar Silício';
                document.getElementById('m-desc').innerText = 'Gasta saldo do Caixa (CNPJ). 1 R$ = 1g de Silício Bruto.';
            }
            document.getElementById('modal').style.display = 'flex';
        }

        async function execMod() {
            let v = document.getElementById('m-input').value;
            let payload = { tipo: mType, valor: Number(v)||0, valStr: v };
            const r = await fetch('/api/empresa/acao', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
            const res = await r.json();
            document.getElementById('modal').style.display = 'none';
            if(res.erro) showMsg(res.erro); else loop();
        }

        async function vender() {
            const r = await fetch('/api/empresa/acao', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({tipo:'vender', valor: currPreco})});
            const res = await r.json();
            if(res.erro) showMsg(res.erro); else loop();
        }
    </script>
</body>
</html>`;
fs.writeFileSync('./views/tycoon.html', frontendV4);
console.log('✅ FRONTEND V4 OK: Tela Tycoon atualizada com Terminal ao Vivo e Ciclo 1s!');

