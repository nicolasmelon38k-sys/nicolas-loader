const fs = require('fs');

console.log("🚑 Iniciando resgate do servidor Web...");

// 1. ARRUMANDO O WEB.JS SEM APAGAR O SEU CÓDIGO DO YT-DLP
let webCode = fs.readFileSync('web.js', 'utf8');

// Injeta o Cookie Parser se não tiver
if (!webCode.includes('cookie-parser')) {
    webCode = webCode.replace("const { Server } = require('socket.io');", "const cookieParser = require('cookie-parser');\nconst { Server } = require('socket.io');");
    webCode = webCode.replace("app.use(express.json({ limit: '32kb' }));", "app.use(cookieParser());\napp.use(express.json({ limit: '32kb' }));");
}

// Remove as rotas de login defeituosas que estavam em loop
webCode = webCode.replace(/app\.post\('\/api\/auth'[\s\S]*?\}\);/g, "");
webCode = webCode.replace(/app\.post\('\/api\/login'[\s\S]*?\}\);/g, "");

// Cria o Guarda-Costas de verdade (CheckAuth)
const checkAuthStr = `
const checkAuth = (req, res, next) => {
  if (!req.cookies || !req.cookies.userId) {
    if (req.path.startsWith('/api/')) return res.json({ success: false, ok: false, msg: "Faça login!" });
    return res.redirect('/login');
  }
  next();
};`;

// Injeta a função de segurança
if (!webCode.includes('const checkAuth')) {
    webCode = webCode.replace("const rotasPath = path.join(ROOT, 'rotas_web');", checkAuthStr + "\n\nconst rotasPath = path.join(ROOT, 'rotas_web');");
}

// Conserta a injeção do middleware (Substitui o null pelo checkAuth)
webCode = webCode.replace(/require\(path\.join\(rotasPath, file\)\)\(app, null, db, configWeb\);/g, "require(path.join(rotasPath, file))(app, checkAuth, db, configWeb);");

fs.writeFileSync('web.js', webCode);
console.log("✅ web.js vacinado com Cookie-Parser e CheckAuth!");

// 2. RECRIANDO O ROTAS_WEB/SISTEMA.JS (SISTEMA DE BYPASS 100% FUNCIONAL)
if (!fs.existsSync('rotas_web')) fs.mkdirSync('rotas_web');

const sistemaRoute = `
const path = require('path');
module.exports = (app, checkAuth, db) => {
    
    // Rota que aceita login independente de como seu HTML antigo foi feito
    app.post(['/api/login', '/api/auth', '/api/register'], (req, res) => {
        // Puxa o número de onde quer que o HTML tenha mandado
        const input = req.body.id || req.body.email || req.body.numero || Object.values(req.body)[0];
        
        if (!input) return res.json({ success: false, ok: false, msg: "Digite seu número do WhatsApp para entrar!" });

        const idLimpo = db.normalizarId(String(input));
        let user = db.obterUsuario(idLimpo);

        // Se a conta não existe, ele já cria de brinde
        if (!user) db.registrar(idLimpo, "Usuário VIP");

        // GERA O COOKIE! A chave mestra que faltava 🍪
        res.cookie('userId', idLimpo, { maxAge: 86400000, httpOnly: true });
        
        return res.json({ success: true, ok: true, msg: "Logado com sucesso!" });
    });

    app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
    app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
    app.get('/os', checkAuth, (req, res) => res.sendFile(path.join(__dirname, '../views/os.html')));
};
`;
fs.writeFileSync('rotas_web/sistema.js', sistemaRoute);
console.log("✅ rotas_web/sistema.js reconfigurado e destrancado!");
console.log("🚀 Reparo concluído! Pressione 'node web' para reviver o servidor.");
