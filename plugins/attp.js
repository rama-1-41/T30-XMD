const axios = require('axios');

module.exports = {
    name: 'attp',
    description: 'Create text to sticker (using API)',
    category: 'media',
    usage: 'attp [text]',
    async execute(sock, chatId, message, args, isAdmin, isBotAdmin, isOwner) {
        const text = args.join(' ') || 'Hello';
        
        try {
            // Using an API for text-to-image
            const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x200&data=${encodeURIComponent(text)}`;
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            
            await sock.sendMessage(chatId, {
                image: buffer,
                caption: `📝 ${text}`
            }, { quoted: message });
        } catch (error) {
            console.error('ATTP error:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ Failed to create text sticker!\n\n💡 Install canvas: npm install canvas' 
            });
        }
    }
};
