const { cmd, commands } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

// --- Global Variable ---
global.movieData = global.movieData || [];

cmd({
    pattern: "movie",
    alias: ["film", "cinesubz"],
    desc: "Search and Download movies from Cinesubz",
    category: "download",
    react: "🎬",
    filename: __filename
},
async(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // 1. User මුකුත් type කරලා නැත්නම්
        if (!q) return reply("❌ Please type Movie Name.\nExample: *.movie Avengers*");

        // --- SCENARIO 1: අංකයක් (Link ඉල්ලන විට) ---
        // (User කලින් search කරලා, අංකයක් එව්වොත්)
        if (!isNaN(q) && q > 0 && q <= global.movieData.length) {
            const selectedMovie = global.movieData[q - 1];
            
            // Loading Message
            reply(`🔄 *Fetching Download Links for Next Bot:* \n${selectedMovie.title}...`);

            // Link එක ඇතුලට ගිහින් විස්තර ගමු
            const links = await getMovieLinks(selectedMovie.link);
            
            if (links.length === 0) {
                return reply("❌ Sorry! no download Links.");
            }

            let msg = `🎬 *${selectedMovie.title}* 🎬\n\n`;
            msg += `⬇️ *Direct Download Links:* \n`;
            
            links.forEach((item) => {
                msg += `\n🔹 *${item.quality}*\n🔗 ${item.link}\n`;
            });

            msg += `\n> 🇱🇰 ᴘᴏᴡᴇʀᴇᴅ ʙʏ Next ʙᴏᴛ`;
            
            // Image එකක් තිබුනොත් ඒකත් එක්ක යවමු
            if (selectedMovie.image) {
                await conn.sendMessage(from, { image: { url: selectedMovie.image }, caption: msg }, { quoted: mek });
            } else {
                await conn.sendMessage(from, { text: msg }, { quoted: mek });
            }
            return;
        }

        // --- SCENARIO 2: Search කිරීම (නමක් එව්වොත්) ---
        reply("🔎 *Searching on next bot...*");

        const results = await searchCinesubz(q);

        if (results.length === 0) {
            return reply("❌ No Movies...");
        }

        // Global variable එකට data දාගමු
        global.movieData = results;

        // List එක හදමු
        let listMsg = `🎥 *NEXT BOT SEARCH* 🎥\n\n`;
        
        results.forEach((movie, index) => {
            listMsg += `*${index + 1}.* ${movie.title}\n`;
        });

        listMsg += `\n🔢Movie List *`;

        // පළවෙනි result එකේ Image එක Cover එක විදියට දාලා List එක යවමු
        if(results[0].image) {
             await conn.sendMessage(from, { image: { url: results[0].image }, caption: listMsg }, { quoted: mek });
        } else {
             await conn.sendMessage(from, { text: listMsg }, { quoted: mek });
        }

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e}`);
    }
});

// --- HELPER FUNCTIONS (එන්ජිම) ---

async function searchCinesubz(query) {
    try {
        const searchUrl = `https://cinesubz.lk/?s=${query}`;
        const { data } = await axios.get(searchUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
                "Referer": "https://cinesubz.lk/"
            }
        });

        const $ = cheerio.load(data);
        let results = [];

        $('.item-desc-title').each((index, element) => {
            const title = $(element).text().trim();
            const link = $(element).parent().parent().find('a').attr('href');
            const image = $(element).parent().parent().find('img').attr('src');

            if (title && link) {
                results.push({
                    title: title,
                    link: link,
                    image: image || null
                });
            }
        });
        return results.slice(0, 10);
    } catch (error) {
        console.error("Search Error:", error.message);
        return [];
    }
}

async function getMovieLinks(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
                "Referer": "https://cinesubz.lk/"
            }
        });

        const $ = cheerio.load(data);
        let downloadLinks = [];

        $('.movie-download-button').each((index, element) => {
            let quality = $(element).text().trim();
            quality = quality.replace("Direct Download Links", "").replace("Telegram Download Links", "Telegram: ");
            const link = $(element).attr('href');

            if (link) {
                downloadLinks.push({ quality, link });
            }
        });
        return downloadLinks;
    } catch (error) {
        console.error("Link Fetch Error:", error.message);
        return [];
    }
}