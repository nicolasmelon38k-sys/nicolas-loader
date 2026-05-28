#!/data/data/com.termux/files/usr/bin/bash
set -e

python - <<'PY'
from pathlib import Path
import re

path = Path("web.js")
txt = path.read_text(encoding="utf-8")

# Remove qualquer push solto que foi adicionado no fim do arquivo
txt = re.sub(r"\nappsFront\.push\('peixes'\);\s*$", "\n", txt)

# Adiciona peixes no array appsFront se ainda não tiver
txt = txt.replace(
"""const appsFront = [
  'os', 'perfil', 'ranking', 'chat', 'bank', 'store',
  'gov', 'tigrinho', 'casino', 'imoveis', 'empregos',
  'inventario', 'tycoon'
];
""",
"""const appsFront = [
  'os', 'perfil', 'ranking', 'chat', 'bank', 'store',
  'gov', 'tigrinho', 'casino', 'imoveis', 'empregos',
  'inventario', 'tycoon', 'peixes'
];
"""
)

# Adiciona o texto humano da rota peixes
txt = txt.replace(
"""      tycoon: 'abriu a área da empresa'
    };
""",
"""      tycoon: 'abriu a área da empresa',
      peixes: 'abriu a loja de peixes'
    };
"""
)

path.write_text(txt, encoding="utf-8")
print("✅ peixes adicionado em web.js")
PY

node -c web.js
echo "✅ web.js validado"
