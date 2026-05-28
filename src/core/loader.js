const fs = require('fs')

function loadCommands() {
    const commands = new Map()

    const categories = fs.readdirSync('./src/commands')

    for (const category of categories) {
        const files = fs.readdirSync(`./src/commands/${category}`)

        for (const file of files) {
            const cmd = require(`../commands/${category}/${file}`)
            commands.set(cmd.name, cmd)
        }
    }

    return commands
}

module.exports = { loadCommands }
