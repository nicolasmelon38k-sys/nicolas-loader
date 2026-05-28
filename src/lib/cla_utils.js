const fs = require('fs');
const path = require('path');
const arquivoClas = path.join(__dirname, '../data/clas.json');

module.exports = {
    lerClas: () => {
        try {
            if (!fs.existsSync(arquivoClas)) return {};
            const data = fs.readFileSync(arquivoClas, 'utf-8');
            return data.trim() ? JSON.parse(data) : {};
        } catch (e) {
            console.error("❌ Erro ao ler clas.json:", e);
            return {};
        }
    },
    salvarClas: (d) => {
        try {
            // Escrita Atômica: Salva num arquivo temporário e depois renomeia.
            // Isso evita corrupção se o Termux fechar bem na hora de salvar!
            const tmpPath = arquivoClas + '.tmp';
            fs.writeFileSync(tmpPath, JSON.stringify(d, null, 4));
            fs.renameSync(tmpPath, arquivoClas);
        } catch (e) {
            console.error("❌ Erro ao salvar clas.json:", e);
        }
    },
    gerarId: () => {
        // Gera um ID único estilo: cla_lx3kf9a2
        return 'cla_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
};
