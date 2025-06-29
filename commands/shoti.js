
const CommandBase = require('../utils/commandBase');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class ShotiCommand extends CommandBase {
    constructor() {
        super({
            name: 'shoti',
            description: 'Get a random Shoti image or video!',
            category: 'Entertainment',
            usage: 'shoti',
            cooldown: 5,
            slashCommand: {
                name: 'shoti',
                description: 'Get a random Shoti image or video!'
            }
        });
    }

    async execute(context) {
        try {
            await context.reply('🎬 Fetching random Shoti content...');

            let data;
            try {
                const response = await fetch('https://shoti.fbbot.org/api/get-shoti?type=video', {
                    headers: { 'apikey': 'shoti-6c8d8ff17f' }
                });

                if (!response.ok) {
                    const text = await response.text();
                    console.error('Shoti API error:', response.status, text);
                    throw new Error('Shoti API returned an error');
                }

                data = await response.json();
            } catch (err) {
                console.error('Fetch error:', err);
                return await context.send('❌ Failed to fetch from Shoti API. Please try again later.');
            }

            if (!data || !data.result) {
                return await context.send('❌ No result from Shoti API. Please try again later.');
            }

            const result = data.result;
            const user = result.user;

            const userInfo = [
                `${this.bold('Nickname:', context)} ${user.nickname}`,
                `${this.bold('Username:', context)} ${user.username}`,
                `${this.bold('Signature:', context)} ${user.signature || 'N/A'}`,
                `${this.bold('Instagram:', context)} ${user.instagram || 'N/A'}`,
                `${this.bold('Twitter:', context)} ${user.twitter || 'N/A'}`
            ].join('\n');

            const title = result.title || 'Shoti Content';
            const footer = `Region: ${result.region} | Type: ${result.type}`;

            if (context.isDiscord) {
                const { EmbedBuilder } = require('discord.js');

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(userInfo)
                    .setColor(0x667eea)
                    .setFooter({ text: footer });

                if (result.type === 'image' && Array.isArray(result.content)) {
                    embed.setImage(result.content[0]);
                    return await context.send({ embeds: [embed] });
                }

                if (result.type === 'video' && typeof result.content === 'string') {
                    embed.setDescription(`${userInfo}\n\n[🎥 Watch Video](${result.content})`);
                    return await context.send({ embeds: [embed] });
                }
            } else {
                if (result.type === 'image' && Array.isArray(result.content)) {
                    const caption = `🎬 ${this.bold(title, context)}\n\n${userInfo}\n\n${this.italic(footer, context)}`;
                    
                    try {
                        const telegramBot = global.telegramBot;
                        if (telegramBot && context.rawMessage && context.rawMessage.chat) {
                            await telegramBot.sendPhoto(context.rawMessage.chat.id, result.content[0], {
                                caption: caption,
                                parse_mode: 'HTML'
                            });
                            return;
                        }
                    } catch (err) {
                        console.error('Error sending photo:', err);
                        const message = `${caption}\n\n🖼️ <a href="${result.content[0]}">View Image</a>`;
                        return await context.send(message);
                    }
                }

                if (result.type === 'video' && typeof result.content === 'string') {
                    const caption = `🎬 ${this.bold(title, context)}\n\n${userInfo}\n\n${this.italic(footer, context)}`;
                    
                    try {
                        const telegramBot = global.telegramBot;
                        if (telegramBot && context.rawMessage && context.rawMessage.chat) {
                            await telegramBot.sendVideo(context.rawMessage.chat.id, result.content, {
                                caption: caption,
                                parse_mode: 'HTML'
                            });
                            return;
                        }
                    } catch (err) {
                        console.error('Error sending video directly:', err);
                        const message = `${caption}\n\n🎥 <a href="${result.content}">Watch Video</a>`;
                        return await context.send(message);
                    }
                }
            }

        } catch (error) {
            console.error('Shoti command error:', error);
            await this.handleError(context, error);
        }
    }
}

module.exports = new ShotiCommand();
