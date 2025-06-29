
const CommandBase = require('../utils/commandBase');
const Formatter = require('../utils/formatter');

class InfoCommand extends CommandBase {
    constructor() {
        super({
            name: 'info',
            description: 'Display comprehensive bot information and statistics',
            category: 'Utility',
            usage: 'info',
            cooldown: 5,
            slashCommand: {
                name: 'info',
                description: 'Display comprehensive bot information and statistics',
                options: []
            }
        });
    }

    async execute(context) {
        const config = require('../config.json');
        const packageInfo = require('../package.json');
        
        const uptime = this.formatUptime(process.uptime() * 1000);
        const platformEmoji = context.isDiscord ? '🟦' : '🟢';
        const platformName = context.platform.charAt(0).toUpperCase() + context.platform.slice(1);

        if (context.isDiscord) {
            const embed = {
                color: 0x667eea,
                title: '🤖 ZENTRYX Bot Information',
                thumbnail: {
                    url: 'https://cdn.discordapp.com/attachments/123456789/987654321/bot-avatar.png'
                },
                fields: [
                    {
                        name: '📊 Bot Statistics',
                        value: [
                            `**Name:** ${config.bot.name}`,
                            `**Version:** ${config.bot.version}`,
                            `**Developer:** ${config.bot.developer}`,
                            `**Platform:** ${platformName} ${platformEmoji}`,
                            `**Uptime:** ${uptime}`
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: '⚙️ Technical Details',
                        value: [
                            `**Node.js:** ${process.version}`,
                            `**Memory Usage:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                            `**Platform Support:** Discord, Telegram`,
                            `**Commands:** ${global.bot?.commands?.size || 'Loading...'}`
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: '🌟 Features',
                        value: [
                            '✅ Cross-platform compatibility',
                            '✅ Web dashboard monitoring',
                            '✅ AI integration (GPT-4O)',
                            '✅ Entertainment commands',
                            '✅ Real-time statistics'
                        ].join('\n'),
                        inline: false
                    }
                ],
                footer: {
                    text: `Requested by ${context.user.displayName} • ZENTRYX`,
                    icon_url: 'https://cdn.discordapp.com/attachments/123456789/987654321/bot-icon.png'
                },
                timestamp: new Date().toISOString()
            };

            await context.reply({ embeds: [embed] });
        } else {
            const message = [
                `🤖 <b>CrossPlatform Bot Information</b>`,
                '',
                `📊 <b>Bot Statistics</b>`,
                `• <b>Name:</b> ${config.bot.name}`,
                `• <b>Version:</b> ${config.bot.version}`,
                `• <b>Developer:</b> ${config.bot.developer}`,
                `• <b>Platform:</b> ${platformName} ${platformEmoji}`,
                `• <b>Uptime:</b> ${uptime}`,
                '',
                `⚙️ <b>Technical Details</b>`,
                `• <b>Node.js:</b> ${process.version}`,
                `• <b>Memory Usage:</b> ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                `• <b>Platform Support:</b> Discord, Telegram`,
                `• <b>Commands:</b> ${global.bot?.commands?.size || 'Loading...'}`,
                '',
                `🌟 <b>Features</b>`,
                `✅ Cross-platform compatibility`,
                `✅ Web dashboard monitoring`,
                `✅ AI integration (GPT-4O)`,
                `✅ Entertainment commands`,
                `✅ Real-time statistics`,
                '',
                `<i>Requested by ${context.user.displayName}</i>`
            ].join('\n');

            await context.reply(message);
        }
    }

    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
}

module.exports = new InfoCommand();
