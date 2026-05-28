const db = require('../db');
let petsDb = {};
try { petsDb = require('../data/pets'); } catch(e){}

const salarios = {
    "Lixeiro": { min: 400, max: 800, xp: 20 }, "Atendente": { min: 700, max: 1400, xp: 25 }, "Padeiro": { min: 1800, max: 3200, xp: 35 }, "Motorista": { min: 2500, max: 4800, xp: 45 }, "Jardineiro": { min: 3800, max: 6200, xp: 55 }, "Mecânico": { min: 5500, max: 8500, xp: 65 }, "Cozinheiro": { min: 8000, max: 12000, xp: 80 }, "Professor": { min: 12000, max: 18000, xp: 100 }, "Enfermeiro": { min: 18000, max: 28000, xp: 130 }, "Cientista": { min: 35000, max: 55000, xp: 180 }, "Piloto de Avião": { min: 60000, max: 100000, xp: 300 }, "Cirurgião Chefe": { min: 200000, max: 400000, xp: 500 }, "Juiz Federal": { min: 800000, max: 1500000, xp: 1200 }, "CEO": { min: 6000000, max: 15000000, xp: 4000 },
    "Pivete": { min: 900, max: 2000, xp: 30 }, "Batedor": { min: 1500, max: 3500, xp: 40 }, "Vigia de Boca": { min: 3000, max: 6000, xp: 60 }, "Aviãozinho": { min: 5500, max: 9000, xp: 80 }, "Clonador": { min: 10000, max: 18000, xp: 110 }, "Assaltante": { min: 18000, max: 32000, xp: 150 }, "Hacker": { min: 30000, max: 50000, xp: 200 }, "Mercenário": { min: 55000, max: 90000, xp: 280 }, "Contrabandista": { min: 90000, max: 160000, xp: 400 }, "Dono de Morro": { min: 250000, max: 500000, xp: 800 }, "Barão do Pó": { min: 500000, max: 900000, xp: 800 }, "Mafioso": { min: 3000000, max: 6000000, xp: 2500 }, "Imperador do Crime": { min: 40000000, max: 100000000, xp: 15000 },
    "Entregador Sus": { min: 1200, max: 2500, xp: 35 }, "Cobrador": { min: 2200, max: 4200, xp: 50 }, "Segurança": { min: 4500, max: 7800, xp: 75 }, "Job": { min: 8000, max: 14000, xp: 110 }, "Agiota": { min: 12000, max: 22000, xp: 160 }, "Gerente Cassino": { min: 25000, max: 42000, xp: 220 }, "Falsificador": { min: 40000, max: 68000, xp: 300 }, "Informante": { min: 75000, max: 120000, xp: 450 }, "Político": { min: 180000, max: 350000, xp: 700 }, "Agente Sombra": { min: 500000, max: 900000, xp: 1200 }, "Prostituta": { min: 150000, max: 300000, xp: 400 }, "Hacker de Elite": { min: 1500000, max: 3000000, xp: 1800 }, "Dono da Deep Web": { min: 15000000, max: 35000000, xp: 8000 }
};

module.exports = {
    name: 'trabalhar',
    execute: async (sock, msg, args) => {
        const id = msg.key.participant || msg.key.remoteJid;
        const user = db.obterUsuario(id);
        if (!user) return;

        // ⏱️ Alterado para 3 minutos
        const cooldown = 3 * 60 * 1000;
        const agora = Date.now();
        if (agora - (user.ultimoTrabalho || 0) < cooldown) {
            const falta = cooldown - (agora - user.ultimoTrabalho);
            const m = Math.floor(falta/60000), s = Math.floor((falta%60000)/1000);
            return sock.sendMessage(msg.key.remoteJid, { text: "⏳ *DESCANSE!* Volte em: *" + m + "m " + s + "s*" }, { quoted: msg });
        }

        const info = salarios[user.emprego] || salarios["Lixeiro"];
        const ganhoBase = Math.floor(Math.random() * (info.max - info.min + 1)) + info.min;

        let bonusPet = 0;
        let nomePet = "";
        let iconePet = "";
        if (user.inventario) {
            for (let itemNome of user.inventario) {
                if (petsDb[itemNome] && petsDb[itemNome].bonus > bonusPet) {
                    bonusPet = petsDb[itemNome].bonus;
                    nomePet = itemNome;
                    iconePet = petsDb[itemNome].icone;
                }
            }
        }

        const ganhoFinal = ganhoBase + bonusPet;
        await db.ganharXP(id, info.xp, sock, msg);
        db.salvar(id, { dinheiro: (user.dinheiro || 0) + ganhoFinal, ultimoTrabalho: agora });

        const txtBonus = bonusPet > 0 ? "\n🐾 *Bônus Pet (" + iconePet + " " + nomePet + "):* + R$ " + bonusPet.toLocaleString('pt-BR') : "";

        const texto = "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n" +
                      "┃       💼 !𝑻𝑹𝑨𝑩𝑨𝑳𝑯𝑨𝑹 💼       ┃\n" +
                      "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n" +
                      "👤 *Usuário:* " + (user.nome || "Jogador") + "\n" +
                      "💼 *Emprego:* " + (user.emprego || "Lixeiro") + "\n\n" +
                      "💰 *Ganhos:*\n" +
                      "💵 *Salário Base:* R$ " + ganhoBase.toLocaleString('pt-BR') + txtBonus + "\n" +
                      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                      "📈 *TOTAL ADICIONADO:* R$ " + ganhoFinal.toLocaleString('pt-BR') + "\n" +
                      "✨ *XP:* +" + info.xp + "\n" +
                      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                      "📊 _Trabalho concluído com sucesso!_\n" +
                      "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯";

        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};
