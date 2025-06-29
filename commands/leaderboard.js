
const CommandBase = require('../utils/commandBase');

class LeaderboardCommand extends CommandBase {
    constructor() {
        super({
            name: 'leaderboard',
            description: 'View the richest users',
            category: 'Economy',
            aliases: ['lb', 'top'],
            slashCommand: {
                name: 'leaderboard',
                description: 'View the richest users'
            }
        });
    }

    async execute(context) {
        const leaderboard = global.bot.bankManager.getLeaderboard(10);
        
        if (leaderboard.length === 0) {
            await context.reply('📊 No users found in the leaderboard yet!');
            return;
        }

        if (context.isDiscord) {
            const embed = {
                color: 0xffd700,
                title: '🏆 Coin Leaderboard',
                description: leaderboard.map(user => 
                    `${this.getRankEmoji(user.rank)} **#${user.rank}** - ${user.balance} coins (${user.gamesWon}W/${user.gamesPlayed}P)`
                ).join('\n'),
                footer: {
                    text: 'Play games to earn coins and climb the leaderboard!'
                }
            };

            await context.reply({ embeds: [embed] });
        } else {
            const message = [
                '🏆 <b>Coin Leaderboard</b>',
                '',
                ...leaderboard.map(user => 
                    `${this.getRankEmoji(user.rank)} <b>#${user.rank}</b> - ${user.balance} coins (${user.gamesWon}W/${user.gamesPlayed}P)`
                ),
                '',
                '<i>Play games to earn coins and climb the leaderboard!</i>'
            ].join('\n');

            await context.reply(message);
        }
    }

    getRankEmoji(rank) {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '🏅';
        }
    }
}

module.exports = new LeaderboardCommand();
