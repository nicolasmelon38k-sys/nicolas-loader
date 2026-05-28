const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Qual é a cor do céu? ", function(resposta) {

  if (resposta === "azul") {
    console.log("Acertou!");
  } else {
    console.log("Errou!");
  }

  rl.close();
});
