module.exports = {
    name: 'promote',
    description: 'Promote a user to admin',
    category: 'admin',
    usage: 'promote [@user]',
    async execute(sock, chatId, message, args, isAdmin, isBotAdmin) {
        if (!isAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' });
            return;
        }
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Bot must be admin!' });
            return;
        }

        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentioned.length === 0) {
            await sock.sendMessage(chatId, { text: '❌ Please mention a user to promote!' });
            return;
        }

        try {
            await sock.groupParticipantsUpdate(chatId, mentioned, 'promote');
            await sock.sendMessage(chatId, {
                text: `✅ ${mentioned.map(jid => `@${jid.split('@')[0]}`).join(', ')} promoted!`
            });
        } catch (error) {
            console.error('Promote error:', error);
            await sock.sendMessage(chatId, { text: '❌ Failed to promote user!' });
        }
    }
};
