const express = require('express');
const path = require('path');

class Logger {
    static info(message) {
        console.log(`\x1b[34m[INFO]\x1b[0m ${message}`);
    }

    static warn(message) {
        console.log(`\x1b[33m[WARN]\x1b[0m ${message}`);
    }

    static error(message) {
        console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`);
    }

    static success(message) {
        console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`);
    }

    static web(message) {
        console.log(`\x1b[36m[WEB]\x1b[0m ${message}`);
    }
}

const emojiToKeyword = {
    '🌐': '[WEB]',
};

function replaceEmojis(message) {
    let replacedMessage = message;
    for (const emoji in emojiToKeyword) {
        if (emojiToKeyword.hasOwnProperty(emoji)) {
            replacedMessage = replacedMessage.replace(new RegExp(emoji, 'g'), emojiToKeyword[emoji]);
        }
    }
    return replacedMessage;
}

class WebDashboard {
    constructor(mainBot) {
        this.mainBot = mainBot;
        this.app = express();
        this.port = this.mainBot.config.web.port;

        this.setupRoutes();
        this.start();
    }

    setupRoutes() {
        this.app.use(express.static(path.join(__dirname, 'public')));

        this.app.get('/api/stats', (req, res) => {
            try {
                const stats = this.mainBot.getStats();
                const performanceData = {
                    ...stats,
                    memoryUsage: process.memoryUsage(),
                    cpuUsage: process.cpuUsage(),
                    nodeVersion: process.version,
                    platform: process.platform,
                    platforms: {
                        discord: this.mainBot.config.discord.enabled,
                        telegram: this.mainBot.config.telegram.enabled,
                        facebook: this.mainBot.config.facebook?.status === 'coming_soon' ? 'coming_soon' : false
                    },
                    uptimeFormatted: this.formatUptime(stats.uptime || 0)
                };
                res.json(performanceData);
            } catch (error) {
                Logger.error('Error in /api/stats:', error.message);
                res.status(500).json({ 
                    error: 'Internal server error',
                    uptime: 0,
                    commandsExecuted: 0,
                    platforms: {
                        discord: false,
                        telegram: false,
                        facebook: 'coming_soon'
                    }
                });
            }
        });

        this.app.get('/api/ping', (req, res) => {
            const start = Date.now();
            res.json({
                ping: Date.now() - start,
                timestamp: new Date().toISOString()
            });
        });

        this.app.get('/api/logs', (req, res) => {
            try {
                const logs = this.mainBot.getLogs ? this.mainBot.getLogs() : [];
                res.json({ logs });
            } catch (error) {
                Logger.error('Error in /api/logs:', error.message);
                res.status(500).json({ 
                    logs: [`Error loading logs: ${error.message}`]
                });
            }
        });

        this.app.get('/api/readme', (req, res) => {
            try {
                const fs = require('fs');
                const path = require('path');
                const readmePath = path.join(__dirname, '../../README.md');
                const readmeContent = fs.readFileSync(readmePath, 'utf8');
                res.json({ content: readmeContent });
            } catch (error) {
                res.status(500).json({ error: 'Could not read README.md' });
            }
        });

        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });
    }

    formatUptime(uptime) {
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    start() {
        this.server = this.app.listen(this.mainBot.config.web.port, '0.0.0.0', () => {
            Logger.web(`Dashboard running at http://0.0.0.0:${this.mainBot.config.web.port}`);
        });
    }
}

module.exports = WebDashboard;