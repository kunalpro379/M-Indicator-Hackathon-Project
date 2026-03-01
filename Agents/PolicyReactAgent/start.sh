#!/bin/bash

# Start Policy REACT Agent API Server

echo "🚀 Starting Policy REACT Agent..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env with your database credentials"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt
pip install flask==3.0.0 axios==0.9.0

# Start the API server
echo "✅ Starting API server on port 5000..."
python api_integration.py
