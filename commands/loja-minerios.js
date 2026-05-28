module.exports = {
    name: 'loja-minerios',
    execute: async (sock, msg) => {
        const texto = "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n" +
                      "┃        ✦  𝑫𝑨𝑬𝑴𝑶𝑵-𝑴𝑰𝑵𝑬́𝑹𝑰𝑶𝑺  ✦        ┃\n" +
                      "┃         60 MINÉRIOS • PREÇO EM /g      ┃\n" +
                      "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n" +
                      "┏━━━━━━━━━━━━━━━━━━━━━━┓\n" +
                      "┃ 1) 𝑰𝑵𝑫𝑼𝑺𝑻𝑹𝑰𝑨𝑰𝑺       ┃\n" +
                      "┗━━━━━━━━━━━━━━━━━━━━━━┛\n" +
                      "⛏️ [801] Minério de Ferro  — R$ 600/g\n" +
                      "🟤 [802] Bauxita           — R$ 950/g\n" +
                      "⚙️ [803] Cobre             — R$ 2,5k/g\n" +
                      "🪙 [804] Zinco             — R$ 1,7k/g\n" +
                      "🧲 [805] Níquel            — R$ 4,3k/g\n" +
                      "🧪 [806] Estanho           — R$ 5,9k/g\n" +
                      "🔋 [807] Lítio             — R$ 8,4k/g\n" +
                      "⬛ [808] Grafite           — R$ 1,4k/g\n" +
                      "🧂 [809] Sal-gema          — R$ 420/g\n" +
                      "🟡 [810] Enxofre           — R$ 980/g\n" +
                      "🪨 [811] Caulim            — R$ 750/g\n" +
                      "🟠 [812] Fosfato           — R$ 2,1k/g\n\n" +
                      "┏━━━━━━━━━━━━━━━━━━━━━━┓\n" +
                      "┃ 2) 𝑴𝑬𝑻𝑨𝑰𝑺 𝑽𝑨𝑳𝑰𝑶𝑺𝑶𝑺   ┃\n" +
                      "┗━━━━━━━━━━━━━━━━━━━━━━┛\n" +
                      "💛 [813] Ouro nativo       — R$ 42k/g\n" +
                      "🤍 [814] Prata nativa      — R$ 2,1k/g\n" +
                      "✨ [815] Platina           — R$ 78k/g\n" +
                      "🌫️ [816] Paládio           — R$ 95k/g\n" +
                      "⚪ [817] Ródio             — R$ 260k/g\n" +
                      "🔶 [818] Irídio            — R$ 180k/g\n" +
                      "🔷 [819] Ósmio             — R$ 150k/g\n" +
                      "🪙 [820] Rutênio           — R$ 35k/g\n" +
                      "🪙 [821] Ouro bruto        — R$ 38k/g\n" +
                      "🧿 [822] Prata bruta       — R$ 1,5k/g\n" +
                      "⚫ [823] Rênio             — R$ 120k/g\n" +
                      "🪨 [824] Tântalo           — R$ 98k/g\n\n" +
                      "┏━━━━━━━━━━━━━━━━━━━━━━┓\n" +
                      "┃ 3) 𝑮𝑬𝑴𝑨𝑺 𝑪𝑳𝑨́𝑺𝑺𝑰𝑪𝑨𝑺   ┃\n" +
                      "┗━━━━━━━━━━━━━━━━━━━━━━┛\n" +
                      "💎 [825] Diamante bruto    — R$ 260k/g\n" +
                      "💎 [826] Diamante lapidado — R$ 620k/g\n" +
                      "❤️ [827] Rubi              — R$ 190k/g\n" +
                      "💙 [828] Safira azul       — R$ 160k/g\n" +
                      "💚 [829] Esmeralda         — R$ 185k/g\n" +
                      "🟣 [830] Ametista          — R$ 12k/g\n" +
                      "🟠 [831] Topázio           — R$ 18k/g\n" +
                      "🟡 [832] Citrino           — R$ 10k/g\n" +
                      "🔷 [833] Água-marinha      — R$ 24k/g\n" +
                      "🌈 [834] Opala             — R$ 41k/g\n" +
                      "🟢 [835] Peridoto          — R$ 15k/g\n" +
                      "⚪ [836] Quartzo           — R$ 3,2k/g\n\n" +
                      "┏━━━━━━━━━━━━━━━━━━━━━━┓\n" +
                      "┃ 4) 𝑹𝑨𝑹𝑶𝑺 / 𝑵𝑶𝑩𝑹𝑬𝑺    ┃\n" +
                      "┗━━━━━━━━━━━━━━━━━━━━━━┛\n" +
                      "💠 [837] Espinélio         — R$ 48k/g\n" +
                      "🌸 [838] Morganita         — R$ 36k/g\n" +
                      "🦋 [839] Tanzanita         — R$ 120k/g\n" +
                      "🪞 [840] Alexandrita       — R$ 390k/g\n" +
                      "🌊 [841] Larimar           — R$ 28k/g\n" +
                      "🧿 [842] Jadeíta           — R$ 72k/g\n" +
                      "🟩 [843] Nephrita          — R$ 12k/g\n" +
                      "⚪ [844] Pedra-da-lua      — R$ 18k/g\n" +
                      "🟠 [845] Andaluzita        — R$ 24k/g\n" +
                      "🩵 [846] Turmalina paraíba — R$ 520k/g\n" +
                      "💜 [847] Turmalina roxa    — R$ 42k/g\n" +
                      "🩷 [848] Turmalina rosa    — R$ 55k/g\n\n" +
                      "┏━━━━━━━━━━━━━━━━━━━━━━┓\n" +
                      "┃ 5) 𝑫𝑰𝑨𝑴𝑨𝑵𝑻𝑬𝑺 𝑬𝑺𝑷𝑬𝑪. ┃\n" +
                      "┗━━━━━━━━━━━━━━━━━━━━━━┛\n" +
                      "💗 [849] Diamante rosa     — R$ 2,4m/g\n" +
                      "💙 [850] Diamante azul     — R$ 4,8m/g\n" +
                      "❤️ [851] Diamante vermelho — R$ 12m/g\n" +
                      "🖤 [852] Diamante negro    — R$ 950k/g\n" +
                      "💎 [853] D. bruto premium  — R$ 1,1m/g\n" +
                      "💠 [854] Diamante estrela  — R$ 2m/g\n" +
                      "🌟 [855] Diamante de fogo  — R$ 3,5m/g\n" +
                      "❄️ [856] Diamante gelo     — R$ 4,2m/g\n\n" +
                      "┏━━━━━━━━━━━━━━━━━━━━━━┓\n" +
                      "┃ 6) 𝑬𝑿𝑶́𝑻𝑰𝑪𝑶𝑺 𝑻𝑶𝑷      ┃\n" +
                      "┗━━━━━━━━━━━━━━━━━━━━━━┛\n" +
                      "⚡ [857] Meteorito ferroso — R$ 180k/g\n" +
                      "🌑 [858] Meteorito lunar   — R$ 520k/g\n" +
                      "🪐 [859] Frag. cósmico     — R$ 1,6m/g\n" +
                      "👑 [860] Núcleo de cristal — R$ 4,5m/g\n\n" +
                      "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n" +
                      "┃ 💡 Como comprar: !comprar [ID]         ┃\n" +
                      "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯";

        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};
