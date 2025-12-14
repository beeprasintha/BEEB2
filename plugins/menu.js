const { cmd, commands } = require('../command');

cmd({
    pattern: "menu",
    desc: "Get Bot Commands List",
    category: "main",
    react: "📂",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        // බොට්ගේ නම සහ විස්තර
        let botName = "NEXT BOT MD"; 
        
        // Menu එකේ උඩින්ම පෙනෙන ලස්සන Design එක
        let menu = `
👋 *Hello* 👻
🔥 *I'am ${botName}* 🤖
😉 *Bot Owner:* Mr.Rasintha 😻
🧬 *Version:* 1.0.0
⚡ *Uptime:* Online

📋 *COMMAND LIST*
-------------------------
`;

        // Commands ටික Loop කරලා Menu එකට එකතු කරන කොටස
        let addedCommands = [];
        
        commands.map((command) => {
            if (command.pattern && !addedCommands.includes(command.pattern)) {
                // 🛠️ FIX: මෙතන cmd.pattern වෙනුවට command.pattern විය යුතුයි
                let commandName = command.pattern.toString().replace(/[^a-zA-Z0-9]/g, "");
                
                menu += `✅ .${commandName}\n`; // ඔයාට කැමති නම් . හෝ / දාන්න
                addedCommands.push(command.pattern);
            }
        });

        menu += `
-------------------------
© Powered by Next Bot
`;

        // Menu එක Photo එකක් එක්ක යවන විදිය
        await conn.sendMessage(from, { 
            image: { url: "https://raw.githubusercontent.com/beeprasintha/beep/refs/heads/main/photo_2025-12-14_14-04-12.jpg" }, 
            caption: menu 
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error loading menu.");
    }
});