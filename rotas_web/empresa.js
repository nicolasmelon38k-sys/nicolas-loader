module.exports = function(app, checkAuth, db, configWeb) {
    const path = require('path');
    const getUser = db.obterUsuario || db.getUser;
    const saveUser = db.salvar || db.saveUser;

    const dbTycoon = {
        pacoes: {
            soro_supersoldado: { nome: "Soro Supersoldado", preco: 500000, duracao: 180, mult: 1000, desc: "1.000x Poder Total", icon: "fas fa-biohazard", cor: "#32d74b" },
            essencia_divina: { nome: "Essência Divina", preco: 1000000, duracao: 240, mult: 5000, desc: "5.000x Poder Total", icon: "fas fa-sun", cor: "#ff9f0a" },
            singularidade_daemon: { nome: "Singularidade Daemon", preco: 3000000, duracao: 300, mult: 25000, desc: "25.000x Poder Total", icon: "fas fa-vortex", cor: "#a100ff" },
            fogo_bravo: { nome: "Fogo Bravo", preco: 25000, duracao: 120, mult: 3, desc: "3x Produção", icon: "fas fa-fire", cor: "#ff4500" },
            bomba_gourmet: { nome: "Bomba Gourmet", preco: 75000, duracao: 180, mult: 8, desc: "8x Produção", icon: "fas fa-star", cor: "#ffd700" },
            energia_nitro: { nome: "Energia Nitro", preco: 150000, duracao: 240, mult: 15, desc: "15x Produção", icon: "fas fa-bolt", cor: "#00d4ff" }
        },

        rh: {
            drill_king: { nome: "Drill King", preco: 500000000, salarioMin: 600000000, max: 1, bonus: "200x Speed", icon: "fas fa-crown", tema: "alimentos" },
            master_chef: { nome: "Master Chef", preco: 15000000, salarioMin: 1000000, max: 3, bonus: "10x Speed", icon: "fas fa-utensils", tema: "alimentos" },
            agro_manager: { nome: "Gerente Agro", preco: 2000000, salarioMin: 200000, max: 5, bonus: "+20% Speed", icon: "fas fa-seedling", tema: "alimentos" },
            chef_exec: { nome: "Chef Executivo", preco: 85000, salarioMin: 3000, max: 10, bonus: "+10% Prod", icon: "fas fa-hat-chef", tema: "alimentos" },
            chapeiro: { nome: "Chapeiro", preco: 1500, salarioMin: 25, max: 20, bonus: "0% Aumento", icon: "fas fa-fire", tema: "alimentos" },

            quantum_eng: { nome: "Eng. Quântico", preco: 500000000, salarioMin: 600000000, max: 1, bonus: "200x Speed", icon: "fas fa-atom", tema: "gpus" },
            ia_architect: { nome: "Arquiteto de IA", preco: 15000000, salarioMin: 1000000, max: 3, bonus: "10x Speed", icon: "fas fa-brain", tema: "gpus" },
            chief_tech: { nome: "Chief Tech Officer", preco: 85000, salarioMin: 3000, max: 10, bonus: "+10% Prod", icon: "fas fa-user-tie", tema: "gpus" },
            op_jr: { nome: "Operário Jr", preco: 2500, salarioMin: 50, max: 20, icon: "fas fa-hard-hat", tema: "gpus" },
            tec_hw: { nome: "Téc. de Hardware", preco: 8000, salarioMin: 180, max: 20, icon: "fas fa-microchip", tema: "gpus" },

            mestre_churrasco: { nome: "Mestre do Churrasco", preco: 12000, salarioMin: 250, max: 8, bonus: "+15% Prod", icon: "fas fa-drumstick-bite", tema: "alimentos" },
            nutri_chef: { nome: "Nutri Chef", preco: 22000, salarioMin: 500, max: 6, bonus: "+12% Eficiência", icon: "fas fa-leaf", tema: "alimentos" },
            analista_logistica: { nome: "Analista de Logística", preco: 9000, salarioMin: 180, max: 10, bonus: "+8% Speed", icon: "fas fa-truck-fast", tema: "alimentos" },
            linha_tech: { nome: "Linha Tech", preco: 18000, salarioMin: 420, max: 6, bonus: "+12% Eficiência", icon: "fas fa-robot", tema: "gpus" },
            engenheiro_senior: { nome: "Engenheiro Sênior", preco: 55000, salarioMin: 1500, max: 4, bonus: "+20% Prod", icon: "fas fa-user-gear", tema: "gpus" }
        },

        materiais: {
            pao: { nome: "Pão Brioche", preco: 2, icon: "fas fa-burger", cor: "#e2b714", tema: "alimentos" },
            carne: { nome: "Hambúrguer 150g", preco: 5, icon: "fas fa-drumstick-bite", cor: "#8b4513", tema: "alimentos" },
            queijo: { nome: "Queijo Cheddar", preco: 4, icon: "fas fa-cheese", cor: "#ffc107", tema: "alimentos" },
            bacon: { nome: "Bacon Crispy", preco: 7, icon: "fas fa-bacon", cor: "#b22222", tema: "alimentos" },
            alface: { nome: "Alface Americana", preco: 1, icon: "fas fa-leaf", cor: "#4cd137", tema: "alimentos" },
            tomate: { nome: "Tomate Italiano", preco: 2, icon: "fas fa-circle", cor: "#e84118", tema: "alimentos" },
            picles: { nome: "Picles Agridoce", preco: 5, icon: "fas fa-seedling", cor: "#44bd32", tema: "alimentos" },
            cebola: { nome: "Cebola Caramelizada", preco: 6, icon: "fas fa-stroopwafel", cor: "#f39c12", tema: "alimentos" },
            molho_especial: { nome: "Molho Secreto", preco: 10, icon: "fas fa-fill-drip", cor: "#f1c40f", tema: "alimentos" },
            maio: { nome: "Maionese Artesanal", preco: 3, icon: "fas fa-egg", cor: "#f0ede5", tema: "alimentos" },

            gases_nobres: { nome: "Gases Nobres", preco: 50, icon: "fas fa-wind", cor: "#00d4ff", tema: "gpus" },
            ouro_liquido: { nome: "Ouro Líquido", preco: 100, icon: "fas fa-tint", cor: "#ffd700", tema: "gpus" },
            nanotubos: { nome: "Nanotubos de Carbono", preco: 15, icon: "fas fa-microscope", cor: "#555", tema: "gpus" },
            silicio: { nome: "Silício Puro", preco: 2, icon: "fas fa-cube", cor: "#aaa", tema: "gpus" },
            cobre: { nome: "Fios de Cobre", preco: 8, icon: "fas fa-bolt", cor: "#b87333", tema: "gpus" },

            ketchup_premium: { nome: "Ketchup Premium", preco: 4, icon: "fas fa-prescription-bottle", cor: "#cc0000", tema: "alimentos" },
            mostarda_dourada: { nome: "Mostarda Dourada", preco: 6, icon: "fas fa-vial", cor: "#ffd43b", tema: "alimentos" },
            carne_angus: { nome: "Carne Angus", preco: 9, icon: "fas fa-drumstick-bite", cor: "#7b3f00", tema: "alimentos" },
            queijo_artesanal: { nome: "Queijo Artesanal", preco: 8, icon: "fas fa-cheese", cor: "#ffcc33", tema: "alimentos" },
            cebola_roxa: { nome: "Cebola Roxa", preco: 3, icon: "fas fa-circle", cor: "#8e44ad", tema: "alimentos" },

            massa_termica: { nome: "Pasta Térmica", preco: 12, icon: "fas fa-temperature-high", cor: "#ff8c00", tema: "gpus" },
            fibra_carbono: { nome: "Fibra de Carbono", preco: 25, icon: "fas fa-braille", cor: "#333", tema: "gpus" },
            titanio: { nome: "Titânio Refino", preco: 40, icon: "fas fa-shield-halved", cor: "#9aa0a6", tema: "gpus" },
            wafer_silicio: { nome: "Wafer de Silício", preco: 15, icon: "fas fa-plate-wheat", cor: "#bbb", tema: "gpus" }
        },

        upgrades: {
            sistema_vacuo: { nome: "Sistema a Vácuo", preco: 1000000, icon: "fas fa-wind", cor: "#a100ff", tema: "alimentos" },
            chapa_industrial: { nome: "Chapa Industrial", preco: 50000, icon: "fas fa-industry", cor: "#555", tema: "alimentos" },
            turbo_cooler: { nome: "Turbo Cooler", preco: 40000, icon: "fas fa-snowflake", cor: "#00d4ff", tema: "alimentos" },
            chapa_vulcan: { nome: "Chapa Vulcan 3000", preco: 15000, icon: "fas fa-fire", cor: "#ff4500", tema: "alimentos" },
            fogao_inducao: { nome: "Fogão de Indução", preco: 25000, icon: "fas fa-bolt", cor: "#00d4ff", tema: "alimentos" },
            extrator_turbo: { nome: "Extrator Turbo", preco: 10000, icon: "fas fa-wind", cor: "#ffffff", tema: "alimentos" },
            chapa: { nome: "Chapa a Gás", preco: 2000, icon: "fas fa-fire", cor: "#ff9f0a", tema: "alimentos" },

            scanner_euv: { nome: "Scanner Litográfico EUV", preco: 1000000, icon: "fas fa-barcode", cor: "#a100ff", tema: "gpus" },
            sala_limpa_v10: { nome: "Sala Limpa V10", preco: 50000, icon: "fas fa-vial", cor: "#ffffff", tema: "gpus" },
            camara_vacuo: { nome: "Câmara de Vácuo", preco: 25000, icon: "fas fa-box-open", cor: "#aaa", tema: "gpus" },
            esteira: { nome: "Esteira Industrial", preco: 8000, icon: "fas fa-cogs", cor: "#ff9f0a", tema: "gpus" },
            prensa: { nome: "Prensa Precisão", preco: 15000, icon: "fas fa-compress-arrows-alt", cor: "#32d74b", tema: "gpus" },

            forno_duplo: { nome: "Forno Duplo", preco: 18000, icon: "fas fa-fire-flame-curved", cor: "#ff7b00", tema: "alimentos" },
            linha_automatica: { nome: "Linha Automática", preco: 22000, icon: "fas fa-gears", cor: "#00d4ff", tema: "alimentos" },
            nanofab: { nome: "NanoFab 2.0", preco: 75000, icon: "fas fa-microchip", cor: "#7c4dff", tema: "gpus" }
        },

        chips: {
            titan_drill: { nome: "Titan Drill Burger", mats: { pao: 10, carne: 10, queijo: 10, bacon: 10, cebola: 20, molho_especial: 20, maio: 20 }, reqFunc: ["drill_king"], reqUpg: ["sistema_vacuo"], preco: 8000, tema: "alimentos" },
            daemon_god: { nome: "Daemon God Burger", mats: { pao: 5, carne: 5, queijo: 5, bacon: 5, picles: 5, cebola: 5, molho_especial: 5 }, reqFunc: ["chef_exec"], reqUpg: ["chapa_vulcan"], preco: 4000, tema: "alimentos" },
            nuclear_burger: { nome: "Nuclear Burger", mats: { pao: 1, carne: 3, bacon: 5, queijo: 5, cebola: 10, molho_especial: 10 }, reqFunc: ["chef_exec"], reqUpg: ["chapa"], preco: 850, tema: "alimentos" },
            daemon_monster: { nome: "Daemon Monster", mats: { pao: 1, carne: 2, queijo: 3, bacon: 5, maio: 10 }, reqFunc: ["chef_exec"], reqUpg: ["chapa"], preco: 450, tema: "alimentos" },
            burguer_simples: { nome: "Hambúrguer", mats: { pao: 1, carne: 1 }, reqFunc: ["chapeiro"], reqUpg: ["chapa"], preco: 25, tema: "alimentos" },
            x_salada: { nome: "X-Salada", mats: { pao: 1, carne: 1, alface: 2, tomate: 2 }, reqFunc: ["chapeiro"], reqUpg: ["chapa"], preco: 45, tema: "alimentos" },
            onion_burger: { nome: "Onion Burger", mats: { pao: 1, carne: 1, queijo: 1, cebola: 5 }, reqFunc: ["chapeiro"], reqUpg: ["chapa"], preco: 95, tema: "alimentos" },
            big_daemon: { nome: "Big Daemon", mats: { pao: 2, carne: 2, picles: 3, alface: 2, molho_especial: 5 }, reqFunc: ["chapeiro"], reqUpg: ["chapa"], preco: 220, tema: "alimentos" },

            mega_burger: { nome: "Mega Burger", mats: { pao: 2, carne: 3, queijo: 2, bacon: 2, cebola_roxa: 3, ketchup_premium: 2 }, reqFunc: ["mestre_churrasco"], reqUpg: ["forno_duplo"], preco: 180, tema: "alimentos" },
            triplo_cheddar: { nome: "Triplo Cheddar", mats: { pao: 2, carne: 2, queijo: 4, mostarda_dourada: 2 }, reqFunc: ["nutri_chef"], reqUpg: ["linha_automatica"], preco: 240, tema: "alimentos" },
            royal_bacon: { nome: "Royal Bacon", mats: { pao: 2, carne: 2, bacon: 4, queijo_artesanal: 2, molho_especial: 2 }, reqFunc: ["analista_logistica"], reqUpg: ["chapa_industrial"], preco: 320, tema: "alimentos" },
            spicy_daemon: { nome: "Spicy Daemon", mats: { pao: 1, carne: 3, queijo: 2, cebola: 4, picles: 2, molho_especial: 4 }, reqFunc: ["chef_exec"], reqUpg: ["chapa_vulcan"], preco: 580, tema: "alimentos" },
            double_x: { nome: "Double X", mats: { pao: 1, carne: 2, alface: 3, tomate: 3, queijo: 2 }, reqFunc: ["analista_logistica"], reqUpg: ["turbo_cooler"], preco: 260, tema: "alimentos" },
            garden_deluxe: { nome: "Garden Deluxe", mats: { pao: 1, carne: 1, alface: 4, tomate: 4, picles: 2, cebola: 2 }, reqFunc: ["analista_logistica"], reqUpg: ["extrator_turbo"], preco: 210, tema: "alimentos" },
            volcano_stack: { nome: "Volcano Stack", mats: { pao: 3, carne: 4, bacon: 4, queijo: 3, cebola_roxa: 5, molho_especial: 5 }, reqFunc: ["mestre_churrasco"], reqUpg: ["forno_duplo"], preco: 760, tema: "alimentos" },
            turbo_smash: { nome: "Turbo Smash", mats: { pao: 2, carne: 3, queijo: 3, bacon: 3, maio: 3, ketchup_premium: 3 }, reqFunc: ["chef_exec"], reqUpg: ["sistema_vacuo"], preco: 920, tema: "alimentos" },
            bacon_blitz: { nome: "Bacon Blitz", mats: { pao: 2, carne: 2, bacon: 5, picles: 3, mostarda_dourada: 2 }, reqFunc: ["mestre_churrasco"], reqUpg: ["linha_automatica"], preco: 640, tema: "alimentos" },
            ultra_daemon: { nome: "Ultra Daemon", mats: { pao: 2, carne: 4, queijo: 4, bacon: 4, molho_especial: 6, mostarda_dourada: 2 }, reqFunc: ["chef_exec"], reqUpg: ["sistema_vacuo"], preco: 1200, tema: "alimentos" },

            quantum_chip: { nome: "Processador Quântico", mats: { silicio: 20, ouro_liquido: 10, gases_nobres: 50, nanotubos: 100 }, reqFunc: ["quantum_eng"], reqUpg: ["scanner_euv"], preco: 8500, tema: "gpus" },
            gpu_ai_ultra: { nome: "GPU IA Ultra (200GB)", mats: { silicio: 10, cobre: 20, ouro_liquido: 5, nanotubos: 20 }, reqFunc: ["ia_architect"], reqUpg: ["scanner_euv"], preco: 4500, tema: "gpus" },
            ddr6_ram: { nome: "Módulo RAM DDR6", mats: { silicio: 5, cobre: 10, gases_nobres: 2 }, reqFunc: ["tec_hw"], reqUpg: ["sala_limpa_v10"], preco: 450, tema: "gpus" },
            basic: { nome: "Transistor 100nm", mats: { silicio: 5 }, reqFunc: ["op_jr"], reqUpg: ["esteira"], preco: 45, tema: "gpus" },
            core_i5: { nome: "Core-i5 Basic", mats: { silicio: 15, cobre: 10 }, reqFunc: ["tec_hw"], reqUpg: ["prensa"], preco: 850, tema: "gpus" },

            quantum_x: { nome: "Quantum X Chip", mats: { silicio: 25, cobre: 20, titanio: 10, fibra_carbono: 15 }, reqFunc: ["engenheiro_senior"], reqUpg: ["nanofab"], preco: 3200, tema: "gpus" },
            ai_core_pro: { nome: "AI Core Pro", mats: { silicio: 18, ouro_liquido: 6, nanotubos: 30, massa_termica: 4 }, reqFunc: ["linha_tech"], reqUpg: ["scanner_euv"], preco: 5400, tema: "gpus" }
        }
    };

    function safeEmpresa(emp) {
        if (!emp) return null;
        emp.materiais = emp.materiais || {};
        emp.equipe = emp.equipe || {};
        emp.upgrades = emp.upgrades || [];
        emp.estoqueModelos = emp.estoqueModelos || {};
        emp.linhasAtivas = emp.linhasAtivas || {};
        emp.liveLogs = emp.liveLogs || [];
        emp.pacoesAtivas = emp.pacoesAtivas || [];
        emp.autoCompra = !!emp.autoCompra;
        emp.pausado = !!emp.pausado;
        emp.tema = emp.tema || 'alimentos';
        return emp;
    }

    app.get('/tycoon', checkAuth, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/tycoon.html'));
    });

    app.get('/api/empresa/info', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const user = getUser ? getUser(idLimpo) : null;

        if (!user || !user.empresas || user.empresas.length === 0) {
            return res.json({ hasCompany: false });
        }

        const idx = user.empresaAtiva || 0;
        let emp = safeEmpresa(user.empresas[idx]);
        if (!emp) return res.json({ hasCompany: false });

        const agora = Date.now();
        if (!emp.ultimaProducao) emp.ultimaProducao = agora;

        let segPassados = Math.floor((agora - emp.ultimaProducao) / 1000);
        if (segPassados > 60) segPassados = 60;

        let salarios = 0;
        for (const c in emp.equipe) salarios += (emp.equipe[c] || 0) * (dbTycoon.rh[c]?.salarioMin || 0);
        emp.custoMinuto = 500 + salarios;

        if (emp.pausado && emp.caixa > 0) {
            emp.pausado = false;
            emp.liveLogs.unshift({ t: new Date().toLocaleTimeString(), m: "✅ CAIXA RECUPERADO - PRODUÇÃO RETOMADA", c: "green" });
        }

        if (segPassados >= 1 && emp.pausado === false) {
            emp.ultimaProducao = agora;
            const desconto = (emp.custoMinuto / 60) * segPassados;

            if (emp.caixa >= desconto && emp.caixa > 0) {
                emp.caixa -= desconto;

                let gestores = 0;
                if (emp.tema === 'alimentos') gestores = (emp.equipe['chef_exec'] || 0);
                else if (emp.tema === 'gpus') gestores = (emp.equipe['chief_tech'] || 0);

                const upgs = emp.upgrades || [];

                let pocaoMult = 1;
                emp.pacoesAtivas = emp.pacoesAtivas.filter(p => p.fim > agora);
                emp.pacoesAtivas.forEach(p => { pocaoMult *= p.mult; });

                let bMaq = 0;
                if (upgs.includes('chapa_vulcan')) bMaq += 0.07;
                if (upgs.includes('fogao_inducao')) bMaq += 0.10;
                if (upgs.includes('extrator_turbo')) bMaq += 0.03;
                if (upgs.includes('chapa_industrial')) bMaq += 0.10;
                if (upgs.includes('turbo_cooler')) bMaq += 0.05;
                if (upgs.includes('sistema_vacuo')) bMaq += 0.19;
                if (upgs.includes('forno_duplo')) bMaq += 0.08;
                if (upgs.includes('linha_automatica')) bMaq += 0.12;
                if (upgs.includes('nanofab')) bMaq += 0.20;

                let bFuncMult = 1;
                if ((emp.equipe['agro_manager'] || 0) > 0) bFuncMult *= (1 + (emp.equipe['agro_manager'] * 0.20));
                if ((emp.equipe['master_chef'] || 0) > 0) bFuncMult *= (emp.equipe['master_chef'] * 10);
                if ((emp.equipe['drill_king'] || 0) > 0) bFuncMult *= (emp.equipe['drill_king'] * 200);
                if ((emp.equipe['mestre_churrasco'] || 0) > 0) bFuncMult *= (1 + (emp.equipe['mestre_churrasco'] * 0.15));
                if ((emp.equipe['nutri_chef'] || 0) > 0) bFuncMult *= (1 + (emp.equipe['nutri_chef'] * 0.12));
                if ((emp.equipe['analista_logistica'] || 0) > 0) bFuncMult *= (1 + (emp.equipe['analista_logistica'] * 0.08));
                if ((emp.equipe['linha_tech'] || 0) > 0) bFuncMult *= (1 + (emp.equipe['linha_tech'] * 0.12));
                if ((emp.equipe['engenheiro_senior'] || 0) > 0) bFuncMult *= (1 + (emp.equipe['engenheiro_senior'] * 0.20));

                const multiplicador = (1 + (gestores * 0.10) + bMaq) * pocaoMult * bFuncMult;

                let custoAutoS = 0;
                if (emp.autoCompra) {
                    for (const k in emp.linhasAtivas) {
                        if (emp.linhasAtivas[k] && dbTycoon.chips[k]) {
                            for (const m in dbTycoon.chips[k].mats) {
                                custoAutoS += (dbTycoon.chips[k].mats[m] * multiplicador) * (dbTycoon.materiais[m]?.preco || 0);
                            }
                        }
                    }
                }
                emp.custoAutoSegundo = custoAutoS;

                for (let i = 0; i < segPassados; i++) {
                    const feitoAgora = [];

                    for (const k in emp.linhasAtivas) {
                        if (!emp.linhasAtivas[k]) continue;

                        const proj = dbTycoon.chips[k];
                        if (!proj) continue;

                        let ok = true;
                        if (proj.reqUpg) proj.reqUpg.forEach(u => { if (!upgs.includes(u)) ok = false; });
                        if (proj.reqFunc) proj.reqFunc.forEach(f => { if (!(emp.equipe[f] > 0)) ok = false; });

                        if (ok) {
                            let temMat = true;
                            let custoA = 0;
                            const matC = {};

                            for (const m in proj.mats) {
                                const prec = (proj.mats[m] * multiplicador);
                                if ((emp.materiais[m] || 0) < prec) {
                                    temMat = false;
                                    const falta = prec - (emp.materiais[m] || 0);
                                    matC[m] = falta;
                                    custoA += falta * (dbTycoon.materiais[m]?.preco || 0);
                                }
                            }

                            if (!temMat && emp.autoCompra && emp.caixa >= custoA) {
                                emp.caixa -= custoA;
                                for (const m in matC) emp.materiais[m] = (emp.materiais[m] || 0) + matC[m];
                                temMat = true;
                            }

                            if (temMat) {
                                for (const m in proj.mats) emp.materiais[m] -= (proj.mats[m] * multiplicador);
                                emp.estoqueModelos[k] = (emp.estoqueModelos[k] || 0) + multiplicador;
                                if (i === 0) feitoAgora.push(multiplicador.toFixed(0) + "x " + proj.nome);
                            } else if (i === 0) {
                                emp.liveLogs.unshift({ t: new Date().toLocaleTimeString(), m: "⚠️ FALTA INSUMOS: " + proj.nome, c: "red" });
                            }
                        } else if (i === 0) {
                            emp.liveLogs.unshift({ t: new Date().toLocaleTimeString(), m: "🚫 REQUISITOS FALTANDO: " + proj.nome, c: "red" });
                        }
                    }

                    if (i === 0 && feitoAgora.length > 0) {
                        emp.liveLogs.unshift({ t: new Date().toLocaleTimeString(), m: "✅ FEITO: " + feitoAgora.join(" | "), c: "green" });
                    }
                }
            } else {
                emp.pausado = true;
                emp.liveLogs.unshift({ t: new Date().toLocaleTimeString(), m: "❌ FALÊNCIA - CAIXA ZERADO", c: "red" });
            }
        }

        if (emp.liveLogs.length > 6) emp.liveLogs = emp.liveLogs.slice(0, 6);
        saveUser(idLimpo, user);

        res.json({
            hasCompany: true,
            saldoReal: user.dinheiro || 0,
            empresa: emp,
            listaEmpresas: (user.empresas || []).map((e) => ({ nome: e.nome, tema: e.tema, caixa: e.caixa })),
            empAtivaIndex: user.empresaAtiva || 0,
            bancoDados: dbTycoon
        });
    });

    app.post('/api/empresa/acao', checkAuth, (req, res) => {
        const idLimpo = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        let user = getUser ? getUser(idLimpo) : null;
        if (!user) return res.json({ erro: "Usuário não encontrado!" });

        const { tipo, valor, valStr, tema, theme } = req.body;
        const temaFinal = tema || theme || 'alimentos';
        let emp = user.empresas ? safeEmpresa(user.empresas[user.empresaAtiva || 0]) : null;

        if (tipo === 'criar_empresa') {
            const custo = (!user.empresas || user.empresas.length === 0) ? 0 : 50000;
            if ((user.dinheiro || 0) < custo) return res.json({ erro: "Saldo insuficiente!" });

            user.dinheiro -= custo;
            if (!user.empresas) user.empresas = [];

            user.empresas.push({
                nome: valStr,
                tema: temaFinal,
                caixa: 0,
                materiais: {},
                equipe: {},
                upgrades: [],
                estoqueModelos: {},
                linhasAtivas: {},
                liveLogs: [],
                pausado: false,
                ultimaProducao: Date.now(),
                autoCompra: false,
                pacoesAtivas: []
            });

            user.empresaAtiva = user.empresas.length - 1;
        } else if (emp) {
            if (tipo === 'toggle_linha') emp.linhasAtivas[valStr] = !emp.linhasAtivas[valStr];
            else if (tipo === 'toggle_autocompra') emp.autoCompra = !emp.autoCompra;
            else if (tipo === 'investir') {
                if ((user.dinheiro || 0) >= valor) {
                    user.dinheiro -= valor;
                    emp.caixa += valor;
                    emp.pausado = false;
                } else return res.json({ erro: "Saldo real insuficiente!" });
            }
            else if (tipo === 'sacar_caixa') {
                if (emp.caixa >= valor) {
                    emp.caixa -= valor;
                    user.dinheiro = (user.dinheiro || 0) + valor;
                } else return res.json({ erro: "Caixa insuficiente!" });
            }
            else if (tipo === 'limpar_caixa') {
                emp.caixa = 0;
            }
            else if (tipo === 'comprar_mat') {
                const c = (dbTycoon.materiais[valStr]?.preco || 0) * valor;
                if (emp.caixa >= c) {
                    emp.caixa -= c;
                    emp.materiais[valStr] = (emp.materiais[valStr] || 0) + valor;
                } else return res.json({ erro: "Caixa insuficiente!" });
            }
            else if (tipo === 'demitir') {
                if ((emp.equipe[valStr] || 0) > 0) emp.equipe[valStr] -= 1;
            }
            else if (tipo === 'contratar') {
                const p = (dbTycoon.rh[valStr]?.preco || 0);
                const max = (dbTycoon.rh[valStr]?.max || 99);
                if (emp.caixa >= p && (emp.equipe[valStr] || 0) < max) {
                    emp.caixa -= p;
                    emp.equipe[valStr] = (emp.equipe[valStr] || 0) + 1;
                } else return res.json({ erro: "Caixa insuficiente ou limite atingido!" });
            }
            else if (tipo === 'upgrade') {
                const p = (dbTycoon.upgrades[valStr]?.preco || 0);
                if (emp.caixa >= p && !emp.upgrades.includes(valStr)) {
                    emp.caixa -= p;
                    emp.upgrades.push(valStr);
                } else return res.json({ erro: "Caixa insuficiente!" });
            }
            else if (tipo === 'comprar_pocao') {
                const p = dbTycoon.pacoes[valStr];
                if (!p) return res.json({ erro: "Poção inválida!" });
                if (emp.caixa >= p.preco) {
                    emp.caixa -= p.preco;
                    if (!emp.pacoesAtivas) emp.pacoesAtivas = [];
                    emp.pacoesAtivas.push({ id: valStr, nome: p.nome, mult: p.mult, fim: Date.now() + (p.duracao * 1000) });
                } else return res.json({ erro: "Caixa insuficiente!" });
            }
            else if (tipo === 'vender_estoque') {
                let totalDinheiro = 0;
                let totalItens = 0;
                const detalhes = [];

                for (const k in emp.estoqueModelos) {
                    const qtd = emp.estoqueModelos[k] || 0;
                    if (qtd > 0 && dbTycoon.chips[k]) {
                        const valorVenda = qtd * dbTycoon.chips[k].preco;
                        totalDinheiro += valorVenda;
                        totalItens += qtd;
                        detalhes.push(qtd.toFixed(0) + "x " + dbTycoon.chips[k].nome);
                        emp.estoqueModelos[k] = 0;
                    }
                }

                if (totalItens > 0) {
                    emp.caixa += totalDinheiro;
                    emp.pausado = false;
                    if (!emp.liveLogs) emp.liveLogs = [];
                    emp.liveLogs.unshift({
                        t: new Date().toLocaleTimeString(),
                        m: "💰 VENDA: R$ " + totalDinheiro.toLocaleString() + " | " + detalhes.join(" + "),
                        c: "blue"
                    });
                }
            }
        }

        saveUser(idLimpo, user);
        res.json({ success: true });
    });
};
