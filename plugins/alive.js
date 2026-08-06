module.exports = {
    name: 'alive',
    description: 'Check if bot is alive',
    category: 'general',
    usage: 'alive',
    async execute(sock, chatId, message, args) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        await sock.sendMessage(chatId, {
            text: `🤖 *Bot is Alive!*\n\n⏱️ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s\n📡 Status: Online\n⚡ Memory: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`
        }, { quoted: message });
    }
};
