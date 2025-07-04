const { 
  makeWASocket, 
  DisconnectReason, 
  useMultiFileAuthState,
  MessageType,
  Mimetype,
  jidDecode 
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const { processMessage } = require('./openai');
const { 
  logger, 
  formatContactName, 
  isCommand, 
  parseCommand, 
  processCommand, 
  delay, 
  formatError 
} = require('./utils');
const config = require('./config');

// Estado da conexão
let sock;
let isConnected = false;

/**
 * Inicializa o bot WhatsApp
 */
async function startBot() {
  try {
    logger.info('🚀 Iniciando WhatsApp Bot com OpenAI...');
    
    // Usar autenticação multi-arquivo
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    // Criar socket WhatsApp
    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: logger.child({ module: 'baileys' }),
      browser: ['WhatsApp Bot', 'Chrome', '1.0.0'],
      generateHighQualityLinkPreview: true,
    });

    // Salvar credenciais quando atualizadas
    sock.ev.on('creds.update', saveCreds);

    // Lidar com atualizações de conexão
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        logger.info('📱 Escaneie o QR Code abaixo com seu WhatsApp:');
        qrcode.generate(qr, { small: true });
      }
      
      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        logger.info(`Conexão fechada: ${lastDisconnect?.error?.output?.statusCode}. Reconectando: ${shouldReconnect}`);
        
        if (shouldReconnect) {
          await delay(5000);
          startBot();
        }
      } else if (connection === 'open') {
        isConnected = true;
        logger.info('✅ Bot conectado com sucesso!');
        logger.info(`🤖 ${config.bot.name} está pronto para responder mensagens!`);
      }
    });

    // Lidar com mensagens recebidas
    sock.ev.on('messages.upsert', async (m) => {
      const message = m.messages[0];
      
      if (!message.key.fromMe && message.message) {
        await handleMessage(message);
      }
    });

  } catch (error) {
    logger.error('Erro ao inicializar bot:', error);
    setTimeout(startBot, 5000);
  }
}

/**
 * Processa mensagens recebidas
 * @param {Object} message - Mensagem recebida
 */
async function handleMessage(message) {
  try {
    const messageType = Object.keys(message.message)[0];
    
    // Só processar mensagens de texto
    if (messageType !== 'conversation' && messageType !== 'extendedTextMessage') {
      return;
    }

    // Extrair texto da mensagem
    const text = message.message.conversation || message.message.extendedTextMessage?.text;
    
    if (!text) return;

    // Informações do remetente
    const from = message.key.remoteJid;
    const userId = jidDecode(from)?.user || from;
    const isGroup = from.endsWith('@g.us');
    
    // Não responder em grupos por enquanto (pode ser habilitado se necessário)
    if (isGroup) {
      return;
    }

    // Obter informações do contato
    const contact = await sock.onWhatsApp(from);
    const contactName = formatContactName(contact?.[0]);
    
    logger.info(`📨 Mensagem recebida de ${contactName} (${userId}): ${text}`);

    // Mostrar indicador de "digitando"
    await sock.sendPresenceUpdate('composing', from);

    let response;

    // Verificar se é um comando
    if (isCommand(text)) {
      const { command, args } = parseCommand(text);
      response = processCommand(command, args, userId);
      
      // Se não foi um comando válido, processar como mensagem normal
      if (!response) {
        response = await processMessage(text, userId);
      }
    } else {
      // Processar mensagem normal com OpenAI
      response = await processMessage(text, userId);
    }

    // Simular tempo de digitação
    await delay(Math.min(response.length * 50, 3000));

    // Parar indicador de "digitando"
    await sock.sendPresenceUpdate('paused', from);

    // Enviar resposta
    await sock.sendMessage(from, { text: response });
    
    logger.info(`✅ Resposta enviada para ${contactName}: ${response.substring(0, 100)}...`);

  } catch (error) {
    logger.error('Erro ao processar mensagem:', error);
    
    try {
      const errorMessage = formatError(error);
      await sock.sendMessage(message.key.remoteJid, { text: errorMessage });
    } catch (sendError) {
      logger.error('Erro ao enviar mensagem de erro:', sendError);
    }
  }
}

/**
 * Envia mensagem para um número específico (útil para testes)
 * @param {string} number - Número do destinatário
 * @param {string} message - Mensagem a ser enviada
 */
async function sendMessage(number, message) {
  try {
    if (!isConnected) {
      throw new Error('Bot não está conectado');
    }
    
    const jid = number.includes('@') ? number : `${number}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: message });
    logger.info(`Mensagem enviada para ${number}: ${message}`);
  } catch (error) {
    logger.error('Erro ao enviar mensagem:', error);
    throw error;
  }
}

/**
 * Encerra o bot graciosamente
 */
async function stopBot() {
  try {
    if (sock) {
      await sock.logout();
      logger.info('🛑 Bot desconectado com sucesso');
    }
  } catch (error) {
    logger.error('Erro ao desconectar bot:', error);
  }
}

// Lidar com sinais de encerramento
process.on('SIGINT', async () => {
  logger.info('🛑 Recebido sinal de encerramento...');
  await stopBot();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Recebido sinal de término...');
  await stopBot();
  process.exit(0);
});

// Lidar com erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejeitada não tratada:', reason);
  process.exit(1);
});

// Iniciar o bot
if (require.main === module) {
  startBot();
}

module.exports = {
  startBot,
  stopBot,
  sendMessage,
};