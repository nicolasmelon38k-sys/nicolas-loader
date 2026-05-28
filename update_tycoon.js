const fs = require('fs');
const path = require('path');

// ==========================================
// 1. REESCREVENDO O BACKEND DA EMPRESA (V2)
// ==========================================
const motorV2 = `module.exports = function(app, checkAuth, db, configWeb) {
    const path = require('path');

    app.get('/tycoon', checkAuth, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/tycoon.html'));
    });

    const rhDB = {
        "op_junior": { id: "op_junior", nome: "Operário Jr.", cargo: "Fábrica", preco: 500, reqLvl: 1, desc: "+5 Chips/min", buff_prod_flat: 5, icon: "fas fa-hard-hat" },
        "tec_pleno": { id: "tec_pleno", nome: "Técnico Pleno", cargo: "Otimização", preco: 2500, reqLvl: 2, desc: "+10% Produção", buff_prod_pct: 10, icon: "fas fa-wrench" },
        "log_junior": { id: "log_junior", nome: "Aux. Logística", cargo: "Estoque", preco: 1500, reqLvl: 2, desc: "+2.000 Estoque", buff_estoque: 2000, icon: "fas fa-box" },
        "eng_senior": { id: "eng_senior", nome: "Eng. Sênior", cargo: "Automação", preco: 8000, reqLvl: 4, desc: "+40 Chips/min", buff_prod_flat: 40, icon: "fas fa-laptop-code" },
        "ger_finan": { id: "ger_finan", nome: "Gerente Fin.", cargo: "Cortes", preco: 12000, reqLvl: 5, desc: "-5% Custos", buff_custo_pct: 5, icon: "fas fa-chart-line" }
    };

    const upgradesDB = {
        "galpao_1": { nome: "Galpão Nível 2", desc: "+5.000 Estoque Máx", preco: 15000, tipo: "estoque", valor: 5000, icon: "fas fa-warehouse", cor: "#0a84ff" },
        "galpao_2": { nome: "Centro Logístico", desc: "+25.000 Estoque Máx", preco: 80000, tipo: "estoque", valor: 25000, icon: "fas fa-truck-loading", cor: "#0a84ff" },
        "galpao_3": { nome: "Mega Armazém", desc: "+100.000 Estoque Máx", preco: 250000, tipo: "estoque", valor: 100000, icon: "fas fa-building", cor: "#0a84ff" },
        "auto_1": { nome: "Esteiras Rápidas", desc: "+20% Produção Global", preco: 25000, tipo: "prod_pct", valor: 20, icon: "fas fa-cogs", cor: "#ff9f0a" },
        "auto_2": { nome: "Braços Robóticos", desc: "+50% Produção Global", preco: 100000, tipo: "prod_pct", valor: 50, icon: "fas fa-robot", cor: "#ff9f0a" },
        "auto_3": { nome: "Fábrica Autônoma", desc: "+150% Produção Global", preco: 400000, tipo: "prod_pct", valor: 150, icon: "fas fa-industry", cor: "#ff9f0a" },
        "gestao_1": { nome: "Software ERP", desc: "-15% Custo Base", preco: 30000, tipo: "custo_pct", valor: 15, icon: "fas fa-server", cor: "#32d74b" },
        "gestao_2": { nome: "IA de Gestão", desc: "-30% Custo Base", preco: 120000, tipo: "custo_pct", valor: 30, icon: "fas fa-network-wired", cor: "#32d74b" },
        "venda_1": { nome: "Contratos B2B", desc: "+R$ 5 no Preço do Chip", preco: 50000, tipo: "venda_flat", valor: 5, icon: "fas fa-handshake", cor: "#bf5af2" },
        "venda_2": { nome: "Monopólio Global", desc: "+R$ 15 no Preço do Chip", preco: 200000, tipo: "venda_flat", valor: 15, icon: "fas fa-globe", cor: "#bf5af2" }
    };

    function registrarLog(empresa, acao, detalhe) {
        if (!empresa.logs) empresa.logs = [];
        empresa.logs.unshift({ data: Date.now(), acao, detalhe });
        if (empresa.logs.length > 20) empresa.logs.pop();
    }

    app.get('/api/empresa/info', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const user = db.obterUsuario(idLimpo);
        if (!user || !user.empresa) return res.json({ hasCompany: false });

        let emp = user.empresa;
        
        // MIGRACAO DA VERSAO 1 PRA VERSAO 2 (Protegendo seu save)
        if (Array.isArray(emp.funcionarios)) {
            emp.equipe = {};
            emp.funcionarios = null;
        }
        if (!emp.equipe) emp.equipe = {};
        if (!emp.upgrades) emp.upgrades = [];
        if (!emp.estoque) emp.estoque = { "Microchips": 0 };

        // MATEMÁTICA BASE
        let prodBase = 10 + (emp.nivel * 5);
        let estBase = 500 + (emp.nivel * 200);
        let custoBase = 45 + (emp.nivel * 2);

        let buffProdFlat = 0; let buffProdPct = 0; let buffEstoque = 0; let buffCustoPct = 0; let precoChip = 25;

        // MULTIPLICADORES DE RH (Aceita Vários Iguais)
        for (let fId in emp.equipe) {
            let qtd = emp.equipe[fId];
            let f = rhDB[fId];
            if (f) {
                if (f.buff_prod_flat) buffProdFlat += (f.buff_prod_flat * qtd);
                if (f.buff_prod_pct) buffProdPct += (f.buff_prod_pct * qtd);
                if (f.buff_estoque) buffEstoque += (f.buff_estoque * qtd);
                if (f.buff_custo_pct) buffCustoPct += (f.buff_custo_pct * qtd);
            }
        }

        // MULTIPLICADORES DE UPGRADES
        emp.upgrades.forEach(upgId => {
            let u = upgradesDB[upgId];
            if (u) {
                if (u.tipo === "estoque") buffEstoque += u.valor;
                if (u.tipo === "prod_pct") buffProdPct += u.valor;
                if (u.tipo === "custo_pct") buffCustoPct += u.valor;
                if (u.tipo === "venda_flat") precoChip += u.valor;
            }
        });

        if (buffCustoPct > 80) buffCustoPct = 80; // Máximo de 80% de desconto no custo

        // TOTAIS FINAIS
        let finalProd = Math.floor((prodBase + buffProdFlat) * (1 + (buffProdPct / 100)));
        let finalEstoque = estBase + buffEstoque;
        let finalCusto = Math.floor(custoBase * (1 - (buffCustoPct / 100)));

        // MOTOR AFK
        const agora = Date.now();
        const minPassados = Math.floor((agora - (emp.ultimaProducao || agora)) / 60000);
        
        if (minPassados >= 1) {
            let chipsGerados = finalProd * minPassados;
            let custoTotal = finalCusto * minPassados;

            if (emp.caixa >= custoTotal) {
                emp.caixa -= custoTotal;
                emp.custoAcumulado = (emp.custoAcumulado || 0) + custoTotal;
                emp.estoque["Microchips"] = Math.min((emp.estoque["Microchips"] || 0) + chipsGerados, finalEstoque);
            } else {
                registrarLog(emp, "CRISE", \`Produção parada por falta de caixa na manutenção.\`);
            }
            emp.ultimaProducao = agora;
            db.salvar(idLimpo, user);
        }

        res.json({ 
            hasCompany: true, 
            empresa: emp, 
            stats: { 
                finalProd, finalEstoque, finalCusto, precoChip, 
                baseInfo: { prodBase, estBase, custoBase, buffProdFlat, buffProdPct, buffCustoPct },
                rh: rhDB, upgrades: upgradesDB 
            } 
        });
    });

    app.post('/api/empresa/fundar', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        if (user.empresa) return res.json({ success: false, msg: "CNPJ já existente." });
        if (user.dinheiro < 2500) return res.json({ success: false, msg: "Requer R$ 2.500." });

        user.dinheiro -= 2500;
        user.empresa = {
            nome: req.body.nome || "Minha Empresa", nivel: 1, xp: 0, caixa: 5000,
            equipe: {}, estoque: { "Microchips": 0 }, upgrades: [], logs: [],
            lucroAcumulado: 0, custoAcumulado: 0, ultimaProducao: Date.now()
        };
        db.salvar(idLimpo, user);
        res.json({ success: true, msg: "Empresa fundada! R$ 5.000 injetados no caixa inicial." });
    });

    app.post('/api/empresa/contratar', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        if (!user.empresa) return res.json({ success: false });

        const { funcId } = req.body; const func = rhDB[funcId];
        if (!func) return res.json({ success: false, msg: "Profissional inválido." });
        if (user.empresa.nivel < func.reqLvl) return res.json({ success: false, msg: \`Requer Nível \${func.reqLvl}\` });

        if (user.empresa.caixa < func.preco) return res.json({ success: false, msg: \`Caixa insuficiente (R$ \${func.preco}).\` });

        user.empresa.caixa -= func.preco;
        user.empresa.equipe[funcId] = (user.empresa.equipe[funcId] || 0) + 1;
        registrarLog(user.empresa, "RH", \`Contratou +1 \${func.nome}\`);
        db.salvar(idLimpo, user);
        res.json({ success: true, msg: \`\${func.nome} adicionado à equipe!\` });
    });

    app.post('/api/empresa/comprar_upgrade', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        if (!user.empresa) return res.json({ success: false });

        const { upgId } = req.body; const upg = upgradesDB[upgId];
        if (!upg) return res.json({ success: false, msg: "Tecnologia inválida." });
        if (user.empresa.upgrades.includes(upgId)) return res.json({ success: false, msg: "Já instalada." });
        if (user.empresa.caixa < upg.preco) return res.json({ success: false, msg: \`Caixa insuficiente: R$ \${upg.preco}\` });

        user.empresa.caixa -= upg.preco;
        user.empresa.upgrades.push(upgId);
        registrarLog(user.empresa, "UPGRADE", \`Instalou: \${upg.nome}\`);
        db.salvar(idLimpo, user);
        res.json({ success: true, msg: \`Tecnologia \${upg.nome} ativada!\` });
    });

    app.post('/api/empresa/vender', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        if (!user.empresa) return res.json({ success: false });

        let chips = Math.floor(user.empresa.estoque["Microchips"] || 0);
        if (chips <= 0) return res.json({ success: false, msg: "Estoque vazio." });

        // Calcula o preço dinâmico baseado nos upgrades no momento da venda
        let precoChip = 25;
        user.empresa.upgrades.forEach(upgId => {
            let u = upgradesDB[upgId];
            if (u && u.tipo === "venda_flat") precoChip += u.valor;
        });

        let valorVenda = chips * precoChip;
        user.empresa.estoque["Microchips"] = 0;
        user.empresa.caixa += valorVenda;
        user.empresa.lucroAcumulado = (user.empresa.lucroAcumulado || 0) + valorVenda;

        user.empresa.xp = (user.empresa.xp || 0) + Math.max(1, Math.floor(chips / 15));
        let limXp = user.empresa.nivel * 100;
        if (user.empresa.xp >= limXp) {
            user.empresa.nivel += 1; user.empresa.xp -= limXp;
            registrarLog(user.empresa, "LEVEL UP", \`Alcançou Nível \${user.empresa.nivel}!\`);
        }

        registrarLog(user.empresa, "VENDA", \`Lote vendido por R$ \${valorVenda}.\`);
        db.salvar(idLimpo, user);
        res.json({ success: true, msg: \`Lote de \${chips} chips vendido por R$ \${valorVenda}!\` });
    });

    app.post('/api/empresa/recolher', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        let valor = Number(req.body.valor);
        if (isNaN(valor) || valor <= 0 || user.empresa.caixa < valor) return res.json({ success: false, msg: "Saque inválido." });

        let liquido = valor * 0.95;
        user.empresa.caixa -= valor;
        user.dinheiro = (user.dinheiro || 0) + liquido;
        registrarLog(user.empresa, "SAQUE", \`Sócio retirou R$ \${liquido.toFixed(2)}\`);
        db.salvar(idLimpo, user);
        res.json({ success: true, msg: \`Saque aprovado! R$ \${liquido.toFixed(2)} transferidos.\` });
    });
};`;

fs.writeFileSync('./rotas_web/empresa.js', motorV2);
console.log('✅ BACKEND V2 APLICADO: Matemática e múltiplos funcionários resolvidos!');

// ==========================================
// 2. CRIANDO A INTERFACE TYCOON (FRONTEND)
// ==========================================
const htmlTycoon = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>DaemonTech | V2</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root { --bg: #050505; --card: #121215; --gold: #ffd700; --green: #00ff88; --blue: #0a84ff; --red: #ff453a; --purple: #bf5af2; --text: #fff; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; -webkit-tap-highlight-color: transparent; }
        body { background: var(--bg); color: var(--text); height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
        
        .header { padding: 15px 20px; background: rgba(5,5,5,0.9); border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-weight: 900; font-size: 1.2rem; color: #fff; }
        .level-badge { background: var(--blue); color: #fff; padding: 5px 12px; border-radius: 12px; font-weight: 900; font-size: 12px; }

        .dash-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 15px; }
        .d-card { background: var(--card); border: 1px solid #222; border-radius: 15px; padding: 15px; }
        .d-label { font-size: 10px; color: #888; text-transform: uppercase; font-weight: 800; margin-bottom: 5px; }
        .d-val { font-size: 18px; font-weight: 900; }
        
        .prog-bg { width: 100%; height: 8px; background: #222; border-radius: 4px; margin-top: 8px; overflow: hidden; position: relative; }
        .prog-bar { height: 100%; background: var(--gold); transition: 0.5s; }

        .tabs { display: flex; gap: 5px; padding: 0 15px; border-bottom: 1px solid #222; }
        .tab { flex: 1; text-align: center; padding: 12px 5px; font-size: 12px; font-weight: bold; color: #666; cursor: pointer; border-bottom: 2px solid transparent; }
        .tab.active { color: #fff; border-bottom: 2px solid var(--blue); }

        .content { flex: 1; overflow-y: auto; padding: 15px; padding-bottom: 40px; }
        .section { display: none; flex-direction: column; gap: 12px; }
        .section.active { display: flex; }

        .item-card { background: var(--card); border: 1px solid #222; border-radius: 15px; padding: 15px; display: flex; align-items: center; gap: 12px; }
        .i-icon { width: 45px; height: 45px; border-radius: 12px; background: #1a1a20; display: grid; place-items: center; font-size: 20px; flex-shrink: 0; }
        .i-info { flex: 1; }
        .i-title { font-weight: 900; font-size: 14px; margin-bottom: 2px; }
        .i-desc { font-size: 10px; color: #888; }
        .i-badge { background: #222; color: #fff; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: bold; margin-left: 5px; }
        
        .btn { border: none; padding: 10px 15px; border-radius: 8px; font-weight: 900; font-size: 11px; cursor: pointer; text-transform: uppercase; color: #000; }
        .btn-buy { background: var(--blue); color: #fff; }
        .btn-sell { background: var(--gold); color: #000; width: 100%; padding: 15px; font-size: 14px; margin-top: 10px; box-shadow: 0 5px 15px rgba(255,215,0,0.2); }
        .btn-withdraw { background: var(--green); color: #000; width: 100%; padding: 15px; font-size: 14px; margin-top: 10px; }
        .btn-disabled { background: #222; color: #555; cursor: not-allowed; }

        .stat-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #222; }
        
        #toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%) translateY(100px); background: #fff; color: #000; padding: 10px 20px; border-radius: 20px; font-weight: 800; font-size: 12px; opacity: 0; transition: 0.3s; z-index: 1000; white-space: nowrap; }
        #toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
    </style>
</head>
<body>
    <header class="header">
        <a href="/os" style="color:#fff;"><i class="fa-solid fa-chevron-left"></i></a>
        <div class="logo" id="ui-nome">Empresa</div>
        <div class="level-badge" id="ui-nivel">LVL 1</div>
    </header>

    <div class="dash-cards">
        <div class="d-card">
            <div class="d-label">Caixa (CNPJ)</div>
            <div class="d-val" style="color: var(--green);" id="ui-caixa">R$ 0</div>
        </div>
        <div class="d-card">
            <div class="d-label">Lucro Líquido Real</div>
            <div class="d-val" style="color: var(--blue);" id="ui-lucro">R$ 0</div>
        </div>
        <div class="d-card" style="grid-column: span 2;">
            <div class="d-label" style="display:flex; justify-content:space-between;">
                <span>Estoque de Chips</span> <span id="ui-estoque-txt">0 / 0</span>
            </div>
            <div class="prog-bg"><div class="prog-bar" id="ui-estoque-bar"></div></div>
        </div>
    </div>

    <div class="tabs">
        <div class="tab active" onclick="switchTab('painel')">PAINEL</div>
        <div class="tab" onclick="switchTab('rh')">EQUIPE</div>
        <div class="tab" onclick="switchTab('tech')">UPGRADES</div>
    </div>

    <div class="content">
        <div class="section active" id="sec-painel">
            <div class="d-card">
                <div class="d-label" style="margin-bottom: 15px;"><i class="fas fa-microchip"></i> Motor de Produção (AFK)</div>
                <div class="stat-row"><span><i class="fas fa-arrow-up" style="color:var(--gold);"></i> Produção Final:</span> <b style="color:#fff;" id="s-prod">0 / min</b></div>
                <div class="stat-row"><span><i class="fas fa-arrow-down" style="color:var(--red);"></i> Custo Final:</span> <b style="color:#fff;" id="s-custo">R$ 0 / min</b></div>
                <div class="stat-row" style="border:none; padding:0; margin:0;"><span><i class="fas fa-tag" style="color:var(--purple);"></i> Preço de Venda:</span> <b style="color:#fff;" id="s-preco">R$ 0 / chip</b></div>
            </div>
            
            <button class="btn btn-sell" onclick="vender()"><i class="fas fa-truck-loading"></i> EXPORTAR ESTOQUE</button>
            <button class="btn btn-withdraw" onclick="sacar()"><i class="fas fa-wallet"></i> SACAR PARA CONTA FISICA</button>
            
            <div class="d-label" style="margin-top:20px;">Detalhes Matemáticos</div>
            <div class="d-card" style="background:transparent;">
                <div style="font-size:10px; color:#888; line-height:1.6;" id="ui-math">Carregando...</div>
            </div>
        </div>

        <div class="section" id="sec-rh">
            <div class="d-label" style="margin-bottom:5px;">Você pode contratar vários do mesmo cargo.</div>
            <div id="list-rh"></div>
        </div>

        <div class="section" id="sec-tech">
            <div id="list-tech"></div>
        </div>
    </div>

    <div id="toast">Aviso</div>

    <script>
        const fmt = v => new Intl.NumberFormat('pt-BR').format(v||0);
        let cache = null;

        function showMsg(m) { const t=document.getElementById('toast'); t.innerText=m; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3000); }
        function switchTab(t) { document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); document.querySelectorAll('.section').forEach(x=>x.classList.remove('active')); event.target.classList.add('active'); document.getElementById('sec-'+t).classList.add('active'); }

        async function sync() {
            try {
                const r = await fetch('/api/empresa/info'); const d = await r.json();
                if(!d.hasCompany) return document.body.innerHTML = '<div style="padding:40px;text-align:center;"><h2>Sem Empresa</h2><button class="btn btn-buy" style="margin-top:20px;" onclick="fundar()">Fundar R$ 2.500</button></div>';
                cache = d; render(d);
            } catch(e) {}
        }
        setInterval(sync, 2000); sync();

        function render(d) {
            const emp = d.empresa; const st = d.stats;
            document.getElementById('ui-nome').innerText = emp.nome;
            document.getElementById('ui-nivel').innerText = 'LVL ' + emp.nivel;
            document.getElementById('ui-caixa').innerText = 'R$ ' + fmt(emp.caixa);
            
            // Lucro Líquido Real = Tudo que ganhou vendendo - Tudo que gastou em manutenção AFK
            let lucroLiq = (emp.lucroAcumulado||0) - (emp.custoAcumulado||0);
            const lEl = document.getElementById('ui-lucro');
            lEl.innerText = 'R$ ' + fmt(lucroLiq);
            lEl.style.color = lucroLiq >= 0 ? 'var(--blue)' : 'var(--red)';

            // Barra de Estoque
            let ch = Math.floor(emp.estoque["Microchips"]||0);
            document.getElementById('ui-estoque-txt').innerText = fmt(ch) + ' / ' + fmt(st.finalEstoque);
            document.getElementById('ui-estoque-bar').style.width = Math.min(100, (ch/st.finalEstoque)*100) + '%';

            // Painel Stats
            document.getElementById('s-prod').innerText = fmt(st.finalProd) + ' / min';
            document.getElementById('s-custo').innerText = 'R$ ' + fmt(st.finalCusto) + ' / min';
            document.getElementById('s-preco').innerText = 'R$ ' + fmt(st.precoChip) + ' / chip';

            // Detalhe Matemático
            const b = st.baseInfo;
            document.getElementById('ui-math').innerHTML = 
                \`Produção: (Base \${b.prodBase} + Flat \${b.buffProdFlat}) x \${b.buffProdPct}%<br>\` +
                \`Manutenção: Base R$ \${b.custoBase} - \${b.buffCustoPct}% desconto\`;

            // RH
            let hRH = '';
            for(let id in st.rh) {
                let r = st.rh[id]; let qtd = emp.equipe[id]||0; let lck = emp.nivel < r.reqLvl;
                let btn = lck ? \`<button class="btn btn-disabled" disabled>LVL \${r.reqLvl}</button>\` : \`<button class="btn btn-buy" onclick="contratar('\${id}')">R$ \${fmt(r.preco)}</button>\`;
                hRH += \`<div class="item-card"><div class="i-icon"><i class="\${r.icon}" style="color:#fff;"></i></div><div class="i-info"><div class="i-title">\${r.nome} \${qtd>0?'<span class="i-badge">x'+qtd+'</span>':''}</div><div class="i-desc">\${r.desc}</div></div>\${btn}</div>\`;
            }
            document.getElementById('list-rh').innerHTML = hRH;

            // Upgrades
            let hUpg = '';
            for(let id in st.upgrades) {
                let u = st.upgrades[id]; let tem = emp.upgrades.includes(id);
                let btn = tem ? \`<button class="btn btn-disabled" disabled>INSTALADO</button>\` : \`<button class="btn btn-buy" style="background:\${u.cor};" onclick="upg('\${id}')">R$ \${fmt(u.preco)}</button>\`;
                hUpg += \`<div class="item-card"><div class="i-icon"><i class="\${u.icon}" style="color:\${u.cor};"></i></div><div class="i-info"><div class="i-title">\${u.nome}</div><div class="i-desc">\${u.desc}</div></div>\${btn}</div>\`;
            }
            document.getElementById('list-tech').innerHTML = hUpg;
        }

        async function fundar() { const r=await fetch('/api/empresa/fundar',{method:'POST'}); const d=await r.json(); showMsg(d.msg); sync(); window.location.reload(); }
        async function contratar(id) { const r=await fetch('/api/empresa/contratar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({funcId:id})}); const d=await r.json(); showMsg(d.msg||d.erro); sync(); }
        async function upg(id) { const r=await fetch('/api/empresa/comprar_upgrade',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({upgId:id})}); const d=await r.json(); showMsg(d.msg||d.erro); sync(); }
        async function vender() { const r=await fetch('/api/empresa/vender',{method:'POST'}); const d=await r.json(); showMsg(d.msg||d.erro); sync(); }
        
        async function sacar() {
            let v = prompt('Qual valor deseja sacar do Caixa para seu Bolso? (Taxa 5%)');
            if(!v || isNaN(v)) return;
            const r=await fetch('/api/empresa/recolher',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({valor:v})}); const d=await r.json(); showMsg(d.msg||d.erro); sync();
        }
    </script>
</body>
</html>`;

fs.writeFileSync('./views/tycoon.html', htmlTycoon);
console.log('✅ FRONTEND V2 APLICADO: Tela tycoon.html criada com sucesso!');

// ==========================================
// 3. ARRUMANDO O BOTÃO NO OS PRINCIPAL
// ==========================================
let os = fs.readFileSync('./views/os.html', 'utf8');
const regexAntigo = /<div class="app-item apple-btn-active" onclick="openEmpresa\(\)">([\s\S]*?)<\/div>/;
const botaoNovo = '<a href="/tycoon" class="app-item apple-btn-active">$1</a>';
if (os.match(regexAntigo)) {
    os = os.replace(regexAntigo, botaoNovo);
    fs.writeFileSync('./views/os.html', os);
    console.log('✅ LINK APLICADO: Botão da Empresa no OS agora leva para o Tycoon Oficial!');
} else {
    console.log('⚠️ Link do botão Empresa já estava arrumado ou não foi encontrado.');
}
