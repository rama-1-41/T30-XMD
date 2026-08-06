module.exports = {
    name: 'delete',
    description: 'Delete a message (reply to message)',
    category: 'admin',
    usage: 'delete (reply to message)',
    async execute(sock, chatId, message, args, isAdmin) {
        if (!isAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' });
            return;
        }

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            await sock.sendMessage(chatId, { text: '❌ Please reply to a message to delete!' });
            return;
        }

        try {
            await sock.sendMessage(chatId, {
                delete: {
                    remoteJid: chatId,
                    fromMe: false,
                    id: quoted.key.id,
                    participant: quoted.key.participant || quoted.key.remoteJid
                }
            });
            await sock.sendMessage(chatId, { text: '✅ Message deleted!' });
        } catch (error) {
            console.error('Delete error:', error);
            await sock.sendMessage(chatId, { text: '❌ Failed to delete message!' });
        }
    }
};
