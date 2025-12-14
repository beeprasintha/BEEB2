const { cmd, commands } = require('../command');
const os = require("os");

cmd({
    pattern: "alive",
    alias: ["hi", "hello", "status"],
    desc: "Check bot online status",
    category: "main",
    react: "👋",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        
        // 1. Bot ගේ Photo එක (මෙතනට ඔයාගේ කැමති Image URL එකක් දාන්න)
        let logoImage = "https://telegra.ph/file/your-image-url.jpg"; 

        // 2. Telegram Link එක (Bot Owner Contact)
        let telegramLink = "https://t.me/rasintha_official"; 

        // 3. Uptime එක හදාගන්න function එක (මේක දැන් මෙතනම තියෙනවා)
        const runtime = (seconds) => {
            seconds = Number(seconds);
            var d = Math.floor(seconds / (3600 * 24));
            var h = Math.floor(seconds % (3600 * 24) / 3600);
            var m = Math.floor(seconds % 3600 / 60);
            var s = Math.floor(seconds % 60);
            var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
            var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
            var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
            var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
            return dDisplay + hDisplay + mDisplay + sDisplay;
        };

        // 4. පෙන්නන්න ඕන විස්තර ටික
        let desc = `
👋 *Hello ${pushname}*!

🔥 *I am NEXT BOT MD* 🤖
🧬 *Version:* 1.0.0
⚡ *Uptime:* ${runtime(process.uptime())}
🧠 *Ram:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB
👤 *Owner:* Mr.Rasintha

> 🇱🇰 Powered by Next Bot
`;

        // 5. Message එක යැවීම (Contact Button එකත් එක්ක)
        await conn.sendMessage(from, { 
            image: { url: logoImage }, 
            caption: desc,
            contextInfo: {
                externalAdReply: {
                    title: "Contact Bot Owner 👨‍💻", // Button එකේ නම
                    body: "Click here to message on Telegram",
                    thumbnailUrl: logoImage,
                    sourceUrl: telegramLink, // Click කරාම යන තැන
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error loading alive message.");
    }
});