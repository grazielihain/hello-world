const { processMessage } = require('./openai');
const config = require('./config');

async function testBot() {
  console.log('🧪 Testando WhatsApp Bot com OpenAI...\n');
  
  // Verificar configuração
  if (!config.openai.apiKey) {
    console.log('❌ API Key da OpenAI não configurada!');
    console.log('Execute: node setup.js para configurar\n');
    return;
  }

  console.log('✅ Configuração encontrada:');
  console.log(`   Modelo: ${config.openai.model}`);
  console.log(`   Max Tokens: ${config.openai.maxTokens}`);
  console.log(`   Temperature: ${config.openai.temperature}`);
  console.log(`   Bot Name: ${config.bot.name}\n`);

  // Teste básico
  console.log('🔍 Realizando teste básico...');
  
  try {
    const testMessage = 'Olá! Você está funcionando?';
    const testUserId = 'test-user-123';
    
    console.log(`Enviando: "${testMessage}"`);
    const response = await processMessage(testMessage, testUserId);
    
    console.log(`Resposta: "${response}"\n`);
    
    if (response.includes('❌')) {
      console.log('❌ Erro no teste! Verifique suas configurações.');
    } else {
      console.log('✅ Teste bem-sucedido! O bot está funcionando.');
      console.log('\nPara usar o bot:');
      console.log('1. Execute: npm start');
      console.log('2. Escaneie o QR Code');
      console.log('3. Envie mensagens para o bot!');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Dica: Verifique se sua API Key da OpenAI está correta');
    } else if (error.message.includes('network')) {
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