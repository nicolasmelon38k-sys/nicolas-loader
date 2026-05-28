const fs = require('fs');
const path = require('path');
const chatPath = path.join(__dirname, '../chat.json');

if (!fs.existsSync(chatPath)) fs.writeFileSync(chatPath, JSON.stringify([]));

let usersTyping = {};

module.exports = (app, checkAuth, db) => {
    app.get('/chat', checkAuth, (req, res) => res.sendFile(path.join(__dirname, '../views/chat.html')));

    app.get('/api/chat/data', checkAuth, (req, res) => {
        try {
            const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
            const msgs = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
            const now = Date.now();
            const digitandoAgora = [];
            
            for (let id in usersTyping) {
                if (now - usersTyping[id].time < 3000) {
                    if (id !== userId) digitandoAgora.push(usersTyping[id].nome.split(' ')[0]);
                } else {
                    delete usersTyping[id];
                }
            }
            res.json({ success: true, messages: msgs, meuId: userId, digitando: digitandoAgora });
        } catch(e) { res.json({ success: false, messages: [] }); }
    });

    app.post('/api/chat/typing', checkAuth, (req, res) => {
        try {
            const database = db.ler();
            const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
            const user = database[userId];
            if (user) usersTyping[userId] = { nome: user.nome || "Alguém", time: Date.now() };
            res.json({ success: true });
        } catch(e) { res.json({ success: false }); }
    });

    app.post('/api/chat/send', checkAuth, (req, res) => {
        try {
            const { text, fontStyle, replyTo } = req.body;
            if (!text || text.trim() === '') return res.json({ success: false });

            const database = db.ler();
            const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
            const user = database[userId];
            if (!user) return res.json({ success: false });

            if(usersTyping[userId]) delete usersTyping[userId];
            const msgs = JSON.parse(fs.readFileSync(chatPath, 'utf8'));

            // Agora salva também a mensagem respondida, se tiver
            const newMsg = {
                id: userId,
                nome: user.nome || "Novato",
                texto: text,
                fontStyle: fontStyle || 'normal',
                hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                replyTo: replyTo || null 
            };

            msgs.push(newMsg);
            if(msgs.length > 200) msgs.shift();
            fs.writeFileSync(chatPath, JSON.stringify(msgs, null, 2));
            res.json({ success: true });
        } catch(e) { res.json({ success: false }); }
    });
};
