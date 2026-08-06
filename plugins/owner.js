const settings = require('../settings');

module.exports = {
    name: 'owner',
    description: 'Contact bot owner',
    category: 'general',
    usage: 'owner',
    async execute(sock, chatId, message, args) {
        await sock.sendMessage(chatId, {
            text: `👤 *Bot Owner*\n📱 ${settings.ownerNumber || 'Not set'}\n\nContact them for support or issues!`
        }, { quoted: message });
    }
};
