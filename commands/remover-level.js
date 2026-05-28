const db = require('../db');
const { pegarNome } = require('../utils/_util');

// Traz a lista sincronizada para não errar demissões
const listaCargos = {
    "Lixeiro": 1, "Atendente": 5, "Padeiro": 12, "Motorista": 20, "Jardineiro": 28, "Mecânico": 35,
    "Cozinheiro": 45, "Professor": 60, "Enfermeiro": 80, "Cientista": 100, "Piloto de Avião": 250,
    "Cirurgião Chefe": 400, "Juiz Federal": 800, "CEO": 2000, "Pivete": 8, "Batedor": 15,
    "Vigia de Boca": 25, "Aviãozinho": 35, "Clonador": 50, "Assaltante": 70, "Hacker": 85,
    "Mercenário": 110, "Contrabandista": 140, "Dono de Morro": 180, "Barão do Pó": 600,
    "Mafioso": 1500, "Imperador do Crime": 4000, "Entregador Sus": 10, "Cobrador": 18,
    "Segurança": 30, "Job": 40, "Agiota": 55, "Gerente Cassino": 75, "Falsificador": 95,
    "Informante": 120, "Político": 160, "Agente Sombra": 200, "Prostituta": 300,
    "Hacker de Elite": 1000, "Dono da Deep Web": 3000
};

module.exports = {
    name: 'remover-level',
    execute: async (sock, msg, args) => {
        const reis = ['554896669255', '161830827753644'];
        const rem = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        if (!reis.includes(rem)) return;

        const info = msg.message?.extendedTextMessage?.contextInfo || {};
        let alvoId, valorBruto;

        if (info?.quotedMessage) { alvoId = db.normalizarId(info.participant); valorBruto = args[0]; }
        else if (info?.mentionedJid?.[0]) { alvoId = db.normalizarId(info.mentionedJid[0]); valorBruto = args[1]; }
        else { alvoId = rem; valorBruto = args[0]; }

        const user = db.obterUsuario(alvoId);
        if (!user) return;

        const lvlParaRemover = Number(String(valorBruto).replace(/\D/g, '').slice(0, 15));
        if (!lvlParaRemover || lvlParaRemover <= 0) return;

        const oldLevel = Number(user.level || 1);
        const novoLevel = Math.max(1, oldLevel - lvlParaRemover);
        const nome = user.nome || await pegarNome(sock, alvoId);

        let cargoFinal = user.emprego || "Auxiliar Geral";
        let avisoCargo = "Mantido";

        let lvlExigido = listaCargos[user.emprego];
        if (lvlExigido && novoLevel < lvlExigido) {
            cargoFinal = "Auxiliar Geral";
            avisoCargo = "⚠️ PERDIDO (Nível insuficiente)";
        }

        db.salvar(alvoId, { level: novoLevel, xp: 0, emprego: cargoFinal });

        const texto = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃      📉 𝑹𝑬𝑩𝑨𝑰𝑿𝑨𝑴𝑬𝑵𝑻𝑶 📉      ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
👤 *𝑼𝒔𝒖𝒂́𝒓𝒊𝒐:* ${nome}
⚠️ *𝑺𝒕𝒂𝒕𝒖𝒔:* Punição Administrativa
📉 *𝑯𝑰𝑺𝑻𝑶́𝑹𝑰𝑪𝑶:*
• Level Anterior: ${oldLevel}
• Removidos: -${lvlParaRemover}
• Level Atual: ${novoLevel}
💼 *𝑶𝑪𝑼𝑷𝑨𝑪̧𝑨̃𝑶:*
• Cargo Final: ${cargoFinal}
• Motivo: ${avisoCargo}
📊 *𝑺𝑻𝑨𝑻𝑼𝑺:*
• XP: Resetado para 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ _Justiça do bot aplicada com sucesso._`;

        await sock.sendMessage(msg.key.remoteJid, { text: texto, mentions: [`${alvoId}@s.whatsapp.net`] }, { quoted: msg });
    }
};