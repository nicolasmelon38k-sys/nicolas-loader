module.exports = (app, checkAuth, db, configWeb) => {
    // Banco de dados interno para validar preço no servidor (anti-hacker)
    const peixesDB = {
        531: { nome: 'Lambari', preco: 100 }, 532: { nome: 'Cascudo', preco: 300 }, 533: { nome: 'Tilápia', preco: 600 },
        534: { nome: 'Piaba', preco: 1000 }, 535: { nome: 'Cará', preco: 1500 }, 536: { nome: 'Traíra pequena', preco: 2000 },
        537: { nome: 'Douradinha', preco: 3000 }, 538: { nome: 'Curimatã', preco: 4000 }, 539: { nome: 'Piau', preco: 5000 },
        540: { nome: 'Tucunaré juvenil', preco: 7000 }, 541: { nome: 'Pacu', preco: 10000 }, 542: { nome: 'Tambaqui', preco: 13000 },
        543: { nome: 'Robalo', preco: 16000 }, 544: { nome: 'Sardinha', preco: 19000 }, 545: { nome: 'Badejo', preco: 20000 },
        546: { nome: 'Badejo Negro', preco: 25000 }, 547: { nome: 'Dourado', preco: 30000 }, 548: { nome: 'Cavala', preco: 36000 },
        549: { nome: 'Salmão do Rio', preco: 44000 }, 550: { nome: 'Atum Pequeno', preco: 52000 }, 551: { nome: 'Garoupa', preco: 60000 },
        552: { nome: 'Linguado', preco: 70000 }, 553: { nome: 'Pirarucu', preco: 80000 }, 554: { nome: 'Peixe-Espada', preco: 90000 },
        555: { nome: 'Truta Azul', preco: 100000 }, 556: { nome: 'Peixe-Morcego', preco: 120000 }, 557: { nome: 'Tubarão-Bambu', preco: 140000 },
        558: { nome: 'Peixe-Pedra', preco: 160000 }, 559: { nome: 'Baiacu Gigante', preco: 180000 }, 560: { nome: 'Aruanã Prateada', preco: 200000 },
        561: { nome: 'Peixe-Lua', preco: 230000 }, 562: { nome: 'Enguia Elétrica', preco: 260000 }, 563: { nome: 'Raia Mística', preco: 290000 },
        564: { nome: 'Tubarão-Martelo', preco: 320000 }, 565: { nome: 'Marlin Azul', preco: 360000 }, 566: { nome: 'Peixe-Dragão', preco: 400000 },
        567: { nome: 'Leviatã Juvenil', preco: 450000 }, 568: { nome: 'Kraken-Guia', preco: 500000 }, 569: { nome: 'Esturjão Real', preco: 550000 },
        570: { nome: 'Peixe-Cristal', preco: 600000 }, 571: { nome: 'Peixe-Relâmpago', preco: 660000 }, 572: { nome: 'Cardume Fantasma', preco: 720000 },
        573: { nome: 'Rei do Abismo', preco: 780000 }, 574: { nome: 'Sereia-Peixe', preco: 840000 }, 575: { nome: 'Dragão Marinho', preco: 900000 },
        579: { nome: 'Rei Abissal', preco: 990000 }, 580: { nome: 'Leviatã Supremo', preco: 1000000 }
    };

    app.post('/api/peixes/comprar', checkAuth, async (req, res) => {
        try {
            const { cart, metodo } = req.body;
            const userId = req.ator.id;
            let user = db.obterUsuario(userId);

            if (!cart || cart.length === 0) return res.json({ success: false, msg: "Carrinho vazio!" });

            let totalReal = 0;
            let itensAdicionados = [];

            // Validação de Preço pelo servidor
            for (let item of cart) {
                let p = peixesDB[item.id];
                if (p) {
                    totalReal += p.preco * item.qtd;
                    for(let i=0; i<item.qtd; i++) {
                        itensAdicionados.push(p.nome);
                    }
                }
            }

            // Descontar saldo
            if (metodo === 'dinheiro') {
                if ((user.dinheiro || 0) < totalReal) return res.json({ success: false, msg: "Dinheiro insuficiente!" });
                user.dinheiro -= totalReal;
            } else if (metodo === 'banco') {
                if ((user.banco || 0) < totalReal) return res.json({ success: false, msg: "Saldo no banco insuficiente!" });
                user.banco -= totalReal;
            } else if (metodo === 'credito') {
                let cartaoAtivo = user.cartaoAtivo || "Nenhum";
                let tabelaCartoes = configWeb?.tabelaCartoes || {
                    basico: { limite: 500 }, black: { limite: 200000 }
                };
                if (cartaoAtivo === "Nenhum" || !tabelaCartoes[cartaoAtivo]) return res.json({ success: false, msg: "Sem cartão ativo!" });
                
                let limiteTotal = tabelaCartoes[cartaoAtivo].limite + (user.limitesBonus?.[cartaoAtivo] || 0);
                let faturaAtual = Number(user.faturas?.[cartaoAtivo] || 0);
                if (limiteTotal - faturaAtual < totalReal) return res.json({ success: false, msg: "Limite do cartão insuficiente!" });
                
                if(!user.faturas) user.faturas = {};
                user.faturas[cartaoAtivo] = faturaAtual + totalReal;
            } else {
                return res.json({ success: false, msg: "Método de pagamento inválido!" });
            }

            // Adicionar ao inventário
            if (!user.inventario) user.inventario = [];
            user.inventario.push(...itensAdicionados);

            db.salvar(userId, user);
            return res.json({ success: true, msg: "Compra realizada com sucesso!" });

        } catch(e) {
            console.error("Erro ao comprar peixe:", e);
            return res.json({ success: false, msg: "Erro no servidor." });
        }
    });
};
