module.exports = {
    name: 'loja2',
    execute: async (sock, msg) => {
        const texto = `
╭━━━━━━━『 🍱 𝑹𝑬𝑺𝑻𝑨𝑼𝑹𝑨𝑵𝑻𝑬 𝑫𝑨𝑬𝑴𝑶𝑵 』━━━━━━━╮
┃
┃ 🍲 *𝒫𝓇𝒶𝓉𝑜𝓈 𝐹𝑒𝒾𝓉𝑜𝓈 (𝒫𝑅)*
┃ ⟫ 501. Tigela de Salada de Maçã e Uva - R$ 22.500
┃ ⟫ 505. Jarra de Suco de Melancia - R$ 27.000
┃ ⟫ 509. Frango Assado c/ Legumes - R$ 67.500
┃ ⟫ 516. Combo de 10 Hambúrgueres - R$ 90.000
┃ ⟫ 530. Banquete Fast-Food (10 Pessoas) - R$ 127.500
┃
┃ 👑 *𝒫𝓇𝒶𝓉𝑜𝓈 𝒱𝐼𝒫 𝐸𝓍𝒸𝓁𝓊𝓈𝒾𝓋𝑜𝓈*
┃ ⟫ 517. Sushi de Salmão Supremo - R$ 65.000
┃ ⟫ 518. Filé Mignon ao Vinho Tinto - R$ 68.000
┃ ⟫ 519. Risoto de Frutos do Mar - R$ 75.000
┃ ⟫ 520. Pizza Trufada de Cogumelos - R$ 80.000
┃ ⟫ 521. Lagosta Imperial - R$ 95.000
┃ ⟫ 522. Hambúrguer de Ouro - R$ 110.000
┃ ⟫ 523. Wagyu A5 com Trufas - R$ 120.000
┃ ⟫ 524. Pizza de Ouro 24K - R$ 150.000
┃ ⟫ 525. Caviar Beluga - R$ 250.000
┃ ⟫ 526. Taça de Sorvete de Diamante - R$ 300.000
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 🛒 *Como comprar:* !comprar [ID]
┃ 😋 *Como comer:* !comer [ID]
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};
