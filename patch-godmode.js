const fs = require('fs');

let code = fs.readFileSync('rotas_web/sistema.js', 'utf8');

const adminRoutes = `
    // ======== SISTEMA GOD MODE / CONTROL ========
    // 🛡️ Segurança dupla: Só o Dono passa daqui
    const checkAdmin = (req, res, next) => {
        const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        if (userId !== '554896669255') return res.status(403).json({ success: false, msg: 'Acesso negado.' });
        next();
    };

    // 📡 Manda o database inteiro pro OLYMPUS EYE
    app.get('/api/admin/users', checkAuth, checkAdmin, (req, res) => {
        res.json(db.ler());
    });

    // ⚡ Executa os botões de Cash e Level do Control
    app.post('/api/admin/action', checkAuth, checkAdmin, (req, res) => {
        const { targetId, action, amount } = req.body;
        const val = Number(amount);
        
        if (!targetId || !action || isNaN(val)) return res.json({ success: false, msg: 'Dados inválidos' });

        const database = db.ler();
        if (!database[targetId]) return res.json({ success: false, msg: 'Usuário não encontrado' });

        // Executa a diretriz
        if (action === 'add_money') database[targetId].dinheiro = (database[targetId].dinheiro || 0) + val;
        if (action === 'rem_money') database[targetId].dinheiro = Math.max(0, (database[targetId].dinheiro || 0) - val);
        if (action === 'set_level') database[targetId].level = val;
        if (action === 'rem_level') database[targetId].level = Math.max(1, (database[targetId].level || 1) - val);

        db.gravar(database);
        res.json({ success: true, msg: 'Operação concluída com sucesso!' });
    });
    // ============================================
`;

// Injeta o código antes de fechar o module.exports
if (!code.includes('/api/admin/users')) {
    code = code.replace(/};\s*$/, adminRoutes + '\n};');
    fs.writeFileSync('rotas_web/sistema.js', code);
    console.log('✅ Motores do OLYMPUS EYE e Control ativados com sucesso!');
} else {
    console.log('⚠️ As rotas do God Mode já estavam lá!');
}
