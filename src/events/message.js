async function handleMessages(sock, msg, commands) {
    const message = msg.messages[0]
    if (!message.message) return

    const body =
        message.message.conversation ||
        message.message.extendedTextMessage?.text ||
        ""

    const prefix = "!"
    if (!body.startsWith(prefix)) return

    const args = body.slice(prefix.length).trim().split(/ +/)
    const cmdName = args.shift().toLowerCase()

    const command = commands.get(cmdName)
    if (!command) return

    try {
        await command.execute(sock, message, args)
    } catch (err) {
        console.error("Erro comando:", err)
    }
}

module.exports = { handleMessages }
