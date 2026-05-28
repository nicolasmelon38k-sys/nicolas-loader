const fs = require('fs');

let webPath = './web.js';
let webStr = fs.readFileSync(webPath, 'utf8');

if (!webStr.includes('TENTATIVA DE REGISTRO')) {
    webStr = webStr.replace('idZap = db.normalizarId(idZap);', `idZap = db.normalizarId(idZap);\n        console.log(\`\\n[👀 TENTATIVA DE REGISTRO] Alguém no site digitou o número: \${idZap}\`);`);
    
    webStr = webStr.replace('if (!user) {', `if (!user) {\n            console.log(\`[❌ BLOQUEADO] O número \${idZap} não tem conta no RPG! Ele precisa mandar !menu no zap primeiro.\`);`);
    
    fs.writeFileSync(webPath, webStr);
    console.log("✅ Sistema de rastreamento ativado! Reinicie o node web.");
} else {
    console.log("⚠️ Rastreador já instalado.");
}
