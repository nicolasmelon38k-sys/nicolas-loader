const path = require('path');
const fs = require('fs');

module.exports = (app, checkAuth, db, configWeb) => {
    app.get('/imoveis', checkAuth, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/imoveis.html'));
    });

    // 1. O SISTEMA DE LUCRO OFFLINE (A MÁGICA)
    app.get('/api/imoveis/carregar', checkAuth, (req, res) => {
        const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const dbPath = path.join(__dirname, '../database.json');
        
        try {
            let bancoDados = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            let user = bancoDados[userId];
            if (!user) return res.json({ success: false });

            let agora = Date.now();
            let ultimaRenda = user.imoveis_ultima_renda || agora;
            let minutosPassados = Math.floor((agora - ultimaRenda) / 60000); // 60.000ms = 1 minuto
            
            // Se o cara ficou fora do app e tem casa alugada, cobra os NPCs!
            if (minutosPassados > 0 && user.imoveis_comprados && user.imoveis_comprados.length > 0) {
                let rendaTotalMinuto = 0;
                user.imoveis_comprados.forEach(imovel => {
                    if (imovel.inquilino) rendaTotalMinuto += imovel.rendaHora; // rendaHora é o valor por minuto
                });
                
                if (rendaTotalMinuto > 0) {
                    user.imoveis_caixa = (user.imoveis_caixa || 0) + (rendaTotalMinuto * minutosPassados);
                }
                
                // Salva o novo tempo descontando os minutos calculados
                user.imoveis_ultima_renda = agora - ((agora - ultimaRenda) % 60000);
                fs.writeFileSync(dbPath, JSON.stringify(bancoDados, null, 2));
            }

            res.json({
                success: true,
                saldoAtual: user.dinheiro || 0,
                meusImoveis: user.imoveis_comprados || [],
                caixaAluguel: user.imoveis_caixa || 0
            });
        } catch(e) {
            console.log("Erro ao carregar imóveis:", e);
            res.json({ success: false });
        }
    });

    // 2. SALVAR AS TRANSAÇÕES
    app.post('/api/imoveis/transacao', checkAuth, (req, res) => {
        const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const dbPath = path.join(__dirname, '../database.json');
        
        try {
            let bancoDados = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            if (!bancoDados[userId]) return res.json({ success: false });
            
            let valor = Number(req.body.valor) || 0;
            let tipo = req.body.tipo;
            
            if (tipo === 'comprar') {
                if (bancoDados[userId].dinheiro < valor) return res.json({ success: false, erro: 'Saldo' });
                bancoDados[userId].dinheiro -= valor; 
            } else if (tipo === 'receber') {
                bancoDados[userId].dinheiro += valor; 
            }
            
            if (req.body.meusImoveis !== undefined) bancoDados[userId].imoveis_comprados = req.body.meusImoveis;
            
            if (req.body.caixaAluguel !== undefined) {
                bancoDados[userId].imoveis_caixa = req.body.caixaAluguel;
                bancoDados[userId].imoveis_ultima_renda = Date.now(); // Reseta o relógio pra não pagar dobrado
            }
            
            fs.writeFileSync(dbPath, JSON.stringify(bancoDados, null, 2));
            res.json({ success: true, saldoAtual: bancoDados[userId].dinheiro });
        } catch(e) {
            res.json({ success: false });
        }
    });
};
