#!/bin/sh

echo "🔨 Building NutrIA Dashboard..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install --production

# Build frontend
echo "🎨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Build complete!"
