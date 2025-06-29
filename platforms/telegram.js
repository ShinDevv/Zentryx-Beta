const TelegramBotAPI = require('node-telegram-bot-api');
const Logger = require('../utils/logger');
const PlatformAdapter = require('../utils/platformAdapter');

class TelegramBot {
    constructor(mainBot) {
        this.mainBot = mainBot;
        this.initBot();
    }

    async initBot() {
        try {
            this.bot = new TelegramBotAPI(this.mainBot.config.telegram.token, { polling: false });

            try {
                await this.bot.deleteWebHook();
                Logger.info('Telegram: Webhook deleted successfully');
            } catch (webhookError) {
                Logger.info('Telegram: No webhook to delete or error deleting webhook');
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            this.bot = new TelegramBotAPI(this.mainBot.config.telegram.token, { 
                polling: {
                    interval: 1000,
                    autoStart: false
                }
            });

            global.telegramBot = this.bot;

            this.setupEvents();

            await this.startPolling();

        } catch (error) {
            Logger.error('Telegram: Failed to initialize bot:', error);
            setTimeout(() => this.initBot(), 5000);
        }
    }

    async startPolling() {
        try {
            await this.bot.startPolling();
            Logger.info('Telegram: Bot started and listening for messages');
        } catch (error) {
            if (error.code === 'ETELEGRAM' && error.response && error.response.body) {
                const errorBody = error.response.body;
                if (errorBody.error_code === 409) {
                    Logger.error('Telegram: Another bot instance is running. Retrying in 10 seconds...');
                    setTimeout(() => this.startPolling(), 10000);
                    return;
                }
            }
            Logger.error('Telegram: Error starting polling:', error);
            setTimeout(() => this.startPolling(), 5000);
        }
    }

    setupEvents() {
        this.bot.on('message', async (msg) => {
            if (!msg.text || msg.text.charAt(0) !== '/') return;

            const args = msg.text.split(' ');
            const commandName = args[0].substring(1).toLowerCase();
            const commandArgs = args.slice(1);

            await this.executeCommand(commandName, msg, commandArgs);
        });

        this.bot.on('polling_error', (error) => {
            if (error.code === 'ETELEGRAM' && error.response && error.response.body) {
                const errorBody = error.response.body;
                if (errorBody.error_code === 409) {
                    Logger.error('Telegram: Polling conflict detected. Another instance is running.');
                    return;
                }
            }
            Logger.error('Telegram polling error:', error);
        });

        this.bot.on('error', (error) => {
            Logger.error('Telegram bot error:', error);
        });
    }

    async executeCommand(commandName, msg, args) {
        const command = this.mainBot.commands.get(commandName) || 
                      this.mainBot.commands.get(this.getCommandByAlias(commandName));

        if (!command) return;

        const userId = msg.from.id.toString();
        const RateLimiter = require('../utils/rateLimiter');

        if (!RateLimiter.checkLimit(userId) || !RateLimiter.checkLimit('global', true)) {
            const remainingTime = RateLimiter.getRemainingTime(userId);
            await this.bot.sendMessage(msg.chat.id, 
                `⏰ Rate limit exceeded! Please wait ${remainingTime} seconds before using another command.`);
            return;
        }

        try {
            const context = PlatformAdapter.createContext('telegram', msg, args);

            if (this.mainBot.bannedUsers && this.mainBot.bannedUsers.has(context.user.id)) {
                await context.reply('🚫 **You are banned from using this bot.**');
                return;
            }

            const startTime = Date.now();

            try {
                await command.execute(context);
                const responseTime = Date.now() - startTime;
                this.mainBot.recordCommandExecution(responseTime);
            } catch (error) {
                await command.handleError(context, error);
            }
        } catch (error) {
            console.error('Error in telegram platform:', error);
        }
    }

    getCommandByAlias(alias) {
        for (const [name, command] of this.mainBot.commands) {
            if (command.aliases && command.aliases.includes(alias)) {
                return name;
            }
        }
        return null;
    }
}

module.exports = TelegramBot;