const fs = require('fs');

// 1. FAXINA NO DATABASE
let db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
delete db["5548996669255"]; // Apaga a conta falsa
delete db[""]; // Apaga o bug do ID vazio

// Passa o acesso pra sua conta mestre
if(db["554896669255"]) {
    db["554896669255"].auth = {
        email: "negao1192@daemon.com",
        password: "negao122",
        verified: true
    };
}
fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));
console.log("✅ Banco de dados limpo! Sua conta mestre está com o email negao1192@daemon.com");

// 2. CORRIGINDO O FRONT-END (TIRANDO A REGRA DO 9)
let html = fs.readFileSync('./public/index.html', 'utf8');
html = html.replace(/\/\/ 🛑 VALIDAÇÃO EXIGIDA: CHECAGEM DE NÚMERO SEM O ÚLTIMO '9'[\s\S]*?\}\n            \}/, "// Validação do 9 removida para aceitar o formato exato do Baileys");
fs.writeFileSync('./public/index.html', html);
console.log("✅ Interface corrigida! Agora aceita qualquer formato numérico sem forçar o 9.");

// 3. O SISTEMA DE AUTENTICAÇÃO BLINDADO PRA TODOS OS 100 USUÁRIOS
const sistemaCode = `
const path = require('path');

module.exports = (app, checkAuth, db) => {
    app.post('/api/register', (req, res) => {
        let numeroRaw = req.body.numero || req.body.id;
        const { email, password } = req.body;

        if (!numeroRaw || !email || !password) return res.json({ success: false, msg: "Preencha número, email e senha!" });

        // Limpa tudo e deixa SÓ os números exatos que o cara digitou
        const idLimpo = String(numeroRaw).replace(/\\D/g, '');
        const database = db.ler();

        // Checa se o cara já existe no Zap
        if (database[idLimpo]) {
            // Se já tem email, não deixa roubar a conta
            if (database[idLimpo].auth && database[idLimpo].auth.email) {
                return res.json({ success: false, msg: "Esta conta já possui um email registrado. Faça login!" });
            }
        } else {
            // Se o cara for 100% novo (não tá nem no bot do zap ainda)
            database[idLimpo] = { nome: "Usuário Web", dinheiro: 0, level: 1, xp: 0 };
        }

        // Registra a segurança do cara
        database[idLimpo].auth = {
            email: email.trim().toLowerCase(),
            password: password,
            verified: true
        };
        
        db.gravar(database);

        res.cookie('userId', idLimpo, { maxAge: 86400000, httpOnly: true });
        return res.json({ success: true, ok: true, msg: "Conta blindada com sucesso!" });
    });

    app.post('/api/login', (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) return res.json({ success: false, msg: "Preencha email e senha!" });

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

        res.cookie('userId', loggedId, { maxAge: 86400000, httpOnly: true });
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
};
`;
fs.writeFileSync('./rotas_web/sistema.js', sistemaCode);
console.log("✅ Sistema de registro/login blindado e universalizado!");
