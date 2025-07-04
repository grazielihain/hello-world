const OpenAI = require('openai');
const config = require('./config');
const { logger } = require('./utils');

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// Histórico de conversas por usuário
const conversationHistory = new Map();

/**
 * Processa uma pergunta usando a API da OpenAI
 * @param {string} message - Mensagem do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<string>} - Resposta da OpenAI
 */
async function processMessage(message, userId) {
  try {
    // Verificar se a API key está configurada
    if (!config.openai.apiKey) {
      return '❌ Erro: API Key da OpenAI não configurada. Verifique o arquivo .env';
    }

    // Obter ou criar histórico do usuário
    if (!conversationHistory.has(userId)) {
      conversationHistory.set(userId, []);
    }

    const history = conversationHistory.get(userId);
    
    // Adicionar mensagem do usuário ao histórico
    history.push({
      role: 'user',
      content: message
    });

    // Manter apenas as últimas 10 mensagens para economizar tokens
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    // Preparar mensagens para a API
    const messages = [
      {
        role: 'system',
        content: `Você é um assistente inteligente integrado ao WhatsApp. Seja útil, amigável e responda de forma clara e concisa. Você pode ajudar com diversas tarefas como responder perguntas, explicar conceitos, dar sugestões, etc. Mantenha as respostas objetivas e adequadas para o formato de mensagem do WhatsApp.`
      },
      ...history
    ];

    // Fazer chamada para a API da OpenAI
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: messages,
      max_tokens: config.openai.maxTokens,
      temperature: config.openai.temperature,
    });

    const aiResponse = response.choices[0].message.content;

    // Adicionar resposta da IA ao histórico
    history.push({
      role: 'assistant',
      content: aiResponse
    });

    logger.info(`Resposta gerada para usuário ${userId}: ${aiResponse.substring(0, 100)}...`);
    
    return aiResponse;

  } catch (error) {
    logger.error('Erro ao processar mensagem com OpenAI:', error);
    
    if (error.status === 401) {
      return '❌ Erro de autenticação: Verifique sua API Key da OpenAI';
    } else if (error.status === 429) {
      return '❌ Limite de requisições atingido. Tente novamente em alguns minutos.';
    } else if (error.status === 500) {
      return '❌ Erro interno da OpenAI. Tente novamente mais tarde.';
    } else {
      return '❌ Erro inesperado. Tente novamente ou contate o suporte.';
    }
  }
}

/**
 * Limpa o histórico de conversas de um usuário
 * @param {string} userId - ID do usuário
 */
function clearHistory(userId) {
  conversationHistory.delete(userId);
  logger.info(`Histórico limpo para usuário ${userId}`);
}

/**
 * Limpa todo o histórico de conversas
 */
function clearAllHistory() {
  conversationHistory.clear();
  logger.info('Histórico de todas as conversas limpo');
}

module.exports = {
  processMessage,
  clearHistory,
  clearAllHistory,
};