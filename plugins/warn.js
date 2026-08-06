const fs = require('fs');
const path = require('path');

const WARNINGS_FILE = path.join(process.cwd(), 'data', 'warnings.json');

function getWarnings() {
    try {
        return JSON.parse(fs.readFileSync(WARNINGS_FILE, 'utf8'));
    } catch (error) { return {}; }
}

function saveWarnings(data) {
    try {
        fs.writeFileSync(WARNINGS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) { return false; }
}

module.exports = {
    name: 'warn',
    description: 'Warn a user',
    category: 'admin',
    usage: 'warn [@user] [reason]',
    async execute(sock, chatId, message, args, isAdmin) {
        if (!isAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' });
            return;
        }

        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentioned.length === 0) {
            await sock.sendMessage(chatId, { text: '❌ Please mention a user to warn!' });
            return;
        }

        const target = mentioned[0];
        const reason = args.slice(1).join(' ') || 'No reason provided';
        const warnings = getWarnings();
        
        if (!warnings[target]) warnings[target] = [];
        warnings[target].push({ reason, date: new Date().toISOString(), warnedBy: message.key.participant || message.key.remoteJid });
        
        if (saveWarnings(warnings)) {
            await sock.sendMessage(chatId, {
                text: `⚠️ User @${target.split('@')[0]} has been warned!\n📝 Reason: ${reason}\n📊 Total warnings: ${warnings[target].length}`
            });
        } else {
            await sock.sendMessage(chatId, { text: '❌ Failed to warn user!' });
        }
    }
};
