const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const config = require('./config.json');

const genAI = new GoogleGenerativeAI(config.geminiKey);

// Usando o modelo que apareceu na sua lista!
const MODELO = "gemini-flash-latest";

async function rodarInspetor() {
    console.log(`🔍 Daemon-IA v3.1 iniciando inspeção com ${MODELO}...`);

    try {
        const webJs = fs.readFileSync('./web.js', 'utf8');
        const dbJs = fs.readFileSync('./db.js', 'utf8');
        const rotas = fs.readdirSync('./rotas_web').join(', ');

        let sample = "";
        if(fs.existsSync('./rotas_web/loja.js')) sample = fs.readFileSync('./rotas_web/loja.js', 'utf8');

        const prompt = `
        VOCÊ É O INSPETOR DAEMON. Analise os erros e dê o código de correção.

        ERROS RELATADOS:
        1. Site dá "Cannot GET" nas rotas /perfil, /bank, /gov.
        2. Saldo aparece como 0 (Usuário tem 200k no database.json).
        3. Erro "tabelaCartoes undefined" na loja.js.

        ARQUIVO WEB.JS:
        ${webJs}

        ARQUIVO DB.JS:
        ${dbJs}

        ARQUIVOS NA PASTA ROTAS_WEB:
        ${rotas}

        CÓDIGO DA LOJA.JS (EXEMPLO):
        ${sample}

        Dê o diagnóstico direto e o código para consertar o web.js e as rotas.
        `;

        const model = genAI.getGenerativeModel({ model: MODELO });
        const result = await model.generateContent(prompt);

        console.log("\n╭━━━━━━━『 𝑫𝑰𝑨𝑮𝑵𝑶́𝑺𝑻𝑰𝑪𝑶 𝑫𝑨 𝑰𝑨 』━━━━━━━╮\n");
        console.log(result.response.text());
        console.log("\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n");

    } catch (e) {
        console.log("❌ Erro na análise: " + e.message);
    }
}

// A MÁGICA TÁ AQUI: Isso permite que o index.js puxe a função!
module.exports = { rodarInspetor };
