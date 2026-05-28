const path = require('path');
const fs = require('fs');

module.exports = (app, checkAuth, db, configWeb) => {
    // Rota da Página
    app.get('/casino', checkAuth, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/casino.html'));
    });

    // API de Giro (Spin)
    app.post('/api/casino/spin', checkAuth, (req, res) => {
        const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const dbPath = path.join(__dirname, '../database.json');
        
        try {
            let bancoDados = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            if (!bancoDados[userId]) return res.json({ success: false });
            
            let aposta = Number(req.body.aposta);
            
            // Verifica se tem saldo
            if (aposta < 10 || bancoDados[userId].dinheiro < aposta) {
                return res.json({ success: false, erro: 'Saldo insuficiente!' });
            }
            
            // 1. DESCONTA NA HORA
            bancoDados[userId].dinheiro -= aposta;

            // 2. LÓGICA DO SORTEIO
            const simbolos = ["🍒", "🍋", "🍇", "🔔", "💎", "7️⃣"];
            let s1 = simbolos[Math.floor(Math.random() * simbolos.length)];
            let s2 = simbolos[Math.floor(Math.random() * simbolos.length)];
            let s3 = simbolos[Math.floor(Math.random() * simbolos.length)];

            let multiplicador = 0;
            
            // Regras de Pagamento
            if (s1 === s2 && s2 === s3) {
                if (s1 === "7️⃣") multiplicador = 15; // Jackpot
                else if (s1 === "💎") multiplicador = 10;
                else multiplicador = 5;
            } else if (s1 === s2 || s2 === s3 || s1 === s3) {
                multiplicador = 1.5; // Acertou 2 (Salva a aposta e ganha um troco)
            }

            let ganho = aposta * multiplicador;
            
            // 3. PAGA O PRÊMIO
            bancoDados[userId].dinheiro += ganho;

            // Salva no banco de dados
            fs.writeFileSync(dbPath, JSON.stringify(bancoDados, null, 2));
            
            res.json({ 
                success: true, 
                saldoAtual: bancoDados[userId].dinheiro,
                resultado: [s1, s2, s3],
                ganho: ganho,
                multiplicador: multiplicador
            });
        } catch(e) {
            console.log("Erro no Cassino:", e);
            res.json({ success: false });
        }
    });
};
