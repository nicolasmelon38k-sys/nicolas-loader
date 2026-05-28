const db = require('../db');

module.exports = {
    name: 'sortear',
    execute: async (sock, msg, args) => {
        try {
            const chatId = msg.key.remoteJid;

            // 1. TRAVA: Só funciona em grupos
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: "⚠️ *Mano, sorteio só funciona em grupos!*" }, { quoted: msg });
            }

            if (!args[0]) {
                return await sock.sendMessage(chatId, { 
                    text: "📝 *Como usar o Sorteio:*\n\n`!sortear <quantia> [pessoas]`\nEx: `!sortear 30k 5` (Divide 30k pra 5 pessoas)\n\n`!sortear <id_item> [pessoas]`\nEx: `!sortear 801 3` (Sorteia 3 Minérios, 1 pra cada)" 
                }, { quoted: msg });
            }

            const senderJid = msg.key.participant || msg.key.remoteJid;
            const senderId = db.normalizarId(senderJid);
            const senderUser = db.obterUsuario(senderId);

            if (!senderUser) {
                return await sock.sendMessage(chatId, { text: "❌ Você precisa estar registrado pra sortear algo." }, { quoted: msg });
            }

            // 2. PARSE DOS ARGUMENTOS
            const arg0 = args[0];
            let numPessoas = args[1] ? parseInt(args[1]) : 1;
            
            if (isNaN(numPessoas) || numPessoas <= 0) numPessoas = 1;
            if (numPessoas > 10) numPessoas = 10; // Limite máximo de vencedores

            let tipoPremio = 'dinheiro';
            let nomeItem = null;
            let valorDinheiro = 0;

            // Tenta identificar se é o ID de um item (Minérios, Frutas, etc)
            try {
                const produtos = require('../data/produtos');
                if (produtos[arg0] && produtos[arg0].nome) {
                    tipoPremio = 'item';
                    nomeItem = produtos[arg0].nome;
                }
            } catch (e) {
                // Se der erro ao ler produtos, ignora e assume que é dinheiro
            }

            // Se for dinheiro, formata os K e M
            if (tipoPremio === 'dinheiro') {
                let strVal = arg0.toLowerCase().replace(/\./g, '').replace(/,/g, '');
                let mult = 1;
                if (strVal.endsWith('k')) { mult = 1000; strVal = strVal.replace('k', ''); }
                else if (strVal.endsWith('m')) { mult = 1000000; strVal = strVal.replace('m', ''); }
                else if (strVal.endsWith('b')) { mult = 1000000000; strVal = strVal.replace('b', ''); }
                
                valorDinheiro = parseInt(strVal) * mult;

                if (isNaN(valorDinheiro) || valorDinheiro <= 0) {
                    return await sock.sendMessage(chatId, { text: "❌ Valor inválido para sorteio." }, { quoted: msg });
                }
            }

            // 3. VALIDAÇÃO DE SALDO / INVENTÁRIO (O remetente tem isso?)
            if (tipoPremio === 'dinheiro') {
                if ((senderUser.dinheiro || 0) < valorDinheiro) {
                    return await sock.sendMessage(chatId, { text: `❌ Você não tem R$ ${valorDinheiro.toLocaleString('pt-BR')} na carteira para sortear!` }, { quoted: msg });
                }
            } else {
                const qtdNoInventario = (senderUser.inventario || []).filter(i => i === nomeItem).length;
                if (qtdNoInventario < numPessoas) {
                    return await sock.sendMessage(chatId, { text: `❌ Você precisa de **${numPessoas}x ${nomeItem}** no inventário para sortear para ${numPessoas} pessoas. Você só tem ${qtdNoInventario}.` }, { quoted: msg });
                }
            }

            await sock.sendMessage(chatId, { react: { text: "🎲", key: msg.key } });

            // 4. PEGAR PARTICIPANTES E SORTEAR
            const groupMetadata = await sock.groupMetadata(chatId);
            const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            
            // Tira o Bot e o próprio Remetente do sorteio
            let participantes = groupMetadata.participants
                .map(p => p.id)
                .filter(id => id !== senderJid && id !== botJid);

            if (participantes.length === 0) {
                return await sock.sendMessage(chatId, { text: "❌ Não tem mais ninguém no grupo pra participar do sorteio!" }, { quoted: msg });
            }

            if (numPessoas > participantes.length) numPessoas = participantes.length;

            const embaralhados = participantes.sort(() => 0.5 - Math.random());
            const ganhadores = embaralhados.slice(0, numPessoas);

            // 5. DISTRIBUIR OS PRÊMIOS E DEBITAR DO REMETENTE
            let textoPremio = "";
            
            if (tipoPremio === 'dinheiro') {
                // Tira do bolso
                db.salvar(senderId, { dinheiro: senderUser.dinheiro - valorDinheiro });
                
                const fatia = Math.floor(valorDinheiro / numPessoas);
                textoPremio = `*Prêmio:* R$ ${valorDinheiro.toLocaleString('pt-BR')}\n_R$ ${fatia.toLocaleString('pt-BR')} para cada ganhador!_`;

                // Paga os ganhadores
                for (let gid of ganhadores) {
                    const idNorm = db.normalizarId(gid);
                    let wUser = db.obterUsuario(idNorm);
                    if (!wUser) { db.registrar(idNorm, "Sortudo"); wUser = db.obterUsuario(idNorm); }
                    
                    db.salvar(idNorm, { dinheiro: (wUser.dinheiro || 0) + fatia });
                }
            } else {
                // Tira do inventário
                for (let i = 0; i < numPessoas; i++) {
                    const idx = senderUser.inventario.indexOf(nomeItem);
                    if (idx > -1) senderUser.inventario.splice(idx, 1);
                }
                db.salvar(senderId, { inventario: senderUser.inventario });

                textoPremio = `*Prêmio:* 1x [ ${nomeItem} ] para cada!`;

                // Dá para os ganhadores
                for (let gid of ganhadores) {
                    const idNorm = db.normalizarId(gid);
                    let wUser = db.obterUsuario(idNorm);
                    if (!wUser) { db.registrar(idNorm, "Sortudo"); wUser = db.obterUsuario(idNorm); }
                    
                    wUser.inventario.push(nomeItem);
                    db.salvar(idNorm, { inventario: wUser.inventario });
                }
            }

            // 6. MONTAR MENSAGEM FINAL
            let textoFinal = `🎉 *MEGA SORTEIO DE @${senderId}* 🎉\n\n${textoPremio}\n\n🏆 *GANHADORES:*\n`;
            
            ganhadores.forEach((g, idx) => {
                const medalha = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🎖️";
                textoFinal += `${medalha} @${g.split('@')[0]}\n`;
            });

            await sock.sendMessage(chatId, {
                text: textoFinal,
                mentions: [senderJid, ...ganhadores]
            });

        } catch (e) {
            console.error("Erro no comando !sortear:", e.message);
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ Ocorreu um erro ao processar o sorteio." }, { quoted: msg });
        }
    }
}
