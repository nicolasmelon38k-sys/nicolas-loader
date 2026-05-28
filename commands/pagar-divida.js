const db = require('../db');

module.exports = {
    name: 'pagar-divida',
    execute: async (sock, msg, args) => {
        const id = msg.key.participant;
        const user = db.obterUsuario(id);
        const remetente = msg.key.remoteJid;

        const dividaAtual = user.divida || 0;
        const carteira = user.dinheiro || 0;

        if (dividaAtual <= 0) {
            return sock.sendMessage(remetente, { text: "✅ Você não tem nenhuma dívida com o governo/polícia no momento. Nome limpo!" }, { quoted: msg });
        }

        if (carteira <= 0) {
            return sock.sendMessage(remetente, { text: `❌ Você não tem dinheiro na carteira. Sua dívida atual é de R$ ${dividaAtual.toLocaleString('pt-BR')}. Vá trabalhar!` }, { quoted: msg });
        }

        const valorSugerido = args[0] ? Number(args[0].replace(/\D/g, '')) : carteira;
        
        if (!valorSugerido || valorSugerido <= 0) return;

        // Paga o que der (ou quita tudo, ou paga só um pedaço)
        const valorPago = Math.min(valorSugerido, carteira, dividaAtual);

        db.salvar(id, {
            dinheiro: carteira - valorPago,
            divida: dividaAtual - valorPago
        });

        const layout = `
╭━━━━━━━『 🧾 PAGAMENTO DE DÍVIDA 』━━━━━━━╮
┃
┃ 👤 *Cidadão:* ${user.nome}
┃ 💸 *Valor Pago:* R$ ${valorPago.toLocaleString('pt-BR')}
┃ 
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 📉 *Nova Dívida Restante:* R$ ${(dividaAtual - valorPago).toLocaleString('pt-BR')}
┃ 💳 *Novo Saldo Carteira:* R$ ${(carteira - valorPago).toLocaleString('pt-BR')}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

        await sock.sendMessage(remetente, { text: layout }, { quoted: msg });
    }
};
