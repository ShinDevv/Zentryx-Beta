const CommandBase = require('../utils/commandBase');

class RPSCommand extends CommandBase {
    constructor() {
        super({
            name: 'rps',
            description: 'Play Rock Paper Scissors with the bot',
            category: 'Games',
            usage: 'rps <rock|paper|scissors>',
            cooldown: 3,
            slashCommand: {
                name: 'rps',
                description: 'Play Rock Paper Scissors with the bot',
                options: [
                    {
                        name: 'choice',
                        description: 'Your choice: rock, paper, or scissors',
                        type: 3,
                        required: true,
                        choices: [
                            { name: 'Rock', value: 'rock' },
                            { name: 'Paper', value: 'paper' },
                            { name: 'Scissors', value: 'scissors' }
                        ]
                    }
                ]
            }
        });
    }

    async execute(context) {
        const userChoice = context.args[0]?.toLowerCase();
        const validChoices = ['rock', 'paper', 'scissors'];

        if (!userChoice || !validChoices.includes(userChoice)) {
            const usage = context.isDiscord ? '!rps <rock|paper|scissors>' : '/rps <rock|paper|scissors>';
            await context.reply(`❌ Please choose rock, paper, or scissors. Usage: \`${usage}\``);
            return;
        }

        const botChoice = validChoices[Math.floor(Math.random() * validChoices.length)];
        const result = this.determineWinner(userChoice, botChoice);

        // Reward coins based on result
        let coinsEarned = 0;
        if (result === 'win') {
            coinsEarned = 15;
            global.bot.bankManager.addCoins(context.user.id, coinsEarned, 'RPS win');
        } else if (result === 'tie') {
            coinsEarned = 5;
            global.bot.bankManager.addCoins(context.user.id, coinsEarned, 'RPS tie');
        }

        global.bot.bankManager.recordGameResult(context.user.id, result === 'win', coinsEarned);
        const newBalance = global.bot.bankManager.getBalance(context.user.id);

        const emojis = {
            rock: '🪨',
            paper: '📄',
            scissors: '✂️'
        };

        const resultEmojis = {
            win: '🎉',
            lose: '😔',
            tie: '🤝'
        };

        if (context.isDiscord) {
            const embed = {
                color: result === 'win' ? 0x00ff00 : result === 'lose' ? 0xff0000 : 0xffff00,
                title: `${resultEmojis[result]} Rock Paper Scissors!`,
                fields: [
                    {
                        name: '👤 Your Choice',
                        value: `${emojis[userChoice]} ${userChoice.charAt(0).toUpperCase() + userChoice.slice(1)}`,
                        inline: true
                    },
                    {
                        name: '🤖 Bot Choice',
                        value: `${emojis[botChoice]} ${botChoice.charAt(0).toUpperCase() + botChoice.slice(1)}`,
                        inline: true
                    },
                    {
                        name: '🏆 Result',
                        value: this.getResultMessage(result),
                        inline: false
                    },
                    {
                        name: '💰 Coins Earned',
                        value: coinsEarned > 0 ? `+${coinsEarned} coins` : 'No coins earned',
                        inline: true
                    },
                    {
                        name: '💳 Balance',
                        value: `${newBalance} coins`,
                        inline: true
                    }
                ],
                footer: {
                    text: `Played by ${context.user.displayName}`
                }
            };

            await context.reply({ embeds: [embed] });
        } else {
            const message = [
                `${resultEmojis[result]} <b>Rock Paper Scissors!</b>`,
                '',
                `👤 <b>Your Choice:</b> ${emojis[userChoice]} ${userChoice.charAt(0).toUpperCase() + userChoice.slice(1)}`,
                `🤖 <b>Bot Choice:</b> ${emojis[botChoice]} ${botChoice.charAt(0).toUpperCase() + botChoice.slice(1)}`,
                '',
                `🏆 <b>Result:</b> ${this.getResultMessage(result)}`,
                `💰 <b>Coins Earned:</b> ${coinsEarned > 0 ? `+${coinsEarned}` : 'No coins earned'}`,
                `💳 <b>Balance:</b> ${newBalance} coins`,
                '',
                `<i>Played by ${context.user.displayName}</i>`
            ].join('\n');

            await context.reply(message);
        }
    }

    determineWinner(userChoice, botChoice) {
        if (userChoice === botChoice) return 'tie';

        const winConditions = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };

        return winConditions[userChoice] === botChoice ? 'win' : 'lose';
    }

    getResultMessage(result) {
        switch (result) {
            case 'win': return 'You win! 🎉 (+15 coins)';
            case 'lose': return 'You lose! Better luck next time! 😔';
            case 'tie': return "It's a tie! Great minds think alike! 🤝 (+5 coins)";
            default: return 'Unknown result';
        }
    }
}

module.exports = new RPSCommand();