
const CommandBase = require('../utils/commandBase');

class BotStatsCommand extends CommandBase {
    constructor() {
        super({
            name: 'botstats',
            description: 'View detailed bot statistics (Admin only)',
            category: 'Admin',
            usage: 'botstats',
            adminOnly: true
        });
    }

    async execute(context) {
        const adminManager = global.bot.adminManager;
        
        if (!adminManager.isAdmin(context.platform, context.user.id)) {
            await context.reply('🚫 **Access Denied!** This command is for admins only.');
            return;
        }

        const stats = global.bot.getStats();
        const uptime = this.formatUptime(stats.uptime);
        const bannedCount = global.bot.bannedUsers.size;ze;

        const embed = {
            title: '📊 Bot Statistics',
            fields: [
                {
                    name: '⏱️ Uptime',
                    value: uptime,
                    inline: true
                },
                {
                    name: '🎮 Discord Guilds',
                    value: stats.discordGuilds.toString(),
                    inline: true
                },
                {
                    name: '📱 Telegram Chats',
                    value: stats.telegramChats.toString(),
                    inline: true
                },
                {
                    name: '⚡ Commands Executed',
                    value: stats.commandsExecuted.toString(),
                    inline: true
                },
                {
                    name: '📝 Total Commands',
                    value: stats.commandCount.toString(),
                    inline: true
                },
                {
                    name: '🚫 Banned Users',
                    value: bannedCount.toString(),
                    inline: true
                },
                {
                    name: '💾 Memory Usage',
                    value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
                    inline: true
                },
                {
                    name: '🟢 Node.js Version',
                    value: process.version,
                    inline: true
                },
                {
                    name: '🚀 Started',
                    value: `<t:${Math.floor(stats.startTime / 1000)}:R>`,
                    inline: true
                }
            ],
            color: 0x00ff00,
            footer: {
                text: `ZENTRYX v${global.bot.config.bot.version} | ${global.bot.config.bot.developer}`
            },
            timestamp: new Date().toISOString()
        };

        if (context.isDiscord) {
            await context.reply({ embeds: [embed] });
        } else {
            let text = '📊 **Bot Statistics**\n\n';
            text += `⏱️ **Uptime:** ${uptime}\n`;
            text += `🎮 **Discord Guilds:** ${stats.discordGuilds}\n`;
            text += `📱 **Telegram Chats:** ${stats.telegramChats}\n`;
            text += `⚡ **Commands Executed:** ${stats.commandsExecuted}\n`;
            text += `📝 **Total Commands:** ${stats.commandCount}\n`;
            text += `🚫 **Banned Users:** ${bannedCount}\n`;
            text += `💾 **Memory Usage:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB\n`;
            text += `🟢 **Node.js Version:** ${process.version}\n`;
            text += `\n**ZENTRYX v${global.bot.config.bot.version}** by ${global.bot.config.bot.developer}`;
            
            await context.reply(text);
        }
    }

    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
}

module.exports = new BotStatsCommand();
