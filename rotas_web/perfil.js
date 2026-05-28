const path = require('path');
module.exports = (app, checkAuth, db) => {
    const limparId = (id) => (id || '').replace('@s.whatsapp.net', '');
    app.get('/perfil', checkAuth, (req, res) => res.sendFile(path.join(__dirname, '../views/perfil.html')));
    app.get('/ranking', checkAuth, (req, res) => res.sendFile(path.join(__dirname, '../views/ranking.html')));
    
    app.get('/api/user/profile', checkAuth, (req, res) => {
        const user = db.obterUsuario(limparId(req.cookies.userId));
        if (user) res.json({ success: true, user });
        else res.json({ success: false });
    });
};
