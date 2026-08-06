const fs = require('fs');
const path = require('path');

const AUTOREAD_FILE = path.join(process.cwd(), 'data', 'autoread.json');

function getAutoreadState() {
    try {
        return JSON.parse(fs.readFileSync(AUTOREAD_FILE, 'utf8'));
    } catch (error) { return { enabled: false }; }
}

function updateAutoreadState(state) {
    try {
        fs.writeFileSync(AUTOREAD_FILE, JSON.stringify(state, null, 2));
        return true;
    } catch (error) { return false; }
}

module.exports = {
    name: 'autoread',
    description: 'Toggle auto-read messages on/off',
    category: 'settings',
    usage: 'autoread [on/off]',
    async execute(sock, chatId, message, args, isOwner) {
        if (!isOwner) {
            await sock.sendMessage(chatId, { text: '❌ Only owner can use this command!' });
            return;
        }

        const status = args[0]?.toLowerCase();
        const state = getAutoreadState();

        if (status === 'on') {
            updateAutoreadState({ enabled: true });
            await sock.sendMessage(chatId, { text: '✅ Auto-read enabled!' });
        } else if (status === 'off') {
            updateAutoreadState({ enabled: false });
            await sock.sendMessage(chatId, { text: '❌ Auto-read disabled!' });
        } else {
            await sock.sendMessage(chatId, {
                text: `👀 Auto-read status: ${state.enabled ? '✅ ON' : '❌ OFF'}\n\nUsage: .autoread on/off`
            });
        }
    }
};
