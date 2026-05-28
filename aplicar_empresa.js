const fs = require('fs');

// 1. LIMPANDO O WEB.JS (Tirando o conflito)
let web = fs.readFileSync('web.js', 'utf8');
const inicio = web.indexOf('// ==========================================\n// 🏢 MÓDULO EMPRESA');
const fim = web.indexOf('// Engine H.264');

if (inicio !== -1 && fim !== -1) {
    web = web.substring(0, inicio) + '\n' + web.substring(fim);
    fs.writeFileSync('web.js', web);
    console.log('✅ Conflito removido do web.js!');
}

// 2. RECRIANDO O MOTOR COMPLETO DA EMPRESA
const motorEmpresa = `module.exports = function(app, checkAuth, db, configWeb) {

    const rhDB = {
        "rafael": { id: "rafael", nome: "Rafael Nunes", cargo: "Assist. Operacional", salarioHora: 120, reqLvl: 1, desc: "+500 Estoque Máximo", buff_estoque: 500 },
        "lucas": { id: "lucas", nome: "Lucas Valente", cargo: "Téc. Produção", salarioHora: 250, reqLvl: 1, desc: "+10% Produção", buff_prod_pct: 10 },
        "marina": { id: "marina", nome: "Marina Alves", cargo: "Analista Financeira", salarioHora: 400, reqLvl: 3, desc: "-R$ 10 Custo/min", buff_custo_flat: 10 }
    };

    const upgradesDB = {
        "galpao_1": { id: "galpao_1", nome: "Galpão Nível 2", desc: "+5.000 de Estoque Máximo", preco: 15000, tipo: "estoque", valor: 5000, icon: "fas fa-warehouse", cor: "#0a84ff" },
        "automacao_1": { id: "automacao_1", nome: "Braços Robóticos", desc: "+25% Produção Global", preco: 30000, tipo: "prod_pct", valor: 25, icon: "fas fa-robot", cor: "#ff9f0a" },
        "rh_1": { id: "rh_1", nome: "IA de Gestão (RH)", desc: "-R$ 50 Custo Fixo/min", preco: 20000, tipo: "custo_flat", valor: 50, icon: "fas fa-network-wired", cor: "#32d74b" },
        "galpao_2": { id: "galpao_2", nome: "Centro Logístico", desc: "+25.000 de Estoque Máximo", preco: 80000, tipo: "estoque", valor: 25000, icon: "fas fa-truck-loading", cor: "#0a84ff" },
        "automacao_2": { id: "automacao_2", nome: "Fábrica Autônoma", desc: "+50% Produção Global", preco: 150000, tipo: "prod_pct", valor: 50, icon: "fas fa-industry", cor: "#ff9f0a" }
    };

    function registrarLog(empresa, acao, detalhe) {
        if (!empresa.logs) empresa.logs = [];
        empresa.logs.unshift({ data: Date.now(), acao, detalhe });
        if (empresa.logs.length > 30) empresa.logs.pop();
    }

    app.get('/api/empresa/info', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const user = db.obterUsuario(idLimpo);
        if (!user || !user.empresa) return res.json({ hasCompany: false });

        let emp = user.empresa;
        if (!emp.upgrades) emp.upgrades = [];
        if (!emp.funcionarios) emp.funcionarios = [];
        if (!emp.estoque) emp.estoque = { "Microchips": 0 };

        const agora = Date.now();
        const minutosPassados = Math.floor((agora - (emp.ultimaProducao || agora)) / 60000);

        // --- CÁLCULO DOS STATUS ---
        let prodPorMinuto = 10 + (emp.nivel * 5);
        let limiteEstoque = 500 + (emp.nivel * 200);
        let custoManutencaoMinuto = 45 + (emp.nivel * 2);
        let bonusProdMulti = 1.0;
        let descontoCusto = 0;

        // Buffs do RH
        emp.funcionarios.forEach(fId => {
            let f = rhDB[fId];
            if(f) {
                if(f.buff_estoque) limiteEstoque += f.buff_estoque;
                if(f.buff_prod_pct) bonusProdMulti += (f.buff_prod_pct / 100);
                if(f.buff_custo_flat) descontoCusto += f.buff_custo_flat;
            }
        });

        // Buffs dos Upgrades
        emp.upgrades.forEach(upgId => {
            let u = upgradesDB[upgId];
            if(u) {
                if(u.tipo === "estoque") limiteEstoque += u.valor;
                if(u.tipo === "prod_pct") bonusProdMulti += (u.valor / 100);
                if(u.tipo === "custo_flat") descontoCusto += u.valor;
            }
        });

        prodPorMinuto = Math.floor(prodPorMinuto * bonusProdMulti);
        custoManutencaoMinuto = Math.max(0, custoManutencaoMinuto - descontoCusto);

        // --- SISTEMA AFK ---
        if (minutosPassados >= 1) {
            let chipsGerados = prodPorMinuto * minutosPassados;
            let custoTotal = custoManutencaoMinuto * minutosPassados;

            if (emp.caixa >= custoTotal) {
                emp.caixa -= custoTotal;
                emp.custoAcumulado = (emp.custoAcumulado || 0) + custoTotal;
                emp.estoque["Microchips"] = Math.min((emp.estoque["Microchips"] || 0) + chipsGerados, limiteEstoque);
            } else {
                registrarLog(emp, "CRISE", \`Produção parada por falta de caixa para manutenção (\${minutosPassados} min).\`);
            }
            emp.ultimaProducao = agora;
            db.salvar(idLimpo, user);
        }

        res.json({ hasCompany: true, empresa: emp, stats: { prodPorMinuto, limiteEstoque, custoManutencaoMinuto, rh: rhDB, upgrades: upgradesDB } });
    });

    app.post('/api/empresa/fundar', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        if (user.empresa) return res.json({ success: false, msg: "Você já tem CNPJ ativo." });
        if (user.dinheiro < 2500) return res.json({ success: false, msg: "Precisa de R$ 2.500 na mão." });

        user.dinheiro -= 2500;
        user.empresa = {
            nome: req.body.nome || "DaemonTech", nivel: 1, xp: 0, caixa: 5000,
            estoque: { "Microchips": 0 }, funcionarios: [], upgrades: [], logs: [],
            lucroAcumulado: 0, custoAcumulado: 0, retiradoDono: 0, ultimaProducao: Date.now()
        };
        registrarLog(user.empresa, "FUNDAÇÃO", "Empresa aberta com sucesso!");
        db.salvar(idLimpo, user);
        res.json({ success: true, msg: "Empresa fundada! Você ganhou R$ 5.000 de caixa inicial." });
    });

    app.post('/api/empresa/contratar', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        if (!user.empresa) return res.json({ success: false, msg: "Sem empresa." });

        const funcId = req.body.funcId; const func = rhDB[funcId];
        if (!func) return res.json({ success: false, msg: "Profissional não existe." });
        if (user.empresa.nivel < func.reqLvl) return res.json({ success: false, msg: \`Requer empresa Nível \${func.reqLvl}\` });
        if (user.empresa.funcionarios.includes(funcId)) return res.json({ success: false, msg: "Já faz parte da equipe." });

        const custoContrato = func.salarioHora * 5;
        if (user.empresa.caixa < custoContrato) return res.json({ success: false, msg: \`Caixa insuficiente. Custa R$ \${custoContrato}\` });

        user.empresa.caixa -= custoContrato;
        user.empresa.funcionarios.push(funcId);
        registrarLog(user.empresa, "RH", \`Contratou: \${func.nome}\`);
        db.salvar(idLimpo, user);
        res.json({ success: true, msg: \`\${func.nome} assinou contrato!\` });
    });

    app.post('/api/empresa/comprar_upgrade', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        if (!user.empresa) return res.json({ success: false, msg: "Sem empresa." });

        const upgId = req.body.upgId; const upg = upgradesDB[upgId];
        if (!upg) return res.json({ success: false, msg: "Tecnologia não existe." });
        if (user.empresa.upgrades.includes(upgId)) return res.json({ success: false, msg: "Já instalada." });
        if (user.empresa.caixa < upg.preco) return res.json({ success: false, msg: \`Caixa insuficiente: R$ \${upg.preco}\` });

        user.empresa.caixa -= upg.preco;
        user.empresa.upgrades.push(upgId);
        registrarLog(user.empresa, "UPGRADE", \`Instalou: \${upg.nome}\`);
        db.salvar(idLimpo, user);
        res.json({ success: true, msg: \`Upgrade \${upg.nome} ativado!\` });
    });

    app.post('/api/empresa/vender', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        if (!user.empresa) return res.json({ success: false, msg: "Sem empresa." });

        let chips = Math.floor(user.empresa.estoque["Microchips"] || 0);
        if (chips <= 0) return res.json({ success: false, msg: "Seu armazém está vazio." });

        let valorVenda = chips * 25; // 25 reais por chip
        user.empresa.estoque["Microchips"] -= chips;
        user.empresa.caixa += valorVenda;
        user.empresa.lucroAcumulado = (user.empresa.lucroAcumulado || 0) + valorVenda;

        // XP e Level Up
        user.empresa.xp = (user.empresa.xp || 0) + Math.max(1, Math.floor(chips / 10));
        let limiteXp = user.empresa.nivel * 100;
        if (user.empresa.xp >= limiteXp) {
            user.empresa.nivel += 1; user.empresa.xp = 0;
            registrarLog(user.empresa, "LEVEL UP", \`Empresa alcançou o Nível \${user.empresa.nivel}!\`);
        }

        registrarLog(user.empresa, "VENDA", \`Exportou \${chips} und. Lucro: R$ \${valorVenda}\`);
        db.salvar(idLimpo, user);
        res.json({ success: true, msg: \`Lote vendido! R$ \${valorVenda} pro caixa.\` });
    });

    app.post('/api/empresa/recolher', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = db.obterUsuario(idLimpo);
        if (!user.empresa) return res.json({ success: false, msg: "Sem empresa." });

        let valor = Number(req.body.valor);
        if (isNaN(valor) || valor <= 0) return res.json({ success: false, msg: "Valor inválido." });
        if (user.empresa.caixa < valor) return res.json({ success: false, msg: "Caixa insuficiente." });

        let liquido = valor * 0.95; // 5% de taxa
        user.empresa.caixa -= valor;
        user.empresa.retiradoDono = (user.empresa.retiradoDono || 0) + liquido;
        user.dinheiro = (user.dinheiro || 0) + liquido;

        registrarLog(user.empresa, "SAQUE", \`Sócio retirou R$ \${liquido.toFixed(2)}.\`);
        db.salvar(idLimpo, user);
        res.json({ success: true, msg: \`Transferido R$ \${liquido.toFixed(2)} para sua carteira!\` });
    });
};`;

fs.writeFileSync('./rotas_web/empresa.js', motorEmpresa);
console.log('✅ rotas_web/empresa.js reconstruído com motor completo!');
