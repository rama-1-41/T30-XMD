module.exports = {
    name: 'groupinfo',
    description: 'Get group information',
    category: 'general',
    usage: 'groupinfo',
    async execute(sock, chatId, message, args) {
        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            const groupName = groupMetadata.subject || 'Unknown';
            const groupDesc = groupMetadata.desc || 'No description';
            const participants = groupMetadata.participants || [];
            const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

            await sock.sendMessage(chatId, {
                text: `📊 *Group Info*\n\n` +
                    `📌 *Name:* ${groupName}\n` +
                    `📝 *Description:* ${groupDesc}\n` +
                    `👥 *Members:* ${participants.length}\n` +
                    `👑 *Admins:* ${admins.length}\n` +
                    `🤖 *Bot Admin:* ${participants.some(p => p.id === botId && (p.admin === 'admin' || p.admin === 'superadmin')) ? '✅' : '❌'}\n\n` +
                    `📱 *Group JID:* ${chatId}`
            }, { quoted: message });
        } catch (error) {
            console.error('Group info error:', error);
            await sock.sendMessage(chatId, { text: '❌ Failed to get group info!' });
        }
    }
};
