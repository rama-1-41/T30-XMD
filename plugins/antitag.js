module.exports = {
    name: 'antitag',
    description: 'Enable/disable anti-tag feature',
    category: 'admin',
    usage: 'antitag [on/off]',
    async execute(sock, chatId, message, args, isAdmin) {
        if (!isAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' });
            return;
        }

        // Anti-tag logic would go here
        const status = args[0]?.toLowerCase();
        const antitagState = global.antitagState || { enabled: false };

        if (status === 'on') {
            global.antitagState = { enabled: true };
            await sock.sendMessage(chatId, { text: '✅ Anti-tag enabled!' });
        } else if (status === 'off') {
            global.antitagState = { enabled: false };
            await sock.sendMessage(chatId, { text: '❌ Anti-tag disabled!' });
        } else {
            await sock.sendMessage(chatId, {
                text: `🔖 Anti-tag status: ${global.antitagState?.enabled ? '✅ ON' : '❌ OFF'}\n\nUsage: .antitag on/off`
            });
        }
    }
};
