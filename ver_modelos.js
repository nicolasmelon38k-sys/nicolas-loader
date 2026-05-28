const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config.json');

const genAI = new GoogleGenerativeAI(config.geminiKey);

async function listar() {
    try {
        // Tenta listar os modelos disponíveis para a sua chave
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.geminiKey}`);
        const data = await response.json();
        
        console.log("🟢 MODELOS DISPONÍVEIS NA SUA CONTA:");
        data.models.forEach(m => {
            if(m.supportedGenerationMethods.includes('generateContent')) {
                console.log(`- ${m.name.replace('models/', '')}`);
            }
        });
    } catch (e) {
        console.log("❌ Erro ao listar: " + e.message);
    }
}
listar();
