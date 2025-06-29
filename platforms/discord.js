const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const Logger = require('../utils/logger');
const PlatformAdapter = require('../utils/platformAdapter');

class DiscordBot {
    constructor(mainBot) {
        this.mainBot = mainBot;
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.DirectMessages
            ]
        });

        global.discordClient = this.client;

        this.setupEvents();
        this.login();
    }

    async setupEvents() {
        this.client.once('ready', async () => {
            Logger.info(`Discord: Bot logged in as ${this.client.user.tag}`);
            this.mainBot.stats.discordGuilds = this.client.guilds.cache.size;

            await this.registerSlashCommands();
        });

        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;

            const prefix = this.mainBot.config.discord.prefix || '!';
            if (!message.content.startsWith(prefix)) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            if (commandName === '') return;

            if (this.mainBot.isUserBanned(message.author.id)) {
                return;
            }

            try {
                await this.executeCommand(commandName, message, args);
            } catch (error) {
                Logger.error(`Error handling Discord message command ${commandName}:`, error);
            }
        });

        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const commandName = interaction.commandName;
            const args = [];

            if (interaction.options.data.length > 0) {
                interaction.options.data.forEach(option => {
                    args.push(option.value);
                });
            }

            if (this.mainBot.isUserBanned(interaction.user.id)) {
                return;
            }

            try {
                await this.executeCommand(commandName, interaction, args);
            } catch (error) {
                Logger.error(`Error handling Discord slash command ${commandName}:`, error);
            }
        });

        this.client.on('error', (error) => {
            Logger.error('Discord client error:', error);
        });
    }

    async registerSlashCommands() {
        const commands = [];

        for (const [name, command] of this.mainBot.commands) {
            commands.push({
                name: command.name,
                description: command.description || 'No description provided',
                options: this.getSlashCommandOptions(command)
            });
        }

        try {
            const rest = new REST({ version: '10' }).setToken(this.mainBot.config.discord.token);

            Logger.info('Discord: Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationCommands(this.mainBot.config.discord.clientId),
                { body: commands }
            );

            Logger.info('Discord: Successfully reloaded application (/) commands.');
        } catch (error) {
            Logger.error('Discord: Error registering slash commands:', error);
        }
    }

    getSlashCommandOptions(command) {
        const options = [];

        if (command.name === 'gpt') {
            options.push({
                name: 'question',
                description: 'Question to ask GPT',
                type: 3,
                required: true
            });
        } else if (command.name === 'rps') {
            options.push({
                name: 'choice',
                description: 'Your choice: rock, paper, or scissors',
                type: 3,
                required: true,
                choices: [
                    { name: 'Rock', value: 'rock' },
                    { name: 'Paper', value: 'paper' },
                    { name: 'Scissors', value: 'scissors' }
                ]
            });
        } else if (command.name === 'ban') {
            options.push({
                name: 'user_id',
                description: 'User ID to ban',
                type: 3,
                required: true
            });
            options.push({
                name: 'reason',
                description: 'Reason for ban',
                type: 3,
                required: false
            });
        } else if (command.name === 'unban') {
            options.push({
                name: 'user_id',
                description: 'User ID to unban',
                type: 3,
                required: true
            });
        }

        return options;
    }

    getCommandByAlias(alias) {
        for (const [name, command] of this.mainBot.commands) {
            if (command.aliases && command.aliases.includes(alias)) {
                return name;
            }
        }
        return null;
    }

    async executeCommand(commandName, messageOrInteraction, args) {
        const command = this.mainBot.commands.get(commandName) || 
                      this.mainBot.commands.get(this.getCommandByAlias(commandName));

        if (!command) return;

        const userId = messageOrInteraction.user?.id || messageOrInteraction.author?.id;
        const RateLimiter = require('../utils/rateLimiter');

        if (!RateLimiter.checkLimit(userId) || !RateLimiter.checkLimit('global', true)) {
            const remainingTime = RateLimiter.getRemainingTime(userId);
            const rateLimitMsg = `⏰ Rate limit exceeded! Please wait ${remainingTime} seconds before using another command.`;

            if (messageOrInteraction.reply) {
                await messageOrInteraction.reply({ content: rateLimitMsg, ephemeral: true });
            } else {
                await messageOrInteraction.channel.send(rateLimitMsg);
            }
            return;
        }

        const startTime = Date.now();

        try {
            const context = PlatformAdapter.createContext('discord', messageOrInteraction, args);

            if (this.mainBot.bannedUsers && this.mainBot.bannedUsers.has(context.user.id)) {
                await context.reply('🚫 **You are banned from using this bot.**');
                return;
            }

            await command.execute(context);
            const responseTime = Date.now() - startTime;
            this.mainBot.stats.commandsExecuted++;
            this.mainBot.recordCommandExecution(responseTime);

            if (this.mainBot.config.features.logging) {
                Logger.log(`Discord: ${context.user.displayName || context.user.username || 'Unknown User'} used ${commandName}`);
            }
        } catch (error) {
            Logger.error(`Error executing Discord command ${commandName}:`, error);
            try {
                const context = PlatformAdapter.createContext('discord', messageOrInteraction, args);
                await context.reply('❌ An error occurred while executing this command.');
            } catch (replyError) {
                Logger.error('Error sending error message:', replyError);
            }
        }
    }

    async login() {
        try {
            await this.client.login(this.mainBot.config.discord.token);
        } catch (error) {
            Logger.error('Discord: Failed to login:', error);
        }
    }
}

module.exports = DiscordBot;