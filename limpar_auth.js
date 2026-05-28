const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'db.json');

if (!fs.existsSync(file)) {
  console.log('db.json não encontrado');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(file, 'utf8'));

for (const id in db) {
  delete db[id].daemonEmail;
  delete db[id].daemonSenha;
  if (db[id].auth) {
    delete db[id].auth;
  }
}

fs.writeFileSync(file, JSON.stringify(db, null, 2));
console.log('Auth antigo removido do banco.');
