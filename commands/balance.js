
const CommandBase = require('../utils/commandBase');

class BalanceCommand extends CommandBase {
    constructor() {
        super({
            name: 'balance',
            description: 'Check your coin balance',
            category: 'Economy',
            aliases: ['bal', 'coins'],
            slashCommand: {
                name: 'balance',
                description: 'Check your coin balance',
                options: [
                    {
                        name: 'user',
                        description: 'Check another user\'s balance',
                        type: 6,
                        required: false
                    }
                ]
            }
        });
    }

    async execute(context) {
        const targetUserId = context.args[0] || context.user.id;
        const targetUser = context.args[0] ? 
            (context.isDiscord ? context.interaction?.options?.getUser('user') || { username: 'Unknown' } : { first_name: 'Unknown' }) : 
            context.user;

        const userData = global.bot.bankManager.getUserData(targetUserId);
        const winRate = userData.gamesPlayed > 0 ? ((userData.gamesWon / userData.gamesPlayed) * 100).toFixed(1) : '0.0';
        const bankBalance = userData.bankBalance || 0;
        const totalWealth = userData.balance + bankBalance;

        if (context.isDiscord) {
            const embed = {
                color: 0x667eea,
                title: `💰 ${targetUser.displayName || targetUser.username}'s Wallet`,
                fields: [
                    {
                        name: '🪙 Wallet Balance',
                        value: `${userData.balance} coins`,
                        inline: true
                    },
                    {
                        name: '🏛️ Bank Balance',
                        value: `${bankBalance} coins`,
                        inline: true
                    },
                    {
                        name: '💎 Total Wealth',
                        value: `${totalWealth} coins`,
                        inline: true
                    },
                    {
                        name: '📈 Total Earned',
                        value: `${userData.totalEarned} coins`,
                        inline: true
                    },
                    {
                        name: '🎮 Games Stats',
                        value: `${userData.gamesWon}/${userData.gamesPlayed} (${winRate}%)`,
                        inline: true
                    },
                    {
                        name: '🔥 Daily Streak',
                        value: `${userData.streak} days`,
                        inline: true
                    }
                ],
                footer: {
                    text: 'Use /daily to claim coins or /bank to manage your account!'
                }
            };

            await context.reply({ embeds: [embed] });
        } else {
            const message = [
                `💰 <b>${targetUser.first_name || targetUser.username}'s Wallet</b>`,
                '',
                `🪙 <b>Wallet Balance:</b> ${userData.balance} coins`,
                `🏛️ <b>Bank Balance:</b> ${bankBalance} coins`,
                `💎 <b>Total Wealth:</b> ${totalWealth} coins`,
                `📈 <b>Total Earned:</b> ${userData.totalEarned} coins`,
                `🎮 <b>Games:</b> ${userData.gamesWon}/${userData.gamesPlayed} (${winRate}% win rate)`,
                `🔥 <b>Daily Streak:</b> ${userData.streak} days`,
                '',
                '<i>Use /daily to claim coins or /bank to manage your account!</i>'
            ].join('\n');

            await context.reply(message);
        }
    }
}

module.exports = new BalanceCommand();
