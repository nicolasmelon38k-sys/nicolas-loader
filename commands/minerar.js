const db = require('../db');
const biomas = require('../data/biomas');
const produtos = require('../data/produtos');

const cooldowns = new Map();

// Tabela de Itens e Pesos (De acordo com o script do usuário)
const cat1 = [{id:801, p:14},{id:802, p:10},{id:803, p:9},{id:804, p:8},{id:805, p:7},{id:806, p:7},{id:807, p:6},{id:808, p:6},{id:809, p:5},{id:810, p:5},{id:811, p:4},{id:812, p:4}];
const cat2 = [{id:813, p:7},{id:814, p:6},{id:821, p:5},{id:822, p:5},{id:815, p:4},{id:816, p:3},{id:817, p:2},{id:818, p:2},{id:819, p:2},{id:820, p:2},{id:823, p:1},{id:824, p:1}];
const cat3 = [{id:836, p:7},{id:830, p:5},{id:831, p:5},{id:832, p:5},{id:833, p:4},{id:834, p:4},{id:835, p:4},{id:827, p:4},{id:828, p:4},{id:829, p:4},{id:825, p:3},{id:826, p:2}];
const cat4 = [{id:837, p:3},{id:838, p:3},{id:839, p:2},{id:840, p:1.5},{id:841, p:2},{id:842, p:1.5},{id:843, p:1.5},{id:844, p:2},{id:845, p:2},{id:846, p:1.2},{id:847, p:2},{id:848, p:2}];
const cat5 = [{id:852, p:1.2},{id:849, p:0.8},{id:850, p:0.6},{id:851, p:0.4},{id:853, p:1},{id:854, p:0.6},{id:855, p:0.6},{id:856, p:0.6}];
const cat6 = [{id:857, p:1.2},{id:858, p:0.6},{id:859, p:0.4},{id:860, p:0.2}];

function rollItem(array) {
    const total = array.reduce((sum, item) => sum + item.p, 0);
    let rand = Math.random() * total;
    for (let item of array) {
        if (rand < item.p) return item.id;
        rand -= item.p;
    }
    return array[0].id;
}

module.exports = {
    name: 'minerar',
    execute: async (sock, msg) => {
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(id);
        if (!user) return;

        const agora = Date.now();
        if (cooldowns.has(id) && agora < cooldowns.get(id)) {
            const faltaSegundos = Math.ceil((cooldowns.get(id) - agora) / 1000);
            const m = Math.floor(faltaSegundos / 60);
            const s = faltaSegundos % 60;
            const tempoStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
            return sock.sendMessage(remetente, { text: `⏳ *Calma aí!* A picareta está quente. Aguarde ${tempoStr}.` }, { quoted: msg });
        }

        if (user.energia === undefined) user.energia = 100;
        if (user.energia < 2) {
            return sock.sendMessage(remetente, { text: "❌ *Você está sem energia!* Descanse ou coma algo. (Energia: " + user.energia + "/100)" }, { quoted: msg });
        }

        // Definindo Pesos Base das Categorias
        let w1 = 45; // Industriais
        let w2 = 25; // Metais Valiosos
        let w3 = 15; // Gemas
        let w4 = 10; // Raros
        let w5 = 4;  // Diamantes
        let w6 = 1;  // Exóticos

        // Aplicando Buffs do Bioma
        const bioma = user.biomaAtivo ? biomas[user.biomaAtivo] : null;
        let nomeBioma = bioma ? bioma.nome : "SUPERFÍCIE COMUM";
        let bonusCrit = 0;

        if (bioma) {
            if (bioma.buff === 'industriais') w1 *= (1 + bioma.bonus);
            if (bioma.buff === 'metais_valiosos') w2 *= (1 + bioma.bonus);
            if (bioma.buff === 'gemas') w3 *= (1 + bioma.bonus);
            if (bioma.buff === 'raros') w4 *= (1 + bioma.bonus);
            if (bioma.buff === 'diamantes' || bioma.buff === 'diamantes_especiais') w5 *= (1 + bioma.bonus);
            if (bioma.buff === 'exoticos' || bioma.buff === 'exoticos_ultra') w6 *= (1 + bioma.bonus);
            if (bioma.buff === 'geral') {
                bonusCrit = bioma.bonus; // Aumenta a chance de crítico nas gramas
            }
        }

        // Roleta da Categoria
        const totalW = w1 + w2 + w3 + w4 + w5 + w6;
        let rollCat = Math.random() * totalW;
        let idSorteado, raridadeTxt, qtdGramas;

        if (rollCat < w1) {
            idSorteado = rollItem(cat1); raridadeTxt = "🟤 INDUSTRIAL (Comum)"; qtdGramas = Math.floor(Math.random() * 71) + 10;
        } else if (rollCat < w1 + w2) {
            idSorteado = rollItem(cat2); raridadeTxt = "⚪ METAL VALIOSO (Incomum)"; qtdGramas = Math.floor(Math.random() * 71) + 10;
        } else if (rollCat < w1 + w2 + w3) {
            idSorteado = rollItem(cat3); raridadeTxt = "💎 GEMA CLÁSSICA (Raro)"; qtdGramas = Math.floor(Math.random() * 26) + 5;
        } else if (rollCat < w1 + w2 + w3 + w4) {
            idSorteado = rollItem(cat4); raridadeTxt = "🪞 RARO / NOBRE (Épico)"; qtdGramas = Math.floor(Math.random() * 26) + 5;
        } else if (rollCat < w1 + w2 + w3 + w4 + w5) {
            idSorteado = rollItem(cat5); raridadeTxt = "💠 DIAMANTE ESPECIAL (Lendário)"; qtdGramas = Math.floor(Math.random() * 10) + 1;
        } else {
            idSorteado = rollItem(cat6); raridadeTxt = "🌌 EXÓTICO (Mítico)"; qtdGramas = Math.floor(Math.random() * 5) + 1;
        }

        // Crítico (Mais Gramas)
        let isCritico = "Não";
        if (Math.random() < (0.10 + bonusCrit)) {
            isCritico = "Sim! (+50% Drops)";
            qtdGramas = Math.floor(qtdGramas * 1.5);
        }

        const minProduto = produtos[idSorteado.toString()];
        const valorTotal = minProduto.preco * qtdGramas;

        // Debita energia e salva item na mochila (qtd = peso em /g)
        user.energia -= 2;
        if (!user.inventario) user.inventario = [];
        for (let i = 0; i < qtdGramas; i++) {
            user.inventario.push(minProduto.nome);
        }

        // ⏱️ Alterado para 2 Minutos (120000ms)
        cooldowns.set(id, agora + 120000); 
        db.salvar(id, user);

        const finalResult = "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n" +
                            "┃                     ⛏️ 𝑫𝑨𝑬𝑴𝑶𝑵 - 𝑴𝑰𝑵𝑬𝑹𝑨𝑹 ⛏️                    ┃\n" +
                            "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n" +
                            "👤 Jogador: " + (msg.pushName || "Minerador") + "\n" +
                            "💰 Dinheiro: R$ " + (user.dinheiro || 0).toLocaleString('pt-BR') + "\n" +
                            "⛏️ Energia: " + user.energia + "/100\n" +
                            "📊 Nível: " + (user.level || 1) + "\n\n" +
                            "──────────────────────────────────────────────────────────────\n\n" +
                            "📍 LOCAL:\n" +
                            "🪨 " + nomeBioma + "\n\n" +
                            "──────────────────────────────────────────────────────────────\n\n" +
                            "🎯 RESULTADO:\n\n" +
                            "💠 Você encontrou:\n" +
                            "➤ " + qtdGramas + "g de " + minProduto.nome + " [ID " + idSorteado + "]\n\n" +
                            "📊 Qualidade:\n" +
                            "➤ " + raridadeTxt + "\n\n" +
                            "💰 Valor na cotação total:\n" +
                            "➤ R$ " + valorTotal.toLocaleString('pt-BR') + "\n\n" +
                            "──────────────────────────────────────────────────────────────\n\n" +
                            "⚡ BÔNUS:\n" +
                            "🎯 Crítico: " + isCritico + "\n" +
                            "🧲 Buff Ativo: " + (bioma ? bioma.nome : "Nenhum") + "\n\n" +
                            "──────────────────────────────────────────────────────────────\n\n" +
                            "⏳ COOLDOWN:\n" +
                            "⛏️ Aguarde: 2 Minutos\n\n" +
                            "──────────────────────────────────────────────────────────────\n\n" +
                            "💡 COMANDOS:\n" +
                            "⛏️ !minerar → minerar novamente\n" +
                            "📦 !inventario → ver itens\n" +
                            "💰 !vender → vender recursos\n\n" +
                            "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯";

        // Manda o resultado final de uma vez, direto e sem piscar.
        await sock.sendMessage(remetente, { text: finalResult }, { quoted: msg });
    }
};
