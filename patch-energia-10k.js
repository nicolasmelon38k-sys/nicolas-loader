const fs = require('fs');
const path = require('path');

console.log("🛠️ INICIANDO UPGRADE DO SISTEMA DE ENERGIA/FOME (10K MAX)...");

// 1. ALTERAR DB.JS (Novos registros começam com 10.000)
let dbPath = path.join(__dirname, 'db.js');
let dbJs = fs.readFileSync(dbPath, 'utf8');
dbJs = dbJs.replace(/fome: 100/g, 'fome: 10000');
fs.writeFileSync(dbPath, dbJs);
console.log("✅ DB.JS atualizado (Novatos começam com 10k de energia).");

// 2. ALTERAR INDEX.JS (Sistema de Exaustão e Corte de Comandos)
let indexPath = path.join(__dirname, 'index.js');
let indexJs = fs.readFileSync(indexPath, 'utf8');

// Atualiza a recuperação automática caso o bot não ache a fome
indexJs = indexJs.replace(/if \(user\.fome === undefined\) user\.fome = 100;/g, 'if (user.fome === undefined) user.fome = 10000;');

// Injeta o bloqueio de comandos
const alvoCmd = `if (command) {\n                await command.execute(sock, msg, args);`;
const blockCmd = `if (command) {
                // 🛡️ SISTEMA DE EXAUSTÃO
                const cmdLiberados = ['comer', 'comprar', 'loja', 'loja2', 'loja3', 'inventario', 'pix', 'saldo'];
                const fomeUser = user.fome !== undefined ? user.fome : 10000;
                
                if (fomeUser <= 10 && !cmdLiberados.includes(commandName)) {
                    return sock.sendMessage(remetente, { text: "⚠️ *EXAUSTÃO EXTREMA!* Você está fraco demais para fazer isso (Energia: " + fomeUser + ").\n\n🛒 Use *!loja* para ver as comidas.\n😋 Use *!comer [ID]* para recuperar suas forças.\n🎒 Veja sua mochila no *!inventario*." }, { quoted: msg });
                }
                
                await command.execute(sock, msg, args);`;

if (indexJs.includes('await command.execute(sock, msg, args);') && !indexJs.includes('SISTEMA DE EXAUSTÃO')) {
    indexJs = indexJs.replace(/if \(command\) \{\s*await command\.execute\(sock, msg, args\);/, blockCmd);
    fs.writeFileSync(indexPath, indexJs);
    console.log("✅ INDEX.JS atualizado (Bloqueio por Exaustão ativado).");
} else {
    console.log("⚠️ INDEX.JS já possui o bloqueio de exaustão.");
}

// 3. ALTERAR PERFIL.JS (Visualização da Barra de 10k)
let perfilPath = path.join(__dirname, 'commands', 'perfil.js');
let perfilJs = fs.readFileSync(perfilPath, 'utf8');
perfilJs = perfilJs.replace(/user\.fome !== undefined \? user\.fome : 100/g, 'user.fome !== undefined ? user.fome : 10000');
perfilJs = perfilJs.replace(/Fome:\* \$\{fomeAtual\} \/ 100/g, 'Energia:* ${fomeAtual.toLocaleString(\'pt-BR\')} / 10.000');
fs.writeFileSync(perfilPath, perfilJs);
console.log("✅ PERFIL.JS atualizado (Barra de energia estendida).");

// 4. ALTERAR COMER.JS (Ajustar Limites e Escala de Restauração)
let comerPath = path.join(__dirname, 'commands', 'comer.js');
let comerJs = fs.readFileSync(comerPath, 'utf8');

comerJs = comerJs.replace(/user\.fome !== undefined \? user\.fome : 100/g, 'user.fome !== undefined ? user.fome : 10000');
comerJs = comerJs.replace(/fomeAtual >= 100/g, 'fomeAtual >= 10000');
comerJs = comerJs.replace(/100\/100/g, '10.000/10.000');
comerJs = comerJs.replace(/Math\.min\(100,/g, 'Math.min(10000,');
comerJs = comerJs.replace(/\$\{fomeAtual\}\/100/g, '${fomeAtual.toLocaleString(\'pt-BR\')}/10.000');

comerJs = comerJs.replace(/recupera = 50;/g, 'recupera = 5000;');
comerJs = comerJs.replace(/recupera = 30;/g, 'recupera = 3000;');
comerJs = comerJs.replace(/recupera = 15;/g, 'recupera = 1500;');

fs.writeFileSync(comerPath, comerJs);
console.log("✅ COMER.JS atualizado (Comidas agora restauram milhares de pontos).");

// 5. ATUALIZAR DATABASE.JSON (Garantir que ninguém morra assim que o bot ligar)
const dbJsonPath = path.join(__dirname, 'database.json');
let dbData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
let dbChanged = false;

for(let key in dbData) {
    if(dbData[key].fome !== undefined && dbData[key].fome <= 100) {
        dbData[key].fome = 10000;
        dbChanged = true;
    } else if (dbData[key].fome === undefined) {
        dbData[key].fome = 10000;
        dbChanged = true;
    }
}

if (dbChanged) {
    fs.writeFileSync(dbJsonPath, JSON.stringify(dbData, null, 2));
    console.log("✅ DATABASE curada! Todos os jogadores receberam 10.000 de energia inicial.");
}

console.log("🚀 SISTEMA DE SOBREVIVÊNCIA INSTALADO! Inicie o bot com 'node index'.");
