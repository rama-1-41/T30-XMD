const { processSticker } = require('../lib/sticker');
const settings = require('../settings');

module.exports = {
    name: 'sticker',
    description: 'Create sticker from image/video',
    category: 'media',
    usage: 'sticker (reply to image/video)',
    async execute(sock, chatId, message, args) {
        await processSticker(sock, chatId, message, settings.packname, settings.author);
    }
};
