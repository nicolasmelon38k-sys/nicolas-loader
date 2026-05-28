const fs = require('fs');
let html = fs.readFileSync('./views/os.html', 'utf8');

// Arranca a barra maldita antes das crases
html = html.replace(/\\`/g, '`');

// Arranca a barra maldita antes dos cifrões
html = html.replace(/\\\${/g, '${');

fs.writeFileSync('./views/os.html', html);
console.log("✅ CÉREBRO DESBUGADO! Barras invisíveis removidas com sucesso.");
