const settings = require('../settings');

module.exports = {
    name: 'menu',
    description: 'Show command menu',
    category: 'general',
    usage: 'menu',
    async execute(sock, chatId, message, args, isAdmin, isBotAdmin, isOwner) {
        const menuText = `
╔═══════════════════════════════════════╗
║     🤖 *${settings.botName}*             ║
╚═══════════════════════════════════════╝

📌 *Prefix:* ${settings.prefix}
👤 *Owner:* ${settings.ownerNumber || 'Not set'}

*📋 COMMAND MENU:*

*🔹 General Commands:*
  ${settings.prefix}ping - Check bot status
  ${settings.prefix}help - Show help
  ${settings.prefix}menu - Show this menu
  ${settings.prefix}info - Bot info
  ${settings.prefix}owner - Contact owner
  ${settings.prefix}alive - Check if bot is alive
  ${settings.prefix}github - GitHub repo
  ${settings.prefix}groupinfo - Group info

*🔹 Media Commands:*
  ${settings.prefix}sticker - Create sticker
  ${settings.prefix}attp - Text to sticker

*🔹 Admin Commands:*
  ${settings.prefix}ban - Ban user
  ${settings.prefix}unban - Unban user
  ${settings.prefix}promote - Promote to admin
  ${settings.prefix}demote - Demote admin
  ${settings.prefix}kick - Kick user
  ${settings.prefix}tagall - Tag all members
  ${settings.prefix}tagnotadmin - Tag non-admins
  ${settings.prefix}hidetag - Hidden tag all
  ${settings.prefix}delete - Delete message
  ${settings.prefix}warn - Warn user
  ${settings.prefix}warnings - Check warnings
  ${settings.prefix}antilink - Toggle anti-link
  ${settings.prefix}antibadword - Toggle bad word filter

*🔹 Settings Commands:*
  ${settings.prefix}autoread - Toggle auto-read
  ${settings.prefix}autotyping - Toggle auto-typing

*📢 Links:*
🔗 ${global.channelLink || 'https://whatsapp.com/channel/0029VbDEaph2P59lnHWK6R3N'}

*ℹ️ Version:* ${settings.version || '1.0.0'}
`;
        await sock.sendMessage(chatId, { text: menuText }, { quoted: message });
    }
};
