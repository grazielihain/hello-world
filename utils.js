const pino = require('pino');
const config = require('./config');

// Configurar logger
const logger = pino({
  level: config.logging.level,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
});

/**
 * Formata o nome do contato
 * @param {Object} contact - Objeto de contato
 * @returns {string} - Nome formatado
 */
function formatContactName(contact) {
  if (!contact) return 'Usuário';
  
  if (contact.name) return contact.name;
  if (contact.verifiedName) return contact.verifiedName;
  if (contact.pushName) return contact.pushName;
  
  return 'Usuário';
}

/**
 * Verifica se uma mensagem é um comando
 * @param {string} message - Mensagem para verificar
 * @returns {boolean} - True se for um comando
 */
function isCommand(message) {
  return message.startsWith(config.bot.prefix);
}

/**
 * Extrai o comando e argumentos de uma mensagem
 * @param {string} message - Mensagem completa
 * @returns {Object} - Objeto com comando e argumentos
 */
function parseCommand(message) {
  const parts = message.slice(config.bot.prefix.length).split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');
  
  return { command, args };
}

/**
 * Processa comandos específicos do bot
 * @param {string} command - Comando a ser processado
 * @param {string} args - Argumentos do comando
 * @param {string} userId - ID do usuário
 * @returns {string|null} - Resposta do comando ou null se não for um comando válido
 */
function processCommand(command, args, userId) {
  switch (command) {
    case 'help':
    case 'ajuda':
      return `🌤️ *${config.bot.name}*\n\n` +
             `Comandos disponíveis:\n` +
             `• ${config.bot.prefix}help - Mostra esta mensagem\n` +
             `• ${config.bot.prefix}limpar - Reinicia a conversa\n` +
             `• ${config.bot.prefix}sobre - Informações sobre o bot\n\n` +
             `🌍 **Como usar:**\n` +
             `Simplesmente me envie o nome de uma cidade e eu te darei a previsão do tempo completa!\n\n` +
             `📍 **Exemplo:** "São Paulo, SP" ou "Rio de Janeiro"`;
    
    case 'sobre':
    case 'about':
      return `🌤️ *${config.bot.name}*\n\n` +
             `${config.bot.description}\n\n` +
             `🌍 Previsão do tempo para qualquer lugar do mundo\n` +
             `☀️ Informações em tempo real\n` +
             `📊 Dados detalhados e precisos\n\n` +
             `Powered by OpenWeatherMap & OpenAI\n` +
             `Versão: 2.0.0`;
    
    case 'limpar':
    case 'clear':
    case 'reiniciar':
    case 'restart':
      const { clearHistory } = require('./openai');
      clearHistory(userId);
      return '🔄 Conversa reiniciada!\n\n' +
             '👋 Olá! Sou seu assistente especialista em previsão do tempo! 🌤️\n\n' +
             'Para qual cidade, estado e país você gostaria de saber a previsão do tempo? 📍';
    
    default:
      return null;
  }
}

/**
 * Valida se o número é válido para WhatsApp
 * @param {string} number - Número a ser validado
 * @returns {boolean} - True se o número for válido
 */
function isValidWhatsAppNumber(number) {
  // Remove caracteres não numéricos
  const cleanNumber = number.replace(/\D/g, '');
  
  // Verifica se tem pelo menos 10 dígitos
  return cleanNumber.length >= 10 && cleanNumber.length <= 15;
}

/**
 * Adiciona delay entre operações
 * @param {number} ms - Milissegundos para esperar
 * @returns {Promise} - Promise que resolve após o delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formata mensagem de erro amigável
 * @param {Error} error - Erro a ser formatado
 * @returns {string} - Mensagem formatada
 */
function formatError(error) {
  logger.error('Erro capturado:', error);
  return '❌ Ocorreu um erro inesperado. Tente novamente em alguns instantes.';
}

module.exports = {
  logger,
  formatContactName,
  isCommand,
  parseCommand,
  processCommand,
  isValidWhatsAppNumber,
  delay,
  formatError,
};