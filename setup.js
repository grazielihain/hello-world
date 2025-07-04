#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupBot() {
  console.log('🤖 Configuração do WhatsApp Bot com OpenAI\n');
  
  try {
    // Verificar se o arquivo .env já existe
    if (fs.existsSync('.env')) {
      const overwrite = await question('Arquivo .env já existe. Deseja sobrescrever? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Configuração cancelada.');
        process.exit(0);
      }
    }

    // Solicitar API Key da OpenAI
    const apiKey = await question('Digite sua API Key da OpenAI: ');
    if (!apiKey.trim()) {
      console.log('❌ API Key é obrigatória!');
      process.exit(1);
    }

    // Solicitar nome do bot
    const botName = await question('Nome do bot (padrão: WhatsApp AI Bot): ') || 'WhatsApp AI Bot';

    // Solicitar modelo
    console.log('\nModelos disponíveis:');
    console.log('1. gpt-3.5-turbo (mais rápido e econômico)');
    console.log('2. gpt-4 (mais preciso)');
    console.log('3. gpt-4-turbo (melhor performance)');
    const modelChoice = await question('Escolha o modelo (1-3, padrão: 1): ') || '1';
    
    const models = {
      '1': 'gpt-3.5-turbo',
      '2': 'gpt-4',
      '3': 'gpt-4-turbo'
    };
    const model = models[modelChoice] || 'gpt-3.5-turbo';

    // Solicitar configurações avançadas
    const maxTokens = await question('Máximo de tokens por resposta (padrão: 1000): ') || '1000';
    const temperature = await question('Temperatura (0-1, padrão: 0.7): ') || '0.7';

    // Criar conteúdo do arquivo .env
    const envContent = `# Configurações da API OpenAI
OPENAI_API_KEY=${apiKey}

# Configurações do Bot
BOT_NAME=${botName}
BOT_DESCRIPTION=Bot inteligente powered by OpenAI

# Configurações do OpenAI
OPENAI_MODEL=${model}
OPENAI_MAX_TOKENS=${maxTokens}
OPENAI_TEMPERATURE=${temperature}

# Configurações de Log
LOG_LEVEL=info
`;

    // Escrever arquivo .env
    fs.writeFileSync('.env', envContent);
    
    console.log('\n✅ Configuração concluída com sucesso!');
    console.log('\nPróximos passos:');
    console.log('1. Execute: npm install');
    console.log('2. Execute: npm start');
    console.log('3. Escaneie o QR Code com seu WhatsApp');
    console.log('\nComandos disponíveis:');
    console.log('- /help - Lista de comandos');
    console.log('- /sobre - Informações do bot');
    console.log('- /limpar - Limpar histórico');
    console.log('\n🎉 Seu bot está pronto para uso!');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  setupBot();
}

module.exports = { setupBot };