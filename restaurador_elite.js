const fs = require('fs');
console.log("💎 Restaurando o Império: Interface Elite + Motor Completo...");

const arqBack = './rotas_web/empresa.js';
const arqFront = './views/tycoon.html';

// 1. BACKEND COMPLETO (Holding, 20 Materiais, Cozinha, Hardware e Salvar)
const backendConteudo = `module.exports = function(app, checkAuth, db, configWeb) {
    const path = require('path');

    const rhDB = {
        "op_junior": { nome: "Operário Jr", preco: 2500, salarioMin: 50, reqLvl: 1, icon: "fas fa-hard-hat", tema: "gpus" },
        "eng_ia": { nome: "Engenheiro de IA", preco: 3000000, salarioMin: 95000, reqLvl: 40, icon: "fas fa-brain", tema: "gpus" },
        "chapeiro_jr": { nome: "Chapeiro Júnior", preco: 1500, salarioMin: 25, reqLvl: 1, icon: "fas fa-fire", tema: "alimentos" },
        "chef_cozinha": { nome: "Chef de Cozinha", preco: 25000, salarioMin: 600, reqLvl: 5, icon: "fas fa-utensils", tema: "alimentos" }
    };

    const matDB = {
        "silicio": { nome: "Silício Puro", preco: 2, icon: "fas fa-cube", cor: "#aaa", tema: "gpus" },
        "ouro": { nome: "Ouro (Contatos)", preco: 350, icon: "fas fa-coins", cor: "#ffd700", tema: "gpus" },
        "grafeno": { nome: "Grafeno", preco: 8500, icon: "fas fa-layer-group", cor: "#444", tema: "gpus" },
        "pao": { nome: "Pão Brioche", preco: 2, icon: "fas fa-hamburger", cor: "#e2b714", tema: "alimentos" },
        "carne": { nome: "Carne 150g", preco: 5, icon: "fas fa-drumstick-bite", cor: "#8b4513", tema: "alimentos" },
        "queijo": { nome: "Queijo Cheddar", preco: 3, icon: "fas fa-cheese", cor: "#ffbb00", tema: "alimentos" },
        "bacon": { nome: "Bacon", preco: 4, icon: "fas fa-bacon", cor: "#c21e56", tema: "alimentos" }
    };

    const chipsDB = {
        "basic": { nome: "Transistor 100nm", transistores: "100 Mil", reqFunc: ["op_junior"], reqUpg: ["esteira"], mats: {silicio: 5}, preco: 45, tema: "gpus" },
        "dark_matter": { nome: "Processador Matéria Escura", transistores: "Infinito", reqFunc: ["eng_ia"], reqUpg: ["high_na_euv"], mats: {silicio: 50, ouro: 50}, preco: 4500000, tema: "gpus" },
        "burguer_simples": { nome: "Hambúrguer Simples", transistores: "150g", reqFunc: ["chapeiro_jr"], reqUpg: ["chapa_basica"], mats: {pao: 1, carne: 1}, preco: 25, tema: "alimentos" },
        "x_bacon": { nome: "X-Bacon Supremo", transistores: "350g", reqFunc: ["chapeiro_jr"], reqUpg: ["chapa_basica"], mats: {pao: 1, carne: 1, queijo: 1, bacon: 3}, preco: 95, tema: "alimentos" }
    };

    const upgradesDB = {
        "esteira": { nome: "Esteira Industrial", desc: "Produção básica", preco: 80000, icon: "fas fa-cogs", cor: "#ff9f0a", tema: "gpus" },
        "high_na_euv": { nome: "High-NA EUV", desc: "Precisão Atômica", preco: 150000000, icon: "fas fa-microscope", cor: "#bf5af2", tema: "gpus" },
        "chapa_basica": { nome: "Chapa a Gás", desc: "Fritura manual", preco: 2000, icon: "fas fa-fire-burner", cor: "#ff9f0a", tema: "alimentos" }
    };

    app.get('/tycoon', checkAuth, (req, res) => { res.sendFile(path.join(__dirname, '../views/tycoon.html')); });

    app.get('/api/empresa/info', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const user = db.obterUsuario(idLimpo);

        if (user.empresa && !user.empresas) {
            user.empresas = [JSON.parse(JSON.stringify(user.empresa))];
            user.empresaAtiva = 0;
            delete user.empresa;
            db.salvar(idLimpo, user);
        }

        if (!user.empresas || user.empresas.length === 0) return res.json({ hasCompany: false });
        let emp = user.empresas[user.empresaAtiva || 0];
        if(!emp) emp = user.empresas[0];

        res.json({ 
            hasCompany: true, saldoReal: user.dinheiro, empresa: emp, levelUser: user.level || 1,
            listaEmpresas: user.empresas.map((e, i) => ({nome: e.nome, caixa: e.caixa, tema: e.tema || 'gpus'})),
            empAtivaIndex: user.empresaAtiva || 0,
            bancoDados: { rh: rhDB, upgrades: upgradesDB, chips: chipsDB, materiais: matDB },
            folhaPagamentoMin: 0 
        });
    });

    app.post('/api/empresa/acao', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        const { tipo, valor, valStr, tema } = req.body;

        if (tipo === 'criar_empresa') {
            if(!user.empresas) user.empresas = [];
            let custo = user.empresas.length === 0 ? 0 : 50000;
            if(user.dinheiro < custo) return res.json({erro: "Saldo Insuficiente!"});
            user.dinheiro -= custo;
            user.empresas.push({ nome: valStr, tema: tema || 'gpus', caixa: 0, materiais: {}, equipe: {}, upgrades: [], estoqueModelos: {}, linhasAtivas: {}, liveLogs: [], pausado: true });
            user.empresaAtiva = user.empresas.length - 1;
        } else if (tipo === 'trocar_empresa') {
            user.empresaAtiva = valor;
        } else if (tipo === 'investir') {
            let emp = user.empresas[user.empresaAtiva];
            if(user.dinheiro >= valor) { user.dinheiro -= valor; emp.caixa += valor; }
        } else if (tipo === 'toggle_linha') {
            let emp = user.empresas[user.empresaAtiva];
            emp.linhasAtivas[valStr] = !emp.linhasAtivas[valStr];
        }

        db.salvar(idLimpo, user);
        res.json({ success: true });
    });
};`;

// 2. FRONTEND COMPLETO (Interface Industrial, Terminal Suave, Abas Dinâmicas)
const frontendConteudo = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>DaemonTech Elite</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root { --bg: #050505; --card: #121215; --blue: #0a84ff; --green: #32d74b; --red: #ff453a; --gold: #ffd700; --purple: #bf5af2; --text: #fff; }
        * { box-sizing: border-box; font-family: 'Segoe UI', sans-serif; -webkit-tap-highlight-color: transparent; }
        body { background: var(--bg); color: var(--text); margin: 0; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
        
        .header { padding: 15px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.8); }
        .tabs { display: flex; overflow-x: auto; background: #000; border-bottom: 1px solid #222; scrollbar-width: none; }
        .tab { flex: 0 0 auto; padding: 15px 20px; font-size: 10px; font-weight: 900; color: #555; cursor: pointer; text-transform: uppercase; border-bottom: 2px solid transparent; }
        .tab.active { color: #fff; border-bottom-color: var(--blue); }

        .content { flex: 1; overflow-y: auto; padding: 15px; padding-bottom: 40px; }
        .section { display: none; flex-direction: column; gap: 12px; }
        .section.active { display: flex; }

        .card, .list-item { background: var(--card); border: 1px solid #222; padding: 15px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .btn { padding: 12px; border-radius: 12px; border: none; font-weight: 900; font-size: 11px; cursor: pointer; text-transform: uppercase; transition: all 0.1s; }
        .btn:active { transform: scale(0.95) translateY(3px); }

        .terminal-box { background: #020202; border: 1px solid #333; border-radius: 12px; padding: 15px; height: 180px; overflow-y: auto; position: relative; }
        .log-line-visual { border-left: 4px solid var(--blue); background: rgba(255,255,255,0.03); padding: 10px; margin-bottom: 8px; border-radius: 0 8px 8px 0; display: flex; align-items: center; font-family: monospace; animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

        .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 2000; justify-content: center; align-items: center; flex-direction: column; padding: 25px; }
        .modal-input { width: 100%; padding: 15px; background: #000; border: 1px solid #333; color: #fff; border-radius: 12px; margin-bottom: 15px; }
        
        .li-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .li-badge { background: #000; padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <b id="ui-nome" style="font-size: 18px;">CARREGANDO...</b>
        <div id="ui-saldo" style="color: var(--green); font-weight: 900;">R$ 0</div>
    </div>

    <div class="tabs">
        <div class="tab active" onclick="switchTab('painel')"><i class="fas fa-chart-pie"></i> PAINEL</div>
        <div class="tab" id="tab-proj" onclick="switchTab('projetos')"><i class="fas fa-microchip"></i> PROJETOS</div>
        <div class="tab" onclick="switchTab('holding')"><i class="fas fa-city"></i> HOLDING</div>
        <div class="tab" id="tab-rh" onclick="switchTab('rh')"><i class="fas fa-users"></i> EQUIPE</div>
    </div>

    <div class="content">
        <div class="section active" id="sec-painel">
            <div class="card" style="border-color: var(--green);">
                <small style="color: #888; font-weight: 800;">CAIXA (CNPJ)</small>
                <div id="ui-caixa" style="font-size: 28px; font-weight: 900; color: var(--green); margin: 5px 0;">R$ 0</div>
                <button class="btn" style="background: var(--blue); color: #fff; width: 100%;" onclick="openMod('investir')">INVESTIR CAPITAL</button>
            </div>
            <div class="terminal-box" id="ui-logs" style="margin-top: 15px;"></div>
        </div>

        <div class="section" id="sec-projetos"><div id="list-chips"></div></div>
        <div class="section" id="sec-holding">
            <button class="btn" style="background: var(--blue); color: #fff; width: 100%; margin-bottom: 15px;" onclick="openMod('criar_empresa')">+ ABRIR NOVO CNPJ</button>
            <div id="list-holding"></div>
        </div>
        <div class="section" id="sec-rh"><div id="list-rh"></div></div>
    </div>

    <div class="modal-overlay" id="modal">
        <h3 id="m-title" style="margin-bottom: 20px;">AÇÃO</h3>
        <input type="text" id="m-input" class="modal-input" placeholder="Valor ou Nome">
        <select id="m-tema" class="modal-input" style="display: none;">
            <option value="gpus">⚙️ Hardware & GPUs</option>
            <option value="alimentos">🍕 Alimentos & Bebidas</option>
        </select>
        <div style="display: flex; gap: 10px; width: 100%;">
            <button class="btn" style="flex: 1; background: #222; color: #fff;" onclick="document.getElementById('modal').style.display='none'">CANCELAR</button>
            <button class="btn" style="flex: 1; background: var(--blue); color: #fff;" onclick="sendInput()">CONFIRMAR</button>
        </div>
    </div>

    <div id="tela-novato" class="modal-overlay" style="display: none; background: var(--bg);">
        <i class="fas fa-city" style="font-size: 50px; color: var(--blue); margin-bottom: 20px;"></i>
        <h2>BEM-VINDO</h2>
        <p style="color: #888; text-align: center;">Funde sua primeira empresa gratuitamente.</p>
        <button class="btn" style="background: var(--blue); color: #fff; padding: 20px; width: 80%;" onclick="openMod('criar_empresa')">COMEÇAR IMPÉRIO</button>
    </div>

    <script>
        const fmt = v => new Intl.NumberFormat('pt-BR').format(v||0);
        let mType = '';

        function switchTab(t) {
            document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
            document.querySelectorAll('.section').forEach(x => x.classList.remove('active'));
            event.currentTarget.classList.add('active');
            document.getElementById('sec-' + t).classList.add('active');
        }

        async function loop() {
            try {
                const r = await fetch('/api/empresa/info');
                const d = await r.json();
                if(!d.hasCompany) { document.getElementById('tela-novato').style.display='flex'; return; }
                document.getElementById('tela-novato').style.display='none';
                render(d);
            } catch(e) {}
        }
        setInterval(loop, 2000); loop();

        function render(d) {
            const e = d.empresa; const db = d.bancoDados;
            const temasIcons = {gpus: '⚙️', alimentos: '🍕'};
            document.getElementById('ui-nome').innerText = (temasIcons[e.tema] || '🏢') + ' ' + e.nome.toUpperCase();
            document.getElementById('ui-saldo').innerText = '💳 R$ ' + fmt(d.saldoReal);
            document.getElementById('ui-caixa').innerText = 'R$ ' + fmt(e.caixa);

            // Abas Dinâmicas
            document.getElementById('tab-proj').innerHTML = e.tema === 'alimentos' ? '<i class="fas fa-hamburger"></i> CARDÁPIO' : '<i class="fas fa-microchip"></i> PROJETOS';
            document.getElementById('tab-rh').innerHTML = e.tema === 'alimentos' ? '<i class="fas fa-user-friends"></i> COZINHEIROS' : '<i class="fas fa-users"></i> EQUIPE';

            // Listas
            let hChips = '';
            for(let k in db.chips) {
                if((db.chips[k].tema || 'gpus') !== (e.tema || 'gpus')) continue;
                let isA = e.linhasAtivas[k];
                hChips += \`<div class="list-item" style="border-left: 5px solid \${isA?'var(--green)':'#222'}">
                    <div class="li-top"><b>\${db.chips[k].nome}</b> <span class="li-badge">ESTOQUE: \${fmt(e.estoqueModelos[k]||0)}</span></div>
                    <button class="btn" style="width:100%; background:\${isA?'var(--red)':'var(--green)'}" onclick="exec('toggle_linha', 0, '\${k}')">\${isA?'DESLIGAR':'LIGAR LINHA'}</button>
                </div>\`;
            }
            document.getElementById('list-chips').innerHTML = hChips;

            let hHold = '';
            d.listaEmpresas.forEach((emp, i) => {
                let isA = d.empAtivaIndex === i;
                hHold += \`<div class="list-item" style="border-color: \${isA?'var(--green)':'#222'}">
                    <div class="li-top"><b>\${temasIcons[emp.tema] || '🏢'} \${emp.nome}</b> <span class="li-badge">R$ \${fmt(emp.caixa)}</span></div>
                    <button class="btn" style="width:100%; background:\${isA?'#111':'var(--blue)'}; color:\${isA?'#555':'#fff'}" \${isA?'disabled':''} onclick="exec('trocar_empresa', \${i}, '')">\${isA?'OPERANDO':'ASSUMIR CONTROLE'}</button>
                </div>\`;
            });
            document.getElementById('list-holding').innerHTML = hHold;

            let hRH = '';
            for(let k in db.rh) {
                if((db.rh[k].tema || 'gpus') !== (e.tema || 'gpus')) continue;
                let qtd = e.equipe[k] || 0;
                hRH += \`<div class="list-item">
                    <div class="li-top"><b><i class="\${db.rh[k].icon}"></i> \${db.rh[k].nome} \${qtd>0?'x'+qtd:''}</b></div>
                    <button class="btn" style="background:var(--blue); color:#fff; width:100%;" onclick="exec('contratar', 0, '\${k}')">CONTRATAR (R$ \${fmt(db.rh[k].preco)})</button>
                </div>\`;
            }
            document.getElementById('list-rh').innerHTML = hRH;
        }

        function openMod(t) {
            mType = t; document.getElementById('modal').style.display='flex';
            document.getElementById('m-tema').style.display = t === 'criar_empresa' ? 'block' : 'none';
            const inp = document.getElementById('m-input');
            inp.type = t === 'criar_empresa' ? 'text' : 'number';
            inp.placeholder = t === 'criar_empresa' ? 'Nome da Empresa' : 'Valor em R$';
        }

        async function sendInput() {
            const val = document.getElementById('m-input').value;
            const tema = document.getElementById('m-tema').value;
            await fetch('/api/empresa/acao', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({tipo: mType, valor: Number(val)||0, valStr: val, tema: tema})
            });
            document.getElementById('modal').style.display='none';
            loop();
        }

        async function exec(tipo, valor, valStr) {
            await fetch('/api/empresa/acao', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({tipo, valor, valStr})
            });
            loop();
        }
    </script>
</body>
</html>`;

fs.writeFileSync(arqBack, backendConteudo);
fs.writeFileSync(arqFront, frontendConteudo);
console.log("✅ RESTAURAÇÃO DE ELITE COMPLETA! Interface premium e motor multi-tema online.");
