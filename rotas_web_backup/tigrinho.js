const path = require('path');
const fs = require('fs');

module.exports = (app, checkAuth, db, configWeb) => {
    app.get('/tigrinho', checkAuth, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/tigrinho.html'));
    });

    app.post('/api/tigrinho/spin', checkAuth, (req, res) => {
        const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const dbPath = path.join(__dirname, '../database.json');
        
        try {
            let bancoDados = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            if (!bancoDados[userId]) return res.json({ success: false });
            
            let aposta = Number(req.body.aposta);
            
            if (aposta < 10 || bancoDados[userId].dinheiro < aposta) {
                return res.json({ success: false, erro: 'Saldo insuficiente!' });
            }
            
            // 1. DESCONTA A APOSTA NA HORA
            bancoDados[userId].dinheiro -= aposta;

            // 2. A MATEMÁTICA REAL (A BANCA SEMPRE GANHA NO LONGO PRAZO)
            let multiplicador = 0;
            let sorte = Math.random(); // Número de 0.00 a 1.00
            
            // 5% de chance de MEGA GANHO (A famosa Carta do Tigre)
            if (sorte <= 0.05) { 
                multiplicador = Math.floor(Math.random() * 6) + 5; // Paga de 5x a 10x
            } 
            // 25% de chance de GANHO NORMAL (Pra prender o jogador)
            else if (sorte <= 0.30) { 
                multiplicador = (Math.random() * 1.5) + 0.5; // Paga de 0.5x a 2.0x
            } 
            // 70% de chance de PERDER TUDO (É aqui que o bot enriquece)
            else {
                multiplicador = 0; 
            }
            
            let ganho = Math.floor(aposta * multiplicador);
            
            // 3. GERA O VISUAL BASEADO NO RESULTADO
            const normais = ["🧧", "💰", "🏮", "🧨", "🍊"];
            let grid = [];
            
            if (multiplicador >= 5) {
                // Se o sistema decidiu que ele ganha o Mega, injeta 3 tigres na tela
                grid = Array.from({length: 9}, () => Math.random() > 0.5 ? "🐯" : normais[Math.floor(Math.random() * normais.length)]);
                grid[0] = "🐯"; grid[4] = "🐯"; grid[8] = "🐯"; 
            } else {
                // Se ele perdeu ou ganhou pouco, NUNCA deixa formar 3 tigres
                grid = Array.from({length: 9}, () => Math.random() > 0.9 ? "🐯" : normais[Math.floor(Math.random() * normais.length)]);
                
                // Varredura de segurança: Se cair 3 tigres na sorte pura, ele apaga um
                let countTigres = 0;
                for(let i=0; i<9; i++) {
                    if(grid[i] === "🐯") countTigres++;
                    if(countTigres >= 3) grid[i] = normais[0];
                }
            }
            
            // 4. PAGA O PRÊMIO
            bancoDados[userId].dinheiro += ganho;

            fs.writeFileSync(dbPath, JSON.stringify(bancoDados, null, 2));
            
            res.json({ 
                success: true, 
                saldoAtual: bancoDados[userId].dinheiro,
                grid: grid,
                ganho: ganho,
                multiplicador: multiplicador.toFixed(2)
            });
        } catch(e) {
            console.log("Erro no Tigrinho:", e);
            res.json({ success: false });
        }
    });
};
