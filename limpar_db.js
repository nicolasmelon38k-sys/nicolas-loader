const fs = require("fs");

// arquivo original
const input = "db.json";
// arquivo de saída
const output = "db_limpo.json";

const db = JSON.parse(fs.readFileSync(input, "utf8"));

for (const userId in db) {
  if (db[userId].auth) {
    db[userId].auth.email = null;
    db[userId].auth.password = null;
    db[userId].auth.verified = false;
  }
}

fs.writeFileSync(output, JSON.stringify(db, null, 2));

console.log("✔ Banco limpo criado:", output);
