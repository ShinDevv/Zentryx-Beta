
const CommandBase = require('../utils/commandBase');

class UnbanCommand extends CommandBase {
    constructor() {
        super({
            name: 'unban',
            description: 'Unban a user from using the bot (Admin only)',
            category: 'Admin',
            usage: 'unban <user_id>',
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
            await context.reply('❌ **Usage:** `unban <user_id>`');
            return;
        }

        const targetUserId = context.args[0];

        if (!global.bot.isUserBanned(targetUserId)) {
            await context.reply('❌ **User is not banned!**');
            return;
        }

        global.bot.unbanUser(targetUserId);

        const embed = {
            title: '✅ User Unbanned',
            description: `**User ID:** \`${targetUserId}\`\n**Unbanned by:** ${context.user.displayName}`,
            color: 0x00ff00,
            timestamp: new Date().toISOString()
        };

        if (context.isDiscord) {
            await context.reply({ embeds: [embed] });
        } else {
            await context.reply(`✅ **User Unbanned**\n\n**User ID:** \`${targetUserId}\`\n**Unbanned by:** ${context.user.displayName}`);
        }
    }
}

module.exports = new UnbanCommand();
