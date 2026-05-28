const fs = require('fs');

// 1. FAXINA DO LIXO RECENTE
let db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
delete db["5548996669255"];
delete db["555596676629"];
fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));

let code = fs.readFileSync('rotas_web/sistema.js', 'utf8');

const novoSistema = `
const path = require('path');

// Função cirúrgica para achar a conta certa no DB, independente de como o cara digitar o número
function acharContaPorNumero(numeroDigitado, database) {
    let limpo = String(numeroDigitado).replace(/\\D/g, ''); // Tira traços e espaços
    
    // Tenta achar exatamente o que foi digitado
    if (database[limpo]) return limpo;

    // Se o cara esqueceu o 55 do Brasil, a gente bota e testa
    if (!limpo.startsWith('55') && database['55' + limpo]) return '55' + limpo;

    // Se o cara botou o '9' a mais ou a menos no DDD (Ex: 55489 -> 5548)
    for (let id in database) {
        let idBase = id.replace(/^55/, ''); // Tira o 55 da conta do zap
        let limpoBase = limpo.replace(/^55/, ''); // Tira o 55 do que o cara digitou
        
        // Se a base do número for muito parecida (excluindo os 9 e DDD confusos), ele puxa a conta do Zap
        if (idBase.endsWith(limpoBase.slice(-8)) || limpoBase.endsWith(idBase.slice(-8))) {
            return id;
        }
    }
    
    // Se não achar nada, ele cria com o formato internacional travado
    return limpo.startsWith('55') ? limpo : '55' + limpo;
}

module.exports = (app, checkAuth, db) => {
    app.post('/api/register', (req, res) => {
        let numeroRaw = req.body.numero || req.body.id;
        const { email, password } = req.body;

        if (!numeroRaw || !email || !password) return res.json({ success: false, msg: "Preencha tudo!" });

        const database = db.ler();
        const idReal = acharContaPorNumero(numeroRaw, database);

        if (database[idReal]) {
            if (database[idReal].auth && database[idReal].auth.email) {
                return res.json({ success: false, msg: "Conta já registrada. Faça login!" });
            }
        } else {
            database[idReal] = { nome: "Usuário Web", dinheiro: 0, banco: 0, level: 1, xp: 0 };
        }

        database[idReal].auth = {
            email: email.trim().toLowerCase(),
            password: password,
            verified: true
        };

        db.gravar(database);

        // Sessão para 30 dias de vida (não desloga ao fechar)
        res.cookie('userId', idReal, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        return res.json({ success: true, ok: true, msg: "Conta blindada! Bem-vindo(a)." });
    });

    app.post('/api/login', (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) return res.json({ success: false, msg: "Preencha tudo!" });

        const searchEmail = email.trim().toLowerCase();
        const database = db.ler();
        let loggedId = null;

        for (const id in database) {
            const u = database[id];
            if (u.auth && u.auth.email === searchEmail && u.auth.password === password) {
                loggedId = id;
                break;
            }
        }

        if (!loggedId) return res.json({ success: false, msg: "Email ou senha incorretos!" });

        // Sessão para 30 dias de vida
        res.cookie('userId', loggedId, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        return res.json({ success: true, ok: true, msg: "Acesso Liberado!" });
    });

    app.get('/api/logout', (req, res) => {
        res.clearCookie('userId');
        res.redirect('/login');
    });

    app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
    app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
    app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
    app.get('/os', checkAuth, (req, res) => res.sendFile(path.join(__dirname, '../views/os.html')));
`;

// Injeta o novo motor substituindo até onde começa as rotas de Admin
const splitCode = code.split('// ======== SISTEMA GOD MODE / CONTROL ========');
if (splitCode.length === 2) {
    fs.writeFileSync('rotas_web/sistema.js', novoSistema + '\n// ======== SISTEMA GOD MODE / CONTROL ========\n' + splitCode[1]);
    console.log('✅ Motor de Fusão de Contas + Sessão de 30 dias ativado!');
} else {
    console.log('❌ O patch não conseguiu achar a rota do God Mode. Verifique o arquivo.');
}
