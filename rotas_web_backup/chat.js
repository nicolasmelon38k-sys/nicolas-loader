const fs = require('fs');
const path = require('path');
const chatPath = path.join(__dirname, '../chat.json');

if (!fs.existsSync(chatPath)) fs.writeFileSync(chatPath, JSON.stringify([]));

// Memória RAM temporária para ver quem está digitando
let usersTyping = {};

module.exports = (app, checkAuth, db, configWeb) => {
    
    app.get('/chat', checkAuth, (req, res) => res.sendFile(path.join(__dirname, '../views/chat.html')));

    // API: Puxa mensagens e quem tá digitando
    app.get('/api/chat/data', checkAuth, (req, res) => {
        try {
            const database = db.ler();
            const me = database[(req.cookies.userId || '').replace('@s.whatsapp.net', '')];
            const msgs = JSON.parse(fs.readFileSync(chatPath, 'utf8'));

            // Limpa quem parou de digitar (timeout de 3 segundos)
            const now = Date.now();
            const digitandoAgora = [];
            for (let email in usersTyping) {
                if (now - usersTyping[email].time < 3000) {
                    // Não mostra pra mim mesmo que eu estou digitando
                    if (me && email !== me.daemonEmail) {
                        digitandoAgora.push(usersTyping[email].nome.split(' ')[0]); // Pega só o primeiro nome
                    }
                } else {
                    delete usersTyping[email];
                }
            }

            res.json({ success: true, messages: msgs, meuEmail: me ? me.daemonEmail : '', digitando: digitandoAgora });
        } catch(e) { res.json({ success: false, messages: [] }); }
    });

    // API: Recebe aviso de que o cara encostou no teclado
    app.post('/api/chat/typing', checkAuth, (req, res) => {
        try {
            const database = db.ler();
            const user = database[(req.cookies.userId || '').replace('@s.whatsapp.net', '')];
            if (user && user.daemonEmail) {
                usersTyping[user.daemonEmail] = { nome: user.nome || "Alguém", time: Date.now() };
            }
            res.json({ success: true });
        } catch(e) { res.json({ success: false }); }
    });

    // API: Envia a mensagem final
    app.post('/api/chat/send', checkAuth, (req, res) => {
        try {
            const { text, fontStyle } = req.body;
            if (!text || text.trim() === '') return res.json({ success: false });

            const database = db.ler();
            const user = database[(req.cookies.userId || '').replace('@s.whatsapp.net', '')];
            if (!user) return res.json({ success: false });

            // Apaga o "digitando" já que ele mandou a mensagem
            if(usersTyping[user.daemonEmail]) delete usersTyping[user.daemonEmail];

            const msgs = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
            
            const newMsg = {
                nome: user.nome || "Anônimo",
                email: user.daemonEmail || "usuario@daemon.com",
                texto: text,
                fontStyle: fontStyle || 'normal',
                hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            };

            msgs.push(newMsg);
            if(msgs.length > 150) msgs.shift();
            fs.writeFileSync(chatPath, JSON.stringify(msgs, null, 2));
            
            res.json({ success: true });
        } catch(e) { res.json({ success: false }); }
    });
};
