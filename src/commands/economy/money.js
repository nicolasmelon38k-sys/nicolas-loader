module.exports = {
    name: "money",

    async execute(sock, msg, args) {
        const user = msg.key.remoteJid

        await sock.sendMessage(user, {
            text: "💰 Sistema de dinheiro ativo!"
        })
    }
}
