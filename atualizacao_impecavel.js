const fs = require('fs');

// 1. BACKEND COM MOTOR REALISTA E VENDA
const back = `module.exports = function(app, checkAuth, db, configWeb) {
    const path = require('path');

    const dbTycoon = {
        rh: {
            "chapeiro": { nome: "Chapeiro", preco: 1500, salarioMin: 25, icon: "fas fa-fire", tema: "alimentos" },
            "op_jr": { nome: "Operário Jr", preco: 2500, salarioMin: 50, icon: "fas fa-hard-hat", tema: "gpus" },
            "tec_hw": { nome: "Téc. de Hardware", preco: 8000, salarioMin: 180, icon: "fas fa-microchip", tema: "gpus" }
        },
        materiais: {
            "pao": { nome: "Pão Brioche", preco: 2, icon: "fas fa-hamburger", cor: "#e2b714", tema: "alimentos" },
            "carne": { nome: "Hambúrguer 150g", preco: 5, icon: "fas fa-drumstick-bite", cor: "#8b4513", tema: "alimentos" },
            "silicio": { nome: "Silício Puro", preco: 2, icon: "fas fa-cube", cor: "#aaa", tema: "gpus" },
            "cobre": { nome: "Fios de Cobre", preco: 8, icon: "fas fa-bolt", cor: "#b87333", tema: "gpus" }
        },
        upgrades: {
            "chapa": { nome: "Chapa a Gás", preco: 2000, icon: "fas fa-fire-burner", cor: "#ff9f0a", tema: "alimentos" },
            "esteira": { nome: "Esteira Industrial", preco: 8000, icon: "fas fa-cogs", cor: "#ff9f0a", tema: "gpus" },
            "prensa": { nome: "Prensa Precisão", preco: 15000, icon: "fas fa-compress-arrows-alt", cor: "#32d74b", tema: "gpus" }
        },
        chips: {
            "burguer_simples": { nome: "Hambúrguer", mats: {pao: 1, carne: 1}, reqFunc: ["chapeiro"], reqUpg: ["chapa"], preco: 25, tema: "alimentos" },
            "basic": { nome: "Transistor 100nm", mats: {silicio: 5}, reqFunc: ["op_jr"], reqUpg: ["esteira"], preco: 45, tema: "gpus" },
            "core_i5": { nome: "Core-i5 Basic", mats: {silicio: 15, cobre: 10}, reqFunc: ["tec_hw"], reqUpg: ["prensa"], preco: 850, tema: "gpus" }
        }
    };

    app.get('/tycoon', checkAuth, (req, res) => { res.sendFile(path.join(__dirname, '../views/tycoon.html')); });

    app.get('/api/empresa/info', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const user = db.obterUsuario(idLimpo);

        if (!user.empresas || user.empresas.length === 0) return res.json({ hasCompany: false });
        let empIndex = user.empresaAtiva || 0; let emp = user.empresas[empIndex];

        let agora = Date.now();
        if (!emp.ultimaProducao) emp.ultimaProducao = agora;
        let segPassados = Math.floor((agora - emp.ultimaProducao) / 1000);

        if (segPassados >= 1 && !emp.pausado) {
            emp.ultimaProducao = agora;
            for (let i = 0; i < segPassados; i++) {
                for (let k in emp.linhasAtivas) {
                    if (emp.linhasAtivas[k]) {
                        let proj = dbTycoon.chips[k];
                        if (!proj) continue;
                        
                        let temTudo = true;
                        if(proj.reqUpg) proj.reqUpg.forEach(u => { if(!(emp.upgrades||[]).includes(u)) temTudo = false; });
                        if(proj.reqFunc) proj.reqFunc.forEach(f => { if(!(emp.equipe[f] > 0)) temTudo = false; });
                        for (let mat in proj.mats) if ((emp.materiais[mat] || 0) < proj.mats[mat]) temTudo = false;

                        if (temTudo) {
                            for (let mat in proj.mats) emp.materiais[mat] -= proj.mats[mat];
                            emp.estoqueModelos[k] = (emp.estoqueModelos[k] || 0) + 1;
                        }
                    }
                }
            }
            db.salvar(idLimpo, user);
        }

        res.json({ hasCompany: true, saldoReal: user.dinheiro, empresa: emp, listaEmpresas: user.empresas.map((e, i) => ({nome: e.nome, tema: e.tema, caixa: e.caixa})), empAtivaIndex: empIndex, bancoDados: dbTycoon });
    });

    app.post('/api/empresa/acao', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        const { tipo, valor, valStr, tema } = req.body;

        if (tipo === 'criar_empresa') {
            let custo = !user.empresas || user.empresas.length === 0 ? 0 : 50000; 
            if (user.dinheiro < custo) return res.json({erro: "Saldo insuficiente!"});
            user.dinheiro -= custo;
            if(!user.empresas) user.empresas = [];
            user.empresas.push({ nome: valStr, tema: tema || 'gpus', caixa: 0, materiais: {}, equipe: {}, upgrades: [], estoqueModelos: {}, linhasAtivas: {}, liveLogs: [], pausado: false, ultimaProducao: Date.now() });
            user.empresaAtiva = user.empresas.length - 1;
        } 
        else if (tipo === 'trocar_empresa') { user.empresaAtiva = valor; }

        let emp = user.empresas[user.empresaAtiva];
        if (emp) {
            if (tipo === 'toggle_linha') { emp.linhasAtivas[valStr] = !emp.linhasAtivas[valStr]; } 
            else if (tipo === 'investir') { if(user.dinheiro >= valor && valor > 0) { user.dinheiro -= valor; emp.caixa += valor; } } 
            else if (tipo === 'comprar_mat') { let custo = dbTycoon.materiais[valStr].preco * valor; if(emp.caixa >= custo && valor > 0) { emp.caixa -= custo; emp.materiais[valStr] = (emp.materiais[valStr]||0) + valor; } } 
            else if (tipo === 'contratar') { let preco = dbTycoon.rh[valStr].preco; if(emp.caixa >= preco) { emp.caixa -= preco; emp.equipe[valStr] = (emp.equipe[valStr]||0) + 1; } } 
            else if (tipo === 'upgrade') { let preco = dbTycoon.upgrades[valStr].preco; if(emp.caixa >= preco && !emp.upgrades.includes(valStr)) { emp.caixa -= preco; emp.upgrades.push(valStr); } }
            else if (tipo === 'vender_estoque') {
                let lucro = 0;
                for(let k in emp.estoqueModelos) {
                    let qtd = emp.estoqueModelos[k] || 0;
                    if(qtd > 0 && dbTycoon.chips[k]) { lucro += qtd * dbTycoon.chips[k].preco; emp.estoqueModelos[k] = 0; }
                }
                emp.caixa += lucro;
            }
        }
        db.salvar(idLimpo, user); res.json({ success: true });
    });
};`;

// 2. FRONTEND COM EFEITO IMÃ (Cubic-Bezier) E BOTÕES AJUSTADOS
const front = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Tycoon Impecável</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root { --bg: #09090b; --card: #131316; --blue: #007bff; --green: #28a745; --red: #dc3545; --text: #f8f9fa; }
        * { box-sizing: border-box; font-family: 'Segoe UI', sans-serif; -webkit-tap-highlight-color: transparent; outline: none; }
        body { background: var(--bg); color: var(--text); margin: 0; padding: 0; display: flex; flex-direction: column; height: 100vh; overflow: hidden; user-select: none; }

        /* MÁGICA DA ANIMAÇÃO IMÃ (SPRING) */
        @keyframes springIn {
            0% { transform: scale(0.8) translateY(10px); opacity: 0; }
            60% { transform: scale(1.03) translateY(-2px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        .input-novato { width: 100%; max-width: 400px; padding: 14px; background: #000; border: 2px solid #222; color: #fff; border-radius: 10px; margin-bottom: 12px; font-size: 14px; font-weight: bold; appearance: none; transition: 0.2s; }
        .input-novato:focus { border-color: var(--blue); }
        
        .btn { 
            width: 100%; padding: 12px; border-radius: 10px; border: none; font-weight: 900; font-size: 11px; cursor: pointer; text-transform: uppercase; 
            background: var(--blue); color: #fff; margin-top: 8px; transition: transform 0.1s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.1s; letter-spacing: 0.5px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .btn:active { transform: scale(0.96) translateY(2px); box-shadow: 0 1px 3px rgba(0,0,0,0.5); }
        
        .header { padding: 18px; background: #000; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; z-index: 10; }
        .tabs { display: flex; overflow-x: auto; background: #000; border-bottom: 1px solid #222; scrollbar-width: none; }
        .tabs::-webkit-scrollbar { display: none; }
        .tab { padding: 15px 20px; font-size: 10px; font-weight: 900; color: #666; cursor: pointer; text-transform: uppercase; white-space: nowrap; border-bottom: 3px solid transparent; transition: 0.2s; }
        .tab.active { color: #fff; border-bottom: 3px solid var(--blue); }

        .content { flex: 1; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-bottom: 40px; }
        .section { display: none; flex-direction: column; gap: 12px; }
        .section.active { display: flex; }
        
        /* Aplica o Efeito Imã nas cartas quando a seção abre */
        .section.active .card { animation: springIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; opacity: 0; }
        .card { background: var(--card); border: 1px solid #222; padding: 18px; border-radius: 12px; }
        .c-title { font-size: 10px; color: #888; font-weight: 900; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; display: flex; justify-content: space-between; align-items: center;}
        
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .badge { background: #000; padding: 5px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; border: 1px solid #333; }
        .req-txt { font-size: 9px; color: var(--red); font-weight: bold; margin-top: 5px; }

        .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 4000; justify-content: center; align-items: center; flex-direction: column; padding: 30px; animation: springIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    </style>
</head>
<body>

    <div id="tela-novato" class="modal-overlay" style="background: var(--bg);">
        <i class="fas fa-building" style="font-size: 50px; color: var(--blue); margin-bottom: 20px;"></i>
        <h2 style="margin-bottom: 5px;">BEM-VINDO AO TYCOON</h2>
        <p style="color: #888; margin-bottom: 25px; font-size: 12px;">Funde seu império grátis.</p>
        <input type="text" id="reg-nome" class="input-novato" placeholder="Nome da Empresa">
        <select id="reg-tema" class="input-novato">
            <option value="gpus">⚙️ Indústria de Hardware</option>
            <option value="alimentos">🍔 Ramo de Alimentos</option>
        </select>
        <button class="btn" style="max-width: 400px; padding: 16px;" onclick="criarPrimeiraEmpresa()">FUNDAR IMPÉRIO</button>
    </div>

    <div id="app-main" style="display: none; height: 100%; flex-direction: column;">
        <div class="header">
            <b id="ui-nome" style="font-size: 15px;">EMPRESA</b>
            <div id="ui-saldo" style="color: var(--green); font-weight: 900; font-size: 14px;">R$ 0</div>
        </div>

        <div class="tabs">
            <div class="tab active" onclick="nav('painel')">PAINEL</div>
            <div class="tab" id="tab-proj" onclick="nav('projetos')">PROJETOS</div>
            <div class="tab" id="tab-mat" onclick="nav('materiais')">MATERIAIS</div>
            <div class="tab" id="tab-rh" onclick="nav('rh')">EQUIPE</div>
            <div class="tab" id="tab-maq" onclick="nav('maquinas')">MÁQUINAS</div>
            <div class="tab" onclick="nav('holding')">HOLDING</div>
        </div>

        <div class="content">
            <div class="section active" id="sec-painel">
                <div class="card" style="border-left: 5px solid var(--green); animation-delay: 0ms;">
                    <div class="c-title">CAIXA DA EMPRESA <button class="btn" style="width:auto; padding:8px 12px; margin:0;" onclick="openMod('investir')">INVESTIR R$</button></div>
                    <div style="font-size: 26px; font-weight: 900; color: var(--green);" id="ui-caixa">R$ 0</div>
                </div>

                <div class="card" style="border-left: 5px solid var(--blue); animation-delay: 50ms;">
                    <div class="c-title">PRODUÇÃO ATIVA</div>
                    <div id="ui-producao" style="font-family: monospace; font-size: 12px; font-weight: bold; background: #000; padding: 12px; border-radius: 8px;"></div>
                </div>
                
                <button class="btn" style="background: #ffc107; color: #000; padding: 16px; animation: springIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; animation-delay: 100ms; opacity:0;" onclick="exec('vender_estoque')"><i class="fas fa-truck"></i> VENDER ESTOQUE (LUCRO)</button>
            </div>

            <div class="section" id="sec-projetos"><div id="list-chips"></div></div>
            <div class="section" id="sec-holding"><div class="card"><div class="c-title">CORPORAÇÃO <button class="btn" style="width:auto; padding:8px; margin:0;" onclick="openMod('criar_empresa')">+ ABRIR CNPJ</button></div><div id="list-holding"></div></div></div>
            <div class="section" id="sec-materiais"><div class="grid-2" id="list-materiais"></div></div>
            <div class="section" id="sec-rh"><div id="list-rh"></div></div>
            <div class="section" id="sec-maquinas"><div id="list-maquinas"></div></div>
        </div>
    </div>

    <div class="modal-overlay" id="modal">
        <h2 id="m-title" style="margin-bottom: 20px;">AÇÃO</h2>
        <input type="text" id="m-input" class="input-novato" placeholder="Nome ou Valor">
        <select id="m-tema" class="input-novato" style="display:none;">
            <option value="gpus">⚙️ HARDWARE & GPUS</option>
            <option value="alimentos">🍔 ALIMENTOS & BEBIDAS</option>
        </select>
        <button class="btn" style="background:var(--blue); padding: 16px; margin-bottom:10px;" onclick="sendInput()">CONFIRMAR</button>
        <button class="btn" style="background:#222; padding: 16px;" onclick="document.getElementById('modal').style.display='none'">CANCELAR</button>
    </div>

    <script>
        const fmt = v => new Intl.NumberFormat('pt-BR').format(v||0);
        let mType = ''; let mArg = '';

        function nav(t) {
            document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
            document.querySelectorAll('.section').forEach(x => x.classList.remove('active'));
            event.currentTarget.classList.add('active');
            document.getElementById('sec-' + t).classList.add('active');
        }

        async function loop() {
            try {
                const r = await fetch('/api/empresa/info'); const d = await r.json();
                if (!d.hasCompany) { document.getElementById('tela-novato').style.display = 'flex'; return; }
                document.getElementById('tela-novato').style.display = 'none';
                document.getElementById('app-main').style.display = 'flex';
                if (d.empresa && d.bancoDados) render(d);
            } catch(e) {}
        }
        setInterval(loop, 2000); loop();

        function render(d) {
            const e = d.empresa; const db = d.bancoDados; const isComida = e.tema === 'alimentos';
            
            document.getElementById('ui-nome').innerText = (isComida ? '🍔 ' : '⚙️ ') + (e.nome || '').toUpperCase();
            document.getElementById('ui-saldo').innerText = '💳 R$ ' + fmt(d.saldoReal);
            document.getElementById('ui-caixa').innerText = 'R$ ' + fmt(e.caixa);
            document.getElementById('tab-proj').innerText = isComida ? 'CARDÁPIO' : 'PROJETOS';
            document.getElementById('tab-mat').innerText = isComida ? 'DESPENSA' : 'MATERIAIS';
            document.getElementById('tab-rh').innerText = isComida ? 'COZINHEIROS' : 'EQUIPE';
            document.getElementById('tab-maq').innerText = isComida ? 'EQUIPAMENTOS' : 'MÁQUINAS';

            let hProd = '';
            for(let k in (e.linhasAtivas || {})) {
                if(e.linhasAtivas[k] && db.chips[k]) {
                    
                    // Verificação de Requisitos Ao Vivo
                    let reqs = []; let statusProd = '<i class="fas fa-sync-alt fa-spin" style="color:var(--green); float:right;"></i>';
                    if(db.chips[k].reqUpg) db.chips[k].reqUpg.forEach(u => { if(!(e.upgrades||[]).includes(u)) reqs.push("Máquina"); });
                    if(db.chips[k].reqFunc) db.chips[k].reqFunc.forEach(f => { if(!(e.equipe[f]>0)) reqs.push("Equipe"); });
                    let matFalta = false; for(let m in db.chips[k].mats) if((e.materiais[m]||0) < db.chips[k].mats[m]) matFalta = true;
                    if(matFalta) reqs.push("Material");
                    
                    if(reqs.length > 0) statusProd = \`<span style="color:var(--red); font-size:10px; float:right;">ERRO: \${reqs.join(', ')}</span>\`;

                    hProd += \`<div style="margin-bottom:8px; border-bottom:1px solid #222; padding-bottom:8px;">> LINHA: <b>\${db.chips[k].nome}</b> \${statusProd}</div>\`;
                }
            }
            document.getElementById('ui-producao').innerHTML = hProd || '<div style="color:#555;">> Nenhuma ordem recebida...</div>';

            let hHold = '';
            (d.listaEmpresas || []).forEach((emp, i) => {
                let isA = d.empAtivaIndex === i;
                hHold += \`<div class="card" style="\${isA?'border-color:var(--green)':''}; animation-delay:\${i*40}ms;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <b style="color:\${isA?'var(--green)':'#fff'}; font-size:13px;">\${emp.tema==='alimentos'?'🍔':'⚙️'} \${emp.nome.toUpperCase()}</b>
                        <span class="badge">R$ \${fmt(emp.caixa)}</span>
                    </div>
                    \${isA ? '<div style="font-size:11px; color:var(--green); text-align:center; font-weight:900;">OPERANDO ATUALMENTE</div>' : \`<button class="btn" style="background:#222; margin-top:0;" onclick="exec('trocar_empresa', \${i}, '')">ASSUMIR</button>\`}
                </div>\`;
            });
            document.getElementById('list-holding').innerHTML = hHold;

            let hChips = ''; let delay = 0;
            for(let k in (db.chips || {})) {
                if((db.chips[k].tema || 'gpus') !== (e.tema || 'gpus')) continue;
                let isA = e.linhasAtivas && e.linhasAtivas[k];
                
                // Mostra requisitos na aba projetos
                let rqs = [];
                if(db.chips[k].reqUpg) db.chips[k].reqUpg.forEach(u => { if(!(e.upgrades||[]).includes(u)) rqs.push(db.upgrades[u]?.nome||"Máquina"); });
                if(db.chips[k].reqFunc) db.chips[k].reqFunc.forEach(f => { if(!(e.equipe[f]>0)) rqs.push(db.rh[f]?.nome||"Funcionário"); });
                let txtReq = rqs.length > 0 ? \`<div class="req-txt">FALTA: \${rqs.join(', ')}</div>\` : '';

                hChips += \`<div class="card" style="border-left: 5px solid \${isA?'var(--green)':'#222'}; animation-delay:\${delay}ms;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <b style="font-size: 13px;">\${db.chips[k].nome}</b> <span class="badge" style="color:var(--blue);">ESTOQUE: \${fmt(e.estoqueModelos && e.estoqueModelos[k] ? e.estoqueModelos[k] : 0)}</span>
                    </div>
                    \${txtReq}
                    <button class="btn" style="background:\${isA?'var(--red)':'var(--green)'}; color:\${isA?'#fff':'#000'};" onclick="exec('toggle_linha', 0, '\${k}')">\${isA?'PARAR PRODUÇÃO':'LIGAR MÁQUINAS'}</button>
                </div>\`; delay += 40;
            }
            document.getElementById('list-chips').innerHTML = hChips;

            let hMats = ''; delay = 0;
            for(let k in (db.materiais || {})) {
                if((db.materiais[k].tema || 'gpus') !== (e.tema || 'gpus')) continue;
                hMats += \`<div class="card" style="text-align:center; display:flex; flex-direction:column; animation-delay:\${delay}ms;">
                    <i class="\${db.materiais[k].icon}" style="color:\${db.materiais[k].cor}; font-size:26px; margin-bottom:10px;"></i>
                    <b style="font-size:11px; color:#ddd;">\${db.materiais[k].nome}</b>
                    <div style="font-weight:900; font-size:14px; margin:5px 0;">\${fmt(e.materiais && e.materiais[k] ? e.materiais[k] : 0)}<span style="font-size:9px; color:#888;">g</span></div>
                    <button class="btn" style="background:#222; font-size:10px; margin-top:auto;" onclick="openMod('comprar_mat', '\${k}')">COMPRAR</button>
                </div>\`; delay += 40;
            }
            document.getElementById('list-materiais').innerHTML = hMats;

            let hRH = ''; delay = 0;
            for(let k in (db.rh || {})) {
                if((db.rh[k].tema || 'gpus') !== (e.tema || 'gpus')) continue;
                let qtd = e.equipe && e.equipe[k] ? e.equipe[k] : 0;
                hRH += \`<div class="card" style="animation-delay:\${delay}ms;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                        <b style="font-size: 12px;"><i class="\${db.rh[k].icon}" style="color:#888;"></i> \${db.rh[k].nome}</b> <span class="badge" style="color:#fff; background:var(--blue);">\${qtd>0?'x'+qtd:'Nenhum'}</span>
                    </div>
                    <div style="font-size:10px; color:#666; font-weight:bold;">SALÁRIO: R$ \${fmt(db.rh[k].preco)}</div>
                    <button class="btn" onclick="exec('contratar', 0, '\${k}')">CONTRATAR</button>
                </div>\`; delay += 40;
            }
            document.getElementById('list-rh').innerHTML = hRH;

            let hMaq = ''; delay = 0;
            for(let k in (db.upgrades || {})) {
                if((db.upgrades[k].tema || 'gpus') !== (e.tema || 'gpus')) continue;
                let tem = (e.upgrades||[]).includes(k);
                hMaq += \`<div class="card" style="animation-delay:\${delay}ms;">
                    <b style="font-size: 13px;"><i class="\${db.upgrades[k].icon}" style="color:\${db.upgrades[k].cor};"></i> \${db.upgrades[k].nome}</b>
                    <div style="font-size:10px; color:#666; margin-top:5px; font-weight:bold;">PREÇO: R$ \${fmt(db.upgrades[k].preco)}</div>
                    <button class="btn" style="background:\${tem?'#111':'var(--blue)'}; color:\${tem?'#555':'#fff'};" \${tem?'disabled':''} onclick="exec('upgrade', 0, '\${k}')">\${tem?'INSTALADA':'COMPRAR MÁQUINA'}</button>
                </div>\`; delay += 40;
            }
            document.getElementById('list-maquinas').innerHTML = hMaq;
        }

        function openMod(t, arg='') { mType = t; mArg = arg; document.getElementById('modal').style.display='flex'; document.getElementById('m-tema').style.display = t === 'criar_empresa' ? 'block' : 'none'; let inp = document.getElementById('m-input'); inp.type = t === 'criar_empresa' ? 'text' : 'number'; inp.placeholder = t === 'criar_empresa' ? 'Nome' : 'Quantidade / Valor'; inp.value = ''; }
        async function sendInput() { const val = document.getElementById('m-input').value; const tema = document.getElementById('m-tema').value; await fetch('/api/empresa/acao', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({tipo: mType, valor: Number(val)||0, valStr: mType === 'criar_empresa' ? val : mArg, tema: tema}) }); document.getElementById('modal').style.display='none'; loop(); }
        async function exec(tipo, valor=0, valStr='') { await fetch('/api/empresa/acao', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({tipo, valor, valStr}) }); loop(); }
    </script>
</body>
</html>`;

fs.writeFileSync('./rotas_web/empresa.js', back);
fs.writeFileSync('./views/tycoon.html', front);
console.log("✅ AJUSTE FINO EXECUTADO! Interface magnética, botões responsivos e motor realista.");
