module.exports = (app, checkAuth, db, configWeb) => {
    
    // Loja (Store)
    app.post('/api/comprar', checkAuth, (req, res) => {
        const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', ''); const { items, total, metodo } = req.body;
        const database = db.ler(); const user = database[userId];
        if (metodo === 'dinheiro') {
            if (user.dinheiro < total) return res.json({ success: false, msg: "Sem saldo!" });
            user.dinheiro -= total;
        } else if (metodo === 'aproximacao') {
            if (user.banco < total) return res.json({ success: false, msg: "Sem banco!" });
            user.banco -= total;
        } else {
            const c = user.cartaoAtivo || "basico";
            if (!user.faturas) user.faturas = {}; user.faturas[c] = (user.faturas[c] || 0) + total;
        }
        if (!user.inventario) user.inventario = [];
        items.forEach(it => { for(let i=0; i<it.qtd; i++) user.inventario.push(it.nome); });
        db.gravar(database); res.json({ success: true });
    });

    // Tigrinho
    app.post('/api/tigrinho/girar', checkAuth, (req, res) => {
        try {
            const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', ''); const { aposta, metodo } = req.body;
            const database = db.ler(); const user = database[userId];
            if (metodo === 'dinheiro') {
                if (user.dinheiro < aposta) return res.json({ success: false, msg: "Sem saldo!" });
                user.dinheiro -= aposta;
            } else {
                const c = user.cartaoAtivo || "basico";
                if(!user.faturas) user.faturas = {}; user.faturas[c] = (user.faturas[c] || 0) + aposta;
            }
            db.gravar(database);
            const items = ['🍊', '🏮', '🧨', '💰', '🧧', '🐯'];
            const mults = { '🍊': 1.5, '🏮': 2, '🧨': 3, '💰': 5, '🧧': 10, '🐯': 25 };
            let mult = 0, grid = [], sorte = Math.random() * 100;
            if (sorte < 20) {
                const sel = items[Math.floor(Math.random()*items.length)]; mult = mults[sel];
                if (Math.random() < 0.1) { mult *= 10; grid = Array(9).fill(sel); }
                else { grid = Array(9).fill(null).map(() => items[Math.floor(Math.random()*6)]); grid[3]=sel; grid[4]=sel; grid[5]=sel; }
            } else { grid = Array(9).fill(null).map(() => items[Math.floor(Math.random()*6)]); }
            const ganho = Math.floor(aposta * mult);
            user.dinheiro += ganho; db.gravar(database);
            res.json({ success: true, grid, ganho });
        } catch(e) { res.json({ success: false, msg: "Erro" }); }
    });

    // Cassino VIP
    app.post('/api/casino/girar', checkAuth, (req, res) => {
        try {
            const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
            const { aposta, metodo } = req.body;
            const database = db.ler();
            const user = database[userId];

            if (metodo === 'dinheiro') {
                if ((user.dinheiro || 0) < aposta) return res.json({ success: false, msg: "Saldo insuficiente!" });
                user.dinheiro -= aposta;
            } else {
                const cId = user.cartaoAtivo || "Nenhum";
                if (cId === "Nenhum" || !configWeb.tabelaCartoes[cId]) return res.json({ success: false, msg: "Nenhum cartão ativo!" });
                
                const limiteBase = configWeb.tabelaCartoes[cId].limite;
                const limiteBonus = (user.limitesBonus && user.limitesBonus[cId]) ? user.limitesBonus[cId] : 0;
                const faturaAtual = Number(user.faturas ? user.faturas[cId] : 0) || 0;
                
                if (aposta > ((limiteBase + limiteBonus) - faturaAtual)) return res.json({ success: false, msg: "Cartão recusado!" });
                
                if(!user.faturas) user.faturas = {};
                user.faturas[cId] = faturaAtual + aposta;
            }
            
            db.gravar(database);

            const emojis = ['🍒', '🍋', '🍉', '🍇', '🔔', '⭐', '💎', '7️⃣'];
            const chance = Math.random() * 100;
            let mult = 0;
            let finalSlots = [];

            if (chance < 2) { mult = 10; finalSlots = ['7️⃣', '7️⃣', '7️⃣']; }
            else if (chance < 10) { mult = 3; finalSlots = ['💎', '💎', '💎']; }
            else if (chance < 25) { mult = 2; const e = emojis[Math.floor(Math.random() * 4)]; finalSlots = [e, e, e]; }
            else if (chance < 45) {
                mult = 1;
                const e = emojis[Math.floor(Math.random() * emojis.length)];
                let e2 = emojis[Math.floor(Math.random() * emojis.length)];
                while(e === e2) e2 = emojis[Math.floor(Math.random() * emojis.length)];
                finalSlots = [e, e, e2].sort(() => Math.random() - 0.5);
            } else {
                mult = 0;
                while(finalSlots.length < 3) {
                    const e = emojis[Math.floor(Math.random() * emojis.length)];
                    if(!finalSlots.includes(e)) finalSlots.push(e);
                }
            }

            const ganho = aposta * mult;
            if (ganho > 0) {
                user.dinheiro += ganho;
                db.gravar(database);
            }

            res.json({ success: true, grid: finalSlots, ganho: ganho, mult: mult });
        } catch(e) { res.json({ success: false, msg: "Erro no cassino." }); }
    });
};
