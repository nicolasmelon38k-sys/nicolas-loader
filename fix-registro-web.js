const fs = require('fs');

console.log("🛠️ INICIANDO CORREÇÃO DO SISTEMA DE REGISTRO WEB...");

// ==========================================
// 1. INTERCEPTAR A ROTA NO WEB.JS
// ==========================================
let webPath = './web.js';
if (fs.existsSync(webPath)) {
    let webStr = fs.readFileSync(webPath, 'utf8');

    const injection = `
// 🛡️ INTERCEPTADOR DE REGISTRO (Impede contas zeradas e exige Zap válido)
app.post('/api/register', (req, res) => {
    try {
        let idZap = req.body.zap || req.body.telefone || req.body.whatsapp || req.body.id || req.body.numero;
        const email = req.body.email;
        const senha = req.body.senha || req.body.password;

        if (!idZap || !email || !senha) {
            return res.json({ success: false, msg: "❌ Preencha todos os campos!" });
        }

        idZap = db.normalizarId(idZap);
        let database = db.ler();
        let user = database[idZap];

        // Tenta achar com o 55 na frente caso o usuário tenha esquecido
        if (!user && !idZap.startsWith('55')) {
            let testZap = '55' + idZap;
            if (database[testZap]) {
                idZap = testZap;
                user = database[idZap];
            }
        }

        if (!user) {
            return res.json({ success: false, msg: "❌ Conta não encontrada! Mande um !menu no WhatsApp do bot antes de criar sua conta aqui." });
        }

        if (user.auth && user.auth.email) {
            return res.json({ success: false, msg: "❌ Este WhatsApp já está vinculado a um email!" });
        }

        // Se passar, vincula a conta existente sem apagar nada!
        user.auth = {
            codigo: Math.random().toString(36).substring(2, 9).toUpperCase(),
            email: email,
            senha: senha,
            criadoEm: new Date().toLocaleString('pt-BR'),
            ipMonitorado: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Desconhecido',
            dispositivo: req.headers['user-agent'] || 'Desconhecido'
        };

        db.salvar(idZap, { auth: user.auth });

        console.log("[🔗 VÍNCULO SUCESSO] Email " + email + " atrelado ao Zap " + idZap + ". Fortuna mantida.");

        res.cookie('userId', idZap, { maxAge: 86400000, httpOnly: true });
        return res.json({ success: true, msg: "Conta vinculada com sucesso! Redirecionando..." });
    } catch(e) {
        console.error("Erro no registro:", e);
        return res.json({ success: false, msg: "❌ Erro interno no servidor." });
    }
});
`;
    if (!webStr.includes('INTERCEPTADOR DE REGISTRO')) {
        webStr = webStr.replace("// CARREGADOR DE APPS", injection + "\n// CARREGADOR DE APPS");
        fs.writeFileSync(webPath, webStr);
        console.log("✅ web.js blindado! O registro agora exige conta no Zap e não cria mais contas zeradas.");
    } else {
        console.log("⚠️ web.js já estava protegido.");
    }
}

// ==========================================
// 2. LIXEIRO: LIMPAR CONTAS FANTASMAS ZERADAS
// ==========================================
let dbPath = './database.json';
if (fs.existsSync(dbPath)) {
    let database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    let limpadas = 0;

    for (let id in database) {
        let u = database[id];
        // Identifica o padrão da conta fantasma criada pelo erro da web
        if (u.nome === "Usuário Web" && u.dinheiro === 0 && u.banco === 0 && u.level === 1) {
            delete database[id];
            limpadas++;
        }
    }

    if (limpadas > 0) {
        fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
        console.log("🧹 Faxina concluida: " + limpadas + " contas fantasmas foram apagadas do banco de dados!");
    } else {
        console.log("✨ Nenhuma conta fantasma encontrada no banco.");
    }
}

console.log("🎯 CORRECAO CONCLUIDA! Pode reiniciar a web.");
