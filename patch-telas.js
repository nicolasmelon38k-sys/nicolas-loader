const fs = require('fs');

let webCode = fs.readFileSync('web.js', 'utf8');

// O mapa de todas as rotas visuais (HTML)
const htmlRoutes = `
// 🌐 MAPA DE TELAS (FRONT-END)
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.get('/register', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

const appsFront = [
    'os', 'perfil', 'ranking', 'chat', 'bank', 'store', 
    'gov', 'tigrinho', 'casino', 'imoveis', 'empregos', 
    'inventario', 'tycoon'
];

appsFront.forEach(appNome => {
    app.get(\`/\${appNome}\`, checkAuth, (req, res) => {
        const caminhoHtml = path.join(ROOT, \`views/\${appNome}.html\`);
        if (fs.existsSync(caminhoHtml)) {
            res.sendFile(caminhoHtml);
        } else {
            res.status(404).json({ success: false, msg: \`Erro: O arquivo \${appNome}.html não existe na pasta views!\` });
        }
    });
});
`;

// Injeta o mapa de telas logo antes da tela preta de erro
if (!webCode.includes('MAPA DE TELAS')) {
    webCode = webCode.replace("// 🚨 TELA PRETA (404) DEDURA O ERRO", htmlRoutes + "\n// 🚨 TELA PRETA (404) DEDURA O ERRO");
    fs.writeFileSync('web.js', webCode);
    console.log('✅ Pontes das telas construídas com sucesso!');
} else {
    console.log('⚠️ As pontes já estavam lá!');
}
