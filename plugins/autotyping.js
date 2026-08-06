const fs = require('fs');
const path = require('path');

const AUTOTYPING_FILE = path.join(process.cwd(), 'data', 'autotyping.json');

function getAutotypingState() {
    try {
        return JSON.parse(fs.readFileSync(AUTOTYPING_FILE, 'utf8'));
    } catch (error) { return { enabled: false }; }
}

function updateAutotypingState(state) {
    try {
        fs.writeFileSync(AUTOTYPING_FILE, JSON.stringify(state, null, 2));
        return true;
    } catch (error) { return false; }
}

module.exports = {
    name: 'autotyping',
    description: 'Toggle auto-typing on/off',
    category: 'settings',
    usage: 'autotyping [on/off]',
    async execute(sock, chatId, message, args, isOwner) {
        if (!isOwner) {
            await sock.sendMessage(chatId, { text: '❌ Only owner can use this command!' });
            return;
        }

        const status = args[0]?.toLowerCase();
        const state = getAutotypingState();

        if (status === 'on') {
            updateAutotypingState({ enabled: true });
            await sock.sendMessage(chatId, { text: '✅ Auto-typing enabled!' });
        } else if (status === 'off') {
            updateAutotypingState({ enabled: false });
            await sock.sendMessage(chatId, { text: '❌ Auto-typing disabled!' });
        } else {
            await sock.sendMessage(chatId, {
                text: `⌨️ Auto-typing status: ${state.enabled ? '✅ ON' : '❌ OFF'}\n\nUsage: .autotyping on/off`
            });
        }
    }
};
