/**
 * Exemplo de uso do WhatsApp Bot com OpenAI
 * Este arquivo demonstra como usar o bot programaticamente
 */

const { startBot, stopBot, sendMessage } = require('./index');
const { processMessage } = require('./openai');
const config = require('./config');

// Exemplo 1: Iniciar o bot normalmente
async function exemploBasico() {
  console.log('🚀 Iniciando bot...');
  await startBot();
  
  // O bot ficará rodando e respondendo mensagens automaticamente
  console.log('Bot iniciado! Pressione Ctrl+C para parar.');
}

// Exemplo 2: Processar mensagem diretamente (para testes)
async function exemploProcessarMensagem() {
  const message = 'Qual é a capital do Brasil?';
  const userId = 'user123';
  
  try {
    const response = await processMessage(message, userId);
    console.log(`Pergunta: ${message}`);
    console.log(`Resposta: ${response}`);
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

// Exemplo 3: Enviar mensagem para um número específico (após bot conectado)
async function exemploEnviarMensagem() {
  const numero = '5511999999999'; // Substitua pelo número real
  const mensagem = 'Olá! Esta é uma mensagem de teste do bot.';
  
  try {
    await sendMessage(numero, mensagem);
    console.log('Mensagem enviada com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.message);
  }
}

// Exemplo 4: Configuração personalizada
async function exemploConfiguracao() {
  console.log('Configurações atuais:');
  console.log('- API Key:', config.openai.apiKey ? 'Configurada' : 'Não configurada');
  console.log('- Modelo:', config.openai.model);
  console.log('- Max Tokens:', config.openai.maxTokens);
  console.log('- Temperature:', config.openai.temperature);
  console.log('- Nome do Bot:', config.bot.name);
}

// Exemplo 5: Bot com handlers personalizados
async function exemploComHandlers() {
  console.log('Este exemplo mostra como estender o bot com funcionalidades personalizadas');
  
  // Você pode modificar o arquivo index.js para adicionar handlers personalizados
  // Por exemplo, para processar imagens, áudios, documentos, etc.
}

// Função principal para demonstrar os exemplos
async function main() {
  const exemplo = process.argv[2];
  
  switch (exemplo) {
    case '1':
      await exemploBasico();
      break;
    case '2':
      await exemploProcessarMensagem();
      break;
    case '3':
      await exemploEnviarMensagem();
      break;
    case '4':
      await exemploConfiguracao();
      break;
    case '5':
      await exemploComHandlers();
      break;
    default:
      console.log('Exemplos de uso do WhatsApp Bot:');
      console.log('');
      console.log('node example-usage.js 1  # Iniciar bot normalmente');
      console.log('node example-usage.js 2  # Processar mensagem diretamente');
      console.log('node example-usage.js 3  # Enviar mensagem para número');
      console.log('node example-usage.js 4  # Mostrar configurações');
      console.log('node example-usage.js 5  # Exemplo com handlers personalizados');
      console.log('');
      console.log('Para uso normal, execute: npm start');
      break;
  }
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  exemploBasico,
  exemploProcessarMensagem,
  exemploEnviarMensagem,
  exemploConfiguracao,
  exemploComHandlers
};