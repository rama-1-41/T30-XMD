const fs = require('fs');
const path = require('path');

const WARNINGS_FILE = path.join(process.cwd(), 'data', 'warnings.json');

function getWarnings() {
    try {
        return JSON.parse(fs.readFileSync(WARNINGS_FILE, 'utf8'));
    } catch (error) { return {}; }
}

module.exports = {
    name: 'warnings',
    description: 'Check warnings of a user',
    category: 'admin',
    usage: 'warnings [@user]',
    async execute(sock, chatId, message, args, isAdmin) {
        if (!isAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' });
            return;
        }

        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentioned.length === 0) {
            await sock.sendMessage(chatId, { text: '❌ Please mention a user to check warnings!' });
            return;
        }

        const target = mentioned[0];
        const warnings = getWarnings();
        const userWarnings = warnings[target] || [];

        if (userWarnings.length === 0) {
            await sock.sendMessage(chatId, {
                text: `✅ User @${target.split('@')[0]} has no warnings!`
            });
        } else {
            let text = `⚠️ *Warnings for @${target.split('@')[0]}:*\n\n`;
            userWarnings.forEach((w, i) => {
                text += `${i+1}. ${w.reason}\n   📅 ${w.date}\n`;
            });
            text += `\n📊 Total: ${userWarnings.length} warnings`;
            await sock.sendMessage(chatId, { text: text });
        }
    }
};
