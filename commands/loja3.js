module.exports = {
    name: 'loja3',
    execute: async (sock, msg, args) => {
        const textoLoja3 = `
╭━━━━━━━『 🛒 𝑫𝑨𝑬𝑴𝑶𝑵-𝑺𝑯𝑶𝑷 』━━━━━━━╮
┃
┃ 🧼 *𝕃𝕚𝕞𝕡𝕖𝕫𝕒 𝔽𝕒𝕔𝕚𝕒𝕝*
┃ ⟫ 56. Gel Limpeza Suave - R$ 98.850
┃ ⟫ 57. Óleo Demaquilante - R$ 134.250
┃ ⟫ 58. Espuma Purificante - R$ 108.000
┃ ⟫ 59. Leite de Limpeza - R$ 117.000
┃ ⟫ 60. Sabonete de Carvão - R$ 67.500
┃
┃ 💧 *𝕋𝕠̂𝕟𝕚𝕔𝕠𝕤 & 𝔼𝕤𝕤𝕖̂𝕟𝕔𝕚𝕒𝕤*
┃ ⟫ 61. Tônico Calmante - R$ 112.500
┃ ⟫ 62. Essência Hidratante - R$ 147.000
┃ ⟫ 63. Tônico Adstringente - R$ 123.750
┃ ⟫ 64. Loção Pré-Sérum - R$ 172.500
┃
┃ ✨ *𝓢𝓮́𝓻𝓾𝓷𝓼 & 𝓣𝓻𝓪𝓽𝓪𝓶𝓮𝓷𝓽𝓸𝓼*
┃ ⟫ 65. Sérum Vitamina C 15% - R$ 284.850
┃ ⟫ 66. Sérum Niacinamida 10% - R$ 202.500
┃ ⟫ 67. Sérum Retinol 0.5% - R$ 330.000
┃ ⟫ 68. Sérum Ácido Hialurônico - R$ 232.500
┃ ⟫ 69. Sérum Ácido Salicílico - R$ 192.000
┃ ⟫ 70. Tratamento Tea Tree - R$ 119.850
┃
┃ 🧴 *ℌ𝔦𝔡𝔯𝔞𝔱𝔞𝔫𝔱𝔢𝔰*
┃ ⟫ 71. Gel Creme Aloe Vera - R$ 142.500
┃ ⟫ 72. Creme Facial Ceramidas - R$ 210.000
┃ ⟫ 73. Loção Hidratante B5 - R$ 165.000
┃ ⟫ 74. Emulsão Matificante - R$ 157.500
┃ ⟫ 75. Bálsamo Rep. Noturno - R$ 247.500
┃
┃ ☀️ *ℙ𝕣𝕠𝕥𝕖𝕥𝕠𝕣𝕖𝕤 𝕊𝕠𝕝𝕒𝕣𝕖𝕤*
┃ ⟫ 76. Protetor Facial FPS 50+ - R$ 195.000
┃ ⟫ 77. Protetor com Cor FPS 40 - R$ 217.500
┃ ⟫ 78. Protetor Bastão FPS 50 - R$ 177.000
┃ ⟫ 79. Fluido Protetor FPS 60 - R$ 225.000
┃
┃ 🎭 *𝓜𝓪́𝓼𝓬𝓪𝓻𝓪𝓼 & 𝓔𝓼𝓯𝓸𝓵𝓲𝓪𝓷𝓽𝓮𝓼*
┃ ⟫ 80. Máscara Argila Verde - R$ 105.000
┃ ⟫ 81. Máscara Noturna Probióticos - R$ 187.500
┃ ⟫ 82. Esfoliante Enzimático - R$ 127.500
┃ ⟫ 83. Máscara Folha Centella - R$ 52.500
┃
┃ 👁️ *𝕮𝖚𝖎𝖉𝖆𝖉𝖔𝖘 𝖕𝖆𝖗𝖆 𝖔𝖘 𝕺𝖑𝖍𝖔𝖘*
┃ ⟫ 84. Creme Anti-Olheiras - R$ 240.000
┃ ⟫ 85. Sérum Rejuvenescedor - R$ 292.500
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 💡 *Como comprar:* !comprar [ID]
┃ _Exemplo: !comprar 56 cartao_
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

        await sock.sendMessage(msg.key.remoteJid, { text: textoLoja3 }, { quoted: msg });
    }
};
