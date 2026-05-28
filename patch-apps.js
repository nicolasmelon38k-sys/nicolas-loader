const fs = require('fs');

let webCode = fs.readFileSync('web.js', 'utf8');

const newUserInfo = `
app.get('/api/userinfo', checkAuth, (req, res) => {
  const database = db.ler();
  const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
  const user = database[userId];
  
  if (!user) return res.json({ id: 'guest', nome: 'Visitante', dinheiro: 0, isAdmin: false });

  // Libera o God Mod
  const isDono = userId === '554896669255';

  res.json({
    id: userId,
    nome: user.nome || 'Usuário',
    dinheiro: user.dinheiro || 0,
    isAdmin: isDono
  });
});`;

// Substitui a rota falsa pela verdadeira que lê o banco de dados
webCode = webCode.replace(/app\.get\('\/api\/userinfo'[\s\S]*?\}\);/, newUserInfo.trim());

fs.writeFileSync('web.js', webCode);
console.log("✅ Apps restaurados e God Mod reativado na Matriz!");
