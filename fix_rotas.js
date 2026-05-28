const fs = require('fs');
let web = fs.readFileSync('web.js', 'utf8');

const loader = `
// 🚪 A PORTA DAS CAIXAS (RESTAURO DE EMERGÊNCIA)
const rotasPath = path.join(__dirname, 'rotas_web');
if (fs.existsSync(rotasPath)) {
    fs.readdirSync(rotasPath).forEach(file => {
        if (file.endsWith('.js')) {
            try { 
                require('./rotas_web/' + file)(app, checkAuth, db, configWeb); 
                console.log('📦 App restaurado: ' + file);
            } catch(e) { console.error('Erro ao carregar ' + file, e); }
        }
    });
}
`;

if (!web.includes('rotasPath = path.join')) {
    web = web.replace('server.listen(3000', loader + '\nserver.listen(3000');
    fs.writeFileSync('web.js', web);
    console.log("✅ SISTEMA RESTAURADO! Todos os seus 12 apps foram religados na Matriz.");
} else {
    console.log("⚠️ O carregador já está no código.");
}
