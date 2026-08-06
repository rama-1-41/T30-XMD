const { getAntilinkSettings, updateAntilinkSettings } = require('../lib/antilink');

module.exports = {
    name: 'antilink',
    description: 'Enable/disable anti-link feature in groups',
    category: 'admin',
    usage: 'antilink [on/off]',
    async execute(sock, chatId, message, args, isAdmin, isBotAdmin, isOwner) {
        if (!isAdmin && !isOwner) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' });
            return;
        }
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Bot must be admin to use this feature!' });
            return;
        }

        const status = args[0]?.toLowerCase();
        const settings = getAntilinkSettings();

        if (status === 'on') {
            updateAntilinkSettings({ enabled: true });
            await sock.sendMessage(chatId, { text: '✅ Anti-link enabled! Links will be deleted.' });
        } else if (status === 'off') {
            updateAntilinkSettings({ enabled: false });
            await sock.sendMessage(chatId, { text: '❌ Anti-link disabled!' });
        } else {
            await sock.sendMessage(chatId, {
                text: `🔗 Anti-link status: ${settings.enabled ? '✅ ON' : '❌ OFF'}\n\nUsage: .antilink on/off`
            });
        }
    }
};

// Additional function for handling link detection
async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    // This is called from the main handler
    const args = userMessage.split(' ').slice(1);
    await module.exports.execute(sock, chatId, message, args, isSenderAdmin, true, false);
}
