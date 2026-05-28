const fs = require('fs');
const path = require('path');
const comPath = path.join(__dirname, '../comentarios.json');

if (!fs.existsSync(comPath)) fs.writeFileSync(comPath, JSON.stringify({}));

module.exports = (app, checkAuth, db, configWeb) => {
    
    app.get('/api/tiktok/feed', checkAuth, (req, res) => {
        try {
            const vPath = path.join(__dirname, '../public/videos');
            const files = fs.readdirSync(vPath).filter(f => f.startsWith('Tiktok') && f.endsWith('.mp4'));
            const comentarios = JSON.parse(fs.readFileSync(comPath, 'utf8'));

            const feed = files.map(file => {
                const vidId = file.replace('.mp4', '');
                return {
                    id: vidId,
                    url: `/videos/${file}`,
                    autor: '@kingvon_official',
                    desc: `Drill energy 👑🔥 #${vidId}`,
                    likes: "466.1K",
                    commentCount: (comentarios[vidId] || []).length
                };
            });
            res.json({ success: true, feed: feed });
        } catch (e) { res.json({ success: false, feed: [] }); }
    });

    app.get('/api/tiktok/comments/:id', checkAuth, (req, res) => {
        const comentarios = JSON.parse(fs.readFileSync(comPath, 'utf8'));
        res.json({ success: true, comments: comentarios[req.params.id] || [] });
    });

    app.post('/api/tiktok/comment/send', checkAuth, (req, res) => {
        const { vidId, texto, replyTo } = req.body;
        const database = db.ler();
        const user = database[(req.cookies.userId || '').replace('@s.whatsapp.net', '')];
        
        const comentarios = JSON.parse(fs.readFileSync(comPath, 'utf8'));
        if (!comentarios[vidId]) comentarios[vidId] = [];

        const novoComent = {
            id: Date.now().toString(),
            nome: user.nome || "Usuário",
            email: user.daemonEmail,
            texto: texto,
            timestamp: Date.now(), // AGORA SALVA O TEMPO REAL
            likes: 0,
            replies: []
        };

        if (replyTo) {
            // Função recursiva para achar o comentário pai mesmo se for resposta de resposta
            const findAndReply = (list) => {
                for (let c of list) {
                    if (c.id === replyTo) { c.replies.push(novoComent); return true; }
                    if (c.replies.length > 0) { if (findAndReply(c.replies)) return true; }
                }
                return false;
            };
            findAndReply(comentarios[vidId]);
        } else {
            comentarios[vidId].unshift(novoComent);
        }

        fs.writeFileSync(comPath, JSON.stringify(comentarios, null, 2));
        res.json({ success: true, total: comentarios[vidId].length });
    });
};
