const numero = '5548996669255'
    .replace(/\D/g, '');

module.exports = async function solicitarPairing(sock) {
    try {
        console.log('⏳ Aguardando conexão estabilizar...');
        
        await new Promise(r => setTimeout(r, 8000));

        const codigo = await sock.requestPairingCode(numero);

        console.log('\n🔑 CÓDIGO DE PAREAMENTO:\n');
        console.log(codigo);
        console.log('\n📱 WhatsApp > Aparelhos conectados > Conectar com número');

    } catch (e) {
        console.log('❌ ERRO NO PAREAMENTO:\n');
        console.log(e?.message || e);
    }
}
