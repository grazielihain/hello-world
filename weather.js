const axios = require('axios');
const config = require('./config');
const { logger } = require('./utils');

/**
 * Busca dados de clima atual para uma cidade
 * @param {string} cityName - Nome da cidade (pode incluir estado e país)
 * @returns {Promise<Object>} - Dados do clima
 */
async function getCurrentWeather(cityName) {
  try {
    // Verificar se a API key está configurada
    if (!config.weather.apiKey) {
      throw new Error('API Key do OpenWeatherMap não configurada');
    }

    const url = `${config.weather.baseUrl}/weather`;
    const params = {
      q: cityName,
      appid: config.weather.apiKey,
      units: config.weather.units,
      lang: 'pt_br'
    };

    logger.info(`Buscando clima para: ${cityName}`);
    
    const response = await axios.get(url, { params });
    const data = response.data;

    // Extrair informações relevantes
    const weatherInfo = {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      main: data.weather[0].main,
      icon: data.weather[0].icon,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || 0,
      visibility: data.visibility ? (data.visibility / 1000).toFixed(1) : 'N/A',
      clouds: data.clouds.all,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('pt-BR'),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('pt-BR')
    };

    logger.info(`Clima obtido para ${weatherInfo.city}, ${weatherInfo.country}: ${weatherInfo.temperature}°C`);
    
    return weatherInfo;

  } catch (error) {
    logger.error('Erro ao buscar dados do clima:', error.message);
    
    if (error.response) {
      const status = error.response.status;
      
      if (status === 404) {
        throw new Error('Cidade não encontrada. Verifique se digitou corretamente o nome da cidade, estado e país.');
      } else if (status === 401) {
        throw new Error('API Key do OpenWeatherMap inválida ou não configurada.');
      } else if (status === 429) {
        throw new Error('Limite de requisições da API atingido. Tente novamente em alguns minutos.');
      } else {
        throw new Error(`Erro da API de clima: ${error.response.data.message || 'Erro desconhecido'}`);
      }
    } else {
      throw new Error('Erro de conexão com o serviço de clima. Verifique sua internet.');
    }
  }
}

/**
 * Busca previsão detalhada de 5 dias
 * @param {string} cityName - Nome da cidade
 * @returns {Promise<Object>} - Previsão detalhada
 */
async function getDetailedForecast(cityName) {
  try {
    if (!config.weather.apiKey) {
      throw new Error('API Key do OpenWeatherMap não configurada');
    }

    const url = `${config.weather.baseUrl}/forecast`;
    const params = {
      q: cityName,
      appid: config.weather.apiKey,
      units: config.weather.units,
      lang: 'pt_br'
    };

    const response = await axios.get(url, { params });
    const data = response.data;

    // Processar previsão para hoje (próximas 8 previsões de 3h)
    const todayForecast = data.list.slice(0, 8).map(item => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(item.main.temp),
      description: item.weather[0].description,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
      pop: Math.round(item.pop * 100) // Probabilidade de precipitação
    }));

    return {
      city: data.city.name,
      country: data.city.country,
      todayForecast
    };

  } catch (error) {
    logger.error('Erro ao buscar previsão detalhada:', error.message);
    throw error;
  }
}

/**
 * Formata dados do clima para exibição amigável
 * @param {Object} weather - Dados do clima
 * @returns {string} - Texto formatado
 */
function formatWeatherResponse(weather) {
  const skyConditions = {
    'clear sky': '☀️ céu limpo',
    'few clouds': '🌤️ poucas nuvens',
    'scattered clouds': '⛅ nuvens dispersas',
    'broken clouds': '☁️ nuvens fragmentadas',
    'overcast clouds': '☁️ nublado',
    'shower rain': '🌦️ chuva rápida',
    'rain': '🌧️ chuva',
    'thunderstorm': '⛈️ tempestade',
    'snow': '🌨️ neve',
    'mist': '🌫️ neblina',
    'fog': '🌫️ névoa'
  };

  const condition = skyConditions[weather.description] || `${weather.description}`;
  
  return `🌡️ **${weather.city}, ${weather.country}**

📊 **Condições Atuais:**
• Temperatura: ${weather.temperature}°C
• Sensação térmica: ${weather.feelsLike}°C
• Céu: ${condition}
• Máxima: ${weather.tempMax}°C
• Mínima: ${weather.tempMin}°C

💨 **Detalhes:**
• Umidade: ${weather.humidity}%
• Vento: ${weather.windSpeed} m/s
• Visibilidade: ${weather.visibility} km
• Pressão: ${weather.pressure} hPa

🌅 Nascer do sol: ${weather.sunrise}
🌇 Pôr do sol: ${weather.sunset}`;
}

/**
 * Formata previsão detalhada para exibição
 * @param {Object} forecast - Dados da previsão
 * @returns {string} - Texto formatado
 */
function formatDetailedForecast(forecast) {
  let response = `📈 **Previsão Detalhada para Hoje - ${forecast.city}**\n\n`;
  
  forecast.todayForecast.forEach((item, index) => {
    if (index % 2 === 0) { // Mostrar a cada 6 horas
      response += `🕐 **${item.time}h**\n`;
      response += `• ${item.temp}°C - ${item.description}\n`;
      response += `• Umidade: ${item.humidity}% | Chuva: ${item.pop}%\n`;
      response += `• Vento: ${item.windSpeed} m/s\n\n`;
    }
  });
  
  return response;
}

/**
 * Extrai nome da cidade de uma mensagem
 * @param {string} message - Mensagem do usuário
 * @returns {string|null} - Nome da cidade extraído
 */
function extractCityFromMessage(message) {
  // Padrões comuns para extrair cidade
  const patterns = [
    /(?:em|de|para|clima|tempo)\s+([^.!?]+)/i,
    /([^.!?]+)/i
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const city = match[1].trim();
      // Filtrar palavras irrelevantes
      const irrelevant = ['clima', 'tempo', 'previsão', 'como', 'está', 'em', 'de', 'para', 'o', 'a'];
      const cleanCity = city.split(' ').filter(word => 
        !irrelevant.includes(word.toLowerCase())
      ).join(' ').trim();
      
      if (cleanCity.length > 2) {
        return cleanCity;
      }
    }
  }
  
  return null;
}

module.exports = {
  getCurrentWeather,
  getDetailedForecast,
  formatWeatherResponse,
  formatDetailedForecast,
  extractCityFromMessage
};