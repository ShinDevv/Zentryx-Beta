
const CommandBase = require('../utils/commandBase');
const Formatter = require('../utils/formatter');

class PingCommand extends CommandBase {
    constructor() {
        super({
            name: 'ping',
            description: 'Check bot latency and status',
            category: 'Utility',
            usage: 'ping',
            cooldown: 3
        });
    }

    async execute(context) {
        const startTime = Date.now();

        const platformInfo = context.isDiscord ? 
            `Discord (${global.discordClient?.ws?.ping || 0}ms)` : 
            'Telegram';

        const latency = Date.now() - startTime;

        const response = `🏓 ${Formatter.bold('Pong!', context.platform)}\n` +
                        `📡 Platform: ${platformInfo}\n` +
                        `⏱️ Response Time: ${latency}ms\n` +
                        `🤖 Status: ${Formatter.code('Online', context.platform)}`;

        await context.reply(response);
    }
}

module.exports = new PingCommand();
