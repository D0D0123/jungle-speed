#!/bin/bash

# Script to expose Jungle Speed frontend and backend to the internet using localtunnel

echo "Starting Jungle Speed services and exposing to internet..."

# Kill any existing processes
pkill -f "node server.js"
pkill -f "react-scripts start"
pkill -f "lt --port"

# Set URLs for internet access
BACKEND_URL="https://jungle-speed-backend.loca.lt"
FRONTEND_URL="https://jungle-speed-frontend.loca.lt"

# Configure frontend to use internet backend
echo "Configuring frontend to use backend: $BACKEND_URL"
cd frontend
echo "REACT_APP_BACKEND_URL=$BACKEND_URL" > .env
cd ..

# Configure backend to allow frontend CORS
echo "Configuring backend CORS for frontend: $FRONTEND_URL"
cd backend
export FRONTEND_URL="$FRONTEND_URL"

# Start backend in background
echo "Starting backend server..."
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Expose backend (port 3001) to internet first
echo "Exposing backend to internet..."
npx lt --port 3001 --subdomain jungle-speed-backend &
BACKEND_TUNNEL_PID=$!

# Wait for backend tunnel to establish
sleep 8

# Start frontend in background
echo "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 12

# Expose frontend (port 3000) to internet
echo "Exposing frontend to internet..."
npx lt --port 3000 --subdomain jungle-speed-frontend &
FRONTEND_TUNNEL_PID=$!

echo ""
echo "🎉 Services exposed to internet:"
echo "📡 Backend: https://jungle-speed-backend.loca.lt"
echo "🎮 Frontend: https://jungle-speed-frontend.loca.lt"
echo ""
echo "🔗 Share this URL with players: https://jungle-speed-frontend.loca.lt"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo "🧹 Stopping all services..."
    kill $BACKEND_PID $FRONTEND_PID $BACKEND_TUNNEL_PID $FRONTEND_TUNNEL_PID 2>/dev/null
    pkill -f "node server.js"
    pkill -f "react-scripts start"
    pkill -f "lt --port"
    
    # Restore local configuration
    echo "🔧 Restoring local configuration..."
    cd frontend 2>/dev/null
    echo "REACT_APP_BACKEND_URL=http://localhost:3001" > .env
    
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for user to stop
wait