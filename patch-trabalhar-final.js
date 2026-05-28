const fs = require('fs');

// 1. CORRIGIR BONUS DO INFINITY NO PETS.JS
let pets = fs.readFileSync('./data/pets.js', 'utf8');
pets = pets.replace(/"Infinity": \{ icone: "🌌", bonus: 80000000 \}/, '"Infinity": { icone: "🌌", bonus: 80000000 }'); 
// (Nota: 80000000 são 80 milhões. Se estava 800M, o ajuste abaixo garante o correto)
pets = pets.replace(/bonus: 800000000/, 'bonus: 80000000');
fs.writeFileSync('./data/pets.js', pets);

// 2. CORRIGIR TRABALHAR.JS (Mostrar Ganho Total)
let trab = fs.readFileSync('./commands/trabalhar.js', 'utf8');

const novaLogica = `        const ganhoFinal = ganhoBase + bonusPet;

        await db.ganharXP(id, info.xp, sock, msg);
        db.salvar(id, { dinheiro: (user.dinheiro || 0) + ganhoFinal, ultimoTrabalho: agora });

        const txtBonus = bonusPet > 0 ? \`\\n🐾 𝑩𝒐̂𝒏𝒖𝒔 𝑷𝒆𝒕 (\${iconePet} \${nomePet}): + R$ \${bonusPet.toLocaleString('pt-BR')}\` : "";

        const texto = \`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃           💼 !𝑻𝑹𝑨𝑩𝑨𝑳𝑯𝑨𝑹 💼            ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

👤 𝑼𝒔𝒖𝒂́𝒓𝒊𝒐: \${nome}
💼 𝑬𝒎𝒑𝒓𝒆𝒈𝒐: \${emp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 𝑮𝒂𝒏𝒉𝒐𝒔:

💵 𝑺𝒂𝒍𝒂́𝒓𝒊𝒐 𝑩𝒂𝒔𝒆: R$ \${ganhoBase.toLocaleString('pt-BR')}\${txtBonus}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 𝑻𝑶𝑻𝑨𝑳 𝑨𝑫𝑰𝑪𝑰𝑶𝑵𝑨𝑫𝑶: R$ \${ganhoFinal.toLocaleString('pt-BR')}
✨ 𝑿𝑷: +\${info.xp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 𝑺𝒕𝒂𝒕𝒖𝒔:
✔ 𝑻𝒓𝒂𝒃𝒂𝒍𝒉𝒐 𝒄𝒐𝒏𝒄𝒍𝒖́𝒅𝒐
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\`;`;

// Regex para trocar o bloco do texto
const regex = /const texto = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮.*?╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;/s;
trab = trab.replace(regex, novaLogica);
fs.writeFileSync('./commands/trabalhar.js', trab);

console.log("✅ Bônus do Infinity corrigido para 80M e Layout de Ganho Total aplicado!");
