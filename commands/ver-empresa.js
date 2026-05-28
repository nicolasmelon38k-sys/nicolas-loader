const db = require('../db');

module.exports = {
    name: 'ver-empresa',
    async execute(sock, msg, args) {
        const id = db.normalizarId(msg.key.participant || msg.key.remoteJid);
        const user = db.obterUsuario(id);

        if (!user || !user.empresas || user.empresas.length === 0) {
            return sock.sendMessage(msg.key.remoteJid, { text: "❌ Você ainda não possui uma empresa! Crie uma no painel web." }, { quoted: msg });
        }

        const emp = user.empresas[user.empresaAtiva || 0];
        const status = emp.pausado ? "🔴 PAUSADA (FALÊNCIA)" : "🟢 EM OPERAÇÃO";
        
        // Formatando o Caixa
        const caixa = (emp.caixa || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        // Contagem de Funcionários
        let totalFunc = 0;
        if (emp.equipe) {
            for (let f in emp.equipe) totalFunc += emp.equipe[f];
        }

        // Linhas de Produção Ativas
        let linhas = [];
        if (emp.linhasAtivas) {
            for (let l in emp.linhasAtivas) {
                if (emp.linhasAtivas[l]) linhas.push(l.replace('_', ' ').toUpperCase());
            }
        }
        const prodStr = linhas.length > 0 ? linhas.join(", ") : "Nenhuma";

        const relatorio = `
╭━━━━━━『 🏭 𝑰𝑴𝑷𝑬́𝑹𝑰𝑶: ${emp.nome.toUpperCase()} 』━━━━━━╮
┃
┃ 📊 *Status:* ${status}
┃ 💰 *Caixa:* ${caixa}
┃ 🎭 *Tema:* ${emp.tema === 'alimentos' ? '🍔 Lanchonete' : '🖥️ Tecnologia'}
┃
┃ 👥 *Equipe:* ${totalFunc} funcionários contratados
┃ 🏗️ *Produzindo:* ${prodStr}
┃ 🛠️ *Upgrades:* ${emp.upgrades ? emp.upgrades.length : 0} ativos
┃
┃ 💡 _Use o painel web para gerenciar materiais_
┃ _e contratar funcionários de elite!_
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

        await sock.sendMessage(msg.key.remoteJid, { text: relatorio }, { quoted: msg });
    }
};
