const db = require('../db');
const config = require('../config.json');

const listaCargos = {
    // LEGAIS (14)
    lixeiro: { nome: 'Lixeiro', lvl: 1 },
    atendente: { nome: 'Atendente', lvl: 5 },
    padeiro: { nome: 'Padeiro', lvl: 12 },
    motorista: { nome: 'Motorista', lvl: 20 },
    jardineiro: { nome: 'Jardineiro', lvl: 28 },
    mecanico: { nome: 'Mecânico', lvl: 35 },
    cozinheiro: { nome: 'Cozinheiro', lvl: 45 },
    professor: { nome: 'Professor', lvl: 60 },
    enfermeiro: { nome: 'Enfermeiro', lvl: 80 },
    cientista: { nome: 'Cientista', lvl: 100 },
    'piloto de aviao': { nome: 'Piloto de Avião', lvl: 250 },
    'cirurgiao chefe': { nome: 'Cirurgião Chefe', lvl: 400 },
    'juiz federal': { nome: 'Juiz Federal', lvl: 800 },
    ceo: { nome: 'CEO', lvl: 2000 },

    // ILEGAIS (13)
    pivete: { nome: 'Pivete', lvl: 8 },
    batedor: { nome: 'Batedor', lvl: 15 },
    'vigia de boca': { nome: 'Vigia de Boca', lvl: 25 },
    aviaozinho: { nome: 'Aviãozinho', lvl: 35 },
    clonador: { nome: 'Clonador', lvl: 50 },
    assaltante: { nome: 'Assaltante', lvl: 70 },
    hacker: { nome: 'Hacker', lvl: 85 },
    mercenario: { nome: 'Mercenário', lvl: 110 },
    contrabandista: { nome: 'Contrabandista', lvl: 140 },
    'dono de morro': { nome: 'Dono de Morro', lvl: 180 },
    'barao do po': { nome: 'Barão do Pó', lvl: 600 },
    mafioso: { nome: 'Mafioso', lvl: 1500 },
    'imperador do crime': { nome: 'Imperador do Crime', lvl: 4000 },

    // UNDERGROUND (13)
    'entregador sus': { nome: 'Entregador Sus', lvl: 10 },
    cobrador: { nome: 'Cobrador', lvl: 18 },
    seguranca: { nome: 'Segurança', lvl: 30 },
    job: { nome: 'Job', lvl: 40 },
    agiota: { nome: 'Agiota', lvl: 55 },
    'gerente cassino': { nome: 'Gerente Cassino', lvl: 75 },
    falsificador: { nome: 'Falsificador', lvl: 95 },
    informante: { nome: 'Informante', lvl: 120 },
    politico: { nome: 'Político', lvl: 160 },
    'agente sombra': { nome: 'Agente Sombra', lvl: 200 },
    prostituta: { nome: 'Prostituta', lvl: 300 },
    'hacker de elite': { nome: 'Hacker de Elite', lvl: 1000 },
    'dono da deep web': { nome: 'Dono da Deep Web', lvl: 3000 }
};

function normalizar(texto) {
    return String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

module.exports = {
    name: 'cargo',
    execute: async (sock, msg, args) => {
        const id = msg.key.participant || msg.key.remoteJid;
        const user = db.obterUsuario(id);
        const prefix = config.prefix || '!';

        if (!user) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Registro não encontrado.' });

        const escolha = normalizar(args.join(' '));
        const userLvl = user.level || 1;

        if (!escolha) {
            return sock.sendMessage(msg.key.remoteJid, { text: `💼 Use *${prefix}empregos* para ver a lista.` });
        }

        const temEmpregoReal = user.emprego && user.emprego !== 'Auxiliar Geral' && user.emprego !== 'Desempregado';

        if (temEmpregoReal) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Você já é *${user.emprego}*.\n\nUse *${prefix}abandonar* para poder pegar um novo cargo!`
            }, { quoted: msg });
        }

        const cargo = listaCargos[escolha];
        if (!cargo) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Cargo não encontrado! Digite o nome exato do menu.' });

        if (userLvl < cargo.lvl) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: `🚫 *NÍVEL INSUFICIENTE*\n\nVocê precisa de nível *${cargo.lvl}* para ser *${cargo.nome}*.\nSeu nível atual: *${userLvl}*`
            }, { quoted: msg });
        }

        db.salvar(id, { emprego: cargo.nome });
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🎉 *PARABÉNS!*\n\nAgora você é o novo *${cargo.nome.toUpperCase()}* do Daemon.`
        }, { quoted: msg });
    }
};