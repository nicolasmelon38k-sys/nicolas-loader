const db = require('../db');
const produtos = require('../data/produtos');
const receitas = require('../data/receitas');

const categoriasConfig = {
    "💎 Minérios": [
        "Minério de Ferro", "Bauxita", "Cobre", "Zinco", "Níquel", "Estanho", "Lítio", "Grafite", "Sal-gema", "Enxofre", "Caulim", "Fosfato",
        "Ouro nativo", "Prata nativa", "Platina", "Paládio", "Ródio", "Irídio", "Ósmio", "Rutênio", "Ouro bruto", "Prata bruta", "Rênio", "Tântalo",
        "Diamante bruto", "Diamante lapidado", "Rubi", "Safira azul", "Esmeralda", "Ametista", "Topázio", "Citrino", "Água-marinha", "Opala", "Peridoto", "Quartzo",
        "Espinélio", "Morganita", "Tanzanita", "Alexandrita", "Larimar", "Jadeíta", "Nephrita", "Pedra-da-lua", "Andaluzita", "Turmalina paraíba", "Turmalina roxa", "Turmalina rosa",
        "Diamante rosa", "Diamante azul", "Diamante vermelho", "Diamante negro", "Diamante bruto premium", "Diamante estrela", "Diamante de fogo", "Diamante gelo",
        "Meteorito ferroso", "Meteorito lunar", "Fragmento cósmico", "Núcleo de cristal"
    ],
    "🎣 Peixes": ["Lambari", "Cascudo", "Tilápia", "Piaba", "Cará", "Traíra pequena", "Douradinha", "Curimatã", "Piau", "Tucunaré juvenil", "Pacu", "Tambaqui", "Robalo", "Sardinha", "Badejo", "Badejo Negro", "Dourado", "Cavala", "Salmão do Rio", "Atum Pequeno", "Garoupa", "Linguado", "Pirarucu", "Peixe-Espada", "Truta Azul", "Peixe-Morcego", "Tubarão-Bambu", "Peixe-Pedra", "Baiacu Gigante", "Aruanã Prateada", "Peixe-Lua", "Enguia Elétrica", "Raia Mística", "Tubarão-Martelo", "Marlin Azul", "Peixe-Dragão", "Leviatã Juvenil", "Kraken-Guia", "Esturjão Real", "Peixe-Cristal", "Peixe-Relâmpago", "Cardume Fantasma", "Rei do Abismo", "Sereia-Peixe", "Dragão Marinho", "Orion do Mar", "Abyssal Prime", "Peixe-Cósmico", "Rei Abissal", "Leviatã Supremo"],
    "🐾 Pets": ["Bolinha", "Mimi", "Nino", "Pipoca", "Floquinho", "Pingo", "Tico", "Fofuxo", "Lili", "Totó", "Luna", "Kiko", "Nuvem", "Mel", "Choco", "Pandora", "Blue", "Amora", "Mimo", "Cookie", "Fênix", "Draco", "Sombra", "Peludinho", "Sol", "Douradinho", "Fumaça", "Kiwi", "Branquinho", "Jacozinho", "Astra", "Noa", "Luar", "Selene", "Spike", "Orion", "Ursozinho", "Vento", "Léo", "Pratinha", "Imperador", "Fenrir", "Pedrinho", "Solzinho", "Levi", "Kirin", "Abismo", "Cosmos", "Vácuo", "Titanzinho", "Cerberus", "Quimera", "Kraken", "Bahamut", "Cthulhu", "Anúbis", "Shenlong", "Ifrit", "Corvo Supremo", "Infinity"],
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
        "Banquete Fast-Food (10 Pessoas)", "Sushi de Salmão Supremo", "Filé Mignon ao Vinho Tinto", "Risoto de Frutos do Mar",
        "Pizza Trufada de Cogumelos", "Lagosta Imperial", "Hambúrguer de Ouro", "Wagyu A5 com Trufas", "Pizza de Ouro 24K",
        "Caviar Beluga", "Taça de Sorvete de Diamante"
    ],
    "📱 Tech": ["Galaxy A54","Moto G53","Notebook Dell","Fone JBL","Caixa de Som","Power Bank","Cabo USB-C","Adaptador","Mi Band 8","Teclado Sem Fio"],
    "🏠 Lar": ["Detergente","Sabão em Pó","Amaciante","Água Sanitária","Desinfetante","Papel Higiênico","Saco de Lixo","Esponja (5x)","Pano de Chão","Vassoura","Rodo","Balde","Lâmpada LED","Pilhas AA (4x)"],
    "✨ Beleza & Skincare": [
        "Gel Limpeza Suave", "Óleo Demaquilante", "Espuma Purificante", "Leite de Limpeza", "Sabonete de Carvão",
        "Tônico Calmante", "Essência Hidratante", "Tônico Adstringente", "Loção Pré-Sérum",
        "Sérum Vitamina C 15%", "Sérum Niacinamida 10%", "Sérum Retinol 0.5%", "Sérum Ácido Hialurônico", "Sérum Ácido Salicílico", "Tratamento Tea Tree",
        "Gel Creme Aloe Vera", "Creme Facial Ceramidas", "Loção Hidratante B5", "Emulsão Matificante", "Bálsamo Rep. Noturno",
        "Protetor Facial FPS 50+", "Protetor com Cor FPS 40", "Protetor Bastão FPS 50", "Fluido Protetor FPS 60",
        "Máscara Argila Verde", "Máscara Noturna Probióticos", "Esfoliante Enzimático", "Máscara Folha Centella", "Creme Anti-Olheiras", "Sérum Rejuvenescedor"
    ]
};

module.exports = {
    name: 'inventario',
    execute: async (sock, msg) => {
        const remetente = msg.key.remoteJid;
        const userId = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(userId);

        if (!user || !user.inventario || user.inventario.length === 0) {
            return sock.sendMessage(remetente, { text: "🎒 Sua mochila está vazia." }, { quoted: msg });
        }

        const contagem = {};
        user.inventario.forEach(i => {
            if (!i) return;
            contagem[i] = (contagem[i] || 0) + 1;
        });

        const categorias = {
            "💎 Minérios": [], "🎣 Peixes": [], "🐾 Pets": [], "🍎 Frutas": [], "🥩 Carnes": [],
            "🥗 Hortifruti": [], "🍱 Pratos Preparados": [], "📱 Tech": [],
            "🏠 Lar": [], "✨ Beleza & Skincare": [], "📦 Outros": []
        };

        for (const [nomeItem, qtd] of Object.entries(contagem)) {
            const idProd = Object.keys(produtos).find(k => produtos[k] && produtos[k].nome === nomeItem);
            const idRec = Object.keys(receitas).find(k => receitas[k] && receitas[k].nome === nomeItem);
            const id = idProd || idRec || "N/A";

            let achou = false;

            for (const [cat, lista] of Object.entries(categoriasConfig)) {
                if (lista.includes(nomeItem)) {
                    categorias[cat].push(`┃ ⟫ [${id}] ${nomeItem} (x${qtd})`);
                    achou = true;
                    break;
                }
            }
            if (!achou) {
                categorias["📦 Outros"].push(`┃ ⟫ [${id}] ${nomeItem} (x${qtd})`);
            }
        }

        let msgInv = "╭━━━━━━━『 🎒 INVENTÁRIO 』━━━━━━━╮\n" +
                     "┃ 👤 " + (msg.pushName || 'Jogador') + "\n" +
                     "┃ 📦 Total: " + user.inventario.length + "\n" +
                     "┃\n" +
                     "┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                     "┃\n";

        for (const [cat, itens] of Object.entries(categorias)) {
            if (itens.length) {
                msgInv += "┃ " + cat + "\n" + itens.join("\n") + "\n┃\n";
            }
        }
        msgInv += "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯";

        await sock.sendMessage(remetente, { text: msgInv }, { quoted: msg });
    }
};
