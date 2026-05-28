module.exports = (app, checkAuth, db, configWeb) => {
    
    app.get('/store', checkAuth, (req, res) => {
        const path = require('path');
        res.sendFile(path.join(__dirname, '../views/store.html'));
    });

    // API para o site saber o saldo do usuário
    app.get('/api/user/finance', checkAuth, (req, res) => {
        const database = db.ler();
        const user = database[(req.cookies.userId || '').replace('@s.whatsapp.net', '')];
        if (!user) return res.json({ success: false });

        const cId = user.cartaoAtivo || "basico";
        const cartao = configWeb.tabelaCartoes[cId];
        const fatura = (user.faturas && user.faturas[cId]) ? user.faturas[cId] : 0;
        const limiteExtra = (user.limitesBonus && user.limitesBonus[cId]) ? user.limitesBonus[cId] : 0;

        res.json({
            success: true,
            dinheiro: user.dinheiro || 0,
            banco: user.banco || 0,
            limiteDisponivel: (cartao.limite + limiteExtra) - fatura
        });
    });

    app.post('/api/loja/comprar', checkAuth, (req, res) => {
        try {
            const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
            const { cart, total, metodo } = req.body;
            const database = db.ler();
            const user = database[userId];

            if (!user) return res.json({ success: false, msg: "Usuário não identificado." });

            if (metodo === 'dinheiro') {
                if ((user.dinheiro || 0) < total) return res.json({ success: false, msg: "Sem grana na carteira!" });
                user.dinheiro -= total;
            } else if (metodo === 'banco') {
                if ((user.banco || 0) < total) return res.json({ success: false, msg: "Saldo bancário insuficiente!" });
                user.banco -= total;
            } else if (metodo === 'credito') {
                const cId = user.cartaoAtivo || "basico";
                const cartao = configWeb.tabelaCartoes[cId];
                const faturaAtual = (user.faturas && user.faturas[cId]) ? user.faturas[cId] : 0;
                const limiteBonus = (user.limitesBonus && user.limitesBonus[cId]) ? user.limitesBonus[cId] : 0;
                
                if (total > ((cartao.limite + limiteBonus) - faturaAtual)) {
                    return res.json({ success: false, msg: "Cartão sem limite!" });
                }
                if (!user.faturas) user.faturas = {};
                user.faturas[cId] = faturaAtual + total;
            }

            if (!user.inventario) user.inventario = [];
            cart.forEach(item => {
                for(let i=0; i < item.qtd; i++) { user.inventario.push(item.nome); }
            });

            db.gravar(database);
            res.json({ success: true, msg: "Compra realizada!", novoSaldo: user.dinheiro });
        } catch (e) { res.json({ success: false, msg: "Erro no processamento." }); }
    });
};
