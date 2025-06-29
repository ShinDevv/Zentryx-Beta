
const CommandBase = require('../utils/commandBase');

class AdminsCommand extends CommandBase {
    constructor() {
        super({
            name: 'admins',
            description: 'List all bot administrators',
            category: 'Admin',
            usage: 'admins'
        });
    }

    async execute(context) {
        const adminManager = global.bot.adminManager;
        const config = global.bot.config;

        const discordAdmins = config.admins.discord || [];
        const telegramAdmins = config.admins.telegram || [];

        const embed = {
            title: '👑 Bot Administrators',
            fields: [
                {
                    name: '🎮 Discord Admins',
                    value: discordAdmins.length > 0 ? discordAdmins.map(id => `\`${id}\``).join('\n') : 'None configured',
                    inline: true
                },
                {
                    name: '📱 Telegram Admins',
                    value: telegramAdmins.length > 0 ? telegramAdmins.map(id => `\`${id}\``).join('\n') : 'None configured',
                    inline: true
                }
            ],
            color: 0x7289da,
            footer: {
                text: `Your ID: ${context.user.id} | Admin: ${adminManager.isAdmin(context.platform, context.user.id) ? 'Yes' : 'No'}`
            },
            timestamp: new Date().toISOString()
        };

        if (context.isDiscord) {
            await context.reply({ embeds: [embed] });
        } else {
            let text = '👑 **Bot Administrators**\n\n';
            text += '🎮 **Discord Admins:**\n';
            text += discordAdmins.length > 0 ? discordAdmins.map(id => `\`${id}\``).join('\n') : 'None configured';
            text += '\n\n📱 **Telegram Admins:**\n';
            text += telegramAdmins.length > 0 ? telegramAdmins.map(id => `\`${id}\``).join('\n') : 'None configured';
            text += `\n\n**Your ID:** \`${context.user.id}\`\n**Admin:** ${adminManager.isAdmin(context.platform, context.user.id) ? 'Yes' : 'No'}`;
            
            await context.reply(text);
        }
    }
}

module.exports = new AdminsCommand();
