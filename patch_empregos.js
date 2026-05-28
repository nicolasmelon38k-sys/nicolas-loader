const fs = require('fs');
let code = fs.readFileSync('web.js', 'utf8');

const rotasJobs = `
// ==========================================
// API: SISTEMA DE EMPREGOS
// ==========================================
app.get('/api/empregos/info', (req, res) => {
    const userId = req.cookies.userId;
    if (!userId || !database[userId]) return res.json({ cargoAtual: "Buscando...", lista: {} });

    const user = database[userId];
    const empregosDB = {
        "entregador": { nome: "Entregador", reqLvl: 1, salario: 50, icon: "fas fa-motorcycle" },
        "atendente": { nome: "Atendente de Loja", reqLvl: 2, salario: 80, icon: "fas fa-cash-register" },
        "hacker": { nome: "Hacker Júnior", reqLvl: 5, salario: 250, icon: "fas fa-laptop-code" },
        "magnata": { nome: "Magnata de Wall Street", reqLvl: 10, salario: 1500, icon: "fas fa-user-tie" }
    };

    res.json({
        cargoAtual: user.emprego || "Desempregado",
        levelUser: user.level || 1,
        lista: empregosDB
    });
});

app.post('/api/empregos/escolher', (req, res) => {
    const userId = req.cookies.userId;
    if (!userId || !database[userId]) return res.json({ success: false, msg: "Sessão inválida" });

    const { cargoId } = req.body;
    const user = database[userId];

    const empregosDB = {
        "entregador": { nome: "Entregador", reqLvl: 1, salario: 50, icon: "fas fa-motorcycle" },
        "atendente": { nome: "Atendente de Loja", reqLvl: 2, salario: 80, icon: "fas fa-cash-register" },
        "hacker": { nome: "Hacker Júnior", reqLvl: 5, salario: 250, icon: "fas fa-laptop-code" },
        "magnata": { nome: "Magnata de Wall Street", reqLvl: 10, salario: 1500, icon: "fas fa-user-tie" }
    };

    const job = empregosDB[cargoId];
    if (!job) return res.json({ success: false, msg: "Vaga inexistente." });

    if ((user.level || 1) < job.reqLvl) {
        return res.json({ success: false, msg: \`Nível insuficiente. Requer Nível \${job.reqLvl}.\` });
    }

    user.emprego = job.nome;
    if (typeof salvarDatabase === 'function') salvarDatabase();

    res.json({ success: true, msg: \`Contratado! Agora você é \${job.nome}.\` });
});
`;

// Se a rota ainda não existir, injeta antes do app.listen
if (!code.includes('/api/empregos/info')) {
    code = code.replace(/app\.listen\(/, rotasJobs + '\n\napp.listen(');
    fs.writeFileSync('web.js', code);
    console.log("✅ MATRIX ATUALIZADA! Vagas de emprego abertas no servidor.");
} else {
    console.log("⚠️ As rotas de emprego já existiam no seu web.js!");
}
