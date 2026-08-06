module.exports = {
    name: 'demote',
    description: 'Demote a user from admin',
    category: 'admin',
    usage: 'demote [@user]',
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
            await sock.sendMessage(chatId, { text: '❌ Please mention a user to demote!' });
            return;
        }

        try {
            await sock.groupParticipantsUpdate(chatId, mentioned, 'demote');
            await sock.sendMessage(chatId, {
                text: `✅ ${mentioned.map(jid => `@${jid.split('@')[0]}`).join(', ')} demoted!`
            });
        } catch (error) {
            console.error('Demote error:', error);
            await sock.sendMessage(chatId, { text: '❌ Failed to demote user!' });
        }
    }
};
