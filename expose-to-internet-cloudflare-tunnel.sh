#!/bin/bash

# Script to expose Jungle Speed frontend and backend to the internet using CloudFlare Tunnel

echo "Starting Jungle Speed services and exposing to internet via CloudFlare Tunnel..."

# Configuration - customize these variables
TUNNEL_NAME="jungle-speed-$(date +%s)"  # Unique tunnel name
BACKEND_SUBDOMAIN="jungle-speed-backend"
FRONTEND_SUBDOMAIN="jungle-speed-frontend"
DOMAIN_NAME=""  # Leave empty to use auto-generated .trycloudflare.com domain

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared is not installed. Installing..."
    
    # Detect OS and install cloudflared
    case "$(uname -s)" in
        Darwin)
            echo "📥 Installing cloudflared via Homebrew..."
            if command -v brew &> /dev/null; then
                brew install cloudflare/cloudflare/cloudflared
            else
                echo "❌ Homebrew not found. Please install cloudflared manually:"
                echo "   https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
                exit 1
            fi
            ;;
        Linux)
            echo "📥 Installing cloudflared for Linux..."
            # Download latest cloudflared for Linux
            ARCH=$(dpkg --print-architecture 2>/dev/null || echo "amd64")
            wget -q "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH}.deb"
            sudo dpkg -i "cloudflared-linux-${ARCH}.deb"
            rm "cloudflared-linux-${ARCH}.deb"
            ;;
        *)
            echo "❌ Unsupported OS. Please install cloudflared manually:"
            echo "   https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
            exit 1
            ;;
    esac
fi

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node server.js"
pkill -f "react-scripts start"
pkill -f "cloudflared tunnel"

# Function to cleanup on exit
cleanup() {
    echo "🧹 Stopping all services..."
    kill $BACKEND_PID $FRONTEND_PID $BACKEND_TUNNEL_PID $FRONTEND_TUNNEL_PID 2>/dev/null
    pkill -f "node server.js"
    pkill -f "react-scripts start"
    pkill -f "cloudflared tunnel"
    
    # Restore local configuration
    echo "🔧 Restoring local configuration..."
    cd frontend 2>/dev/null
    echo "REACT_APP_BACKEND_URL=http://localhost:3001" > .env
    
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Determine tunnel URLs
if [ -n "$DOMAIN_NAME" ]; then
    BACKEND_URL="https://${BACKEND_SUBDOMAIN}.${DOMAIN_NAME}"
    FRONTEND_URL="https://${FRONTEND_SUBDOMAIN}.${DOMAIN_NAME}"
    echo "📡 Using custom domain: $DOMAIN_NAME"
    echo "⚠️  Note: Custom domains require CloudFlare account setup"
else
    # Using trycloudflare.com (free, temporary URLs)
    echo "📡 Using trycloudflare.com (no account required)"
    echo "⚠️  URLs will be randomly generated and temporary"
fi

# Configure frontend to use CloudFlare tunnel backend
if [ -n "$DOMAIN_NAME" ]; then
    echo "🔧 Configuring frontend to use backend: $BACKEND_URL"
    cd frontend
    echo "REACT_APP_BACKEND_URL=$BACKEND_URL" > .env
    cd ..
else
    echo "🔧 Frontend will be configured after backend tunnel is established"
fi

# Configure backend CORS for CloudFlare tunnel
echo "🔧 Configuring backend CORS for CloudFlare tunnel"
cd backend

# Set environment variables for CloudFlare tunnel
if [ -n "$DOMAIN_NAME" ]; then
    export FRONTEND_URL="$FRONTEND_URL"
fi

# Start backend in background
echo "🚀 Starting backend server..."
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start backend tunnel
echo "🌐 Creating CloudFlare tunnel for backend..."
if [ -n "$DOMAIN_NAME" ]; then
    # Named tunnel with custom domain (requires CF account)
    cloudflared tunnel --hostname "$BACKEND_URL" --url http://localhost:3001 &
    BACKEND_TUNNEL_PID=$!
else
    # Quick tunnel with trycloudflare.com
    cloudflared tunnel --url http://localhost:3001 > backend-tunnel.log 2>&1 &
    BACKEND_TUNNEL_PID=$!
    
    # Wait for tunnel to establish and get URL
    echo "⏳ Waiting for backend tunnel to establish..."
    sleep 8
    
    # Extract backend URL from logs
    BACKEND_URL=$(grep -o 'https://.*\.trycloudflare\.com' backend-tunnel.log | head -1)
    
    if [ -n "$BACKEND_URL" ]; then
        echo "✅ Backend tunnel established: $BACKEND_URL"
        
        # Configure frontend with actual backend URL
        echo "🔧 Configuring frontend to use backend: $BACKEND_URL"
        cd ../frontend
        echo "REACT_APP_BACKEND_URL=$BACKEND_URL" > .env
        cd ..
        export FRONTEND_URL=""  # Will be set after frontend tunnel
    else
        echo "❌ Failed to establish backend tunnel"
        cleanup
        exit 1
    fi
fi

# Start frontend in background
echo "🚀 Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 12

# Start frontend tunnel
echo "🌐 Creating CloudFlare tunnel for frontend..."
if [ -n "$DOMAIN_NAME" ]; then
    # Named tunnel with custom domain
    cloudflared tunnel --hostname "$FRONTEND_URL" --url http://localhost:3000 &
    FRONTEND_TUNNEL_PID=$!
else
    # Quick tunnel with trycloudflare.com
    cloudflared tunnel --url http://localhost:3000 > frontend-tunnel.log 2>&1 &
    FRONTEND_TUNNEL_PID=$!
    
    # Wait for tunnel to establish and get URL
    echo "⏳ Waiting for frontend tunnel to establish..."
    sleep 8
    
    # Extract frontend URL from logs
    FRONTEND_URL=$(grep -o 'https://.*\.trycloudflare\.com' frontend-tunnel.log | head -1)
    
    if [ -n "$FRONTEND_URL" ]; then
        echo "✅ Frontend tunnel established: $FRONTEND_URL"
    else
        echo "❌ Failed to establish frontend tunnel"
        cleanup
        exit 1
    fi
fi

cd ..

echo ""
echo "🎉 Services exposed to internet via CloudFlare Tunnel:"
echo "📡 Backend: $BACKEND_URL"
echo "🎮 Frontend: $FRONTEND_URL"
echo ""
echo "🔗 Share this URL with players: $FRONTEND_URL"
echo ""
if [ -z "$DOMAIN_NAME" ]; then
    echo "💡 Note: These are temporary URLs from trycloudflare.com"
    echo "   For permanent URLs, set up a CloudFlare account and custom domain"
fi
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait