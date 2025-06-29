const CommandBase = require('../utils/commandBase');
const BankManager = require('../utils/bankManager');

class DiceCommand extends CommandBase {
    constructor() {
        super({
            name: 'dice',
            description: 'Roll dice and bet on the outcome',
            category: 'Games',
            usage: 'dice <bet_amount> [target_number]',
            slashCommand: {
                name: 'dice',
                description: 'Roll dice and bet on the outcome',
                options: [
                    {
                        name: 'bet',
                        description: 'Amount of coins to bet',
                        type: 4,
                        required: true
                    },
                    {
                        name: 'target',
                        description: 'Target number (1-6) for higher payout',
                        type: 4,
                        required: false
                    }
                ]
            }
        });
    }

    async execute(context) {
        const betAmount = parseInt(context.args[0]);
        const target = parseInt(context.args[1]);

        if (!betAmount || betAmount <= 0) {
            await context.reply('❌ Please enter a valid bet amount!');
            return;
        }

        if (target && (target < 1 || target > 6)) {
            await context.reply('❌ Target number must be between 1 and 6!');
            return;
        }

        const userBalance = global.bot.bankManager.getBalance(context.user.id);

        if (betAmount > userBalance) {
            await context.reply(`❌ You don't have enough coins! Your balance: ${userBalance} coins`);
            return;
        }

        if (betAmount < 5) {
            await context.reply('❌ Minimum bet is 5 coins!');
            return;
        }

        // Remove bet from balance
        if (!global.bot.bankManager.removeCoins(context.user.id, betAmount)) {
           
        }

        const roll = Math.floor(Math.random() * 6) + 1;
        let winnings = 0;
        let won = false;

        if (target) {
            // Specific number bet - 6x payout
            if (roll === target) {
                winnings = betAmount * 6;
                won = true;
            }
        } else {
            // High/low bet - 2x payout for 4, 5, 6
            if (roll >= 4) {
                winnings = betAmount * 2;
                won = true;
            }
        }

        if (won) {
            global.bot.bankManager.addCoins(context.user.id, winnings, 'Dice win');
        }

        global.bot.bankManager.recordGameResult(context.user.id, won, won ? winnings - betAmount : 0);
        const newBalance = global.bot.bankManager.getBalance(context.user.id);

        const diceEmoji = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][roll - 1];
        const outcomeEmoji = won ? '🎉' : '😞';

        if (context.isDiscord) {
            const embed = {
                color: won ? 0x00ff00 : 0xff0000,
                title: `${outcomeEmoji} Dice Roll Result`,
                fields: [
                    {
                        name: '🎲 Roll',
                        value: `${diceEmoji} ${roll}`,
                        inline: true
                    },
                    {
                        name: '🎯 Bet Type',
                        value: target ? `Number ${target}` : 'High (4-6)',
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
                    text: target ? 'Specific number bets pay 6x!' : 'High bets (4-6) pay 2x!'
                }
            };

            await context.reply({ embeds: [embed] });
        } else {
            const message = [
                `${outcomeEmoji} <b>Dice Roll Result</b>`,
                '',
                `🎲 <b>Roll:</b> ${diceEmoji} ${roll}`,
                `🎯 <b>Bet Type:</b> ${target ? `Number ${target}` : 'High (4-6)'}`,
                `💰 <b>Outcome:</b> ${won ? `+${winnings}` : `-${betAmount}`} coins`,
                `💳 <b>New Balance:</b> ${newBalance} coins`,
                '',
                `<i>${target ? 'Specific number bets pay 6x!' : 'High bets (4-6) pay 2x!'}</i>`
            ].join('\n');

            await context.reply(message);
        }
    }
}

module.exports = new DiceCommand();