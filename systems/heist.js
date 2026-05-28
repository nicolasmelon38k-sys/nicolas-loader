const db = require('../db');

async function executarRoubo(sock, chatId, tipo, participantes) {
    const nomes = participantes.map(id => db.obterUsuario(id)?.nome || 'Desconhecido');
    const qtd = participantes.length;

    let baseWinMin, baseWinMax, baseFine, chance, plusWin, plusFine;

    if (tipo === 'carro') {
        baseWinMin = 4000; baseWinMax = 6000;
        baseFine = 2000;
        plusWin = 2000; plusFine = 2000;
        chance = qtd === 1 ? 60 : (qtd === 2 ? 70 : 80); // Max 3 pessoas = 80%
    } else {
        baseWinMin = 10000; baseWinMax = 15000;
        baseFine = 5000;
        plusWin = 5000; plusFine = 5000;
        chance = qtd === 1 ? 40 : (qtd === 2 ? 55 : (qtd === 3 ? 70 : 85)); // Max 4 pessoas = 85%
    }

    // Matemática do Loot e da Multa baseado na quantidade de pessoas
    const recompensaTotal = Math.floor(Math.random() * (baseWinMax - baseWinMin + 1)) + baseWinMin + (plusWin * (qtd - 1));
    const multaTotal = baseFine + (plusFine * (qtd - 1));

    const sucesso = (Math.random() * 100) <= chance;
    const valorIndividual = Math.floor(sucesso ? recompensaTotal / qtd : multaTotal / qtd);

    let detalhes = '';

    for (let id of participantes) {
        const u = db.obterUsuario(id);
        if (!u) continue;

        if (sucesso) {
            db.salvar(id, { dinheiro: (u.dinheiro || 0) + valorIndividual });
            detalhes += `✅ ${u.nome} ganhou R$ ${valorIndividual.toLocaleString('pt-BR')}\n`;
        } else {
            let din = u.dinheiro || 0;
            let div = u.divida || 0;
            
            // Sistema de Multa e SPC (Dívida)
            if (din >= valorIndividual) {
                din -= valorIndividual;
            } else {
                let resto = valorIndividual - din;
                din = 0;
                div += resto;
            }
            db.salvar(id, { dinheiro: din, divida: div });
            detalhes += `❌ ${u.nome} perdeu R$ ${valorIndividual.toLocaleString('pt-BR')}\n`;
        }
    }

    const layout = `
╭━━━━━━━『 ${tipo === 'carro' ? '🚛 ROUBO A CARRO-FORTE' : '🏦 ASSALTO A BANCO'} 』━━━━━━━╮
┃
┃ 👥 *Equipe:* ${nomes.join(', ')}
┃ 🎲 *Chance de Sucesso:* ${chance}%
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 🚦 *Resultado:* ${sucesso ? '🎉 FUGA PERFEITA!' : '🚓 ROTA INTERCEPTOU!'}
┃ ${sucesso ? '💰 *Loot Total:* R$ ' + recompensaTotal.toLocaleString('pt-BR') : '💸 *Prejuízo Total:* R$ ' + multaTotal.toLocaleString('pt-BR')}
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 📊 *Repartição do Saldo:*
${detalhes}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

    await sock.sendMessage(chatId, { text: layout });
}

module.exports = { executarRoubo };
