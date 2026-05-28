const path = require('path');

module.exports = (app, checkAuth, db) => {

    // LOGIN SIMPLES (SEM SENHA)
    app.post('/api/login', (req, res) => {
        const { id } = req.body;

        const idLimpo = db.normalizarId(id);
        const user = db.obterUsuario(idLimpo);

        if (!user) {
            return res.status(404).json({ erro: 'ID não existe no sistema!' });
        }

        res.cookie('userId', idLimpo, {
            maxAge: 86400000,
            httpOnly: true
        });

        return res.json({ ok: true });
    });

    // AUTO CRIAR USUÁRIO SE NÃO EXISTIR
    app.post('/api/register', (req, res) => {
        const { id } = req.body;

        const idLimpo = db.normalizarId(id);
        let user = db.obterUsuario(idLimpo);

        if (!user) {
            db.salvar(idLimpo, {
                nome: 'Usuário',
                dinheiro: 0,
                level: 1,
                xp: 0
            });
        }

        res.cookie('userId', idLimpo, {
            maxAge: 86400000,
            httpOnly: true
        });

        return res.json({ ok: true });
    });

    app.get('/', (req, res) => {
        return res.sendFile(path.join(__dirname, '../views/login.html'));
    });

    app.get('/os', checkAuth, (req, res) => {
        return res.sendFile(path.join(__dirname, '../views/os.html'));
    });

};
