const express = require('express');
const path = require('path');
const fs = require('fs');
const config = require('./config.json');
const DiscordBot = require('./platforms/discord');
const TelegramBot = require('./platforms/telegram');
const WebDashboard = require('./utils/web/dashboard');
const Logger = require('./utils/logger');
const AdminManager = require('./utils/adminManager');
const BankManager = require('./utils/bankManager');
const Cache = require('./utils/cache');
const RateLimiter = require('./utils/rateLimiter');

// Global console logs storage
global.consoleLogs = [];
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Override console.log to capture logs
console.log = function(...args) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${args.join(' ')}`;
    global.consoleLogs.push(logMessage);

    if (global.consoleLogs.length > 1000) {
        global.consoleLogs = global.consoleLogs.slice(-1000);
    }

    originalConsoleLog.apply(console, args);
};

// Override console.error to capture errors
console.error = function(...args) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ERROR: ${args.join(' ')}`;
    global.consoleLogs.push(logMessage);

    if (global.consoleLogs.length > 1000) {
        global.consoleLogs = global.consoleLogs.slice(-1000);
    }

    originalConsoleError.apply(console, args);
};

class CrossPlatformBot {
    constructor() {
        this.config = config;
        this.displayBanner();
        this.commands = new Map();
        this.stats = {
            startTime: Date.now(),
            commandsExecuted: 0,
            discordGuilds: 0,
            telegramChats: 0
        };

        this.adminManager = new AdminManager(this.config);
        this.bannedUsers = new Set();
        this.loadBannedUsers();
        global.bot = this;

        // Performance monitoring
        this.performanceMetrics = {
            commandsPerMinute: 0,
            averageResponseTime: 0,
            lastMinuteCommands: []
        };

        // Start performance monitoring and cache cleanup
        this.startPerformanceMonitoring();
        this.initialize();
    }

    async initialize() {
        this.loadCommands();
        this.initializePlatforms();
        this.startWebDashboard();
    }

    displayBanner() {
        console.log('\n');

        // Custom ASCII art banner with gradient effect
        const bannerLine1 = '▀█ █▀▀ █▄░█ ▀█▀ █▀█ █▄█ ▀▄▀ ▄▄ █░█ ▄█';
        const bannerLine2 = '█▄ ██▄ █░▀█ ░█░ █▀▄ ░█░ █░█ ░░ ▀▄▀ ░█';

        // Apply gradient effect - cyan to magenta
        console.log('\x1b[96m\x1b[1m' + bannerLine1 + '\x1b[0m');
        console.log('\x1b[95m\x1b[1m' + bannerLine2 + '\x1b[0m');

        console.log();

        // Clean banner with === separators
        console.log('\x1b[36m\x1b[1m======= CrossPlatform ChatBot =======\x1b[0m');
        console.log('\x1b[33mDeveloper:\x1b[0m \x1b[37mShinDevv\x1b[0m');
        console.log('\x1b[33mVersion:\x1b[0m \x1b[37m' + this.config.bot.version + '\x1b[0m');
        console.log('\x1b[33mPlatforms:\x1b[0m \x1b[35mDiscord\x1b[0m + \x1b[36mTelegram\x1b[0m + \x1b[90mFacebook (Coming Soon)\x1b[0m');
        console.log();
        console.log('\x1b[34m=== DEVELOPER ===\x1b[0m');
        console.log('\x1b[33mGitHub:\x1b[0m \x1b[34mgithub.com/ShinDevv\x1b[0m');
        console.log('\x1b[33mFacebook:\x1b[0m \x1b[34mhttps://www.fb.com/rai.senpaix\x1b[0m');
        console.log();
        console.log('\x1b[32mSTARTING ZENTRYX BOT...\x1b[0m\n');
    }

    loadCommands() {
        Logger.header('COMMANDS');

        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            this.commands.set(command.name, command);
            Logger.command(`Loaded command: ${command.name}`);
        }

        Logger.system(`Total commands loaded: ${this.commands.size}`);
        console.log();
    }

    initializePlatforms() {
        Logger.header('PLATFORMS');

        if (this.config.discord.enabled) {
            this.discordBot = new DiscordBot(this);
            Logger.startup('Discord bot initialized');
        }

        if (this.config.telegram.enabled) {
            this.telegramBot = new TelegramBot(this);
            Logger.startup('Telegram bot initialized');
        }

        Logger.info('Facebook Messenger integration: Coming Soon!');

        console.log();
    }

    startWebDashboard() {
        Logger.header('WEB DASHBOARD');

        if (this.config.web.enabled) {
            this.webDashboard = new WebDashboard(this);
            Logger.startup(`Web dashboard started on port ${this.config.web.port}`);
            Logger.web(`Dashboard running at http://0.0.0.0:${this.config.web.port}`);

            // Show system ready message after all components are loaded
            setTimeout(() => {
                Logger.ready();
            }, 2000);
        }
    }

    loadBannedUsers() {
        Logger.header('SYSTEM INITIALIZATION');

        try {
            if (fs.existsSync('./data/banned_users.json')) {
                const bannedData = JSON.parse(fs.readFileSync('./data/banned_users.json', 'utf8'));
                this.bannedUsers = new Set(Array.isArray(bannedData) ? bannedData : []);
                Logger.system(`Loaded ${this.bannedUsers.size} banned users`);
            } else {
                if (!fs.existsSync('./data')) {
                    fs.mkdirSync('./data');
                }
                this.saveBannedUsers();
                Logger.system('Created new banned users database');
            }

            this.bankManager = new BankManager();
            Logger.system('Bank system initialized');

            this.displayAdminInfo();

        } catch (error) {
            Logger.error('Error loading banned users:', error);
            this.bannedUsers = new Set();
        }

        console.log();
    }

    displayAdminInfo() {
        Logger.header('ADMIN CONFIGURATION');

        const discordAdmins = this.config.admins.discord || [];
        const telegramAdmins = this.config.admins.telegram || [];

        if (discordAdmins.length > 0) {
            Logger.system(`Discord Admins: ${discordAdmins.length} configured`);
            discordAdmins.forEach((adminId, index) => {
                Logger.info(`  ${index + 1}. ID: ${adminId}`);
            });
        } else {
            Logger.warning('No Discord admins configured');
        }

        if (telegramAdmins.length > 0) {
            Logger.system(`Telegram Admins: ${telegramAdmins.length} configured`);
            telegramAdmins.forEach((adminId, index) => {
                Logger.info(`  ${index + 1}. ID: ${adminId}`);
            });
        } else {
            Logger.warning('No Telegram admins configured');
        }

        Logger.system(`Total Admins: ${discordAdmins.length + telegramAdmins.length}`);
        console.log();
    }

    saveBannedUsers() {
        try {
            const bannedData = Array.from(this.bannedUsers);

            if (!fs.existsSync('./data')) {
                fs.mkdirSync('./data');
            }

            fs.writeFileSync('./data/banned_users.json', JSON.stringify(bannedData, null, 2));
        } catch (error) {
            Logger.error('Error saving banned users:', error);
        }
    }

    banUser(userId) {
        this.bannedUsers.add(String(userId));
        this.saveBannedUsers();
    }

    unbanUser(userId) {
        const wasRemoved = this.bannedUsers.delete(String(userId));
        if (wasRemoved) {
            this.saveBannedUsers();
        }
        return wasRemoved;
    }

    isUserBanned(userId) {
        return this.bannedUsers.has(String(userId));
    }

    startPerformanceMonitoring() {
        // Cache cleanup every 10 minutes
        setInterval(() => {
            Cache.cleanup();
            Logger.system(`Cache cleanup completed. Current cache size: ${Cache.size()}`);
        }, 600000);

        // Performance metrics update every minute
        setInterval(() => {
            const now = Date.now();
            const oneMinuteAgo = now - 60000;

            // Filter commands from last minute
            this.performanceMetrics.lastMinuteCommands = this.performanceMetrics.lastMinuteCommands
                .filter(timestamp => timestamp > oneMinuteAgo);

            this.performanceMetrics.commandsPerMinute = this.performanceMetrics.lastMinuteCommands.length;
        }, 60000);
    }

    recordCommandExecution(responseTime) {
        const now = Date.now();
        this.stats.commandsExecuted++;
        this.performanceMetrics.lastMinuteCommands.push(now);

        // Update average response time
        const totalCommands = this.stats.commandsExecuted;
        this.performanceMetrics.averageResponseTime = 
            ((this.performanceMetrics.averageResponseTime * (totalCommands - 1)) + responseTime) / totalCommands;
    }

    getStats() {
        return {
            ...this.stats,
            uptime: Date.now() - this.stats.startTime,
            commandCount: this.commands.size,
            cacheSize: Cache.size(),
            commandsPerMinute: this.performanceMetrics.commandsPerMinute,
            averageResponseTime: Math.round(this.performanceMetrics.averageResponseTime)
        };
    }

    getLogs() {
        return global.consoleLogs.slice();
    }
}

const bot = new CrossPlatformBot();

process.on('SIGINT', () => {
    Logger.system('\nShutting down bot...');
    process.exit(0);
});

module.exports = CrossPlatformBot;