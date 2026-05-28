const path = require('path');
module.exports = (app, checkAuth, db, configWeb) => {
    const limparId = (id) => (id || '').replace('@s.whatsapp.net', '');
    app.get('/bank', checkAuth, (req, res) => res.sendFile(path.join(__dirname, '../views/bank.html')));

    app.get('/api/bank/info', checkAuth, (req, res) => {
        const user = db.obterUsuario(limparId(req.cookies.userId));
        if (!user) return res.json({ success: false });
        
        const cId = user.cartaoAtivo || "basico";
        const cartao = (configWeb && configWeb.tabelaCartoes) ? configWeb.tabelaCartoes[cId] : { nome: "Cartão Padrão", limite: 500 };
        const fatura = (user.faturas && user.faturas[cId]) ? user.faturas[cId] : 0;
        const bonus = (user.limitesBonus && user.limitesBonus[cId]) ? user.limitesBonus[cId] : 0;
        
        res.json({ 
            success: true, dinheiro: user.dinheiro || 0, banco: user.banco || 0, 
            pix: user.chavePix || "Não gerada", cartao: { nome: cartao.nome }, 
            fatura: fatura, limite: (cartao.limite + bonus) - fatura 
        });
    });

    app.post('/api/bank/action', checkAuth, (req, res) => {
        const database = db.ler();
        const user = database[limparId(req.cookies.userId)];
        const { acao, valor } = req.body;
        if (!user) return res.json({ success: false });

        if (acao === 'depositar') {
            if (user.dinheiro < valor) return res.json({ success: false, msg: "Carteira insuficiente!" });
            user.dinheiro -= valor; user.banco = (user.banco || 0) + valor;
        } else if (acao === 'sacar') {
            if ((user.banco || 0) < valor) return res.json({ success: false, msg: "Cofre insuficiente!" });
            user.banco -= valor; user.dinheiro = (user.dinheiro || 0) + valor;
        }
        db.gravar(database);
        res.json({ success: true, msg: "Transação confirmada!" });
    });

    app.post('/api/bank/pix', checkAuth, (req, res) => {
        const remetenteId = limparId(req.cookies.userId);
        const { chavePix, valor } = req.body;
        const database = db.ler();
        const remetente = database[remetenteId];

        if (!remetente || (remetente.banco || 0) < valor) return res.json({ success: false, msg: "Saldo bancário insuficiente para PIX." });

        let destinoId = Object.keys(database).find(k => database[k].chavePix === chavePix);
        if (!destinoId) return res.json({ success: false, msg: "Chave PIX inválida!" });
        if (destinoId === remetenteId) return res.json({ success: false, msg: "Não pode enviar PIX para você mesmo." });

        remetente.banco -= valor;
        database[destinoId].banco = (database[destinoId].banco || 0) + valor;
        db.gravar(database);
        res.json({ success: true, msg: `PIX transferido com sucesso!` });
    });
};
