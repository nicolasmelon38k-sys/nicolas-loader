const prompt = require("prompt-sync")();

let resposta = prompt("Qual é a capital do Brasil? ");

if (resposta === "Brasília") {
  console.log("Acertou!");
} else {
  console.log("Errou!");
}
