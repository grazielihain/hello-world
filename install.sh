#!/bin/bash

# Script de instalação rápida para WhatsApp Bot com OpenAI
# Para Linux e macOS

set -e

echo "🤖 Instalação do WhatsApp Bot com OpenAI"
echo "========================================"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "Por favor, instale Node.js 16+ antes de continuar."
    echo "Visite: https://nodejs.org/"
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js versão 16+ é necessária!"
    echo "Versão atual: $(node --version)"
    echo "Por favor, atualize o Node.js."
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado!"
    echo "Por favor, instale npm antes de continuar."
    exit 1
fi

echo "✅ npm $(npm --version) encontrado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas com sucesso!"
else
    echo "❌ Erro ao instalar dependências!"
    exit 1
fi

# Executar configuração inicial
echo "🔧 Iniciando configuração..."
node setup.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Instalação concluída com sucesso!"
    echo ""
    echo "Para iniciar o bot, execute:"
    echo "  npm start"
    echo ""
    echo "Para testar a configuração:"
    echo "  npm test"
    echo ""
    echo "Para obter ajuda:"
    echo "  node example-usage.js"
    echo ""
else
    echo "❌ Erro durante a configuração!"
    echo "Você pode executar 'npm run setup' novamente para reconfigurar."
    exit 1
fi