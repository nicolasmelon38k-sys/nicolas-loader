const path = require('path');

module.exports = (app, checkAuth, db, configWeb) => {
    app.get('/ranking', checkAuth, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/ranking.html'));
    });

    app.get('/api/ranking/global', checkAuth, (req, res) => {
        try {
            const dados = db.ler();
            const ids = Object.keys(dados);
            
            let listaRank = ids.map(id => ({
                nome: dados[id].nome || "Usuário",
                mensagens: dados[id].mensagens || 0,
                level: dados[id].level || 1,
                fortuna: (Number(dados[id].dinheiro) || 0) + (Number(dados[id].banco) || 0)
            }));

            listaRank.sort((a, b) => {
                if (b.mensagens !== a.mensagens) return b.mensagens - a.mensagens;
                return b.fortuna - a.fortuna;
            });

            res.json({ success: true, top10: listaRank.slice(0, 10) });
        } catch (e) {
            res.json({ success: false, top10: [] });
        }
    });
};
