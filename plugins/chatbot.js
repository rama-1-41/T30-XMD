const axios = require('axios');

module.exports = {
    name: 'chatbot',
    description: 'Toggle chatbot on/off in groups',
    category: 'admin',
    usage: 'chatbot [on/off]',
    async execute(sock, chatId, message, args, isAdmin) {
        if (!isAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' });
            return;
        }

        const status = args[0]?.toLowerCase();
        global.chatbotState = global.chatbotState || { enabled: false };

        if (status === 'on') {
            global.chatbotState.enabled = true;
            await sock.sendMessage(chatId, { text: '✅ Chatbot enabled!' });
        } else if (status === 'off') {
            global.chatbotState.enabled = false;
            await sock.sendMessage(chatId, { text: '❌ Chatbot disabled!' });
        } else {
            await sock.sendMessage(chatId, {
                text: `💬 Chatbot status: ${global.chatbotState.enabled ? '✅ ON' : '❌ OFF'}\n\nUsage: .chatbot on/off`
            });
        }
    }
};
