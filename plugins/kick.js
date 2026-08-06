module.exports = {
    name: 'kick',
    description: 'Kick a user from the group',
    category: 'admin',
    usage: 'kick [@user]',
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
            await sock.sendMessage(chatId, { text: '❌ Please mention a user to kick!' });
            return;
        }

        try {
            await sock.groupParticipantsUpdate(chatId, mentioned, 'remove');
            await sock.sendMessage(chatId, {
                text: `✅ ${mentioned.map(jid => `@${jid.split('@')[0]}`).join(', ')} kicked!`
            });
        } catch (error) {
            console.error('Kick error:', error);
            await sock.sendMessage(chatId, { text: '❌ Failed to kick user!' });
        }
    }
};
