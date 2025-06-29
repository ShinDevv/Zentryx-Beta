
const CommandBase = require('../utils/commandBase');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');

class GPTCommand extends CommandBase {
    constructor() {
        super({
            name: 'gpt',
            description: 'Ask GPT-4O a question!',
            category: 'AI',
            usage: 'gpt <question>',
            cooldown: 10,
            slashCommand: {
                name: 'gpt',
                description: 'Ask GPT-4O a question!',
                options: [
                    {
                        name: 'question',
                        description: 'Your question for GPT-4O',
                        type: 3,
                        required: true
                    }
                ]
            }
        });
    }

    async execute(context) {
        if (!context.args || context.args.length === 0) {
            const replyText = '🔎 Please provide a question for **GPT-4O**.\n\n***Example:*** `!gpt What is artificial intelligence?`';
            await context.reply(replyText);
            return;
        }

        const question = context.args.join(' ');

        try {
            await context.reply('🤔 Thinking...');

            const headers = {
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "max-age=0",
                "Sec-CH-UA": '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
                "Sec-CH-UA-Mobile": "?0",
                "Sec-CH-UA-Platform": '"Windows"',
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                Cookie: "__stripe_mid=7cee4280-8e2d-43b6-a714-a99393dc8fb0a84de5",
                "Upgrade-Insecure-Requests": "1",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
            };

            const response = await fetch('https://haji-mix.up.railway.app/api/gpt4o', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: JSON.stringify({
                    uid: context.user.id + "_7",
                    ask: question,
                })
            });

            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }

            const data = await response.json();
            let answer = data.answer || 'No answer received.';

            if (context.isDiscord) {
                const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
                let files = [];

                if (Array.isArray(data.images)) {
                    for (const image of data.images) {
                        if (typeof image.description === "string") {
                            answer = image.description + "\n\n" + answer;
                        }
                        if (typeof image.url === "string") {
                            try {
                                const imgResponse = await fetch(image.url);
                                const buffer = Buffer.from(await imgResponse.arrayBuffer());
                                const fileName = path.join(__dirname, `gpt-gen_${Date.now()}_${Math.floor(Math.random() * 1000000)}.png`);
                                fs.writeFileSync(fileName, buffer);
                                files.push(new AttachmentBuilder(fileName));
                            } catch (imgError) {
                                console.error('Error downloading image:', imgError);
                            }
                        }
                    }
                }

                const embed = new EmbedBuilder()
                    .setTitle('🤖 GPT-4O Response')
                    .setDescription(answer)
                    .setColor(0x667eea)
                    .setFooter({ text: 'You can ask another question with !gpt or /gpt' });

                await context.send({ embeds: [embed], files: files });

                for (const file of files) {
                    try { 
                        fs.unlinkSync(file.attachment); 
                    } catch (cleanupError) {
                        console.error('Error cleaning up file:', cleanupError);
                    }
                }
            } else {
                let telegramMessage = `🤖 ${this.bold('GPT-4O Response:', context)}\n\n${answer}`;

                if (Array.isArray(data.images)) {
                    for (const image of data.images) {
                        if (typeof image.description === "string") {
                            telegramMessage = `${image.description}\n\n${telegramMessage}`;
                        }
                        if (typeof image.url === "string") {
                            try {
                                const telegramBot = global.telegramBot;
                                if (telegramBot && context.rawMessage && context.rawMessage.chat) {
                                    await telegramBot.sendPhoto(context.rawMessage.chat.id, image.url, {
                                        caption: `🖼️ Generated Image\n${image.description || 'GPT-4O generated image'}`
                                    });
                                }
                            } catch (imgError) {
                                console.error('Error sending image to Telegram:', imgError);
                                telegramMessage += `\n\n🖼️ <a href="${image.url}">View Generated Image</a>`;
                            }
                        }
                    }
                }

                telegramMessage += `\n\n${this.italic('You can ask another question with /gpt', context)}`;
                await context.send(telegramMessage);
            }

        } catch (error) {
            console.error('GPT command error:', error);
            const errorMsg = "❌ There was an error processing your request. Please try again later.";
            await context.send(errorMsg);
        }
    }
}

module.exports = new GPTCommand();
