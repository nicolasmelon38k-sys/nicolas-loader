const { GoogleGenerativeAI } = require("@google/generative-ai");

async function list() {
    const genAI = new GoogleGenerativeAI("AIzaSyAAvDg-5cjDIN0KDajlkfSnF6JsiQuNf0U");
    try {
        console.log("🔍 Buscando modelos disponíveis...");
        // Usamos o fetch direto para listar os modelos
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${genAI.apiKey}`);
        const data = await response.json();
        
        console.log("\n--- MODELOS ENCONTRADOS ---");
        data.models.forEach(m => {
            if (m.supportedGenerationMethods.includes('generateContent')) {
                console.log(`✅ Nome: ${m.name.replace('models/', '')}`);
                console.log(`📝 Descrição: ${m.description}\n`);
            }
        });
        console.log("---------------------------\n");
    } catch (e) {
        console.log("❌ Erro ao listar: " + e.message);
    }
}

list();
