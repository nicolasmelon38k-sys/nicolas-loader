module.exports = {
    name: 'loja-pets',
    execute: async (sock, msg) => {
        const texto = `╭━━━━━━━『 🐾 𝑫𝑨𝑬𝑴𝑶𝑵-𝑷𝑬𝑻𝑺 』━━━━━━━╮
┃
┃ 🌸 *𝑷𝒆𝒕𝒔 𝑭𝒐𝒇𝒊𝒏𝒉𝒐𝒔 & 𝑩𝒐̂𝒏𝒖𝒔* 🌸
┃
┃ 🐶 *𝐶𝑜𝑚𝑢𝑚*
┃ ⟫ 601. Bolinha — R$ 500 — +R$ 50
┃ ⟫ 602. Mimi — R$ 1K — +R$ 75
┃ ⟫ 603. Nino — R$ 1.5K — +R$ 100
┃ ⟫ 604. Pipoca — R$ 2K — +R$ 125
┃ ⟫ 605. Floquinho — R$ 2.5K — +R$ 150
┃ ⟫ 606. Pingo — R$ 3K — +R$ 175
┃ ⟫ 607. Tico — R$ 3.5K — +R$ 200
┃ ⟫ 608. Fofuxo — R$ 4K — +R$ 225
┃ ⟫ 609. Lili — R$ 4.5K — +R$ 250
┃ ⟫ 610. Totó — R$ 5K — +R$ 300
┃
┃ 🦊 *𝐼𝑛𝑐𝑜𝑚𝑢𝑚*
┃ ⟫ 611. Luna — R$ 7.5K — +R$ 400
┃ ⟫ 612. Kiko — R$ 9K — +R$ 500
┃ ⟫ 613. Nuvem — R$ 10.5K — +R$ 600
┃ ⟫ 614. Mel — R$ 12K — +R$ 700
┃ ⟫ 615. Choco — R$ 13.5K — +R$ 800
┃ ⟫ 616. Pandora — R$ 15K — +R$ 900
┃ ⟫ 617. Blue — R$ 17.5K — +R$ 1K
┃ ⟫ 618. Amora — R$ 20K — +R$ 1.1K
┃ ⟫ 619. Mimo — R$ 22.5K — +R$ 1.2K
┃ ⟫ 620. Cookie — R$ 25K — +R$ 1.5K
┃
┃ 🐺 *𝑹𝒂𝒓𝒐*
┃ ⟫ 621. Fênix — R$ 30K — +R$ 2K
┃ ⟫ 622. Draco — R$ 35K — +R$ 2.5K
┃ ⟫ 623. Sombra — R$ 40K — +R$ 3K
┃ ⟫ 624. Peludinho — R$ 45K — +R$ 3.5K
┃ ⟫ 625. Sol — R$ 50K — +R$ 4K
┃ ⟫ 626. Douradinho — R$ 55K — +R$ 4.5K
┃ ⟫ 627. Fumaça — R$ 60K — +R$ 5K
┃ ⟫ 628. Kiwi — R$ 65K — +R$ 5.5K
┃ ⟫ 629. Branquinho — R$ 70K — +R$ 6K
┃ ⟫ 630. Jacozinho — R$ 75K — +R$ 7K
┃
┃ ✨ *𝑬́𝒑𝒊𝒄𝒐*
┃ ⟫ 631. Astra — R$ 90K — +R$ 10K
┃ ⟫ 632. Noa — R$ 110K — +R$ 12K
┃ ⟫ 633. Luar — R$ 130K — +R$ 14K
┃ ⟫ 634. Selene — R$ 150K — +R$ 16K
┃ ⟫ 635. Spike — R$ 175K — +R$ 18K
┃ ⟫ 636. Orion — R$ 200K — +R$ 20K
┃ ⟫ 637. Ursozinho — R$ 225K — +R$ 22K
┃ ⟫ 638. Vento — R$ 250K — +R$ 24K
┃ ⟫ 639. Léo — R$ 275K — +R$ 26K
┃ ⟫ 640. Pratinha — R$ 300K — +R$ 30K
┃
┃ 👑 *𝑳𝒆𝒏𝒅𝒂́𝒓𝒊𝒐*
┃ ⟫ 641. Imperador — R$ 400K — +R$ 40K
┃ ⟫ 642. Fenrir — R$ 500K — +R$ 45K
┃ ⟫ 643. Pedrinho — R$ 650K — +R$ 50K
┃ ⟫ 644. Solzinho — R$ 800K — +R$ 55K
┃ ⟫ 645. Levi — R$ 1M — +R$ 60K
┃ ⟫ 646. Kirin — R$ 1.25M — +R$ 65K
┃ ⟫ 647. Abismo — R$ 1.6M — +R$ 70K
┃ ⟫ 648. Cosmos — R$ 2M — +R$ 80K
┃
┃ 🌌 *𝑺𝒆𝒄𝒓𝒆𝒕𝒐*
┃ ⟫ 649. Vácuo — R$ 3.5M — +R$ 100K
┃ ⟫ 650. Titanzinho — R$ 5M — +R$ 150K
┃
┃ 💠 *𝑫𝒊𝒗𝒊𝒏𝒐 / 𝑴𝒊𝒕𝒐𝒍𝒐́𝒈𝒊𝒄𝒐*
┃ ⟫ 651. Cerberus — R$ 15M — +R$ 500K
┃ ⟫ 652. Quimera — R$ 30M — +R$ 1M
┃ ⟫ 653. Kraken — R$ 50M — +R$ 2M
┃ ⟫ 654. Bahamut — R$ 80M — +R$ 3.5M
┃ ⟫ 655. Cthulhu — R$ 120M — +R$ 5M
┃ ⟫ 656. Anúbis — R$ 200M — +R$ 8M
┃ ⟫ 657. Shenlong — R$ 350M — +R$ 15M
┃ ⟫ 658. Ifrit — R$ 500M — +R$ 25M
┃ ⟫ 659. Corvo Supremo — R$ 800M — +R$ 40M
┃ ⟫ 660. Infinity — R$ 1.5B — +R$ 80M
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 💡 *Como comprar:* !comprar [ID]
┃ ✨ *Exemplo:* !comprar 660
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
        await sock.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
    }
};