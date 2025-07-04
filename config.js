require('dotenv').config();

const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
  },
  bot: {
    name: process.env.BOT_NAME || 'WhatsApp AI Bot',
    description: process.env.BOT_DESCRIPTION || 'Bot inteligente powered by OpenAI',
    prefix: '/',
    commandTimeout: 30000, // 30 segundos
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

module.exports = config;