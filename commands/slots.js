const CommandBase = require('../utils/commandBase');
const BankManager = require('../utils/bankManager');

class SlotsCommand extends CommandBase {
    constructor() {
        super({
            name: 'slots',
            description: 'Play the slot machine',
            category: 'Games',
            aliases: ['slot'],
            usage: 'slots <bet_amount>',
            slashCommand: {
                name: 'slots',
                description: 'Play the slot machine',
                options: [
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
        const betAmount = parseInt(context.args[0]);

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
        global.bot.bankManager.removeCoins(context.user.id, betAmount);

        const symbols = ['🍎', '🍌', '🍒', '🍇', '🍊', '🍓', '💎', '⭐'];
        const weights = [25, 25, 20, 15, 10, 3, 1.5, 0.5]; // Probability weights

        const getRandomSymbol = () => {
            const random = Math.random() * 100;
            let cumulative = 0;
            for (let i = 0; i < weights.length; i++) {
                cumulative += weights[i];
                if (random <= cumulative) {
                    return symbols[i];
                }
            }
            return symbols[0];
        };

        const slot1 = getRandomSymbol();
        const slot2 = getRandomSymbol();
        const slot3 = getRandomSymbol();

        let winnings = 0;
        let won = false;
        let message = '';

        // Check for wins
        if (slot1 === slot2 && slot2 === slot3) {
            // Three of a kind
            const multipliers = {
                '🍎': 3, '🍌': 3, '🍒': 4, '🍇': 5, 
                '🍊': 6, '🍓': 8, '💎': 15, '⭐': 25
            };
            winnings = betAmount * multipliers[slot1];
            won = true;
            message = `JACKPOT! Three ${slot1}!`;
        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            // Two of a kind
            winnings = Math.floor(betAmount * 1.5);
            won = true;
            message = 'Two of a kind!';
        } else {
            message = 'No match, try again!';
        }

        if (won) {
            global.bot.bankManager.addCoins(context.user.id, winnings, 'Slots win');
        }

        global.bot.bankManager.recordGameResult(context.user.id, won, won ? winnings - betAmount : 0);
        const newBalance = global.bot.bankManager.getBalance(context.user.id);

        const outcomeEmoji = won ? '🎉' : '😞';

        if (context.isDiscord) {
            const embed = {
                color: won ? 0x00ff00 : 0xff0000,
                title: `🎰 Slot Machine`,
                description: `┏━━━━━━━━━┓\n┃ ${slot1} ┃ ${slot2} ┃ ${slot3} ┃\n┗━━━━━━━━━┛`,
                fields: [
                    {
                        name: '🎯 Result',
                        value: `${outcomeEmoji} ${message}`,
                        inline: false
                    },
                    {
                        name: '💰 Outcome',
                        value: won ? `+${winnings} coins` : `-${betAmount} coins`,
                        inline: true
                    },
                    {
                        name: '💳 New Balance',
                        value: `${newBalance} coins`,
                        inline: true
                    }
                ],
                footer: {
                    text: 'Three ⭐ = 25x payout!'
                }
            };

            await context.reply({ embeds: [embed] });
        } else {
            const slotDisplay = [
                '🎰 <b>Slot Machine</b>',
                '',
                `┏━━━━━━━━━┓`,
                `┃ ${slot1} ┃ ${slot2} ┃ ${slot3} ┃`,
                `┗━━━━━━━━━┛`,
                '',
                `🎯 <b>Result:</b> ${outcomeEmoji} ${message}`,
                `💰 <b>Outcome:</b> ${won ? `+${winnings}` : `-${betAmount}`} coins`,
                `💳 <b>New Balance:</b> ${newBalance} coins`,
                '',
                '<i>Three ⭐ = 25x payout!</i>'
            ].join('\n');

            await context.reply(slotDisplay);
        }
    }
}

module.exports = new SlotsCommand();