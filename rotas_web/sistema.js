const path = require('path');
const fs = require('fs');

function acharConta(numeroDigitado, database) {
    let limpo = String(numeroDigitado).replace(/\D/g, ''); 
    if (database[limpo]) return limpo;
    if (!limpo.startsWith('55') && database['55' + limpo]) return '55' + limpo;
    if (limpo.startsWith('55') && database[limpo.substring(2)]) return limpo.substring(2);
    
    for (let id in database) {
        let idB = id.replace(/^55/, '');
        let limpoB = limpo.replace(/^55/, '');
        if (idB === limpoB) return id;
        if (idB.length >= 8 && limpoB.length >= 8) {
            if (idB.endsWith(limpoB) || limpoB.endsWith(idB)) return id;
        }
    }
    return limpo;
}

const cookieConfig = { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, path: '/' };

function gerarCodigo() { return Math.random().toString(36).substring(2, 9).toUpperCase(); }

// Radar Avançado de Dispositivos
function resumirAparelho(userAgent) {
    if (!userAgent) return 'Dispositivo Oculto';
    const ua = userAgent.toLowerCase();
    if (ua.includes('samsung') || ua.includes('sm-')) return '📱 Samsung Galaxy';
    if (ua.includes('iphone')) return '🍎 Apple iPhone';
    if (ua.includes('ipad')) return '🍎 Apple iPad';
    if (ua.includes('moto')) return '📱 Motorola';
    if (ua.includes('xiaomi') || ua.includes('redmi') || ua.includes('poco')) return '📱 Xiaomi / Poco';
    if (ua.includes('windows')) return '💻 PC Windows';
    if (ua.includes('macintosh') || ua.includes('mac os')) return '💻 Mac / MacBook';
    if (ua.includes('linux') && !ua.includes('android')) return '🐧 PC Linux';
    return '📱 Celular / Dispositivo Não Mapeado';
}

module.exports = (app, checkAuth, db) => {
    
    app.post('/api/register', (req, res) => {
        let numeroRaw = req.body.numero || req.body.id;
        let { email, password, consent } = req.body;
        
        const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgentRaw = req.headers['user-agent'] || 'Desconhecido';
        const aparelhoNome = resumirAparelho(userAgentRaw);

        if (!numeroRaw || !email || !password) return res.json({ success: false, msg: "Preencha tudo!" });
        if (!consent) return res.json({ success: false, msg: "Acesso bloqueado sem permissão." });
        
        if(!email.endsWith('@daemon.com')) email = email.split('@')[0] + '@daemon.com';

        const database = db.ler();
        const idReal = acharConta(numeroRaw, database);

        if (database[idReal] && database[idReal].auth && database[idReal].auth.email) {
            console.log(`\n[🚨 ANTI-DUPLICATA] Tentativa de recriar conta!`);
            console.log(`  ↳ Alvo ID: ${idReal}`);
            console.log(`  ↳ IP do Invasor: ${userIP}`);
            console.log(`  ↳ Ficha Técnica: ${userAgentRaw}`);
            return res.json({ success: false, msg: "Conta já registrada." });
        }
        
        if (!database[idReal]) database[idReal] = { nome: "Usuário Web", dinheiro: 0, banco: 0, level: 1, xp: 0 };

        database[idReal].auth = {
            codigo: gerarCodigo(),
            email: email.trim().toLowerCase(),
            senha: password, 
            criadoEm: new Date().toLocaleString('pt-BR'), 
            ipMonitorado: userIP,
            dispositivo: userAgentRaw 
        };

        db.gravar(database);
        console.log(`\n[✅ NOVA IDENTIDADE] Conta Criada: ${email}`);
        console.log(`  ↳ IP Registrado: ${userIP}`);
        console.log(`  ↳ Dispositivo: ${aparelhoNome}`);
        console.log(`  ↳ Ficha Técnica: ${userAgentRaw}`);
        console.log(`  ↳ ID Zap Vinculado: ${idReal}`);

        res.cookie('userId', idReal, cookieConfig);
        return res.json({ success: true, ok: true, msg: "Identidade Criada!" });
    });

    app.post('/api/login', (req, res) => {
        let { email, password } = req.body;
        const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgentRaw = req.headers['user-agent'] || 'Desconhecido';
        const aparelhoNome = resumirAparelho(userAgentRaw);

        if (!email || !password) return res.json({ success: false, msg: "Preencha tudo." });
        
        if(!email.endsWith('@daemon.com')) email = email.split('@')[0] + '@daemon.com';
        const searchEmail = email.trim().toLowerCase();
        
        const database = db.ler();
        let loggedId = null;

        for (const id in database) {
            const u = database[id];
            if (u.auth && u.auth.email === searchEmail && u.auth.senha === password) {
                loggedId = id;
                break;
            }
        }

        if (!loggedId) {
            console.log(`\n[❌ BLOQUEADO] Erro de senha no email ${searchEmail}`);
            console.log(`  ↳ IP do Invasor: ${userIP}`);
            console.log(`  ↳ Dispositivo: ${aparelhoNome}`);
            console.log(`  ↳ Ficha Técnica: ${userAgentRaw}`);
            return res.json({ success: false, msg: "Credenciais inválidas." });
        }

        console.log(`\n[🟢 SESSÃO INICIADA] Conta: ${searchEmail}`);
        console.log(`  ↳ IP Conectado: ${userIP}`);
        console.log(`  ↳ Dispositivo: ${aparelhoNome}`);
        console.log(`  ↳ Ficha Técnica: ${userAgentRaw}`);
        console.log(`  ↳ Pertence ao ID Zap: ${loggedId}`);
        
        res.cookie('userId', loggedId, cookieConfig);
        return res.json({ success: true, ok: true, msg: "Conexão Estabelecida!" });
    });

    app.get('/api/logout', (req, res) => {
        res.clearCookie('userId');
        res.redirect('/login');
    });

    app.post('/api/monitor', checkAuth, (req, res) => {
        const { acao, detalhe } = req.body;
        if (!acao) return res.json({ success: false });

        const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const hora = new Date().toLocaleString('pt-BR');

        const logLine = `[${hora}] IP: ${userIP} | ID: ${userId} | AÇÃO: ${acao} | DETALHE: ${detalhe || 'N/A'}\n`;
        fs.appendFile(path.join(__dirname, '../monitoramento.txt'), logLine, (err) => {});
        res.json({ success: true });
    });

    app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
    app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
    app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
    app.get('/os', checkAuth, (req, res) => res.sendFile(path.join(__dirname, '../views/os.html')));

    // ======== SISTEMA GOD MODE ========
    const checkAdmin = (req, res, next) => {
        const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        if (userId !== '554896669255') return res.status(403).json({ success: false, msg: 'Acesso negado.' });
        next();
    };

    app.get('/api/admin/users', checkAuth, checkAdmin, (req, res) => { res.json(db.ler()); });

    app.post('/api/admin/action', checkAuth, checkAdmin, (req, res) => {
        const { targetId, action, amount } = req.body;
        const val = Number(amount);
        if (!targetId || !action || isNaN(val)) return res.json({ success: false, msg: 'Dados inválidos' });

        const database = db.ler();
        if (!database[targetId]) return res.json({ success: false, msg: 'Usuário não encontrado' });

        if (action === 'add_money') database[targetId].dinheiro = (database[targetId].dinheiro || 0) + val;
        if (action === 'rem_money') database[targetId].dinheiro = Math.max(0, (database[targetId].dinheiro || 0) - val);
        if (action === 'set_level') database[targetId].level = val;
        if (action === 'rem_level') database[targetId].level = Math.max(1, (database[targetId].level || 1) - val);
        if (action === 'add_banco') database[targetId].banco = (database[targetId].banco || 0) + val;
        if (action === 'rem_banco') database[targetId].banco = Math.max(0, (database[targetId].banco || 0) - val);

        db.gravar(database);
        res.json({ success: true, msg: 'Diretriz Executada!' });
    });
};
