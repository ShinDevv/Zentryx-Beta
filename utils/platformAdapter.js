class PlatformAdapter {
    static createContext(platform, rawMessage, args) {
        const context = {
            platform,
            isDiscord: platform === 'discord',
            isTelegram: platform === 'telegram',
            args: args || [],
            rawMessage
        };

        if (platform === 'discord') {
            if (rawMessage.author) {
                // This is a regular message
                context.user = {
                    id: rawMessage.author.id,
                    username: rawMessage.author.username,
                    displayName: rawMessage.author.displayName || rawMessage.author.globalName || rawMessage.author.username,
                    isBot: rawMessage.author.bot || false
                };
                context.reply = async (content, options = {}) => {
                        if (typeof content === 'string') {
                            content = { content };
                        }

                        if (options.ephemeral) {
                            content.flags = 64;
                        }

                        try {
                            if (rawMessage.replied) {
                                return await rawMessage.followUp(content);
                            } else if (rawMessage.deferred) {
                                return await rawMessage.editReply(content);
                            } else {
                                return await rawMessage.reply(content);
                            }
                        } catch (error) {
                            console.error('Error replying to Discord interaction:', error);
                            if (!rawMessage.replied && !rawMessage.deferred) {
                                try {
                                    return await rawMessage.reply({ content: '❌ An error occurred.', flags: 64 });
                                } catch (fallbackError) {
                                    console.error('Fallback reply also failed:', fallbackError);
                                }
                            }
                        }
                    };
                context.send = async (content) => {
                    if (typeof content === 'string') {
                        await rawMessage.channel.send(content);
                    } else {
                        await rawMessage.channel.send(content);
                    }
                };
            } else {
                // This is a slash command interaction
                context.user = {
                    id: rawMessage.user.id,
                    username: rawMessage.user.username,
                    displayName: rawMessage.member?.displayName || rawMessage.user.displayName || rawMessage.user.globalName || rawMessage.user.username,
                    isBot: rawMessage.user.bot || false
                };
                context.reply = async (content, options = {}) => {
                        if (typeof content === 'string') {
                            content = { content };
                        }

                        if (options.ephemeral) {
                            content.flags = 64;
                        }

                        try {
                            if (rawMessage.replied) {
                                return await rawMessage.followUp(content);
                            } else if (rawMessage.deferred) {
                                return await rawMessage.editReply(content);
                            } else {
                                return await rawMessage.reply(content);
                            }
                        } catch (error) {
                            console.error('Error replying to Discord interaction:', error);
                            if (!rawMessage.replied && !rawMessage.deferred) {
                                try {
                                    return await rawMessage.reply({ content: '❌ An error occurred.', flags: 64 });
                                } catch (fallbackError) {
                                    console.error('Fallback reply also failed:', fallbackError);
                                }
                            }
                        }
                    };
                context.send = async (content) => {
                    if (typeof content === 'string') {
                        await rawMessage.followUp({ content });
                    } else {
                        await rawMessage.followUp(content);
                    }
                };
            }
        } else if (platform === 'telegram') {
            context.user = {
                id: rawMessage.from.id,
                displayName: rawMessage.from.first_name + (rawMessage.from.last_name ? ` ${rawMessage.from.last_name}` : '')
            };
            context.reply = async (content) => {
                const options = { parse_mode: 'HTML' };
                if (typeof content === 'object' && content.embed) {
                    let text = '';
                    if (content.embed.title) text += `<b>${content.embed.title}</b>\n`;
                    if (content.embed.description) text += `${content.embed.description}\n`;
                    if (content.embed.fields) {
                        content.embed.fields.forEach(field => {
                            text += `\n<b>${field.name}</b>\n${field.value}`;
                        });
                    }
                    await global.telegramBot.sendMessage(rawMessage.chat.id, text, options);
                } else {
                    await global.telegramBot.sendMessage(rawMessage.chat.id, content, options);
                }
            };
            context.send = context.reply;
        }

        return context;
    }
}

module.exports = PlatformAdapter;