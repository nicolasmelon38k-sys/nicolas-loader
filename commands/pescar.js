const db = require('../db');
const produtos = require('../data/produtos');
const mares = require('../data/mares_pesca');

const peixes = {
    Comum: [ { nome: 'Lambari', id: 531 }, { nome: 'Cascudo', id: 532 }, { nome: 'Tilápia', id: 533 }, { nome: 'Piaba', id: 534 }, { nome: 'Cará', id: 535 }, { nome: 'Traíra pequena', id: 536 } ],
    Incomum: [ { nome: 'Douradinha', id: 537 }, { nome: 'Curimatã', id: 538 }, { nome: 'Piau', id: 539 }, { nome: 'Tucunaré juvenil', id: 540 }, { nome: 'Pacu', id: 541 }, { nome: 'Tambaqui', id: 542 }, { nome: 'Robalo', id: 543 }, { nome: 'Sardinha', id: 544 }, { nome: 'Badejo', id: 545 } ],
    Raro: [ { nome: 'Badejo Negro', id: 546 }, { nome: 'Dourado', id: 547 }, { nome: 'Cavala', id: 548 }, { nome: 'Salmão do Rio', id: 549 }, { nome: 'Atum Pequeno', id: 550 }, { nome: 'Garoupa', id: 551 }, { nome: 'Linguado', id: 552 }, { nome: 'Pirarucu', id: 553 }, { nome: 'Peixe-Espada', id: 554 }, { nome: 'Truta Azul', id: 555 } ],
    Épico: [ { nome: 'Peixe-Morcego', id: 556 }, { nome: 'Tubarão-Bambu', id: 557 }, { nome: 'Peixe-Pedra', id: 558 }, { nome: 'Baiacu Gigante', id: 559 }, { nome: 'Aruanã Prateada', id: 560 }, { nome: 'Peixe-Lua', id: 561 }, { nome: 'Enguia Elétrica', id: 562 }, { nome: 'Raia Mística', id: 563 } ],
    Lendário: [ { nome: 'Tubarão-Martelo', id: 564 }, { nome: 'Marlin Azul', id: 565 }, { nome: 'Peixe-Dragão', id: 566 }, { nome: 'Leviatã Juvenil', id: 567 }, { nome: 'Kraken-Guia', id: 568 }, { nome: 'Esturjão Real', id: 569 }, { nome: 'Peixe-Cristal', id: 570 } ],
    Mítico: [ { nome: 'Peixe-Relâmpago', id: 571 }, { nome: 'Cardume Fantasma', id: 572 }, { nome: 'Rei do Abismo', id: 573 }, { nome: 'Sereia-Peixe', id: 574 }, { nome: 'Dragão Marinho', id: 575 } ],
    Secreto: [ { nome: 'Rei Abissal', id: 579 }, { nome: 'Leviatã Supremo', id: 580 } ]
};

const layouts = {
    "Secreto": "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃        🐟 𝑷𝑬𝑰𝑿𝑬 𝑺𝑬𝑪𝑹𝑬𝑻𝑶 🐟        ┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🐠 𝑵𝒐𝒎𝒆: {peixe}\n📦 𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒂: Secreto\n💰 𝑽𝒆𝒏𝒅𝒊𝒅𝒐 𝒑𝒐𝒓: R$ {valor}\n🎯 𝑹𝒂𝒓𝒊𝒅𝒂𝒅𝒆: Secreto\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Mítico": "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃         🐟 𝑷𝑬𝑰𝑿𝑬 𝑴𝑰́𝑻𝑰𝑪𝑶 🐟       ┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🐠 𝑵𝒐𝒎𝒆: {peixe}\n📦 𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒂: Mítico\n💰 𝑽𝒆𝒏𝒅𝒊𝒅𝒐 𝒑𝒐𝒓: R$ {valor}\n🎯 𝑹𝒂𝒓𝒊𝒅𝒂𝒅𝒆: Mítico\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Lendário": "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃       🐟 𝑷𝑬𝑰𝑿𝑬 𝑳𝑬𝑵𝑫𝑨́𝑹𝑰𝑶 🐟      ┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🐠 𝑵𝒐𝒎𝒆: {peixe}\n📦 𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒂: Lendário\n💰 𝑽𝒆𝒏𝒅𝒊𝒅𝒐 𝒑𝒐𝒓: R$ {valor}\n🎯 𝑹𝒂𝒓𝒊𝒅𝒂𝒅𝒆: Lendário\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Épico": "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃         🐟 𝑷𝑬𝑰𝑿𝑬 𝑬́𝑷𝑰𝑪𝑶 🐟        ┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🐠 𝑵𝒐𝒎𝒆: {peixe}\n📦 𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒂: Épico\n💰 𝑽𝒆𝒏𝒅𝒊𝒅𝒐 𝒑𝒐𝒓: R$ {valor}\n🎯 𝑹𝒂𝒓𝒊𝒅𝒂𝒅𝒆: Épico\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Raro": "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃          🐟 𝑷𝑬𝑰𝑿𝑬 𝑹𝑨𝑹𝑶 🐟          ┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🐠 𝑵𝒐𝒎𝒆: {peixe}\n📦 𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒂: Raro\n💰 𝑽𝒆𝒏𝒅𝒊𝒅𝒐 𝒑𝒐𝒓: R$ {valor}\n🎯 𝑹𝒂𝒓𝒊𝒅𝒂𝒅𝒆: Raro\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Incomum": "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃        🐟 𝑷𝑬𝑰𝑿𝑬 𝑰𝑵𝑪𝑶𝑴𝑼𝑴 🐟       ┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🐠 𝑵𝒐𝒎𝒆: {peixe}\n📦 𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒂: Incomum\n💰 𝑽𝒆𝒏𝒅𝒊𝒅𝒐 𝒑𝒐𝒓: R$ {valor}\n🎯 𝑹𝒂𝒓𝒊𝒅𝒂𝒅𝒆: Incomum\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Comum": "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃          🐟 𝑷𝑬𝑰𝑿𝑬 𝑪𝑶𝑴𝑼𝑴 🐟         ┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n🐠 𝑵𝒐𝒎𝒆: {peixe}\n📦 𝑪𝒂𝒕𝒆𝒈𝒐𝒓𝒊𝒂: Comum\n💰 𝑽𝒆𝒏𝒅𝒊𝒅𝒐 𝒑𝒐𝒓: R$ {valor}\n🎯 𝑹𝒂𝒓𝒊𝒅𝒂𝒅𝒆: Normal\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
};

module.exports = {
    name: 'pescar',
    execute: async (sock, msg) => {
        const remetente = msg.key.remoteJid;
        const id = db.normalizarId(msg.key.participant || remetente);
        const user = db.obterUsuario(id);

        if (!user) return;

        // ⏱️ SISTEMA DE COOLDOWN (2 Minutos)
        const agora = Date.now();
        if (user.ultimaPesca && agora - user.ultimaPesca < 120000) {
            const faltam = Math.ceil((120000 - (agora - user.ultimaPesca)) / 1000);
            const m = Math.floor(faltam / 60);
            const s = faltam % 60;
            const tempoStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
            return sock.sendMessage(remetente, { text: `⏳ Os peixes estão assustados! Espere ${tempoStr} para jogar a isca novamente.` }, { quoted: msg });
        }

        // 🎲 SISTEMA DE RNG
        const rng = Math.random() * 100;
        let raridade = "";

        if (rng < 0.1) raridade = "Secreto";
        else if (rng < 1.0) raridade = "Mítico";
        else if (rng < 3.0) raridade = "Lendário";
        else if (rng < 10.0) raridade = "Épico";
        else if (rng < 25.0) raridade = "Raro";
        else if (rng < 55.0) raridade = "Incomum";
        else raridade = "Comum";

        // 🎣 Puxando peixes originais + exclusivos do Bioma
        const marAtivoId = user.marPesca || "1";
        const marInfo = mares[marAtivoId];
        let poolPeixes = [...peixes[raridade]];

        if (marInfo && marInfo.peixes && marInfo.peixes[raridade]) {
            const idsExclusivos = marInfo.peixes[raridade];
            for (let exId of idsExclusivos) {
                if (produtos[exId]) {
                    poolPeixes.push({ nome: produtos[exId].nome, id: exId });
                }
            }
        }

        const peixeSorteado = poolPeixes[Math.floor(Math.random() * poolPeixes.length)];
        const valorLucro = produtos[peixeSorteado.id].preco;

        // 💰 AUTO-VENDA: Dinheiro direto pra carteira, sem ir pro inventário
        user.ultimaPesca = agora;
        user.dinheiro = (user.dinheiro || 0) + valorLucro;
        db.salvar(id, user);

        let texto = layouts[raridade]
            .replace('{peixe}', peixeSorteado.nome)
            .replace('{valor}', valorLucro.toLocaleString('pt-BR'));
            
        if (marAtivoId !== "1") {
            texto += `\n🌊 Pescado em: *${marInfo.nome}*`;
        }
        
        texto += `\n✅ Venda automática! O dinheiro já está na carteira.`;

        await sock.sendMessage(remetente, { text: texto }, { quoted: msg });
    }
};
