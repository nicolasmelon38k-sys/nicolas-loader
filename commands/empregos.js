const config = require('../config.json');

module.exports = {
    name: 'empregos',
    execute: async (sock, msg) => {
        const p = config.prefix || '!';
        const texto = "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n" +
                      "┃             💼 " + p + "EMPREGOS 💼              ┃\n" +
                      "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n" +
                      "🏙️ 『 𝑳𝑬𝑮𝑨𝑰𝑺 』\n" +
                      "🪠 [Lvl 1] Lixeiro         ⟫ R$ 400-800\n" +
                      "🛍️ [Lvl 5] Atendente       ⟫ R$ 700-1.4K\n" +
                      "🥖 [Lvl 12] Padeiro        ⟫ R$ 1.8K-3.2K\n" +
                      "🚚 [Lvl 20] Motorista      ⟫ R$ 2.5K-4.8K\n" +
                      "🌻 [Lvl 28] Jardineiro     ⟫ R$ 3.8K-6.2K\n" +
                      "🔧 [Lvl 35] Mecânico       ⟫ R$ 5.5K-8.5K\n" +
                      "👨‍🍳 [Lvl 45] Cozinheiro      ⟫ R$ 8K-12K\n" +
                      "📚 [Lvl 60] Professor      ⟫ R$ 12K-18K\n" +
                      "🏥 [Lvl 80] Enfermeiro     ⟫ R$ 18K-28K\n" +
                      "🧬 [Lvl 100] Cientista      ⟫ R$ 35K-55K\n" +
                      "✈️ [Lvl 250] Piloto de Avião ⟫ R$ 60K-100K\n" +
                      "🩺 [Lvl 400] Cirurgião Chefe ⟫ R$ 200K-400K\n" +
                      "⚖️ [Lvl 800] Juiz Federal   ⟫ R$ 800K-1.5M\n" +
                      "🏢 [Lvl 2000] CEO           ⟫ R$ 6M-15M\n\n" +
                      "🔥 『 𝑰𝑳𝑬𝑮𝑨𝑰𝑺 』\n" +
                      "🥷 [Lvl 8] Pivete          ⟫ R$ 900-2K\n" +
                      "👛 [Lvl 15] Batedor        ⟫ R$ 1.5K-3.5K\n" +
                      "👀 [Lvl 25] Vigia de Boca  ⟫ R$ 3K-6K\n" +
                      "🚲 [Lvl 35] Aviãozinho     ⟫ R$ 5.5K-9K\n" +
                      "💳 [Lvl 50] Clonador       ⟫ R$ 10K-18K\n" +
                      "🔫 [Lvl 70] Assaltante     ⟫ R$ 18K-32K\n" +
                      "💻 [Lvl 85] Hacker         ⟫ R$ 30K-50K\n" +
                      "⚔️ [Lvl 110] Mercenário     ⟫ R$ 55K-90K\n" +
                      "📦 [Lvl 140] Contrabandista ⟫ R$ 90K-160K\n" +
                      "👑 [Lvl 180] Dono de Morro  ⟫ R$ 250K-500K\n" +
                      "❄️ [Lvl 600] Barão do Pó    ⟫ R$ 500K-900K\n" +
                      "🕴️ [Lvl 1500] Mafioso       ⟫ R$ 3M-6M\n" +
                      "🌍 [Lvl 4000] Imperador do Crime ⟫ R$ 40M-100M\n\n" +
                      "🕶️ 『 𝑼𝑵𝑫𝑬𝑹𝑮𝑹𝑶𝑼𝑵𝑫 』\n" +
                      "📦 [Lvl 10] Entregador Sus  ⟫ R$ 1.2K-2.5K\n" +
                      "💢 [Lvl 18] Cobrador       ⟫ R$ 2.2K-4.2K\n" +
                      "🛡️ [Lvl 30] Segurança      ⟫ R$ 4.5K-7.8K\n" +
                      "✨ [Lvl 40] Job            ⟫ R$ 8K-14K\n" +
                      "💰 [Lvl 55] Agiota         ⟫ R$ 12K-22K\n" +
                      "🎰 [Lvl 75] Gerente Cassino⟫ R$ 25K-42K\n" +
                      "📄 [Lvl 95] Falsificador   ⟫ R$ 40K-68K\n" +
                      "🕵️ [Lvl 120] Informante     ⟫ R$ 75K-120K\n" +
                      "🏛️ [Lvl 160] Político      ⟫ R$ 180K-350K\n" +
                      "🌑 [Lvl 200] Agente Sombra  ⟫ R$ 500K-900K\n" +
                      "💄 [Lvl 300] Prostituta     ⟫ R$ 150K-300K\n" +
                      "🕸️ [Lvl 1000] Hacker de Elite ⟫ R$ 1.5M-3M\n" +
                      "🌌 [Lvl 3000] Dono da Deep Web ⟫ R$ 15M-35M\n\n" +
                      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                      "💡 Use: " + p + "cargo nome-do-cargo\n" +
                      "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯";

        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};
