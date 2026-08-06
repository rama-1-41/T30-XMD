// 🧹 Fix for ENOSPC / temp overflow in hosted panels
const fs = require('fs');
const path = require('path');

// Redirect temp storage away from system /tmp
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

// Auto-cleaner every 3 hours
setInterval(() => {
    fs.readdir(customTemp, (err, files) => {
        if (err) return;
        for (const file of files) {
            const filePath = path.join(customTemp, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(filePath, () => { });
                }
            });
        }
    });
    console.log('🧹 Temp folder auto-cleaned');
}, 3 * 60 * 60 * 1000);

const settings = require('./settings');
require('./config.js');
const { isBanned } = require('./lib/isBanned');
const { isSudo } = require('./lib/isOwner');
const isOwnerOrSudo = require('./lib/isOwner');
const isAdmin = require('./lib/isAdmin');
const { incrementMessageCount } = require('./lib/messageConfig');
const { smsg } = require('./lib/myfunc');

// Global settings
global.packname = settings.packname || 'T30-XMD';
global.author = settings.author || 'Mr Presenter';
global.channelLink = "https://whatsapp.com/channel/0029VbDEaph2P59lnHWK6R3N";
global.ytch = "T30-XMD";

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363428121144787@newsletter',
            newsletterName: 'T30-XMD',
            serverMessageId: -1
        }
    }
};

// Load all plugins from plugins folder
const plugins = new Map();
const pluginFiles = fs.readdirSync(path.join(__dirname, 'plugins')).filter(file => file.endsWith('.js'));

for (const file of pluginFiles) {
    try {
        const plugin = require(`./plugins/${file}`);
        if (plugin.name) {
            plugins.set(plugin.name, plugin);
            console.log(`✅ Loaded plugin: ${plugin.name}`);
        }
    } catch (error) {
        console.error(`❌ Error loading plugin ${file}:`, error);
    }
}

console.log(`📦 Loaded ${plugins.size} plugins from plugins folder`);

// Command imports (for backward compatibility)
const helpCommand = require('./plugins/help');
const menuCommand = require('./plugins/menu');
const pingCommand = require('./plugins/ping');
const ownerCommand = require('./plugins/owner');
const stickerCommand = require('./plugins/sticker');
const aliveCommand = require('./plugins/alive');
const githubCommand = require('./plugins/github');
const groupInfoCommand = require('./plugins/groupinfo');
const tagAllCommand = require('./plugins/tagall');
const tagNotAdminCommand = require('./plugins/tagnotadmin');
const hideTagCommand = require('./plugins/hidetag');
const banCommand = require('./plugins/ban');
const unbanCommand = require('./plugins/unban');
const promoteCommand = require('./plugins/promote');
const demoteCommand = require('./plugins/demote');
const kickCommand = require('./plugins/kick');
const warnCommand = require('./plugins/warn');
const warningsCommand = require('./plugins/warnings');
const deleteCommand = require('./plugins/delete');
const attpCommand = require('./plugins/attp');
const autoreadCommand = require('./plugins/autoread');
const autotypingCommand = require('./plugins/autotyping');
const antilinkCommand = require('./plugins/antilink');
const antibadwordCommand = require('./plugins/antibadword');

async function handleMessages(sock, messageUpdate, printLog) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const senderIsSudo = await isSudo(senderId);
        const senderIsOwnerOrSudo = await isOwnerOrSudo(senderId, sock, chatId);

        // Get user message
        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            ''
        ).toLowerCase().replace(/\.\s+/g, '.').trim();

        // Preserve raw message for plugins that need original casing
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        // Only log command usage
        if (userMessage.startsWith(settings.prefix)) {
            console.log(`📝 Command used in ${isGroup ? 'group' : 'private'}: ${userMessage}`);
        }

        // Check if user is banned (skip ban check for unban command)
        if (isBanned(senderId) && !userMessage.startsWith('.unban')) {
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, {
                    text: '❌ You are banned from using the bot. Contact an admin to get unbanned.',
                    ...channelInfo
                });
            }
            return;
        }

        // Count messages
        if (!message.key.fromMe) {
            incrementMessageCount(senderId);
        }

        // Check for bad words and antilink in groups
        if (isGroup) {
            if (userMessage) {
                try {
                    const { handleBadwordDetection } = require('./lib/antibadword');
                    await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
                } catch (e) {}
            }
            try {
                const { Antilink } = require('./lib/antilink');
                await Antilink(message, sock);
            } catch (e) {}
        }

        // Then check for command prefix
        if (!userMessage.startsWith(settings.prefix)) {
            if (isGroup) {
                // Handle non-command group messages
                if (userMessage) {
                    // Run any group moderation here
                }
            }
            return;
        }

        // List of admin plugins
        const adminplugins = ['.ban', '.unban', '.promote', '.demote', '.kick', '.tagall', '.tagnotadmin', '.hidetag', '.antilink', '.antitag'];
        const isAdminCommand = adminplugins.some(cmd => userMessage.startsWith(cmd));

        // List of owner plugins
        const ownerplugins = ['.autoread', '.autotyping', '.autostatus', '.clearsession', '.cleartmp', '.areact', '.autoreact', '.mode'];
        const isOwnerCommand = ownerplugins.some(cmd => userMessage.startsWith(cmd));

        let isSenderAdmin = false;
        let isBotAdmin = false;

        // Check admin status only for admin plugins in groups
        if (isGroup && isAdminCommand) {
            const adminStatus = await isAdmin(sock, chatId, senderId);
            isSenderAdmin = adminStatus.isSenderAdmin;
            isBotAdmin = adminStatus.isBotAdmin;

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { text: 'Please make the bot an admin to use admin plugins.', ...channelInfo }, { quoted: message });
                return;
            }

            if (
                userMessage.startsWith('.ban') ||
                userMessage.startsWith('.unban') ||
                userMessage.startsWith('.promote') ||
                userMessage.startsWith('.demote')
            ) {
                if (!isSenderAdmin && !message.key.fromMe) {
                    await sock.sendMessage(chatId, {
                        text: 'Sorry, only group admins can use this command.',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
            }
        }

        // Check owner status for owner plugins
        if (isOwnerCommand) {
            if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner or sudo!' }, { quoted: message });
                return;
            }
        }

        // Extract command and args
        const args = userMessage.slice(settings.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Command handlers - Execute plugins
        let commandExecuted = false;

        // Check if command exists in plugins map (for dynamically loaded plugins)
        if (plugins.has(commandName)) {
            const plugin = plugins.get(commandName);
            try {
                await plugin.execute(sock, chatId, message, args, isSenderAdmin, isBotAdmin, senderIsOwnerOrSudo);
                commandExecuted = true;
            } catch (error) {
                console.error(`Error executing plugin ${commandName}:`, error);
                await sock.sendMessage(chatId, {
                    text: '❌ Error executing command. Please try again.'
                });
            }
        } else {
            // Handle commands with switch statement (for backward compatibility)
            switch (true) {
                case commandName === 'help' || commandName === 'menu' || commandName === 'bot' || commandName === 'list':
                    await helpCommand(sock, chatId, message);
                    commandExecuted = true;
                    break;
                case commandName === 'ping':
                    await pingCommand(sock, chatId, message);
                    commandExecuted = true;
                    break;
                case commandName === 'owner':
                    await ownerCommand(sock, chatId, message);
                    commandExecuted = true;
                    break;
                case commandName === 'sticker' || commandName === 's':
                    await stickerCommand(sock, chatId, message);
                    commandExecuted = true;
                    break;
                case commandName === 'alive':
                    await aliveCommand(sock, chatId, message);
                    commandExecuted = true;
                    break;
                case commandName === 'github' || commandName === 'git' || commandName === 'repo' || commandName === 'sc':
                    await githubCommand(sock, chatId, message);
                    commandExecuted = true;
                    break;
                case commandName === 'groupinfo' || commandName === 'infogp':
                    await groupInfoCommand(sock, chatId, message);
                    commandExecuted = true;
                    break;
                case commandName === 'tagall':
                    await tagAllCommand(sock, chatId, senderId, message);
                    commandExecuted = true;
                    break;
                case commandName === 'tagnotadmin':
                    await tagNotAdminCommand(sock, chatId, senderId, message);
                    commandExecuted = true;
                    break;
                case commandName === 'hidetag':
                    const messageText = rawText.slice(8).trim();
                    const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                    await hideTagCommand(sock, chatId, senderId, messageText, replyMessage, message);
                    commandExecuted = true;
                    break;
                case commandName === 'ban':
                    await banCommand(sock, chatId, message);
                    commandExecuted = true;
                    break;
                case commandName === 'unban':
                    await unbanCommand(sock, chatId, message);
                    commandExecuted = true;
                    break;
                case commandName === 'promote':
                    const mentionedJidListPromote = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await promoteCommand(sock, chatId, mentionedJidListPromote, message);
                    commandExecuted = true;
                    break;
                case commandName === 'demote':
                    const mentionedJidListDemote = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await demoteCommand(sock, chatId, mentionedJidListDemote, message);
                    commandExecuted = true;
                    break;
                case commandName === 'kick':
                    const mentionedJidListKick = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await kickCommand(sock, chatId, senderId, mentionedJidListKick, message);
                    commandExecuted = true;
                    break;
                case commandName === 'warn':
                    const mentionedJidListWarn = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await warnCommand(sock, chatId, senderId, mentionedJidListWarn, message);
                    commandExecuted = true;
                    break;
                case commandName === 'warnings':
                    const mentionedJidListWarnings = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await warningsCommand(sock, chatId, mentionedJidListWarnings);
                    commandExecuted = true;
                    break;
                case commandName === 'delete' || commandName === 'del':
                    await deleteCommand(sock, chatId, message, senderId);
                    commandExecuted = true;
                    break;
                case commandName === 'attp':
                    await attpCommand(sock, chatId, message);
                    commandExecuted = true;
                    break;
                case commandName === 'autoread':
                    await autoreadCommand(sock, chatId, message);
                    commandExecuted = true;
                    break;
                case commandName === 'autotyping':
                    await autotypingCommand(sock, chatId, message);
                    commandExecuted = true;
                    break;
                case commandName === 'antilink':
                    if (!isGroup) {
                        await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
                        return;
                    }
                    if (!isBotAdmin) {
                        await sock.sendMessage(chatId, { text: 'Please make the bot an admin first.', ...channelInfo }, { quoted: message });
                        return;
                    }
                    try {
                        const { handleAntilinkCommand } = require('./plugins/antilink');
                        await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
                    } catch (e) {
                        await sock.sendMessage(chatId, { text: '❌ Error executing antilink command.' });
                    }
                    commandExecuted = true;
                    break;
                case commandName === 'antibadword':
                    if (!isGroup) {
                        await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
                        return;
                    }
                    if (!isBotAdmin) {
                        await sock.sendMessage(chatId, { text: '*Bot must be admin to use this feature*', ...channelInfo }, { quoted: message });
                        return;
                    }
                    try {
                        const antibadwordPlugin = require('./plugins/antibadword');
                        await antibadwordPlugin.execute(sock, chatId, message, args, isSenderAdmin, isBotAdmin);
                    } catch (e) {
                        await sock.sendMessage(chatId, { text: '❌ Error executing antibadword command.' });
                    }
                    commandExecuted = true;
                    break;
                default:
                    // If no command found
                    await sock.sendMessage(chatId, {
                        text: `❌ Unknown command. Use ${settings.prefix}help to see available commands.`
                    });
                    commandExecuted = false;
                    break;
            }
        }

        // If a command was executed, add reaction
        if (commandExecuted) {
            try {
                const emojis = ['❤️', '🔥', '✅', '✨', '💪', '🎯', '⭐', '🏆'];
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(chatId, {
                    react: {
                        key: { remoteJid: chatId, id: message.key.id, fromMe: message.key.fromMe, participant: senderId },
                        text: emoji
                    }
                });
            } catch (e) {}
        }

    } catch (error) {
        console.error('❌ Error in message handler:', error.message);
        if (chatId) {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to process command!',
                ...channelInfo
            });
        }
    }
}

async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action } = update;

        // Check if it's a group
        if (!id.endsWith('@g.us')) return;

        // Handle join events
        if (action === 'add') {
            for (const participant of participants) {
                await sock.sendMessage(id, {
                    text: `👋 Welcome ${participant.split('@')[0]} to the group!`
                });
            }
        }

        // Handle leave events
        if (action === 'remove') {
            for (const participant of participants) {
                await sock.sendMessage(id, {
                    text: `👋 Goodbye ${participant.split('@')[0]}`
                });
            }
        }
    } catch (error) {
        console.error('Error in handleGroupParticipantUpdate:', error);
    }
}

async function handleStatus(sock, status) {
    try {
        // Auto-view status
        if (settings.autoviewStatus !== false) {
            const participantToUse = status.key.participantPn || status.key.participant;
            await sock.readMessages([{
                remoteJid: status.key.remoteJid,
                id: status.key.id,
                fromMe: status.key.fromMe,
                participant: participantToUse
            }]);
        }

        // Auto-like status
        if (settings.autoLikeStatus !== false && status.key.participant) {
            const participantToUse = status.key.participantPn || status.key.participant;
            const emojis = (settings.statusLikeEmojis || '❤️,🔥,🥳,👏,💪,✨,⭐,🌟,💫,🎉,😍,🤩,😎,💖,🧡,💛,💚,💙,💜').split(',').map(e => e.trim());
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)] || '❤️';
            await sock.sendMessage(
                status.key.remoteJid,
                { react: { key: { remoteJid: status.key.remoteJid, id: status.key.id, fromMe: status.key.fromMe, participant: participantToUse }, text: randomEmoji } },
                { statusJidList: [participantToUse] }
            );
        }
    } catch (error) {
        console.error('Status handler error:', error);
    }
}

module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus
};
