const path = require('path');
module.exports = (app, checkAuth) => {
    app.get('/musica', checkAuth, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/music.html'));
    });
};
