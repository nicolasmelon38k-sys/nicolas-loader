const fs = require('fs');

let webCode = fs.readFileSync('web.js', 'utf8');

const rotaUserinfoAntiga = `app.get('/api/userinfo', checkAuth, (req, res) => {
  const database = db.ler();
  const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
  const user = database[userId];

  if (!user) return res.json({ id: 'guest', nome: 'Visitante', dinheiro: 0, isAdmin: false });

  // O sistema checa se quem tá logado é o Nicolas Melo
  const isDono = userId === '554896669255';

  res.json({
    id: userId,
    nome: user.nome || 'Usuário',
    dinheiro: user.dinheiro || 0,
    isAdmin: isDono
  });                                                                                    });`;

const rotaUserinfoNova = `app.get('/api/userinfo', checkAuth, (req, res) => {
  const database = db.ler();
  const userId = (req.cookies.userId || '').replace('@s.whatsapp.net', '');
  const user = database[userId];

  if (!user) return res.json({ id: 'guest', nome: 'Visitante', dinheiro: 0, isAdmin: false });

  const isDono = userId === '554896669255';
  
  // Calcula o patrimônio líquido (Carteira + Banco)
  const saldoCarteira = Number(user.dinheiro) || 0;
  const saldoBanco = Number(user.banco) || 0;
  const fortunaTotal = saldoCarteira + saldoBanco;

  res.json({
    id: userId,
    nome: user.nome || 'Usuário',
    dinheiro: fortunaTotal, 
    isAdmin: isDono
  });
});`;

// Faz a substituição garantindo que a sintaxe seja a mesma do arquivo
const searchRegex = /app\.get\('\/api\/userinfo'[\s\S]*?\}\);/;
webCode = webCode.replace(searchRegex, rotaUserinfoNova);

fs.writeFileSync('web.js', webCode);
console.log('✅ Patrimônio Líquido Sincronizado! Carteira e Banco unificados na tela.');
