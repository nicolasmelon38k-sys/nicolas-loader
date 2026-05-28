module.exports = {
    name: 'pagarfatura',
    execute: async (sock, msg, args) => {
        const cartao = require('./cartao.js');
        // Se o cara mandar só !pagarfatura, o bot entende que é "tudo"
        const valor = args.length > 0 ? args[0] : 'tudo';
        const novosArgs = ['pagar', valor];
        await cartao.execute(sock, msg, novosArgs);
    }
};
