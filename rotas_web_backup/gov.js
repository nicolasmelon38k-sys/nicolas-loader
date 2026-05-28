const path = require('path');
module.exports = (app, checkAuth, db) => {
    const limparId = (id) => (id || '').replace('@s.whatsapp.net', '');
    app.get('/gov', checkAuth, (req, res) => res.sendFile(path.join(__dirname, '../views/gov.html')));

    app.get('/api/gov/info', checkAuth, (req, res) => {
        const user = db.obterUsuario(limparId(req.cookies.userId));
        if (!user) return res.json({ success: false });
        res.json({ success: true, nome: user.nome || "Cidadão", cpf: user.cpf || "Não emitido" });
    });

    app.post('/api/gov/gerar', checkAuth, (req, res) => {
        const database = db.ler();
        const user = database[limparId(req.cookies.userId)];
        if (!user) return res.json({ success: false, msg: "Usuário não encontrado." });
        if (user.cpf && user.cpf !== "Não emitido") return res.json({ success: false, msg: "Você já possui CPF!" });

        const r = () => Math.floor(Math.random() * 900) + 100;
        const d = () => Math.floor(Math.random() * 90) + 10;
        user.cpf = `${r()}.${r()}.${r()}-${d()}`;
        db.gravar(database);
        res.json({ success: true, msg: `✅ CPF emitido com sucesso!` });
    });
};
