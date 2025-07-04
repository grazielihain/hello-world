# 🤖 WhatsApp Bot com OpenAI

Bot inteligente para WhatsApp que utiliza a API da OpenAI para responder perguntas automaticamente. O bot mantém contexto de conversas e possui comandos úteis para uma experiência completa.

## ✨ Funcionalidades

- 🧠 **Respostas Inteligentes**: Utiliza GPT-3.5/GPT-4 para gerar respostas contextuais
- 💬 **Contexto de Conversa**: Mantém histórico de conversas para respostas mais precisas
- 🔧 **Comandos Úteis**: Sistema de comandos para controle do bot
- 📱 **Fácil Configuração**: QR Code para conectar rapidamente
- 🔒 **Seguro**: Suporte a autenticação multi-arquivo
- 📊 **Logs Detalhados**: Sistema de logging para monitoramento
- ⚡ **Reconexão Automática**: Reconecta automaticamente em caso de desconexão

## 🚀 Instalação

### Pré-requisitos

- Node.js 16+ instalado
- Conta na OpenAI com API Key
- WhatsApp instalado no celular

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd whatsapp-openai-bot
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

4. **Edite o arquivo .env** com suas configurações:
```env
OPENAI_API_KEY=sua_api_key_aqui
BOT_NAME=Seu Bot AI
OPENAI_MODEL=gpt-3.5-turbo
```

5. **Inicie o bot**
```bash
npm start
```

6. **Escaneie o QR Code** que aparecerá no terminal com seu WhatsApp

## 📋 Comandos Disponíveis

- `/help` ou `/ajuda` - Mostra lista de comandos
- `/sobre` - Informações sobre o bot
- `/limpar` - Limpa histórico da conversa
- Qualquer outra mensagem será processada pela IA

## 🔧 Configuração Avançada

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `OPENAI_API_KEY` | Chave da API OpenAI | *obrigatório* |
| `OPENAI_MODEL` | Modelo a ser usado | `gpt-3.5-turbo` |
| `OPENAI_MAX_TOKENS` | Máximo de tokens por resposta | `1000` |
| `OPENAI_TEMPERATURE` | Criatividade das respostas (0-1) | `0.7` |
| `BOT_NAME` | Nome do bot | `WhatsApp AI Bot` |
| `LOG_LEVEL` | Nível de log | `info` |

### Modelos Disponíveis

- `gpt-3.5-turbo` - Mais rápido e econômico
- `gpt-4` - Mais preciso (requer acesso)
- `gpt-4-turbo` - Melhor performance

## 📝 Scripts NPM

```bash
npm start     # Inicia o bot
npm run dev   # Inicia em modo desenvolvimento (com nodemon)
```

## 🛡️ Segurança

- Mantenha sua API Key da OpenAI segura
- O arquivo `.env` não deve ser enviado ao repositório
- Os dados de autenticação ficam na pasta `auth_info/`

## 🐛 Solução de Problemas

### Bot não conecta
1. Verifique se o QR Code foi escaneado corretamente
2. Certifique-se que o WhatsApp Web não está ativo em outro lugar
3. Verifique a conexão com a internet

### Erro de API Key
1. Verifique se a API Key está correta no arquivo `.env`
2. Confirme se há saldo/créditos na sua conta OpenAI
3. Verifique se a API Key tem permissões adequadas

### Erro de dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoramento

O bot inclui logging detalhado que mostra:
- Mensagens recebidas e enviadas
- Erros da API OpenAI
- Status da conexão
- Uso de tokens

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- [Baileys](https://github.com/WhiskeySockets/Baileys) - Biblioteca WhatsApp
- [OpenAI](https://openai.com/) - API de IA
- Comunidade open source

## 📞 Suporte

Se encontrar problemas ou tiver dúvidas:
1. Verifique a seção de solução de problemas
2. Consulte as issues do repositório
3. Abra uma nova issue se necessário

---

**⚠️ Aviso**: Este bot é para uso educacional e pessoal. Respeite os termos de uso do WhatsApp e da OpenAI.