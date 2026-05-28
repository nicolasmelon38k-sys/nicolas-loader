const fs = require('fs');

let txt = fs.readFileSync('index.js', 'utf8');

// Pega todo o bloco quebrado da exaustão até o await
const trechoQuebrado = /if \(fomeUser <= 10 && !cmdLiberados\.includes\(commandName\)\) \{[\s\S]*?await command\.execute\(sock, msg, args\);/;

// Substitui por uma versão blindada em uma linha só
const trechoArrumado = `if (fomeUser <= 10 && !cmdLiberados.includes(commandName)) {
                    const msgExaustao = "⚠️ *EXAUSTÃO EXTREMA!* Você está fraco demais para fazer isso (Energia: " + fomeUser + ").\\n\\n🛒 Use *!loja* para ver as comidas.\\n😋 Use *!comer [ID]* para recuperar suas forças.\\n🎒 Veja sua mochila no *!inventario*.";
                    return sock.sendMessage(remetente, { text: msgExaustao }, { quoted: msg });
                }

                await command.execute(sock, msg, args);`;

if (txt.match(trechoQuebrado)) {
    txt = txt.replace(trechoQuebrado, trechoArrumado);
    fs.writeFileSync('index.js', txt);
    console.log("✅ Sintaxe corrigida com sucesso! O texto agora está em uma linha só.");
} else {
    console.log("⚠️ Não encontrei o erro, talvez já tenha sido arrumado.");
}
