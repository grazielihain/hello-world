require('dotenv').config();

const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1500,
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
  },
  weather: {
    apiKey: process.env.WEATHER_API_KEY,
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    units: 'metric', // Para Celsius
  },
  bot: {
    name: process.env.BOT_NAME || 'Bot Previsão do Tempo',
    description: process.env.BOT_DESCRIPTION || 'Bot especialista em previsão do tempo powered by OpenAI',
    prefix: '/',
    commandTimeout: 30000, // 30 segundos
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

module.exports = config;