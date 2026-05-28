module.exports = {
    name: 'loja-peixes',
    execute: async (sock, msg) => {
        const texto = `╭━━━━━━━『 🐟 𝑴𝑬𝑹𝑪𝑨𝑫𝑶 𝑫𝑬 𝑷𝑬𝑰𝑿𝑬𝑺 』━━━━━━━╮
┃
┃ 🌊 *𝑷𝒆𝒊𝒙𝒆𝒔 & 𝑳𝒖𝒄𝒓𝒐𝒔* 🌊
┃
┃ 🐟 *𝑪𝒐𝒎𝒖𝒎*
┃ ⟫ 531. Lambari — R$ 100
┃ ⟫ 532. Cascudo — R$ 300
┃ ⟫ 533. Tilápia — R$ 600
┃ ⟫ 534. Piaba — R$ 1.000
┃ ⟫ 535. Cará — R$ 1.500
┃ ⟫ 536. Traíra pequena — R$ 2.000
┃
┃ 🐠 *𝑰𝒏𝒄𝒐𝒎𝒖𝒎*
┃ ⟫ 537. Douradinha — R$ 3.000
┃ ⟫ 538. Curimatã — R$ 4.000
┃ ⟫ 539. Piau — R$ 5.000
┃ ⟫ 540. Tucunaré juvenil — R$ 7.000
┃ ⟫ 541. Pacu — R$ 10.000
┃ ⟫ 542. Tambaqui — R$ 13.000
┃ ⟫ 543. Robalo — R$ 16.000
┃ ⟫ 544. Sardinha — R$ 19.000
┃ ⟫ 545. Badejo — R$ 20.000
┃
┃ 🐡 *𝑹𝒂𝒓𝒐*
┃ ⟫ 546. Badejo Negro — R$ 25.000
┃ ⟫ 547. Dourado — R$ 30.000
┃ ⟫ 548. Cavala — R$ 36.000
┃ ⟫ 549. Salmão do Rio — R$ 44.000
┃ ⟫ 550. Atum Pequeno — R$ 52.000
┃ ⟫ 551. Garoupa — R$ 60.000
┃ ⟫ 552. Linguado — R$ 70.000
┃ ⟫ 553. Pirarucu — R$ 80.000
┃ ⟫ 554. Peixe-Espada — R$ 90.000
┃ ⟫ 555. Truta Azul — R$ 100.000
┃
┃ 🐬 *𝑬́𝒑𝒊𝒄𝒐*
┃ ⟫ 556. Peixe-Morcego — R$ 120.000
┃ ⟫ 557. Tubarão-Bambu — R$ 140.000
┃ ⟫ 558. Peixe-Pedra — R$ 160.000
┃ ⟫ 559. Baiacu Gigante — R$ 180.000
┃ ⟫ 560. Aruanã Prateada — R$ 200.000
┃ ⟫ 561. Peixe-Lua — R$ 230.000
┃ ⟫ 562. Enguia Elétrica — R$ 260.000
┃ ⟫ 563. Raia Mística — R$ 290.000
┃
┃ 🦈 *𝑳𝒆𝒏𝒅𝒂́𝒓𝒊𝒐*
┃ ⟫ 564. Tubarão-Martelo — R$ 320.000
┃ ⟫ 565. Marlin Azul — R$ 360.000
┃ ⟫ 566. Peixe-Dragão — R$ 400.000
┃ ⟫ 567. Leviatã Juvenil — R$ 450.000
┃ ⟫ 568. Kraken-Guia — R$ 500.000
┃ ⟫ 569. Esturjão Real — R$ 550.000
┃ ⟫ 570. Peixe-Cristal — R$ 600.000
┃
┃ 🌌 *𝑴𝒊́𝒕𝒊𝒄𝒐*
┃ ⟫ 571. Peixe-Relâmpago — R$ 660.000
┃ ⟫ 572. Cardume Fantasma — R$ 720.000
┃ ⟫ 573. Rei do Abismo — R$ 780.000
┃ ⟫ 574. Sereia-Peixe — R$ 840.000
┃ ⟫ 575. Dragão Marinho — R$ 900.000
┃
┃ 🔱 *𝑺𝒆𝒄𝒓𝒆𝒕𝒐*
┃ ⟫ 579. Rei Abissal — R$ 990.000
┃ ⟫ 580. Leviatã Supremo — R$ 1.000.000
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 💡 *Como comprar:* !comprar [ID]
┃ 🛒 *Como vender:* !vender [ID] (Aviso: Peixes comprados e revendidos perdem 50% do valor)
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};
