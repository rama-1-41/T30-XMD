module.exports = {
    name: 'tagnotadmin',
    description: 'Tag all non-admin members',
    category: 'admin',
    usage: 'tagnotadmin [message]',
    async execute(sock, chatId, message, args, isAdmin) {
        if (!isAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' });
            return;
        }

        const text = args.join(' ') || 'Hello non-admins!';
        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];
            const nonAdmins = participants.filter(p => !p.admin || p.admin === 'admin' || p.admin === 'superadmin');
            const mentions = nonAdmins.map(p => p.id);

            if (mentions.length === 0) {
                await sock.sendMessage(chatId, { text: 'No non-admin members found!' });
                return;
            }

            await sock.sendMessage(chatId, {
                text: text,
                mentions: mentions
            }, { quoted: message });
        } catch (error) {
            console.error('Tag not admin error:', error);
            await sock.sendMessage(chatId, { text: '❌ Failed to tag non-admins!' });
        }
    }
};
