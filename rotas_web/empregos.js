const path = require('path');
const fs = require('fs');

// Todos os empregos com seus salários e XP (Exatamente como no seu bot)
const listaCargos = {
    // LEGAIS
    "Lixeiro": { lvl: 1, min: 400, max: 800, xp: 20, cat: "legal", icone: "🪠" },
    "Atendente": { lvl: 5, min: 700, max: 1400, xp: 25, cat: "legal", icone: "🛍️" },
    "Padeiro": { lvl: 12, min: 1800, max: 3200, xp: 35, cat: "legal", icone: "🥖" },
    "Motorista": { lvl: 20, min: 2500, max: 4800, xp: 45, cat: "legal", icone: "🚚" },
    "Jardineiro": { lvl: 28, min: 3800, max: 6200, xp: 55, cat: "legal", icone: "🌻" },
    "Mecânico": { lvl: 35, min: 5500, max: 8500, xp: 65, cat: "legal", icone: "🔧" },
    "Cozinheiro": { lvl: 45, min: 8000, max: 12000, xp: 80, cat: "legal", icone: "👨‍🍳" },
    "Professor": { lvl: 60, min: 12000, max: 18000, xp: 100, cat: "legal", icone: "📚" },
    "Enfermeiro": { lvl: 80, min: 18000, max: 28000, xp: 130, cat: "legal", icone: "🏥" },
    "Cientista": { lvl: 100, min: 35000, max: 55000, xp: 180, cat: "legal", icone: "🧬" },
    "Piloto de Avião": { lvl: 250, min: 60000, max: 100000, xp: 300, cat: "legal", icone: "✈️" },
    "Cirurgião Chefe": { lvl: 400, min: 200000, max: 400000, xp: 500, cat: "legal", icone: "🩺" },
    "Juiz Federal": { lvl: 800, min: 800000, max: 1500000, xp: 1200, cat: "legal", icone: "⚖️" },
    "CEO": { lvl: 2000, min: 6000000, max: 15000000, xp: 4000, cat: "legal", icone: "🏢" },

    // ILEGAIS
    "Pivete": { lvl: 8, min: 900, max: 2000, xp: 30, cat: "ilegal", icone: "🥷" },
    "Batedor": { lvl: 15, min: 1500, max: 3500, xp: 40, cat: "ilegal", icone: "👛" },
    "Vigia de Boca": { lvl: 25, min: 3000, max: 6000, xp: 60, cat: "ilegal", icone: "👀" },
    "Aviãozinho": { lvl: 35, min: 5500, max: 9000, xp: 80, cat: "ilegal", icone: "🚲" },
    "Clonador": { lvl: 50, min: 10000, max: 18000, xp: 110, cat: "ilegal", icone: "💳" },
    "Assaltante": { lvl: 70, min: 18000, max: 32000, xp: 150, cat: "ilegal", icone: "🔫" },
    "Hacker": { lvl: 85, min: 30000, max: 50000, xp: 200, cat: "ilegal", icone: "💻" },
    "Mercenário": { lvl: 110, min: 55000, max: 90000, xp: 280, cat: "ilegal", icone: "⚔️" },
    "Contrabandista": { lvl: 140, min: 90000, max: 160000, xp: 400, cat: "ilegal", icone: "📦" },
    "Dono de Morro": { lvl: 180, min: 250000, max: 500000, xp: 800, cat: "ilegal", icone: "👑" },
    "Barão do Pó": { lvl: 600, min: 500000, max: 900000, xp: 800, cat: "ilegal", icone: "❄️" },
    "Mafioso": { lvl: 1500, min: 3000000, max: 6000000, xp: 2500, cat: "ilegal", icone: "🕴️" },
    "Imperador do Crime": { lvl: 4000, min: 40000000, max: 100000000, xp: 15000, cat: "ilegal", icone: "🌍" },

    // UNDERGROUND
    "Entregador Sus": { lvl: 10, min: 1200, max: 2500, xp: 35, cat: "under", icone: "📦" },
    "Cobrador": { lvl: 18, min: 2200, max: 4200, xp: 50, cat: "under", icone: "💢" },
    "Segurança": { lvl: 30, min: 4500, max: 7800, xp: 75, cat: "under", icone: "🛡️" },
    "Job": { lvl: 40, min: 8000, max: 14000, xp: 110, cat: "under", icone: "✨" },
    "Agiota": { lvl: 55, min: 12000, max: 22000, xp: 160, cat: "under", icone: "💰" },
    "Gerente Cassino": { lvl: 75, min: 25000, max: 42000, xp: 220, cat: "under", icone: "🎰" },
    "Falsificador": { lvl: 95, min: 40000, max: 68000, xp: 300, cat: "under", icone: "📄" },
    "Informante": { lvl: 120, min: 75000, max: 120000, xp: 450, cat: "under", icone: "🕵️" },
    "Político": { lvl: 160, min: 180000, max: 350000, xp: 700, cat: "under", icone: "🏛️" },
    "Agente Sombra": { lvl: 200, min: 500000, max: 900000, xp: 1200, cat: "under", icone: "🌑" },
    "Prostituta": { lvl: 300, min: 150000, max: 300000, xp: 400, cat: "under", icone: "💄" },
    "Hacker de Elite": { lvl: 1000, min: 1500000, max: 3000000, xp: 1800, cat: "under", icone: "🕸️" },
    "Dono da Deep Web": { lvl: 3000, min: 15000000, max: 35000000, xp: 8000, cat: "under", icone: "🌌" }
};

module.exports = (app, checkAuth, db, configWeb) => {
    app.get('/empregos', checkAuth, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/empregos.html'));
    });

    // Puxa o status atual do jogador
    app.get('/api/empregos/status', checkAuth, (req, res) => {
        const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const dbPath = path.join(__dirname, '../database.json');
        try {
            let user = JSON.parse(fs.readFileSync(dbPath, 'utf8'))[userId];
            if (!user) return res.json({ success: false });
            
            res.json({
                success: true,
                dinheiro: user.dinheiro || 0,
                level: user.level || 1,
                xp: user.xp || 0,
                emprego: user.emprego || "Auxiliar Geral",
                ultimoTrabalho: user.ultimoTrabalho || 0,
                cargos: listaCargos
            });
        } catch(e) { res.json({ success: false }); }
    });

    // Processa Ações: Trabalhar, Pegar Cargo, Abandonar
    app.post('/api/empregos/acao', checkAuth, (req, res) => {
        const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const dbPath = path.join(__dirname, '../database.json');
        try {
            let bancoDados = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            let user = bancoDados[userId];
            if (!user) return res.json({ success: false });

            const acao = req.body.acao;
            const cargoReq = req.body.cargo;

            if (acao === 'pegar') {
                if (user.emprego && user.emprego !== "Auxiliar Geral" && user.emprego !== "Desempregado") {
                    return res.json({ success: false, erro: "Você já tem um emprego! Abandone-o primeiro." });
                }
                const infoCargo = listaCargos[cargoReq];
                if ((user.level || 1) < infoCargo.lvl) {
                    return res.json({ success: false, erro: `Level insuficiente. Requisito: ${infoCargo.lvl}` });
                }
                user.emprego = cargoReq;
            } 
            else if (acao === 'abandonar') {
                user.emprego = "Auxiliar Geral";
            } 
            else if (acao === 'trabalhar') {
                const agora = Date.now();
                const cooldown = 3 * 60 * 1000; // 5 Minutos
                if (agora - (user.ultimoTrabalho || 0) < cooldown) {
                    return res.json({ success: false, erro: "Você está cansado! Aguarde o tempo." });
                }

                let meuEmprego = user.emprego || "Lixeiro";
                if (!listaCargos[meuEmprego]) meuEmprego = "Lixeiro"; // Fallback
                
                const info = listaCargos[meuEmprego];
                const ganho = Math.floor(Math.random() * (info.max - info.min + 1)) + info.min;
                const xpGanha = info.xp;

                // Adiciona Grana
                user.dinheiro = (user.dinheiro || 0) + ganho;
                user.ultimoTrabalho = agora;

                // Sistema de Level Up Automático
                user.xp = (user.xp || 0) + xpGanha;
                user.level = user.level || 1;
                let xpNecessario = 100 * (user.level * user.level);
                let upou = false;

                while (user.xp >= xpNecessario) {
                    user.level++;
                    user.xp -= xpNecessario;
                    xpNecessario = 100 * (user.level * user.level);
                    upou = true;
                }

                fs.writeFileSync(dbPath, JSON.stringify(bancoDados, null, 2));
                return res.json({ success: true, ganho, xpGanha, upou, levelAtual: user.level, novoXP: user.xp });
            }

            fs.writeFileSync(dbPath, JSON.stringify(bancoDados, null, 2));
            res.json({ success: true, emprego: user.emprego });

        } catch(e) { res.json({ success: false }); }
    });
};
