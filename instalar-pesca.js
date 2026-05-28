const fs = require('fs');

console.log("🎣 INICIANDO INSTALAÇÃO DO SISTEMA DE PESCA...");

// ==========================================
// 1. CRIAR O COMANDO PESCAR (pescar.js)
// ==========================================
const pescarCode = `const db = require('../db');

const peixes = {
    Comum: [
        { nome: 'Lambari', id: 531, valor: 50 }, { nome: 'Cascudo', id: 532, valor: 150 },
        { nome: 'Tilápia', id: 533, valor: 300 }, { nome: 'Piaba', id: 534, valor: 500 },
        { nome: 'Cará', id: 535, valor: 750 }, { nome: 'Traíra pequena', id: 536, valor: 1000 }
    ],
    Incomum: [
        { nome: 'Douradinha', id: 537, valor: 1500 }, { nome: 'Curimatã', id: 538, valor: 2000 },
        { nome: 'Piau', id: 539, valor: 2500 }, { nome: 'Tucunaré juvenil', id: 540, valor: 3500 },
        { nome: 'Pacu', id: 541, valor: 5000 }, { nome: 'Tambaqui', id: 542, valor: 6500 },
        { nome: 'Robalo', id: 543, valor: 8000 }, { nome: 'Sardinha', id: 544, valor: 9500 },
        { nome: 'Badejo', id: 545, valor: 10000 }
    ],
    Raro: [
        { nome: 'Badejo Negro', id: 546, valor: 12500 }, { nome: 'Dourado', id: 547, valor: 15000 },
        { nome: 'Cavala', id: 548, valor: 18000 }, { nome: 'Salmão do Rio', id: 549, valor: 22000 },
        { nome: 'Atum Pequeno', id: 550, valor: 26000 }, { nome: 'Garoupa', id: 551, valor: 30000 },
        { nome: 'Linguado', id: 552, valor: 35000 }, { nome: 'Pirarucu', id: 553, valor: 40000 },
        { nome: 'Peixe-Espada', id: 554, valor: 45000 }, { nome: 'Truta Azul', id: 555, valor: 50000 }
    ],
    Épico: [
        { nome: 'Peixe-Morcego', id: 556, valor: 60000 }, { nome: 'Tubarão-Bambu', id: 557, valor: 70000 },
        { nome: 'Peixe-Pedra', id: 558, valor: 80000 }, { nome: 'Baiacu Gigante', id: 559, valor: 90000 },
        { nome: 'Aruanã Prateada', id: 560, valor: 100000 }, { nome: 'Peixe-Lua', id: 561, valor: 115000 },
        { nome: 'Enguia Elétrica', id: 562, valor: 130000 }, { nome: 'Raia Mística', id: 563, valor: 145000 }
    ],
    Lendário: [
        { nome: 'Tubarão-Martelo', id: 564, valor: 160000 }, { nome: 'Marlin Azul', id: 565, valor: 180000 },
        { nome: 'Peixe-Dragão', id: 566, valor: 200000 }, { nome: 'Leviatã Juvenil', id: 567, valor: 225000 },
        { nome: 'Kraken-Guia', id: 568, valor: 250000 }, { nome: 'Esturjão Real', id: 569, valor: 275000 },
        { nome: 'Peixe-Cristal', id: 570, valor: 300000 }
    ],
    Mítico: [
        { nome: 'Peixe-Relâmpago', id: 571, valor: 330000 }, { nome: 'Cardume Fantasma', id: 572, valor: 360000 },
        { nome: 'Rei do Abismo', id: 573, valor: 390000 }, { nome: 'Sereia-Peixe', id: 574, valor: 420000 },
        { nome: 'Dragão Marinho', id: 575, valor: 450000 }, { nome: 'Orion do Mar', id: 576, valor: 470000 },
        { nome: 'Abyssal Prime', id: 577, valor: 480000 }, { nome: 'Peixe-Cósmico', id: 578, valor: 490000 }
    ],
    Secreto: [
        { nome: 'Rei Abissal', id: 579, valor: 495000 }, { nome: 'Leviatã Supremo', id: 580, valor: 500000 }
    ]
};

const layouts = {
    "Secreto": "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\\n┃        🐟 𝑷𝑬𝑰𝑿𝑬 𝑺𝑬𝑪𝑹𝑬𝑻𝑶 🐟        ┃\\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\\n\\n🐠 𝑵𝒐𝒎𝒆: {peixe}\\n📦 𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒂: Secreto\\n💰 𝑽𝒂𝒍𝒐𝒓: R$ {valor}\\n🎯 𝑹𝒂𝒓𝒊𝒅𝒂𝒅𝒆: Secreto\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Mítico": "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\\n┃         🐟 𝑷𝑬𝑰𝑿𝑬 𝑴𝑰́𝑻𝑰𝑪𝑶 🐟       ┃\\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\\n\\n🐠 𝑵𝒐𝒎𝒆: {peixe}\\n📦 𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒂: Mítico\\n💰 𝑽𝒂𝒍𝒐𝒓: R$ {valor}\\n🎯 𝑹𝒂𝒓𝒊𝒅𝒂𝒅𝒆: Mítico\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Lendário": "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\\n┃       🐟 𝑷𝑬𝑰𝑿𝑬 𝑳𝑬𝑵𝑫𝑨́𝑹𝑰𝑶 🐟      ┃\\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\\n\\n🐠 𝑵𝒐𝒎𝒆: {peixe}\\n📦 𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒂: Lendário\\n💰 𝑽𝒂𝒍𝒐𝒓: R$ {valor}\\n🎯 𝑹𝒂𝒓𝒊𝒅𝒂𝒅𝒆: Lendário\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Épico": "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\\n┃         🐟 𝑷𝑬𝑰𝑿𝑬 𝑬́𝑷𝑰𝑪𝑶 🐟        ┃\\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\\n\\n🐠 𝑵𝒐𝒎𝒆: {peixe}\\n📦 𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒂: Épico\\n💰 𝑽𝒂𝒍𝒐𝒓: R$ {valor}\\n🎯 𝑹𝒂𝒓𝒊𝒅𝒂𝒅𝒆: Épico\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Raro": "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\\n┃          🐟 𝑷𝑬𝑰𝑿𝑬 𝑹𝑨𝑹𝑶 🐟          ┃\\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\\n\\n🐠 𝑵𝒐𝒎𝒆: {peixe}\\n📦 𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒂: Raro\\n💰 𝑽𝒂𝒍𝒐𝒓: R$ {valor}\\n🎯 𝑹𝒂𝒓𝒊𝒅𝒂𝒅𝒆: Raro\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Incomum": "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\\n┃        🐟 𝑷𝑬𝑰𝑿𝑬 𝑰𝑵𝑪𝑶𝑴𝑼𝑴 🐟       ┃\\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\\n\\n🐠 𝑵𝒐𝒎𝒆: {peixe}\\n📦 𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒂: Incomum\\n💰 𝑽𝒂𝒍𝒐𝒓: R$ {valor}\\n🎯 𝑹𝒂𝒓𝒊𝒅𝒂𝒅𝒆: Incomum\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Comum": "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\\n┃          🐟 𝑷𝑬𝑰𝑿𝑬 𝑪𝑶𝑴𝑼𝑴 🐟         ┃\\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\\n\\n🐠 𝑵𝒐𝒎𝒆: {peixe}\\n📦 𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒂: Comum\\n💰 𝑽𝒂𝒍𝒐𝒓: R$ {valor}\\n🎯 𝑹𝒂𝒓𝒊𝒅𝒂𝒅𝒆: Normal\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
};

module.exports = {
    name: 'pescar',
    execute: async (sock, msg) => {
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(id);
        
        if (!user) return;
        if (!user.inventario) user.inventario = [];

        // ⏱️ SISTEMA DE COOLDOWN (20 segundos)
        const agora = Date.now();
        if (user.ultimaPesca && agora - user.ultimaPesca < 20000) {
            const faltam = Math.ceil((20000 - (agora - user.ultimaPesca)) / 1000);
            return sock.sendMessage(remetente, { text: \`⏳ Os peixes estão assustados! Espere \${faltam}s para jogar a isca novamente.\` }, { quoted: msg });
        }

        // 🎲 SISTEMA DE RNG / PROBABILIDADE HARCORE
        const rng = Math.random() * 100;
        let raridade = "";
        
        if (rng < 0.1) raridade = "Secreto";         // 0.1% chance
        else if (rng < 1.0) raridade = "Mítico";     // 0.9% chance
        else if (rng < 3.0) raridade = "Lendário";   // 2.0% chance
        else if (rng < 10.0) raridade = "Épico";     // 7.0% chance
        else if (rng < 25.0) raridade = "Raro";      // 15.0% chance
        else if (rng < 55.0) raridade = "Incomum";   // 30.0% chance
        else raridade = "Comum";                     // 45.0% chance

        // Escolhe o peixe aleatório dentro da raridade sorteada
        const lista = peixes[raridade];
        const peixeSorteado = lista[Math.floor(Math.random() * lista.length)];

        // Salva os dados
        user.ultimaPesca = agora;
        user.inventario.push(peixeSorteado.nome);
        db.salvar(id, user);

        // Prepara a interface
        const texto = layouts[raridade]
            .replace('{peixe}', peixeSorteado.nome)
            .replace('{valor}', peixeSorteado.valor.toLocaleString('pt-BR'));

        await sock.sendMessage(remetente, { text: texto }, { quoted: msg });
    }
};`;

fs.writeFileSync('./commands/pescar.js', pescarCode);
console.log("✅ Comando 'pescar.js' criado com sistema de RNG e cooldown!");

// ==========================================
// 2. INJETAR PEIXES NO PRODUTOS.JS
// ==========================================
let prodPath = './data/produtos.js';
if (fs.existsSync(prodPath)) {
    let prodTxt = fs.readFileSync(prodPath, 'utf8');
    
    // Lista monstruosa dos peixes, com o valor dobrado pro 'vender.js' dividir na metade e dar o valor exato que vc pediu.
    const injecaoPeixes = `
    // 🎣 SISTEMA DE PESCA (IDs 531 - 580)
    "531": { nome: "Lambari", preco: 100 }, "532": { nome: "Cascudo", preco: 300 }, "533": { nome: "Tilápia", preco: 600 }, "534": { nome: "Piaba", preco: 1000 }, "535": { nome: "Cará", preco: 1500 }, "536": { nome: "Traíra pequena", preco: 2000 },
    "537": { nome: "Douradinha", preco: 3000 }, "538": { nome: "Curimatã", preco: 4000 }, "539": { nome: "Piau", preco: 5000 }, "540": { nome: "Tucunaré juvenil", preco: 7000 }, "541": { nome: "Pacu", preco: 10000 }, "542": { nome: "Tambaqui", preco: 13000 }, "543": { nome: "Robalo", preco: 16000 }, "544": { nome: "Sardinha", preco: 19000 }, "545": { nome: "Badejo", preco: 20000 },
    "546": { nome: "Badejo Negro", preco: 25000 }, "547": { nome: "Dourado", preco: 30000 }, "548": { nome: "Cavala", preco: 36000 }, "549": { nome: "Salmão do Rio", preco: 44000 }, "550": { nome: "Atum Pequeno", preco: 52000 }, "551": { nome: "Garoupa", preco: 60000 }, "552": { nome: "Linguado", preco: 70000 }, "553": { nome: "Pirarucu", preco: 80000 }, "554": { nome: "Peixe-Espada", preco: 90000 }, "555": { nome: "Truta Azul", preco: 100000 },
    "556": { nome: "Peixe-Morcego", preco: 120000 }, "557": { nome: "Tubarão-Bambu", preco: 140000 }, "558": { nome: "Peixe-Pedra", preco: 160000 }, "559": { nome: "Baiacu Gigante", preco: 180000 }, "560": { nome: "Aruanã Prateada", preco: 200000 }, "561": { nome: "Peixe-Lua", preco: 230000 }, "562": { nome: "Enguia Elétrica", preco: 260000 }, "563": { nome: "Raia Mística", preco: 290000 },
    "564": { nome: "Tubarão-Martelo", preco: 320000 }, "565": { nome: "Marlin Azul", preco: 360000 }, "566": { nome: "Peixe-Dragão", preco: 400000 }, "567": { nome: "Leviatã Juvenil", preco: 450000 }, "568": { nome: "Kraken-Guia", preco: 500000 }, "569": { nome: "Esturjão Real", preco: 550000 }, "570": { nome: "Peixe-Cristal", preco: 600000 },
    "571": { nome: "Peixe-Relâmpago", preco: 660000 }, "572": { nome: "Cardume Fantasma", preco: 720000 }, "573": { nome: "Rei do Abismo", preco: 780000 }, "574": { nome: "Sereia-Peixe", preco: 840000 }, "575": { nome: "Dragão Marinho", preco: 900000 }, "576": { nome: "Orion do Mar", preco: 940000 }, "577": { nome: "Abyssal Prime", preco: 960000 }, "578": { nome: "Peixe-Cósmico", preco: 980000 },
    "579": { nome: "Rei Abissal", preco: 990000 }, "580": { nome: "Leviatã Supremo", preco: 1000000 },
`;
    if (!prodTxt.includes('"Lambari"')) {
        prodTxt = prodTxt.replace(/(module\.exports\s*=\s*\{)/, `$1\n${injecaoPeixes}`);
        fs.writeFileSync(prodPath, prodTxt);
        console.log("✅ Produtos.js atualizado! Peixes injetados no mercado com sucesso.");
    } else {
        console.log("⚠️ Os peixes já estavam no produtos.js.");
    }
}

// ==========================================
// 3. ATUALIZAR INVENTÁRIO (inventario.js)
// ==========================================
let invPath = './commands/inventario.js';
if (fs.existsSync(invPath)) {
    let invTxt = fs.readFileSync(invPath, 'utf8');
    
    // Adiciona a categoria nova na configuração
    const blocoNovaCat = `const categoriasConfig = {
    "🎣 Peixes": ["Lambari", "Cascudo", "Tilápia", "Piaba", "Cará", "Traíra pequena", "Douradinha", "Curimatã", "Piau", "Tucunaré juvenil", "Pacu", "Tambaqui", "Robalo", "Sardinha", "Badejo", "Badejo Negro", "Dourado", "Cavala", "Salmão do Rio", "Atum Pequeno", "Garoupa", "Linguado", "Pirarucu", "Peixe-Espada", "Truta Azul", "Peixe-Morcego", "Tubarão-Bambu", "Peixe-Pedra", "Baiacu Gigante", "Aruanã Prateada", "Peixe-Lua", "Enguia Elétrica", "Raia Mística", "Tubarão-Martelo", "Marlin Azul", "Peixe-Dragão", "Leviatã Juvenil", "Kraken-Guia", "Esturjão Real", "Peixe-Cristal", "Peixe-Relâmpago", "Cardume Fantasma", "Rei do Abismo", "Sereia-Peixe", "Dragão Marinho", "Orion do Mar", "Abyssal Prime", "Peixe-Cósmico", "Rei Abissal", "Leviatã Supremo"],`;
    
    if (!invTxt.includes('"🎣 Peixes"')) {
        invTxt = invTxt.replace(/const categoriasConfig = \{/, blocoNovaCat);
        
        // Adiciona o render no loop do inventário
        invTxt = invTxt.replace(/"📦 Outros": \[\]/g, '"🎣 Peixes": [], "📦 Outros": []');
        fs.writeFileSync(invPath, invTxt);
        console.log("✅ Inventário atualizado para renderizar sua mochila de pesca!");
    } else {
         console.log("⚠️ A categoria de peixes já estava no inventário.");
    }
}

console.log("🎯 INSTALAÇÃO CONCLUÍDA! Pode ligar o bot.");
