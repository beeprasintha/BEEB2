const { cmd, commands } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "video",
    desc: "Download Videos",
    category: "download",
    react: "🎬"
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("Please Enter Video url or name");

        // 1. වීඩියෝ එක Search කරනවා
        const search = await yts(q);
        const data = search.videos[0];
        const url = data.url;

        // 2. විස්තරේ යවනවා
        let desc = `*🎬 VIDEO DOWNLOADER*\n\n`;
        desc += `📌 Title: ${data.title}\n`;
        desc += `⏱ Duration: ${data.timestamp}\n`;
        desc += `📅 Uploaded: ${data.ago}\n`;
        desc += `👁 Views: ${data.views}\n\n`;
        desc += `*Downloading... Please wait!*`;

        await conn.sendMessage(from, { image: { url: data.thumbnail }, caption: desc }, { quoted: mek });

        // 3. වීඩියෝ එක Download කරන API එක (Video API)
        let downRes = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp4?url=${url}`);
        let videoUrl = downRes.data.result.download_url;

        // 4. වීඩියෝ එක යවනවා
        await conn.sendMessage(from, { 
            video: { url: videoUrl }, 
            mimetype: "video/mp4", 
            caption: `> © Powered by NEXT Bot`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error downloading video. (API might be down)");
    }
});