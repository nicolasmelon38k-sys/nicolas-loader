const http = require('http');
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Bot Online\n');
}).listen(port);

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const path = require("path");
const pino = require("pino");
const db = require("./db");
const { isGroupAdmin } = require("./lib/permissoes");

const commands = new Map();
const commandsPath = path.join(__dirname, "commands");

function loadCommands() {
    commands.clear();

    if (!fs.existsSync(commandsPath)) {
        console.log("❌ Pasta commands não existe");
        return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        try {
            delete require.cache[require.resolve(`./commands/${file}`)];
            const cmd = require(`./commands/${file}`);

            if (cmd?.name && typeof cmd.execute === "function") {
                commands.set(cmd.name, cmd);
            }
        } catch (e) {
            console.log(`❌ erro no comando ${file}:`, e.message);
        }
    }

    console.log(`🚀 Total comandos carregados: ${commands.size}`);
}

function getText(msg) {
    const m = msg?.message;
    if (!m) return "";

    return (
        m.conversation ||
        m.extendedTextMessage?.text ||
        m.imageMessage?.caption ||
        m.videoMessage?.caption ||
        ""
    );
}

function tempo(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);

    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
}

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        printQRInTerminal: false,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        logger: pino({ level: "silent" })
    });

    if (!sock.authState.creds.registered) {
        console.log("⏳ Preparando para solicitar o código (Delay de 4s para estabilizar a rede)...");
        setTimeout(async () => {
            try {
                const numeroDoBot = "554896669255";
                const code = await sock.requestPairingCode(numeroDoBot);
                console.log("\n======================================================");
                console.log("📱 CÓDIGO DE PAREAMENTO DO WHATSAPP: " + code);
                console.log("======================================================\n");
            } catch (err) {
                console.log("⚠️ Erro ao pedir o código:", err.message);
            }
        }, 4000);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (u) => {
        if (u.connection) console.log("🔌 connection:", u.connection);

        if (u.connection === "open") {
            console.log("🟢 BOT ONLINE (sessão ativa)");
        }

        if (u.connection === "close") {
            const code = u.lastDisconnect?.error?.output?.statusCode;
            console.log("🔴 desconectado (código):", code);

            if (code !== DisconnectReason.loggedOut) {
                start();
            }
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        if (m.type !== "notify" && m.type !== "append") return;

        for (const msg of m.messages) {
            try {
                if (!msg.message || msg.key.remoteJid === "status@broadcast") continue;

                const body = getText(msg);
                const jid = msg.key.remoteJid;
                const isGroup = jid.endsWith("@g.us");

                let sender;
                if (msg.key.fromMe) {
                    sender = sock.user.id.split(":")[0] + "@s.whatsapp.net";
                } else {
                    sender = msg.key.participant || msg.key.remoteJid;
                }

                const id = db.normalizarId(sender);

                if (isGroup && body) {
                    const gruposPath = "./grupos.json";
                    if (!fs.existsSync(gruposPath)) fs.writeFileSync(gruposPath, JSON.stringify({}));
                    const grupos = JSON.parse(fs.readFileSync(gruposPath, "utf8"));
                    const configGrupo = grupos[jid] || {};
                    const antiLinkAtivo = configGrupo.antilink === true || configGrupo["anti-link"] === true;

                    if (antiLinkAtivo && /(https?:\/\/|chat\.whatsapp\.com|wa\.me)/i.test(body)) {
                        const senderIdNum = db.normalizarId(sender);
                        const isAdmin = await isGroupAdmin(sock, jid, sender);
                        const isDonoBot = senderIdNum === "554896669255";
                        const isImmune = isAdmin || isDonoBot || msg.key.fromMe;

                        const botId = sock.user.id.includes(":")
                            ? sock.user.id.split(":")[0] + "@s.whatsapp.net"
                            : sock.user.id;

                        const isBotAdmin = await isGroupAdmin(sock, jid, botId);

                        if (!isImmune) {
                            if (isBotAdmin) {
                                await sock.sendMessage(jid, { delete: msg.key });
                                await sock.sendMessage(jid, {
                                    text: "⚠️ Você não leu as regras? Não é permitido enviar links!",
                                    mentions: [sender]
                                });
                                await sock.groupParticipantsUpdate(jid, [sender], "remove");
                            }
                            continue;
                        }
                    }
                }

                const user = db.obterUsuario(id);

                if (user?.afk?.status) {
                    const diff = Date.now() - user.afk.desde;
                    db.salvar(id, { afk: { status: false, motivo: "", desde: 0 } });
                    await sock.sendMessage(
                        jid,
                        { text: `👋 *Bem-vindo de volta!*\n⏳ Você ficou AFK por: ${tempo(diff)}` },
                        { quoted: msg }
                    );
                    console.log("🔁 AFK removido:", id);
                }

                const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                for (const mId of mentions) {
                    const mid = db.normalizarId(mId);
                    const u = db.obterUsuario(mid);
                    if (u?.afk?.status) {
                        await sock.sendMessage(
                            jid,
                            { text: `💤 Esse usuário está AFK\n📝 Motivo: ${u.afk.motivo}` },
                            { quoted: msg }
                        );
                    }
                }

                if (!body.startsWith("!")) continue;

                const args = body.slice(1).trim().split(/ +/);
                const cmdName = args.shift().toLowerCase();
                const cmd = commands.get(cmdName);

                if (!cmd) {
                    console.log(`❌ Comando [${cmdName}] não encontrado.`);
                    continue;
                }

                console.log(`⚡ EXECUTANDO CMD: ${cmdName} | Solicitado por: ${id}`);
                await cmd.execute(sock, msg, args);
                console.log(`✅ CMD SUCESSO: ${cmdName}`);

            } catch (e) {
                console.log("🔴 ERRO NA MENSAGEM:", e.message);
            }
        }
    });

    loadCommands();
}

start();
