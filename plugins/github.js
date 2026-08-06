module.exports = {
    name: 'github',
    description: 'Get bot GitHub repository info',
    category: 'general',
    usage: 'github',
    async execute(sock, chatId, message, args) {
        await sock.sendMessage(chatId, {
            text: `📂 *GitHub Repository*\n\n` +
                `🔗 https://github.com/rama-1-41/T30-XMD-Bot\n\n` +
                `⭐ *Star this repo if you like it!*\n` +
                `🍴 *Fork to contribute!*\n\n` +
                `📝 *Features:*\n` +
                `• Multi-user support\n` +
                `• Auto-react and auto-view\n` +
                `• Anti-call protection\n` +
                `• And more!`
        }, { quoted: message });
    }
};
