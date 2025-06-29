
const CommandBase = require('../utils/commandBase');
const Cache = require('../utils/cache');

class QuotesCommand extends CommandBase {
    constructor() {
        super({
            name: 'quotes',
            description: 'Get inspirational quotes',
            category: 'Fun',
            usage: 'quotes [category]',
            aliases: ['quote', 'inspire'],
            cooldown: 3,
            slashCommand: {
                name: 'quotes',
                description: 'Get inspirational quotes',
                options: [
                    {
                        name: 'category',
                        description: 'Quote category (motivational, love, life, success)',
                        type: 3,
                        required: false
                    }
                ]
            }
        });
    }

    async execute(context) {
        const category = (context.args[0] || 'random').toLowerCase();
        const cacheKey = `quotes_${category}`;
        
        let quotes = Cache.get(cacheKey);
        
        if (!quotes) {
            try {
                // Try to fetch from a quotes API
                const response = await fetch('https://api.quotable.io/random');
                if (response.ok) {
                    const data = await response.json();
                    quotes = [{
                        text: data.content,
                        author: data.author,
                        category: data.tags.join(', ')
                    }];
                } else {
                    throw new Error('API unavailable');
                }
            } catch (error) {
                // Fallback to predefined quotes
                quotes = this.getFallbackQuotes(category);
            }
            
            // Cache for 30 minutes
            Cache.set(cacheKey, quotes, 1800000);
        }

        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        
        const response = this.createEmbed(
            '💭 Inspirational Quote',
            `"${quote.text}"`,
            [
                { name: '👤 Author', value: quote.author, inline: true },
                { name: '📚 Category', value: quote.category || 'General', inline: true },
                { name: '✨ Share', value: 'Spread the inspiration!', inline: false }
            ],
            context
        );

        await context.reply(response);
    }

    getFallbackQuotes(category) {
        const allQuotes = {
            motivational: [
                { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Motivational" },
                { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Motivational" },
                { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Motivational" }
            ],
            life: [
                { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon", category: "Life" },
                { text: "The purpose of our lives is to be happy.", author: "Dalai Lama", category: "Life" },
                { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll", category: "Life" }
            ],
            success: [
                { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "Success" },
                { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "Success" },
                { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller", category: "Success" }
            ],
            love: [
                { text: "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.", author: "Lao Tzu", category: "Love" },
                { text: "The best thing to hold onto in life is each other.", author: "Audrey Hepburn", category: "Love" },
                { text: "Love is composed of a single soul inhabiting two bodies.", author: "Aristotle", category: "Love" }
            ]
        };

        const selectedQuotes = allQuotes[category] || Object.values(allQuotes).flat();
        return selectedQuotes;
    }
}

module.exports = new QuotesCommand();
