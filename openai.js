const OpenAI = require('openai');
const config = require('./config');
const { logger } = require('./utils');
const { 
  getCurrentWeather, 
  getDetailedForecast, 
  formatWeatherResponse, 
  formatDetailedForecast,
  extractCityFromMessage 
} = require('./weather');

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// Histórico de conversas por usuário
const conversationHistory = new Map();

// Estado da conversa por usuário
const conversationState = new Map();

/**
 * Processa uma pergunta sobre previsão do tempo
 * @param {string} message - Mensagem do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<string>} - Resposta sobre previsão do tempo
 */
async function processMessage(message, userId) {
  try {
    // Verificar configurações
    if (!config.openai.apiKey) {
      return '❌ Erro: API Key da OpenAI não configurada. Verifique o arquivo .env';
    }

    if (!config.weather.apiKey) {
      return '❌ Erro: API Key do OpenWeatherMap não configurada. Verifique o arquivo .env';
    }

    // Obter estado atual da conversa
    const userState = conversationState.get(userId) || { step: 'greeting', lastCity: null };
    
    logger.info(`Usuário ${userId} - Estado: ${userState.step} - Mensagem: ${message}`);

    // Fluxo da conversa de previsão do tempo
    switch (userState.step) {
      case 'greeting':
        return await handleGreeting(userId, message);
      
      case 'waiting_city':
        return await handleCityRequest(userId, message);
      
      case 'showing_weather':
        return await handleWeatherResponse(userId, message);
      
      case 'asking_more_details':
        return await handleMoreDetailsRequest(userId, message);
      
      default:
        // Resetar para greeting se estado inválido
        conversationState.set(userId, { step: 'greeting', lastCity: null });
        return await handleGreeting(userId, message);
    }

  } catch (error) {
    logger.error('Erro ao processar mensagem:', error);
    
    // Resetar estado em caso de erro
    conversationState.set(userId, { step: 'greeting', lastCity: null });
    
    if (error.message.includes('API Key')) {
      return '❌ Problema com as configurações da API. Verifique suas chaves de API.';
    } else if (error.message.includes('Cidade não encontrada')) {
      return '❌ ' + error.message + '\n\nPor favor, digite novamente o nome da cidade, estado e país (exemplo: "São Paulo, SP, Brasil").';
    } else {
      return '❌ Ocorreu um erro inesperado. Vou reiniciar nossa conversa.\n\n' + 
             '👋 Olá! Sou seu assistente especialista em previsão do tempo! 🌤️\n\n' +
             'Para qual cidade, estado e país você gostaria de saber a previsão do tempo em tempo real? 📍\n\n' +
             '(Exemplo: "São Paulo, SP, Brasil" ou "Rio de Janeiro, RJ")';
    }
  }
}

/**
 * Manipula a saudação inicial
 */
async function handleGreeting(userId, message) {
  // Cumprimentar de forma amigável e perguntar pela cidade
  const greeting = `👋 Olá! Sou seu assistente especialista em previsão do tempo! 🌤️

Como posso te ajudar hoje? Para qual cidade, estado e país você gostaria de saber a previsão do tempo em tempo real? 📍

Por favor, me informe no formato: "cidade, estado, país" 
(Exemplo: "São Paulo, SP, Brasil" ou "Rio de Janeiro, RJ")`;

  // Atualizar estado
  conversationState.set(userId, { step: 'waiting_city', lastCity: null });
  
  return greeting;
}

/**
 * Manipula a solicitação de cidade
 */
async function handleCityRequest(userId, message) {
  try {
    // Tentar extrair cidade da mensagem
    let cityName = extractCityFromMessage(message);
    
    // Se não conseguiu extrair, usar a mensagem inteira como cidade
    if (!cityName) {
      cityName = message.trim();
    }

    logger.info(`Buscando clima para: ${cityName}`);

    // Buscar dados do clima
    const weatherData = await getCurrentWeather(cityName);
    
    // Formatar resposta
    const weatherResponse = formatWeatherResponse(weatherData);
    
    const response = `${weatherResponse}

🤔 Gostaria de saber mais detalhes sobre a previsão do tempo para hoje? 

Digite "sim" para mais informações ou "não" se estiver satisfeito(a) com essas informações! 😊`;

    // Atualizar estado
    conversationState.set(userId, { 
      step: 'asking_more_details', 
      lastCity: cityName,
      weatherData: weatherData
    });
    
    return response;

  } catch (error) {
    logger.error('Erro ao buscar clima:', error);
    
    // Manter no estado de espera por cidade
    conversationState.set(userId, { step: 'waiting_city', lastCity: null });
    
    return `❌ ${error.message}

🔄 Vamos tentar novamente! Para qual cidade você gostaria de saber a previsão do tempo?

Por favor, digite no formato: "cidade, estado, país" 
(Exemplo: "São Paulo, SP, Brasil")`;
  }
}

/**
 * Manipula a resposta sobre querer mais detalhes
 */
async function handleMoreDetailsRequest(userId, message) {
  const userState = conversationState.get(userId);
  const lowerMessage = message.toLowerCase().trim();
  
  // Verificar se o usuário quer mais detalhes
  const positiveAnswers = ['sim', 's', 'yes', 'quero', 'claro', 'por favor', 'pode mandar', 'me conte mais'];
  const negativeAnswers = ['não', 'nao', 'n', 'no', 'obrigado', 'obrigada', 'tá bom', 'ta bom', 'suficiente'];
  
  const wantsMoreDetails = positiveAnswers.some(answer => lowerMessage.includes(answer));
  const doesntWantDetails = negativeAnswers.some(answer => lowerMessage.includes(answer));
  
  if (wantsMoreDetails) {
    try {
      // Buscar previsão detalhada
      const forecast = await getDetailedForecast(userState.lastCity);
      const detailedResponse = formatDetailedForecast(forecast);
      
      const response = `${detailedResponse}

🙏 Obrigado por confiar em mim para te ajudar com a previsão do tempo! 

Se precisar de informações sobre outras cidades, é só me enviar uma mensagem! 

Tenha um ótimo dia! 🌟☀️`;
      
      // Resetar estado para nova consulta
      conversationState.set(userId, { step: 'greeting', lastCity: null });
      
      return response;
      
    } catch (error) {
      logger.error('Erro ao buscar previsão detalhada:', error);
      
      const response = `❌ Não consegui buscar os detalhes da previsão no momento.

🙏 Mas obrigado por confiar em mim! Se precisar de informações sobre o tempo, é só me enviar uma mensagem novamente!

Tenha um ótimo dia! 🌟☀️`;
      
      // Resetar estado
      conversationState.set(userId, { step: 'greeting', lastCity: null });
      
      return response;
    }
    
  } else if (doesntWantDetails) {
    // Usuário não quer mais detalhes
    const response = `🙏 Perfeito! Obrigado por confiar em mim para te ajudar com a previsão do tempo! 

Se precisar de informações sobre outras cidades, é só me enviar uma mensagem! 

Tenha um ótimo dia e aproveite o tempo lá fora! 🌟☀️`;
    
    // Resetar estado para nova consulta
    conversationState.set(userId, { step: 'greeting', lastCity: null });
    
    return response;
    
  } else {
    // Resposta ambígua, pedir esclarecimento
    return `🤔 Não entendi bem... 

Você gostaria de saber mais detalhes sobre a previsão do tempo? 

Por favor, responda:
• "Sim" - para ver a previsão detalhada de hoje 📈
• "Não" - se estiver satisfeito(a) com as informações 😊`;
  }
}

/**
 * Manipula respostas gerais sobre clima (não implementado no fluxo atual)
 */
async function handleWeatherResponse(userId, message) {
  // Esta função é para compatibilidade, mas não é usada no fluxo atual
  return await handleGreeting(userId, message);
}

/**
 * Limpa o histórico de conversas e estado de um usuário
 * @param {string} userId - ID do usuário
 */
function clearHistory(userId) {
  conversationHistory.delete(userId);
  conversationState.delete(userId);
  logger.info(`Histórico e estado limpos para usuário ${userId}`);
}

/**
 * Limpa todo o histórico de conversas e estados
 */
function clearAllHistory() {
  conversationHistory.clear();
  conversationState.clear();
  logger.info('Histórico e estado de todas as conversas limpos');
}

module.exports = {
  processMessage,
  clearHistory,
  clearAllHistory,
};