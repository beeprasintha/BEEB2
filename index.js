const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    getContentType
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { commands } = require('./command');
const config = require('./config');
global.autoStatus = config.AUTO_STATUS_SAVE;

// 1. Spam Map (Spam පාලනයට)
const spamMap = new Map();

// 2. Welcome Timer Map (විනාඩි 5ක Cooldown එකට)
const welcomeTimer = new Map();

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('Scan this QR Code:');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ Bot Connected successfully!');
            console.log('⬇️  Installing Plugins...');
            
            const pluginPath = path.join(__dirname, 'plugins');
            fs.readdirSync(pluginPath).forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() === '.js') {
                    require(pluginPath + '/' + plugin);
                    console.log('Plugin Loaded: ' + plugin);
                }
            });
            console.log('✅ All Plugins Loaded!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // =============================================
    // 📞 ANTI-CALL BLOCK SYSTEM (Call ආවොත් Block)
    // =============================================
    sock.ev.on('call', async (callData) => {
        const call = callData[0];
        if (call.status === 'offer') { // Call එකක් එනවා නම් (Ringing)
            
            const callerId = call.from;
            const ownerNumber = '94771916428@s.whatsapp.net'; // ඔයාගේ නම්බර් එක

            if (callerId !== ownerNumber) {
                console.log(`📞 Call detected from ${callerId}. Blocking...`);
                
                // 1. Block කරන බවට Photo එකක් එක්ක Message එකක් යැවීම
                await sock.sendMessage(callerId, { 
                    image: { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhkRUg0u1aHNRVvCcw4qoi6WNAnHt-Q5FgHQ&s" }, // ⚠️ Call Block Photo URL
                    caption: "🚫 *NO CALLS ALLOWED!*\n\n✅ I will respond as soon as possible. Please wait. I am busy right now..😎..\nPlease contact telegram: https://t.me/rasinthabandara."
                });

                // 2. Call එක Reject කිරීම
                await sock.rejectCall(call.id, call.from);

                // 3. User ව Block කිරීම
            }
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const mek = m.messages[0];
            if (!mek.message) return;
            if (mek.key.fromMe) return;

            const type = getContentType(mek.message);
            const body = (type === 'conversation') ? mek.message.conversation : 
             (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
             (type === 'imageMessage') ? mek.message.imageMessage.caption :
             (type === 'videoMessage') ? mek.message.videoMessage.caption : '';

            const from = mek.key.remoteJid;
            const sender = mek.key.participant || mek.key.remoteJid;
            const isGroup = from.endsWith('@g.us');
            const isCmd = body.startsWith('.');
            
            // ⚠️ ඔයාගේ නම්බර් එක (මේ අංකයෙන් මැසේජ් කළාට Welcome එන්නේ නෑ)
            const isOwner = sender.includes('94771916428'); 

            // =============================================
            // 🛡️ SPAM PROTECTION
            // =============================================
            if (!isGroup && !isOwner) {
                let spamData = spamMap.get(sender) || { count: 0, lastMsg: 0 };
                let now = Date.now();

                if (now - spamData.lastMsg < 5000) {
                    spamData.count++;
                } else {
                    spamData.count = 1;
                }
                
                spamData.lastMsg = now;
                spamMap.set(sender, spamData);

                if (spamData.count >= 5) {
                    await sock.sendMessage(from, { text: "🚫 *Spam Detected!* You are blocked." });
                    await sock.updateBlockStatus(sender, "block");
                    spamMap.delete(sender);
                    return;
                }
            }

            // =============================================
            // 👋 AUTO WELCOME (ANY MESSAGE + 5 MIN COOLDOWN)
            // =============================================
            // Group නෙවෙයි නම්, Command එකක් නෙවෙයි නම්, Owner නෙවෙයි නම්
            if (!isGroup && !isCmd && !isOwner) {
                
                const currentTime = Date.now();
                const lastWelcomeTime = welcomeTimer.get(sender) || 0;
                const cooldown = 5 * 60 * 1000; // විනාඩි 5 (Milliseconds වලින්)

                // අන්තිමට යවලා විනාඩි 5ක් පැනලා නම් විතරක් ආයේ යවන්න
                if (currentTime - lastWelcomeTime > cooldown) {
                    
                    // 👇 Welcome Photo එක මෙතනට දාන්න
                    let logoImage = "https://i.imgur.com/fHs8bHM.gif"; 
                    
                    // 👇 Telegram Link එක මෙතනට දාන්න
                    let telegramLink = "https://t.me/rasinthabandara";

                    let desc = `
👋 *Hello There!*

🔥 *I am NEXT BOT MD* 🤖
🧬 *Version:* 1.0.0
⚡ *Status:* Auto Reply Mode
👤 *Owner:* Mr.Rasintha
.....................................

🎁 Bot Features :
 
💥Youtube Video 💦
💥youtube Song 💦
💥Movie Download 💦
💥Image Edit 💦
💥Logo Design 💦
💥AI Function 💦
💥Sticker Create 💦
.....................................

Admin Note : ✅ I will respond as soon as possible. Please wait. I am busy right now..😎.

......................................

💬 Reply: .menu

......................................
> 🇱🇰 Powered by Next Bot
`;
                    // Button Message එක යැවීම (Ad Reply)
                    await sock.sendMessage(from, { 
                        image: { url: logoImage },
                        caption: desc,
                        contextInfo: {
                            externalAdReply: {
                                title: "Contact Bot Owner 👨‍💻", // Button Text
                                body: "Click Telegram",
                                thumbnailUrl: logoImage,
                                sourceUrl: telegramLink, // Link
                                mediaType: 1,
                                renderLargerThumbnail: true
                            }
                        }
                    });

                    // වෙලාව update කිරීම (ආයේ විනාඩි 5ක් යනකම් මෙය ක්‍රියාත්මක නොවේ)
                    welcomeTimer.set(sender, currentTime);
                }
            }

            // =============================================
            // 🤖 COMMAND HANDLER
            // =============================================
            if (isCmd) {
                const commandName = body.slice(1).trim().split(" ")[0].toLowerCase();
                const q = body.slice(1).trim().split(" ").slice(1).join(" ");
                
                const command = commands.find((cmd) => cmd.pattern.test(commandName));
                if (command) {
                    await command.function(sock, mek, m, {
                        from,
                        q,
                        isGroup,
                        sender,
                        reply: (text) => sock.sendMessage(from, { text }, { quoted: mek })
                    });
                }
            }

            // ============================================
            // 📥 AUTO STATUS SAVER
            // ============================================
            if (mek.key.remoteJid === 'status@broadcast' && global.autoStatus) { 
                const caption = mek.message.imageMessage?.caption || mek.message.videoMessage?.caption || "";
                const ownerNumber = '94771916428@s.whatsapp.net'; 

                if (mek.message.imageMessage) {
                    let imageBuffer = await sock.downloadMediaMessage(mek, 'image');
                    await sock.sendMessage(ownerNumber, { image: imageBuffer, caption: caption });
                }
                else if (mek.message.videoMessage) {
                    let videoBuffer = await sock.downloadMediaMessage(mek, 'video');
                    await sock.sendMessage(ownerNumber, { video: videoBuffer, caption: caption });
                }
            }

        } catch (err) {
            console.log(err);
        }
    });
}

startBot();