const settings = require('../settings');

module.exports = {
    name: 'ping',
    description: 'Check bot ping/status',
    category: 'general',
    usage: 'ping',
    async execute(sock, chatId, message, args) {
        const start = Date.now();
        await sock.sendMessage(chatId, { text: '🏓 Pinging...' }, { quoted: message });
        const end = Date.now();
        const ping = end - start;
        
        await sock.sendMessage(chatId, {
            text: `🏓 Pong!\n📡 *Ping:* ${ping}ms\n🤖 *Bot:* ${settings.botName}\n📌 *Prefix:* ${settings.prefix}`
        });
    }
};
