const fs = require('fs');
const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://DAEMON-XBOT123:D282bwhd9fi2hwhsu@cluster0.mlpc7fe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const UserSchema = new mongoose.Schema({ id: String }, { strict: false });
const User = mongoose.model('User', UserSchema);

async function migrar() {
    console.log("⏳ Conectando ao MongoDB para migração...");
    await mongoose.connect(mongoURI);
    console.log("✅ Conectado!");

    const data = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
    let cont = 0;

    for (let id in data) {
        const user = data[id];
        user.id = id; // Garante que o ID tá dentro dos dados
        await User.findOneAndUpdate({ id: id }, { $set: user }, { upsert: true });
        cont++;
        console.log(`🆙 Subindo para a nuvem: ${user.nome || id}`);
    }

    console.log(`\n🎉 MUDANÇA CONCLUÍDA! ${cont} perfis foram salvos no MongoDB Atlas.`);
    process.exit();
}
migrar();
