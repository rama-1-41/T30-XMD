const { getAntiBadwordSettings, updateAntiBadwordSettings } = require('../lib/antibadword');

module.exports = {
    name: 'antibadword',
    description: 'Enable/disable bad word filter in groups',
    category: 'admin',
    usage: 'antibadword [on/off]',
    async execute(sock, chatId, message, args, isAdmin, isBotAdmin) {
        if (!isAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' });
            return;
        }
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Bot must be admin to use this feature!' });
            return;
        }

        const status = args[0]?.toLowerCase();
        const settings = getAntiBadwordSettings();

        if (status === 'on') {
            updateAntiBadwordSettings({ enabled: true });
            await sock.sendMessage(chatId, { text: '✅ Bad word filter enabled!' });
        } else if (status === 'off') {
            updateAntiBadwordSettings({ enabled: false });
            await sock.sendMessage(chatId, { text: '❌ Bad word filter disabled!' });
        } else {
            await sock.sendMessage(chatId, {
                text: `🔤 Bad word filter status: ${settings.enabled ? '✅ ON' : '❌ OFF'}\n\nUsage: .antibadword on/off`
            });
        }
    }
};
