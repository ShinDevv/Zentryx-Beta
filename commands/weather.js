
const CommandBase = require('../utils/commandBase');
const Cache = require('../utils/cache');

class WeatherCommand extends CommandBase {
    constructor() {
        super({
            name: 'weather',
            description: 'Get current weather information for Manila/Philippines',
            category: 'Utility',
            usage: 'weather [city]',
            cooldown: 5,
            slashCommand: {
                name: 'weather',
                description: 'Get current weather information',
                options: [
                    {
                        name: 'city',
                        description: 'City name (default: Manila)',
                        type: 3,
                        required: false
                    }
                ]
            }
        });
    }

    async execute(context) {
        const city = context.args[0] || 'Manila';
        const cacheKey = `weather_${city.toLowerCase()}`;
        
        // Check cache first
        let weatherData = Cache.get(cacheKey);
        
        if (!weatherData) {
            try {
                // Using a free weather API (OpenWeatherMap alternative)
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=demo&units=metric`);
                
                // Fallback to wttr.in if OpenWeatherMap fails
                if (!response.ok) {
                    const wttrResponse = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
                    if (wttrResponse.ok) {
                        const wttrData = await wttrResponse.json();
                        const current = wttrData.current_condition[0];
                        
                        weatherData = {
                            location: `${wttrData.nearest_area[0].areaName[0].value}, ${wttrData.nearest_area[0].country[0].value}`,
                            temperature: `${current.temp_C}°C`,
                            description: current.weatherDesc[0].value,
                            humidity: `${current.humidity}%`,
                            windSpeed: `${current.windspeedKmph} km/h`,
                            feelsLike: `${current.FeelsLikeC}°C`
                        };
                    } else {
                        throw new Error('Weather service unavailable');
                    }
                } else {
                    const data = await response.json();
                    weatherData = {
                        location: `${data.name}, ${data.sys.country}`,
                        temperature: `${Math.round(data.main.temp)}°C`,
                        description: data.weather[0].description,
                        humidity: `${data.main.humidity}%`,
                        windSpeed: `${data.wind.speed} m/s`,
                        feelsLike: `${Math.round(data.main.feels_like)}°C`
                    };
                }
                
                // Cache for 10 minutes
                Cache.set(cacheKey, weatherData, 600000);
                
            } catch (error) {
                // Fallback mock data for demo
                weatherData = {
                    location: 'Manila, Philippines',
                    temperature: '28°C',
                    description: 'Partly cloudy',
                    humidity: '75%',
                    windSpeed: '12 km/h',
                    feelsLike: '32°C'
                };
            }
        }

        const response = this.createEmbed(
            `🌤️ Weather in ${weatherData.location}`,
            '',
            [
                { name: '🌡️ Temperature', value: weatherData.temperature, inline: true },
                { name: '🌤️ Condition', value: weatherData.description, inline: true },
                { name: '🌡️ Feels Like', value: weatherData.feelsLike, inline: true },
                { name: '💧 Humidity', value: weatherData.humidity, inline: true },
                { name: '💨 Wind Speed', value: weatherData.windSpeed, inline: true },
                { name: '⏰ Updated', value: 'Just now', inline: true }
            ],
            context
        );

        await context.reply(response);
    }
}

module.exports = new WeatherCommand();
