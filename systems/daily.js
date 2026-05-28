const db = require('../db');

let dailyEnviadoHoje = false;

module.exports = (sock) => {
    console.log('\x1b[32m💰 Sistema Financeiro: ONLINE (Agendado para 17:10)\x1b[0m');

    setInterval(async () => {
        const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
        const timePart = agora.split(', ')[1];
        const [horaStr, minutoStr] = timePart.split(':');
        const hora = parseInt(horaStr, 10);
        const minuto = parseInt(minutoStr, 10);

        if (hora === 0 && minuto === 0) {
            dailyEnviadoHoje = false;
        }

        // 🔥 NOVO HORÁRIO: 17:10
        if (hora === 17 && minuto === 10 && !dailyEnviadoHoje) {
            dailyEnviadoHoje = true;
            
            try {
                const banco = db.ler();
                let recebedores = 0;
                
                for (const id in banco) {
                    banco[id].dinheiro = (Number(banco[id].dinheiro) || 0) + 50;
                    recebedores++;
                }
                db.gravar(banco);

                const chats = await sock.groupFetchAllParticipating();
                let idGrupoRoblox = null;
                
                for (const jid in chats) {
                    const grupo = chats[jid];
                    // Radar para "𝚁𝙾𝙱𝙻𝙾𝚇 🎮"
                    if (grupo.subject && (grupo.subject.toLowerCase().includes('roblox') || grupo.subject.includes('𝚁𝙾𝙱𝙻𝙾𝚇'))) {
                        idGrupoRoblox = jid;
                        break;
                    }
                }

                if (idGrupoRoblox) {
                    const layout = `
╭━━━━━━━『 💰 𝐏𝐀𝐆𝐀𝐌𝐄𝐍𝐓𝐎 𝐃𝐈𝐀́𝐑𝐈𝐎 』━━━━━━━╮
┃
┃ 💸 *O Banco DAEMON liberou a verba!*
┃ ✅ Todos os membros registrados receberam
┃ *R$ 50,00* em suas contas bancárias!
┃
┃ 👥 *Membros beneficiados:* ${recebedores}
┃
┃ 💡 _Dica: Use_ *!saldo* _para ver sua conta._
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

                    await sock.sendMessage(idGrupoRoblox, { text: layout });
                    console.log('\x1b[32m✅ [DAILY] R$ 50 depositado e anunciado no grupo do Roblox!\x1b[0m');
                } else {
                    console.log('\x1b[33m⚠️ [DAILY] Grana enviada, mas o grupo "𝚁𝙾𝙱𝙻𝙾𝚇" não foi achado.\x1b[0m');
                }
                
            } catch (error) {
                console.error('\x1b[31m❌ Erro no sistema Daily:\x1b[0m', error);
            }
        }
    }, 60000); 
};
