module.exports = {
    name: 'loja',
    execute: async (sock, msg, args) => {
        const textoLoja = `
╭━━━━━━━『 🛒 𝑫𝑨𝑬𝑴𝑶𝑵-𝑺𝑯𝑶𝑷 』━━━━━━━╮
┃
┃ 🍎 *𝐹𝓇𝓊𝓉𝒶𝓈 𝐹𝓇𝑒𝓈𝓆𝓊𝒾𝓃𝒽𝒶𝓈*
┃ ⟫ 1. Maçã Fuji - R$ 5.250
┃ ⟫ 2. Laranja Pera - R$ 4.200
┃ ⟫ 3. Melancia Baby - R$ 12.000
┃ ⟫ 4. Banana Nanica - R$ 6.000
┃ ⟫ 5. Morango (250g) - R$ 11.250
┃ ⟫ 6. Uva Thompson - R$ 9.000
┃ ⟫ 7. Abacaxi Pérola - R$ 9.750
┃ ⟫ 8. Manga Palmer - R$ 7.500
┃ ⟫ 9. Pêssego - R$ 10.500
┃ ⟫ 10. Limão Tahiti - R$ 3.000
┃
┃ 🥩 *ℂ𝕒𝕣𝕟𝕖𝕤 & ℂ𝕠𝕞𝕡𝕒𝕟𝕙𝕚𝕒𝕤*
┃ ⟫ 11. Carne de Porco - R$ 33.000
┃ ⟫ 12. Carne de Boi - R$ 52.500
┃ ⟫ 13. Costela de Porco - R$ 42.000
┃ ⟫ 14. Frango Inteiro - R$ 22.500
┃ ⟫ 15. Linguiça Toscana - R$ 27.000
┃ ⟫ 16. Bacon - R$ 37.500
┃ ⟫ 17. Salsicha - R$ 18.000
┃ ⟫ 18. Hambúrguer (10x) - R$ 30.000
┃ ⟫ 19. Coxinha de Frango - R$ 4.500
┃ ⟫ 20. Pastel de Carne - R$ 6.000
┃
┃ 🥗 *𝓡𝓮𝓰𝓪𝓵 𝓗𝓸𝓻𝓽𝓲𝓯𝓻𝓾𝓽𝓲*
┃ ⟫ 21. Alface Americana - R$ 4.500
┃ ⟫ 22. Tomate - R$ 6.750
┃ ⟫ 23. Cebola - R$ 3.750
┃ ⟫ 24. Batata - R$ 4.500
┃ ⟫ 25. Cenoura - R$ 3.000
┃ ⟫ 26. Pepino - R$ 5.250
┃ ⟫ 27. Brócolis - R$ 9.000
┃ ⟫ 28. Couve-flor - R$ 8.250
┃ ⟫ 29. Espinafre - R$ 7.500
┃ ⟫ 30. Abobrinha - R$ 6.000
┃
┃ 📱 *𝕮𝖔𝖗𝖎𝖆𝖑 𝕿𝖊𝖈𝖓𝖔𝖑𝖔𝖌𝖎𝖆*
┃ ⟫ 31. Galaxy A54 - R$ 2.700.000
┃ ⟫ 32. Moto G53 - R$ 1.800.000
┃ ⟫ 33. Notebook Dell - R$ 3.750.000
┃ ⟫ 34. Fone JBL - R$ 300.000
┃ ⟫ 35. Caixa de Som - R$ 225.000
┃ ⟫ 36. Power Bank - R$ 120.000
┃ ⟫ 37. Cabo USB-C - R$ 30.000
┃ ⟫ 38. Adaptador - R$ 22.500
┃ ⟫ 39. Mi Band 8 - R$ 375.000
┃ ⟫ 40. Teclado Sem Fio - R$ 150.000
┃
┃ 🏠 *𝔗𝔦𝔱𝔞𝔫 𝔓𝔯𝔬𝔡𝔲𝔱𝔬𝔰 𝔏𝔞𝔯*
┃ ⟫ 41. Detergente - R$ 4.500
┃ ⟫ 42. Sabão em Pó - R$ 12.000
┃ ⟫ 43. Amaciante - R$ 9.000
┃ ⟫ 44. Água Sanitária - R$ 6.000
┃ ⟫ 45. Desinfetante - R$ 10.500
┃ ⟫ 46. Papel Higiênico - R$ 7.500
┃ ⟫ 47. Saco de Lixo - R$ 12.000
┃ ⟫ 48. Esponja (5x) - R$ 6.000
┃ ⟫ 49. Pano de Chão - R$ 9.000
┃ ⟫ 50. Vassoura - R$ 15.000
┃ ⟫ 51. Rodo - R$ 12.000
┃ ⟫ 52. Balde - R$ 18.000
┃ ⟫ 53. Lâmpada LED - R$ 7.500
┃ ⟫ 54. Pilhas AA (4x) - R$ 10.500
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 💡 *Como comprar:* !comprar [ID]
┃ _Exemplo: !comprar 31_
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

        await sock.sendMessage(msg.key.remoteJid, { text: textoLoja }, { quoted: msg });
    }
};
