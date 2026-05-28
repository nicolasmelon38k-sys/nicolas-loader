const path = require('path');

module.exports = (app, checkAuth) => {

    const apps = [
        'perfil', 'ranking', 'chat', 'bank', 'store',
        'gov', 'tigrinho', 'casino', 'imoveis',
        'empregos', 'inventario', 'tycoon', 'peixes'
    ];

    apps.forEach(appNome => {
        app.get(`/${appNome}`, checkAuth, (req, res) => {
            res.sendFile(path.join(__dirname, `../views/${appNome}.html`));
        });
    });

};
