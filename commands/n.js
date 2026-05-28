const db = require('../db');

module.exports = {
    name: 'n',
    execute: async (sock, msg, args) => {
        const remetente = msg.key.remoteJid;
        
        // 🛠️ Identificação robusta do dono
        let quemEnviou;
        if (msg.key.fromMe) {
            quemEnviou = sock.user.id;
        } else {
            quemEnviou = msg.key.participant || msg.key.remoteJid;
        }

        const senderId = quemEnviou.split('@')[0].replace(/:.*$/, ""); // Remove o 9 extras ou portas do ID

        // 🛡️ TRAVA DE SEGURANÇA: Aceita com ou sem o dígito 9 (comum em SC/48)
        const dono = '554896669255';
        const donoSem9 = '554866669255'; // Caso o Zap mande sem o 9

        if (senderId !== dono && senderId !== donoSem9) {
            return sock.sendMessage(remetente, { text: "❌ Comando restrito ao desenvolvedor principal." }, { quoted: msg });
        }

        // 🔢 GERADOR DE 65 MIL NÚMEROS
        const padrao = "39939309339393993292992929229292999339393939322939339393939393933939339374893293747484949261720934783";
        const rabo = "52719362928362819102937202728282928273920101010101010101010010101010101";
        
        let textoGrande = padrao.repeat(Math.ceil(65000 / padrao.length)).substring(0, 65000 - rabo.length) + rabo;

        console.log(`\x1b[33m🚀 Enviando super-mensagem de 65k caracteres para ${remetente}\x1b[0m`);

        try {
            await sock.sendMessage(remetente, { text: textoGrande });
        } catch (e) {
            console.error("Erro ao enviar mensagem gigante:", e);
        }
    }
};
