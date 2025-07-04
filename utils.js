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
      return `🤖 *${config.bot.name}*\n\n` +
             `Comandos disponíveis:\n` +
             `• ${config.bot.prefix}help - Mostra esta mensagem\n` +
             `• ${config.bot.prefix}limpar - Limpa o histórico da conversa\n` +
             `• ${config.bot.prefix}sobre - Informações sobre o bot\n\n` +
             `Ou simplesmente envie uma mensagem que eu responderei usando inteligência artificial! 🧠`;
    
    case 'sobre':
    case 'about':
      return `🤖 *${config.bot.name}*\n\n` +
             `${config.bot.description}\n\n` +
             `Powered by OpenAI GPT\n` +
             `Versão: 1.0.0`;
    
    case 'limpar':
    case 'clear':
      const { clearHistory } = require('./openai');
      clearHistory(userId);
      return '🧹 Histórico da conversa limpo! Podemos começar uma nova conversa.';
    
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