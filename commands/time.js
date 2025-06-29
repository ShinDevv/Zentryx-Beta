
const CommandBase = require('../utils/commandBase');

class TimeCommand extends CommandBase {
    constructor() {
        super({
            name: 'time',
            description: 'Get current time in different timezones',
            category: 'Utility',
            usage: 'time [timezone]',
            cooldown: 2,
            slashCommand: {
                name: 'time',
                description: 'Get current time in different timezones',
                options: [
                    {
                        name: 'timezone',
                        description: 'Timezone (e.g., manila, utc, tokyo)',
                        type: 3,
                        required: false
                    }
                ]
            }
        });
    }

    async execute(context) {
        const timezone = (context.args[0] || 'manila').toLowerCase();
        
        const timezones = {
            'manila': 'Asia/Manila',
            'philippines': 'Asia/Manila',
            'ph': 'Asia/Manila',
            'utc': 'UTC',
            'gmt': 'GMT',
            'tokyo': 'Asia/Tokyo',
            'japan': 'Asia/Tokyo',
            'singapore': 'Asia/Singapore',
            'london': 'Europe/London',
            'new_york': 'America/New_York',
            'los_angeles': 'America/Los_Angeles',
            'sydney': 'Australia/Sydney',
            'dubai': 'Asia/Dubai'
        };

        const selectedTimezone = timezones[timezone] || 'Asia/Manila';
        
        try {
            const now = new Date();
            const options = {
                timeZone: selectedTimezone,
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };

            const timeString = now.toLocaleString('en-US', options);
            const [date, time] = timeString.split(' at ');
            
            // Get additional timezone info
            const offset = now.toLocaleString('en-US', { 
                timeZone: selectedTimezone, 
                timeZoneName: 'short' 
            }).split(' ').pop();

            const response = this.createEmbed(
                `🕐 Current Time`,
                '',
                [
                    { name: '📍 Location', value: this.getLocationName(selectedTimezone), inline: false },
                    { name: '📅 Date', value: date, inline: true },
                    { name: '⏰ Time', value: time, inline: true },
                    { name: '🌍 Timezone', value: `${selectedTimezone} (${offset})`, inline: false },
                    { name: '⏱️ Unix Timestamp', value: Math.floor(now.getTime() / 1000).toString(), inline: false }
                ],
                context
            );

            await context.reply(response);
            
        } catch (error) {
            await context.reply('❌ Invalid timezone specified. Try: manila, utc, tokyo, london, new_york, etc.');
        }
    }

    getLocationName(timezone) {
        const locations = {
            'Asia/Manila': '🇵🇭 Manila, Philippines',
            'UTC': '🌍 Coordinated Universal Time',
            'GMT': '🌍 Greenwich Mean Time',
            'Asia/Tokyo': '🇯🇵 Tokyo, Japan',
            'Asia/Singapore': '🇸🇬 Singapore',
            'Europe/London': '🇬🇧 London, United Kingdom',
            'America/New_York': '🇺🇸 New York, USA',
            'America/Los_Angeles': '🇺🇸 Los Angeles, USA',
            'Australia/Sydney': '🇦🇺 Sydney, Australia',
            'Asia/Dubai': '🇦🇪 Dubai, UAE'
        };
        
        return locations[timezone] || timezone;
    }
}

module.exports = new TimeCommand();
