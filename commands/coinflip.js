const CommandBase = require('../utils/commandBase');
const BankManager = require('../utils/bankManager');

class CoinflipCommand extends CommandBase {
    constructor() {
        super({
            name: 'coinflip',
            description: 'Flip a coin and bet your coins',
            category: 'Games',
            aliases: ['cf', 'flip'],
            usage: 'coinflip <heads/tails> <bet_amount>',
            slashCommand: {
                name: 'coinflip',
                description: 'Flip a coin and bet your coins',
                options: [
                    {
                        name: 'choice',
                        description: 'Choose heads or tails',
                        type: 3,
                        required: true,
                        choices: [
                            { name: 'Heads', value: 'heads' },
                            { name: 'Tails', value: 'tails' }
                        ]
                    },
                    {
                        name: 'bet',
                        description: 'Amount of coins to bet',
                        type: 4,
                        required: true
                    }
                ]
            }
        });
    }

    async execute(context) {
        const choice = context.args[0]?.toLowerCase();
        const betAmount = parseInt(context.args[1]);

        if (!choice || !['heads', 'tails'].includes(choice)) {
            await context.reply('❌ Please choose heads or tails!');
            return;
        }

        if (!betAmount || betAmount <= 0) {
            await context.reply('❌ Please enter a valid bet amount!');
            return;
        }

        const userBalance = global.bot.bankManager.getBalance(context.user.id);

        if (betAmount > userBalance) {
            await context.reply(`❌ You don't have enough coins! Your balance: ${userBalance} coins`);
            return;
        }

        if (betAmount < 10) {
            await context.reply('❌ Minimum bet is 10 coins!');
            return;
        }

        // Remove bet from balance
        if (!global.bot.bankManager.removeCoins(context.user.id, betAmount)) {
          return;
        }

        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const won = choice === result;
        const winnings = won ? betAmount * 2 : 0;

        if (won) {
            global.bot.bankManager.addCoins(context.user.id, winnings, 'Coinflip win');
        }

        global.bot.bankManager.recordGameResult(context.user.id, won, won ? betAmount : 0);
        const newBalance = global.bot.bankManager.getBalance(context.user.id);

        const resultEmoji = result === 'heads' ? '🪙' : '💰';
        const outcomeEmoji = won ? '🎉' : '😞';

        if (context.isDiscord) {
            const embed = {
                color: won ? 0x00ff00 : 0xff0000,
                title: `${outcomeEmoji} Coin Flip Result`,
                fields: [
                    {
                        name: '🎯 Your Choice',
                        value: choice.charAt(0).toUpperCase() + choice.slice(1),
                        inline: true
                    },
                    {
                        name: '🎲 Result',
                        value: `${resultEmoji} ${result.charAt(0).toUpperCase() + result.slice(1)}`,
                        inline: true
                    },
                    {
                        name: '💰 Outcome',
                        value: won ? `+${winnings} coins` : `-${betAmount} coins`,
                        inline: true
                    },
                    {
                        name: '💳 New Balance',
                        value: `${newBalance} coins`,
                        inline: false
                    }
                ],
                footer: {
                    text: `Played by ${context.user.displayName}`
                }
            };

            await context.reply({ embeds: [embed] });
        } else {
            const message = [
                `${outcomeEmoji} <b>Coin Flip Result</b>`,
                '',
                `🎯 <b>Your Choice:</b> ${choice.charAt(0).toUpperCase() + choice.slice(1)}`,
                `🎲 <b>Result:</b> ${resultEmoji} ${result.charAt(0).toUpperCase() + result.slice(1)}`,
                `💰 <b>Outcome:</b> ${won ? `+${winnings}` : `-${betAmount}`} coins`,
                `💳 <b>New Balance:</b> ${newBalance} coins`,
                '',
                `<i>Played by ${context.user.displayName}</i>`
            ].join('\n');

            await context.reply(message);
        }
    }
}

module.exports = new CoinflipCommand();