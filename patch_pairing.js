async function connectToWhatsApp() {
    carregarComandosNaMemoria();

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    currentSock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),

        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(
                state.keys,
                pino({ level: 'silent' })
            )
        },

        browser: ["DAEMON-XBOT", "Chrome", "20.0.04"],

        printQRInTerminal: false,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,

        getMessage: async () => ({})
    });

    const sock = currentSock;

    sock.ev.on('creds.update', saveCreds);

    let codigoPedido = false;

    sock.ev.on('connection.update', async (update) => {

        const {
            connection,
            lastDisconnect
        } = update;

        if (connection === 'connecting') {
            console.log('🟡 Conectando ao WhatsApp...');
        }

        if (connection === 'open') {

            reconnectScheduled = false;

            console.log('🟢 Conectado ao WhatsApp!');

            if (
                !sock.authState.creds.registered &&
                !codigoPedido
            ) {

                codigoPedido = true;

                try {

                    console.log('📲 Aguardando estabilizar conexão...');

                    await delay(5000);

                    console.log('📲 Pedindo código de pareamento...');

                    const code = await sock.requestPairingCode(
                        "554896669255"
                    );

                    console.log('\n==============================');
                    console.log('📲 CÓDIGO DE PAREAMENTO:');
                    console.log(code);
                    console.log('==============================\n');

                } catch (err) {

                    console.log(
                        '🔴 Erro ao pedir código:',
                        err?.message || err
                    );
                }
            }

            console.log('\x1b[35m' + `
██████╗  █████╗ ███████╗███╗   ███╗ ██████╗ ███╗   ██╗
██╔══██╗██╔══██╗██╔════╝████╗ ████║██╔═══██╗████╗  ██║
██║  ██║███████║█████╗  ██╔████╔██║██║   ██║██╔██╗ ██║
██║  ██║██╔══██║██╔══╝  ██║╚██╔╝██║██║   ██║██║╚██╗██║
██████╔╝██║  ██║███████╗██║ ╚═╝ ██║╚██████╔╝██║ ╚████║
╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
` + '\x1b[0m');

            if (!dailyStarted && typeof startDaily === 'function') {

                dailyStarted = true;

                try {
                    startDaily(sock);
                } catch (e) {
                    console.log(
                        '⚠️ Erro no sistema daily:',
                        e.message
                    );
                }
            }
        }

        if (connection === 'close') {

            const statusCode =
                lastDisconnect?.error?.output?.statusCode;

            console.log(
                '🔴 Conexão fechada:',
                statusCode || 'desconhecido'
            );

            if (
                statusCode === DisconnectReason.loggedOut
            ) {

                console.log(
                    '🔒 Sessão desconectada.'
                );

                return;
            }

            if (!reconnectScheduled) {

                reconnectScheduled = true;

                console.log(
                    '🔄 Reconectando em 5 segundos...'
                );

                setTimeout(() => {

                    reconnectScheduled = false;

                    connectToWhatsApp().catch(err => {

                        console.log(
                            '🔴 Erro ao reconectar:',
                            err?.message || err
                        );

                    });

                }, 5000);
            }
        }
    });

    sock.ev.on('messages.upsert', async (m) => {

        if (!m?.messages?.length) return;

        for (const msg of m.messages) {
            await processarMensagem(sock, msg);
        }
    });
}
