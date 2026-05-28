const db = require('./db');

const data = db.ler();

for (let id in data) {
  const u = data[id];

  delete u.daemonEmail;
  delete u.daemonSenha;

  u.auth = {
    email: null,
    password: null,
    verified: false
  };
}

db.gravar(data);

console.log("✔ Banco preparado pro sistema novo de auth");
