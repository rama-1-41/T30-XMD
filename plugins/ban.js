const { banUser, getBannedUsers } = require('../lib/isBanned');

module.exports = {
    name: 'ban',
    description: 'Ban a user from using the bot',
    category: 'admin',
    usage: 'ban [@user] or .ban [reply]',
    async execute(sock, chatId, message, args, isAdmin) {
        if (!isAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' });
            return;
        }

        let targetUser = null;
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (mentioned.length > 0) {
            targetUser = mentioned[0];
        } else if (quoted) {
            targetUser = quoted.key?.participant || quoted.key?.remoteJid;
        }

        if (!targetUser) {
            await sock.sendMessage(chatId, { text: '❌ Please mention or reply to a user to ban!' });
            return;
        }

        if (banUser(targetUser)) {
            await sock.sendMessage(chatId, {
                text: `✅ User ${targetUser.split('@')[0]} has been banned!`
            });
        } else {
            await sock.sendMessage(chatId, { text: '❌ Failed to ban user!' });
        }
    }
};
