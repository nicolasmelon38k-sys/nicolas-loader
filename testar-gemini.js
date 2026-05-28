const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyAB39VOUSCZ4ZzG8Qiap0EiRO1nTYPPfk8';
const genAI = new GoogleGenerativeAI(apiKey);

async function escanearModelos() {
    console.log("\n\x1b[36m🔍 CONECTANDO AOS SERVIDORES DO GOOGLE...\x1b[0m");
    
    try {
        // Puxa a lista oficial direto da API REST do Google
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();

        if (!data.models) {
            console.log("\x1b[31m❌ Erro ao buscar a lista. Resposta da API:\x1b[0m", data);
            return;
        }

        // Filtra só os modelos que servem para "generateContent" (ler e criar texto)
        const modelosValidos = data.models
            .filter(m => m.supportedGenerationMethods.includes('generateContent'))
            .map(m => m.name.replace('models/', '')); // Tira o prefixo pra gente poder usar

        console.log(`\n\x1b[32m✅ Encontrados ${modelosValidos.length} modelos compatíveis com texto:\x1b[0m`);
        console.log(modelosValidos.join(' | '));

        console.log("\n\x1b[33m🚀 INICIANDO TESTE DE CARGA (PING & STATUS)...\x1b[0m\n");

        for (const nomeModelo of modelosValidos) {
            process.stdout.write(`⏳ Testando [ ${nomeModelo} ]... `);
            const inicio = Date.now();
            
            try {
                const model = genAI.getGenerativeModel({ model: nomeModelo });
                // Manda um prompt minúsculo só pra ver se o servidor não está lotado
                await model.generateContent("Responda apenas com a palavra OK.");
                const ping = Date.now() - inicio;
                
                console.log(`\x1b[32m✅ VIVO! (Ping: ${ping}ms)\x1b[0m`);
            } catch (erro) {
                // Se der erro de nome, limite ou servidor lotado, ele cai aqui
                const motivo = erro.message.split('\n')[0];
                console.log(`\x1b[31m❌ FALHOU (${motivo})\x1b[0m`);
            }
        }
        
        console.log("\n\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m");
        console.log("💡 DICA: Pegue os nomes que deram ✅ e coloque no seu inspetor.js!");

    } catch (error) {
        console.log("\x1b[31m❌ Erro crítico ao conectar:\x1b[0m", error.message);
    }
}

escanearModelos();
