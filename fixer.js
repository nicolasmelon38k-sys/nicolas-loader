const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const readline = require('readline');

const genAI = new GoogleGenerativeAI("AIzaSyAAvDg-5cjDIN0KDajlkfSnF6JsiQuNf0U");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function fix(file) {
    const path = `./commands/${file}`;
    if (!fs.existsSync(path)) return console.log("❌ Arquivo não achado!");
    const code = fs.readFileSync(path, 'utf8');

    // Forçamos o Gemma 4 que funcionou antes
    const model = genAI.getGenerativeModel({ model: "gemma-4-31b-it" });

    console.log(`🤖 Reconstruindo ${file} com lógica do DAEMON-XBOT...`);
    
    const prompt = `Aja como um desenvolvedor Node.js sênior. 
    Complete o código de comando para Baileys/WhatsApp.
    REGRAS OBRIGATÓRIAS:
    1. Use APENAS "db.obterUsuario(id)" para ler dados.
    2. Use APENAS "db.salvar(id, { emprego: 'Nome' })" para salvar.
    3. Retorne APENAS o código JavaScript. Proibido explicações, textos ou markdown.
    4. Mantenha a lista de 20 cargos com níveis individuais (Lixeiro 1, Atendente 3, etc).
    
    Código cortado:\n\n${code}`;

    try {
        const res = await model.generateContent(prompt);
        let fixed = res.response.text().trim();
        
        // Limpeza agressiva de qualquer texto que não seja código
        fixed = fixed.replace(/```javascript|```js|```/g, "");
        if (fixed.includes("Role:") || fixed.includes("Task:")) {
            fixed = fixed.split("const db")[1] ? "const db" + fixed.split("const db")[1] : fixed;
        }

        console.log("\n--- CÓDIGO RECONSTRUÍDO ---\n" + fixed + "\n-------------------\n");
        rl.question("💾 Salvar esta versão limpa? (sim/nao): ", (ans) => {
            if (ans.toLowerCase() === 'sim') {
                fs.writeFileSync(path, fixed);
                console.log("✅ Arquivo atualizado com sucesso!");
            }
            rl.close();
        });
    } catch (e) {
        console.log("❌ Erro: " + e.message);
        rl.close();
    }
}
fix(process.argv[2]);
