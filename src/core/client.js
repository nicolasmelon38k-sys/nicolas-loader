const makeWASocket = require('@whiskeysockets/baileys')
const { loadCommands } = require('./loader')
const { handleMessages } = require('../events/message')

async function startBot() {
    const sock = makeWASocket({
        auth: require('../../auth')
    })

    const commands = loadCommands()

    sock.ev.on('messages.upsert', async (msg) => {
        await handleMessages(sock, msg, commands)
    })

    console.log("🤖 Bot iniciado com sucesso")
}

module.exports = { startBot }
