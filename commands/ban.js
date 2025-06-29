
const CommandBase = require('../utils/commandBase');

class BanCommand extends CommandBase {
    constructor() {
        super({
            name: 'ban',
            description: 'Ban a user from using the bot (Admin only)',
            category: 'Admin',
            usage: 'ban <user_id> [reason]',
            adminOnly: true
        });
    }

    async execute(context) {
        const adminManager = global.bot.adminManager;
        
        if (!adminManager.isAdmin(context.platform, context.user.id)) {
            await context.reply('🚫 **Access Denied!** This command is for admins only.');
            return;
        }

        if (!context.args || context.args.length === 0) {
            await context.reply('❌ **Usage:** `ban <user_id> [reason]`');
            return;
        }

        const targetUserId = context.args[0];
        const reason = context.args.slice(1).join(' ') || 'No reason provided';

        if (adminManager.isAdmin(context.platform, targetUserId)) {
            await context.reply('❌ **Cannot ban an admin!**');
            return;
        }

        global.bot.banUser(targetUserId);

        const embed = {
            title: '🔨 User Banned',
            description: `**User ID:** \`${targetUserId}\`\n**Reason:** ${reason}\n**Banned by:** ${context.user.displayName}`,
            color: 0xff0000,
            timestamp: new Date().toISOString()
        };

        if (context.isDiscord) {
            await context.reply({ embeds: [embed] });
        } else {
            await context.reply(`🔨 **User Banned**\n\n**User ID:** \`${targetUserId}\`\n**Reason:** ${reason}\n**Banned by:** ${context.user.displayName}`);
        }
    }
}

module.exports = new BanCommand();
