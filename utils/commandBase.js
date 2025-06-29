

const Formatter = require('./formatter');

class CommandBase {
    constructor(config) {
        this.name = config.name;
        this.description = config.description;
        this.aliases = config.aliases || [];
        this.usage = config.usage || `${config.name}`;
        this.category = config.category || 'General';
        this.cooldown = config.cooldown || 3;
        this.permissions = config.permissions || [];
        
        this.slashCommand = config.slashCommand || {
            name: this.name,
            description: this.description || 'No description provided',
            options: config.options || []
        };
    }

    async execute(context) {
        throw new Error('Execute method must be implemented by command');
    }

    format(text, style, context) {
        return Formatter.format(text, style, context.platform);
    }

    bold(text, context) {
        return Formatter.bold(text, context.platform);
    }

    italic(text, context) {
        return Formatter.italic(text, context.platform);
    }

    code(text, context) {
        return Formatter.code(text, context.platform);
    }

    createEmbed(title, description, fields, context) {
        return Formatter.createEmbed(title, description, fields, 0x667eea, context.platform);
    }

    createList(items, context, ordered = false) {
        return Formatter.createList(items, context.platform, ordered);
    }

    async handleError(context, error) {
        console.error(`Error in command ${this.name}:`, error);
        const errorMsg = '❌ An error occurred while executing this command.';
        
        try {
            if (context.isDiscord && context.type === 'slash') {
                if (context.interaction.replied) {
                    await context.interaction.followUp({ content: errorMsg, flags: 64 });
                } else if (context.interaction.deferred) {
                    await context.interaction.editReply({ content: errorMsg });
                } else {
                    await context.interaction.reply({ content: errorMsg, flags: 64 });
                }
            } else {
                await context.reply(errorMsg);
            }
        } catch (replyError) {
            console.error('Error sending error message:', replyError);
        }
    }
}

module.exports = CommandBase;
