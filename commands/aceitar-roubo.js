const db = require('../db');
const { executarRoubo } = require('../systems/heist');

module.exports = {
    name: 'aceitar-roubo',
    execute: async (sock, msg, args) => {
        const senderId = msg.key.participant;
        const remetente = msg.key.remoteJid;
        const user = db.obterUsuario(senderId);

        // Verifica qual mensagem o cara respondeu
        const quotedId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
        
        if (!quotedId) {
            return sock.sendMessage(remetente, { text: "⚠️ Você precisa RESPONDER à mensagem do convite do bot!" }, { quoted: msg });
        }

        global.activeHeists = global.activeHeists || new Map();
        const heist = global.activeHeists.get(quotedId);

        if (!heist) {
            return sock.sendMessage(remetente, { text: "❌ Esse convite já expirou, foi cancelado ou o assalto já aconteceu." }, { quoted: msg });
        }

        if (!heist.convidados.includes(senderId)) {
            return sock.sendMessage(remetente, { text: "⚠️ Você não foi chamado para esse assalto, espertinho!" }, { quoted: msg });
        }

        if (heist.aceitos.includes(senderId)) {
            return sock.sendMessage(remetente, { text: "✅ Você já está com a máscara no rosto, aguarde os outros." }, { quoted: msg });
        }

        // Adiciona o jogador na equipe
        heist.aceitos.push(senderId);
        const totalFaltam = (heist.convidados.length + 1) - heist.aceitos.length;

        if (totalFaltam === 0) {
            // TODO MUNDO ACEITOU! VAMO NESSA!
            clearTimeout(heist.timer); // Cancela o cronômetro pra não bugar
            global.activeHeists.delete(quotedId); // Apaga o convite da memória
            
            await sock.sendMessage(remetente, { text: `🔥 *EQUIPE FORMADA!* Iniciando a operação...` }, { quoted: msg });
            setTimeout(() => {
                executarRoubo(sock, remetente, heist.tipo, heist.aceitos);
            }, 2000); // Suspensezinho de 2 segundos kkkk
        } else {
            await sock.sendMessage(remetente, { text: `🔫 *${user.nome}* pegou as armas! Faltam ${totalFaltam} membro(s) aceitar(em).` }, { quoted: msg });
        }
    }
};
