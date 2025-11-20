#!/bin/bash

echo "🥗 NutrIA Dashboard - Setup"
echo "=========================="
echo ""

# Backend
echo "📦 Instalando dependências do backend..."
npm install

if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais!"
fi

# Frontend
echo ""
echo "📦 Instalando dependências do frontend..."
cd frontend
npm install

if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env do frontend..."
    cp .env.example .env
fi

cd ..

echo ""
echo "✅ Setup completo!"
echo ""
echo "Para iniciar o desenvolvimento:"
echo "  Backend:  npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Não esqueça de configurar o .env com suas credenciais!"
