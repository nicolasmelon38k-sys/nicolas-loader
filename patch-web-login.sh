#!/data/data/com.termux/files/usr/bin/bash
set -e

ARQ="web.js"

python - <<'PY'
from pathlib import Path
import re

path = Path("web.js")
txt = path.read_text(encoding="utf-8")

bloco = r"""
// ===============================
// LOGIN / SESSÃO / REGISTRO
// Cola este bloco antes de "CARREGADOR DE APPS"
// ===============================

function localizarUsuarioParaLogin(credencialBruta) {
  const credencial = limparTexto(credencialBruta);
  if (!credencial) return null;

  const idNormalizado = db.normalizarId(credencial);
  const base = db.ler();

  if (idNormalizado && base[idNormalizado]) {
    return { userId: idNormalizado, user: base[idNormalizado] };
  }

  const credLower = credencial.toLowerCase();

  for (const [userId, user] of Object.entries(base)) {
    const email = limparTexto(user?.auth?.email).toLowerCase();
    const nome = limparTexto(user?.nome).toLowerCase();

    if (email && email === credLower) return { userId, user };
    if (nome && nome === credLower) return { userId, user };
  }

  return null;
}

function senhaConfere(user, senhaInformada) {
  const senha = String(senhaInformada || '');
  const auth = user?.auth || {};

  if (!senha) return false;

  if (auth.senhaHash && auth.senhaSalt) {
    try {
      const hashNovo = crypto.scryptSync(senha, auth.senhaSalt, 64);
      const hashSalvo = Buffer.from(auth.senhaHash, 'hex');
      if (hashSalvo.length !== hashNovo.length) return false;
      return crypto.timingSafeEqual(hashSalvo, hashNovo);
    } catch {
      return false;
    }
  }

  if (typeof auth.senha === 'string') {
    return auth.senha === senha;
  }

  return false;
}

function salvarLoginSessao(req, res, userId, user, senhaInformada) {
  const salt = user?.auth?.senhaSalt || crypto.randomBytes(16).toString('hex');
  const senhaHash = crypto.scryptSync(String(senhaInformada || ''), salt, 64).toString('hex');
  const token = criarTokenSessao();
  const expiraEm = Date.now() + COOKIE_MAX_AGE;

  const authNovo = {
    ...(user.auth || {}),
    senhaHash,
    senhaSalt: salt,
    senha: undefined,
    sessaoToken: token,
    sessaoExpiraEm: expiraEm
  };

  db.salvar(userId, { auth: authNovo });
  salvarSessao(res, req, userId, token);

  return authNovo;
}

function responderLogin(req, res, sucesso, msg, destino = '/os') {
  const viaApi = req.originalUrl.startsWith('/api/');

  if (viaApi) {
    return res.status(sucesso ? 200 : 401).json({
      success: sucesso,
      msg,
      redirect: sucesso ? destino : null
    });
  }

  if (sucesso) return res.redirect(destino);
  return res.redirect('/login');
}

function processarLogin(req, res) {
  try {
    const body = req.body || {};

    const credencial = limparTexto(
      body.email || body.id || body.zap || body.telefone || body.whatsapp || body.numero || body.nome
    );

    const senha = String(body.senha || body.password || '').trim();

    req.acaoHumana = 'tentou fazer login';

    if (!credencial || !senha) {
      req.acaoDetalhe = 'faltou preencher campos';
      return responderLogin(req, res, false, 'Preencha os campos.', '/login');
    }

    const encontrado = localizarUsuarioParaLogin(credencial);

    if (!encontrado) {
      req.acaoDetalhe = `usuário não encontrado (${credencial})`;
      return responderLogin(req, res, false, 'Conta não encontrada.', '/login');
    }

    if (!senhaConfere(encontrado.user, senha)) {
      req.acaoDetalhe = `senha inválida (${credencial})`;
      return responderLogin(req, res, false, 'Senha incorreta.', '/login');
    }

    salvarLoginSessao(req, res, encontrado.userId, encontrado.user, senha);

    req.acaoDetalhe = `login concluído (${credencial})`;
    return responderLogin(req, res, true, 'Login efetuado com sucesso!', '/os');
  } catch (e) {
    req.acaoHumana = 'tentou fazer login';
    req.acaoDetalhe = 'erro interno no login';
    console.error('Erro no login:', e);
    return responderLogin(req, res, false, 'Erro interno no servidor.', '/login');
  }
}

app.post('/os', processarLogin);
app.post('/api/login', processarLogin);

app.get('/registro', (req, res) => {
  req.acaoHumana = 'abriu a tela de registro';
  const caminhoRegistro = path.join(ROOT, 'views/registro.html');
  if (fs.existsSync(caminhoRegistro)) {
    return res.sendFile(caminhoRegistro);
  }
  return res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.get('/register', (req, res) => {
  req.acaoHumana = 'abriu a tela de registro';
  const caminhoRegistro = path.join(ROOT, 'views/registro.html');
  if (fs.existsSync(caminhoRegistro)) {
    return res.sendFile(caminhoRegistro);
  }
  return res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});
"""

if "function localizarUsuarioParaLogin(" not in txt:
    txt = txt.replace("// CARREGADOR DE APPS", bloco + "\n\n// CARREGADOR DE APPS")

txt = txt.replace(
    "{ m: 'GET',  p: /^\\/register$/, texto: 'abriu a tela de registro' },\n",
    "{ m: 'GET',  p: /^\\/register$/, texto: 'abriu a tela de registro' },\n  { m: 'POST', p: /^\\/os$/, texto: 'tentou fazer login' },\n"
)

path.write_text(txt, encoding="utf-8")
print("✅ patch aplicado em web.js")
PY

node -c web.js
echo "✅ web.js validado"
