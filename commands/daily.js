
const CommandBase = require('../utils/commandBase');

class DailyCommand extends CommandBase {
    constructor() {
        super({
            name: 'daily',
            description: 'Claim your daily coin reward',
            category: 'Economy',
            cooldown: 5,
            slashCommand: {
                name: 'daily',
                description: 'Claim your daily coin reward'
            }
        });
    }

    async execute(context) {
        if (!global.bot.bankManager.canClaimDaily(context.user.id)) {
            const userData = BankManager.getUserData(context.user.id);
            const lastDaily = new Date(userData.lastDaily);
            const now = new Date();
            const timeLeft = 24 * 60 * 60 * 1000 - (now - lastDaily);
            const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            const waitMessage = `⏰ You've already claimed your daily reward! Come back in ${hoursLeft}h ${minutesLeft}m`;
            await context.reply(waitMessage);
            return;
        }

        const result = global.bot.bankManager.claimDaily(context.user.id);
        
        if (context.isDiscord) {
            const embed = {
                color: 0x00ff00,
                title: '🎁 Daily Reward Claimed!',
                fields: [
                    {
                        name: '💰 Coins Earned',
                        value: `+${result.amount} coins`,
                        inline: true
                    },
                    {
                        name: '🔥 Current Streak',
                        value: `${result.streak} days`,
                        inline: true
                    },
                    {
                        name: '💡 Tip',
                        value: 'Keep your streak going for bonus coins!',
                        inline: false
                    }
                ],
                footer: {
                    text: 'Come back tomorrow for more coins!'
                }
            };

            await context.reply({ embeds: [embed] });
        } else {
            const message = [
                '🎁 <b>Daily Reward Claimed!</b>',
                '',
                `💰 <b>Coins Earned:</b> +${result.amount} coins`,
                `🔥 <b>Current Streak:</b> ${result.streak} days`,
                '',
                '💡 <b>Tip:</b> Keep your streak going for bonus coins!',
                '',
                '<i>Come back tomorrow for more coins!</i>'
            ].join('\n');

            await context.reply(message);
        }
    }
}

module.exports = new DailyCommand();
