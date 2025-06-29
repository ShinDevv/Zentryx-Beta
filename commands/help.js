const CommandBase = require('../utils/commandBase');
const Formatter = require('../utils/formatter');

class HelpCommand extends CommandBase {
    constructor() {
        super({
            name: 'help',
            description: 'Display all available commands and their usage',
            category: 'Utility',
            usage: 'help [command]',
            cooldown: 3,
            slashCommand: {
                name: 'help',
                description: 'Display all available commands and their usage',
                options: [
                    {
                        name: 'command',
                        description: 'Get detailed information about a specific command',
                        type: 3,
                        required: false
                    }
                ]
            }
        });
    }

    async execute(context) {
        const commandName = context.args[0];

        if (commandName) {
            await this.showCommandHelp(context, commandName);
        } else {
            await this.showAllCommands(context);
        }
    }

    async showCommandHelp(context, commandName) {
        const command = global.bot?.commands?.get(commandName.toLowerCase());

        if (!command) {
            await context.reply(`❌ Command "${commandName}" not found. Use \`help\` to see all available commands.`);
            return;
        }

        const platformPrefix = context.isDiscord ? '!' : '/';

        if (context.isDiscord) {
            const embed = {
                color: 0x667eea,
                title: `📖 Command: ${command.name}`,
                fields: [
                    {
                        name: '📝 Description',
                        value: command.description,
                        inline: false
                    },
                    {
                        name: '📋 Usage',
                        value: `\`${platformPrefix}${command.usage}\``,
                        inline: true
                    },
                    {
                        name: '📂 Category',
                        value: command.category,
                        inline: true
                    },
                    {
                        name: '⏱️ Cooldown',
                        value: `${command.cooldown} seconds`,
                        inline: true
                    }
                ]
            };

            if (command.aliases && command.aliases.length > 0) {
                embed.fields.push({
                    name: '🔄 Aliases',
                    value: command.aliases.map(alias => `\`${alias}\``).join(', '),
                    inline: false
                });
            }

            await context.reply({ embeds: [embed] });
        } else {
            const message = [
                `📖 <b>Command: ${command.name}</b>`,
                '',
                `📝 <b>Description:</b> ${command.description}`,
                `📋 <b>Usage:</b> <code>${platformPrefix}${command.usage}</code>`,
                `📂 <b>Category:</b> ${command.category}`,
                `⏱️ <b>Cooldown:</b> ${command.cooldown} seconds`
            ];

            if (command.aliases && command.aliases.length > 0) {
                message.push(`🔄 <b>Aliases:</b> ${command.aliases.map(alias => `<code>${alias}</code>`).join(', ')}`);
            }

            await context.reply(message.join('\n'));
        }
    }

    async showAllCommands(context) {
        const commands = global.bot?.commands;
        if (!commands) {
            await context.reply('❌ Commands are still loading. Please try again in a moment.');
            return;
        }

        const categories = {};

        for (const [name, command] of commands) {
            const category = command.category || 'General';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(command);
        }

        const platformPrefix = context.isDiscord ? '!' : '/';
        const platformEmoji = context.isDiscord ? '🟦' : '🟢';

        if (context.isDiscord) {
            const gameCommands = Array.from(global.bot.commands.values())
                .filter(cmd => cmd.category === 'Games')
                .map(cmd => `\`${platformPrefix}${cmd.name}\` - ${cmd.description}`)
                .join('\n') || 'No game commands available';

            const economyCommands = Array.from(global.bot.commands.values())
                .filter(cmd => cmd.category === 'Economy')
                .map(cmd => `\`${platformPrefix}${cmd.name}\` - ${cmd.description}`)
                .join('\n') || 'No economy commands available';
            const embed = {
                color: 0x667eea,
                title: `${platformEmoji} Available Commands`,
                description: `Use \`${platformPrefix}help [command]\` for detailed information about a specific command.`,
                fields: []
            };

            for (const [categoryName, categoryCommands] of Object.entries(categories)) {
                const commandList = categoryCommands
                    .map(cmd => `\`${platformPrefix}${cmd.name}\` - ${cmd.description}`)
                    .join('\n');

                embed.fields.push({
                    name: `📂 ${categoryName}`,
                    value: commandList,
                    inline: false
                });
            }

            embed.fields.push(
                    {
                        name: '🎮 Games',
                        value: gameCommands,
                        inline: false
                    },
                    {
                        name: '💰 Economy',
                        value: economyCommands,
                        inline: false
                    }
                );

            embed.footer = {
                text: `Total Commands: ${commands.size} | Platform: Discord`
            };

            await context.reply({ embeds: [embed] });
        } else {
            const gameCommands = Array.from(global.bot.commands.values())
                .filter(cmd => cmd.category === 'Games')
                .map(cmd => `\`${platformPrefix}${cmd.name}\` - ${cmd.description}`)
                .join('\n') || 'No game commands available';

            const economyCommands = Array.from(global.bot.commands.values())
                .filter(cmd => cmd.category === 'Economy')
                .map(cmd => `\`${platformPrefix}${cmd.name}\` - ${cmd.description}`)
                .join('\n') || 'No economy commands available';
            const message = [`${platformEmoji} <b>Available Commands</b>`, ''];

            for (const [categoryName, categoryCommands] of Object.entries(categories)) {
                message.push(`📂 <b>${categoryName}</b>`);

                for (const cmd of categoryCommands) {
                    message.push(`• <code>${platformPrefix}${cmd.name}</code> - ${cmd.description}`);
                }
                message.push('');
            }

            message.push(
                `🎮 <b>Games</b>`,
                gameCommands,
                '',
                `💰 <b>Economy</b>`,
                economyCommands,
            );

            message.push(`Use <code>${platformPrefix}help [command]</code> for detailed information.`);
            message.push(`<i>Total Commands: ${commands.size} | Platform: Telegram</i>`);

            await context.reply(message.join('\n'));
        }
    }
}

module.exports = new HelpCommand();