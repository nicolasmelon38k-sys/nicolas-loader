const db = require('./db');

// O seu ID exato que peguei no banco de dados
const meuId = "554896669255"; 
let user = db.obterUsuario(meuId);

if (user) {
    user.inventario = []; // Zera a array do inventário
    db.salvar(meuId, user);
    console.log("✅ Mochila do Nicolas (Imperador do Crime) esvaziada com sucesso!");
} else {
    console.log("❌ Usuário não encontrado no banco de dados.");
}
