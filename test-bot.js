const { processMessage } = require('./openai');
const config = require('./config');

async function testBot() {
  console.log('🧪 Testando Bot de Previsão do Tempo...\n');
  
  // Verificar configuração
  if (!config.openai.apiKey) {
    console.log('❌ API Key da OpenAI não configurada!');
    console.log('Execute: node setup.js para configurar\n');
    return;
  }

  if (!config.weather.apiKey) {
    console.log('❌ API Key do OpenWeatherMap não configurada!');
    console.log('Execute: node setup.js para configurar\n');
    return;
  }

  console.log('✅ Configuração encontrada:');
  console.log(`   Modelo OpenAI: ${config.openai.model}`);
  console.log(`   Max Tokens: ${config.openai.maxTokens}`);
  console.log(`   Temperature: ${config.openai.temperature}`);
  console.log(`   Bot Name: ${config.bot.name}`);
  console.log(`   Weather API: Configurada\n`);

  // Teste básico - saudação
  console.log('🔍 Realizando teste de saudação...');
  
  try {
    const testUserId = 'test-user-123';
    
    console.log('Enviando: "Olá"');
    const response1 = await processMessage('Olá', testUserId);
    console.log(`Resposta: "${response1.substring(0, 100)}..."\n`);
    
    // Teste de clima
    console.log('🌤️ Testando busca de clima...');
    console.log('Enviando: "São Paulo, SP"');
    const response2 = await processMessage('São Paulo, SP', testUserId);
    console.log(`Resposta: "${response2.substring(0, 150)}..."\n`);
    
    if (response1.includes('❌') || response2.includes('❌')) {
      console.log('❌ Erro no teste! Verifique suas configurações.');
    } else {
      console.log('✅ Teste bem-sucedido! O bot está funcionando.');
      console.log('\n🌤️ Para usar o bot:');
      console.log('1. Execute: npm start');
      console.log('2. Escaneie o QR Code');
      console.log('3. Envie o nome de uma cidade!');
      console.log('\n📍 Exemplos:');
      console.log('- "Rio de Janeiro, RJ"');
      console.log('- "Londres, Inglaterra"');
      console.log('- "Tokyo, Japan"');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    
    if (error.message.includes('API key') || error.message.includes('API Key')) {
      console.log('\n💡 Dica: Verifique se suas API Keys estão corretas');
    } else if (error.message.includes('network') || error.message.includes('conexão')) {
      console.log('\n💡 Dica: Verifique sua conexão com a internet');
    } else {
      console.log('\n💡 Dica: Execute o comando "node setup.js" para reconfigurar');
    }
  }
}

// Executar teste
if (require.main === module) {
  testBot();
}