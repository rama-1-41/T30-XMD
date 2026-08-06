module.exports = {
    name: 'hidetag',
    description: 'Tag all members with hidden message',
    category: 'admin',
    usage: 'hidetag [message]',
    async execute(sock, chatId, message, args, isAdmin) {
        if (!isAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' });
            return;
        }

        const text = args.join(' ') || 'Hello everyone!';
        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];
            const mentions = participants.map(p => p.id);

            await sock.sendMessage(chatId, {
                text: text,
                mentions: mentions
            }, { quoted: message });
        } catch (error) {
            console.error('Hidetag error:', error);
            await sock.sendMessage(chatId, { text: '❌ Failed to send hidetag!' });
        }
    }
};
