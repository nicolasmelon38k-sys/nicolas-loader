const path = require('path');

const categoriasConfig = {
    "🍎 Frutas": ["Maçã Fuji","Laranja Pera","Melancia Baby","Banana Nanica","Morango (250g)","Uva Thompson","Abacaxi Pérola","Manga Palmer","Pêssego","Limão Tahiti"],
    "🥩 Carnes": ["Carne de Porco","Carne de Boi","Costela de Porco","Frango Inteiro","Linguiça Toscana","Bacon","Salsicha","Hambúrguer (10x)","Coxinha de Frango","Pastel de Carne"],
    "🥗 Hortifruti": ["Alface Americana","Tomate","Cebola","Batata","Cenoura","Pepino","Brócolis","Couve-flor","Espinafre","Abobrinha"],
    "🍱 Pratos Preparados": [
        "Tigela de Salada de Maçã e Uva", "Travessa de Salada de Frutas", "Jarra de Vitamina de Banana c/ Morango",
        "Jarra de Suco Cítrico", "Jarra de Suco de Melancia", "Porção de Manga com Limão", "Bowl de Frutas Premium",
        "Travessa de Salada Tropical", "Frango Assado c/ Legumes (Família)", "Frango Assado Acebolado",
        "Costela Assada c/ Batatas", "Picadinho de Carne Acebolado", "Refogado de Porco c/ Abobrinha",
        "Porção de Linguiça Acebolada", "Batata Rústica c/ Bacon", "Combo de 10 Hambúrgueres Artesanais",
        "Combo de 10 Hambúrgueres c/ Salada", "Lanche Rápido: Coxinha + Suco", "Lanche Rápido: Pastel c/ Limão",
        "Travessa de Salada Básica", "Travessa de Salada Crocante", "Panela de Legumes no Vapor",
        "Porção de Brócolis e Couve-flor", "Porção de Espinafre Refogado", "Refogado de Abobrinha c/ Tomate",
        "Mega Salada da Horta", "Carne Bovina c/ Legumes", "Frango Fit c/ Legumes", "Carne de Porco c/ Purê e Couve",
        "Banquete Fast-Food (10 Pessoas)"
    ],
    "📱 Tech": ["Galaxy A54","Moto G53","Notebook Dell","Fone JBL","Caixa de Som","Power Bank","Cabo USB-C","Adaptador","Mi Band 8","Teclado Sem Fio"],
    "🏠 Lar": ["Detergente","Sabão em Pó","Amaciante","Água Sanitária","Desinfetante","Papel Higiênico","Saco de Lixo","Esponja (5x)","Pano de Chão","Vassoura","Rodo","Balde","Lâmpada LED","Pilhas AA (4x)"],
    "✨ Beleza & Skincare": [
        "Gel Limpeza Suave", "Óleo Demaquilante", "Espuma Purificante", "Leite de Limpeza", "Sabonete de Carvão",
        "Tônico Calmante", "Essência Hidratante", "Tônico Adstringente", "Loção Pré-Sérum",
        "Sérum Vitamina C 15%", "Sérum Niacinamida 10%", "Sérum Retinol 0.5%", "Sérum Ácido Hialurônico", "Sérum Ácido Salicílico", "Tratamento Tea Tree",
        "Gel Creme Aloe Vera", "Creme Facial Ceramidas", "Loção Hidratante B5", "Emulsão Matificante", "Bálsamo Rep. Noturno",
        "Protetor Facial FPS 50+", "Protetor com Cor FPS 40", "Protetor Bastão FPS 50", "Fluido Protetor FPS 60",
        "Máscara Argila Verde", "Máscara Noturna Probióticos", "Esfoliante Enzimático", "Máscara Folha Centella",
        "Creme Anti-Olheiras", "Sérum Rejuvenescedor"
    ]
};

const iconesCategoria = {
    "🍎 Frutas": "fa-apple-whole",
    "🥩 Carnes": "fa-drumstick-bite",
    "🥗 Hortifruti": "fa-leaf",
    "🍱 Pratos Preparados": "fa-bowl-food",
    "📱 Tech": "fa-mobile-screen",
    "🏠 Lar": "fa-house",
    "✨ Beleza & Skincare": "fa-sparkles",
    "📦 Outros": "fa-box"
};

const coresCategoria = {
    "🍎 Frutas": "#ff4d4d",      // Vermelho
    "🥩 Carnes": "#d93838",      // Vermelho Escuro
    "🥗 Hortifruti": "#00ff88",  // Verde Neon
    "🍱 Pratos Preparados": "#ff9900", // Laranja
    "📱 Tech": "#00e5ff",        // Ciano
    "🏠 Lar": "#ffd700",         // Dourado
    "✨ Beleza & Skincare": "#ff66b2", // Rosa
    "📦 Outros": "#a200ff"       // Roxo
};

module.exports = (app, checkAuth, db, configWeb) => {
    app.get('/inventario', checkAuth, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/inventario.html'));
    });

    app.get('/api/inventario/lista', checkAuth, (req, res) => {
        const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
        const user = db.obterUsuario(userId);
        
        if (!user || !user.inventario) {
            return res.json({ success: true, itens: [], total: 0, categorias: [] });
        }

        const contagem = {};
        user.inventario.forEach(i => {
            if (i) contagem[i] = (contagem[i] || 0) + 1;
        });

        const itensAgrupados = [];

        for (const [nomeItem, qtd] of Object.entries(contagem)) {
            let catAtual = "📦 Outros";
            for (const [cat, lista] of Object.entries(categoriasConfig)) {
                if (lista.includes(nomeItem)) {
                    catAtual = cat;
                    break;
                }
            }
            itensAgrupados.push({
                nome: nomeItem,
                qtd: qtd,
                categoria: catAtual,
                icone: iconesCategoria[catAtual] || "fa-box",
                cor: coresCategoria[catAtual] || "#888" // Manda a cor pra tela
            });
        }

        res.json({
            success: true,
            total: user.inventario.length,
            itens: itensAgrupados,
            categoriasAtivas: [...new Set(itensAgrupados.map(i => i.categoria))]
        });
    });
};
