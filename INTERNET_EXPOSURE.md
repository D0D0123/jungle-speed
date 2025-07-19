# Internet Exposure with LocalTunnel

This document explains how to expose the Jungle Speed game to the internet using LocalTunnel, allowing players from anywhere to join your game.

## Quick Start

To expose your game to the internet:

```bash
./expose-to-internet.sh
```

Share the frontend URL with players: `https://jungle-speed-frontend.loca.lt`

## How It Works

The `expose-to-internet.sh` script performs the following steps:

1. **Configuration Setup**
   - Configures frontend to connect to `https://jungle-speed-backend.loca.lt`
   - Sets backend CORS to allow connections from `https://jungle-speed-frontend.loca.lt`

2. **Service Startup**
   - Starts the backend server (Node.js on port 3001)
   - Exposes backend via LocalTunnel with subdomain `jungle-speed-backend`
   - Starts the frontend server (React on port 3000) 
   - Exposes frontend via LocalTunnel with subdomain `jungle-speed-frontend`

3. **Internet Access**
   - Backend accessible at: `https://jungle-speed-backend.loca.lt`
   - Frontend accessible at: `https://jungle-speed-frontend.loca.lt`
   - Players can join from anywhere using the frontend URL

## Technical Details

### LocalTunnel Configuration

LocalTunnel creates secure tunnels to localhost through the `loca.lt` service:

- **Backend Tunnel**: `npx lt --port 3001 --subdomain jungle-speed-backend`
- **Frontend Tunnel**: `npx lt --port 3000 --subdomain jungle-speed-frontend`

### CORS Configuration

The backend is configured to accept connections from LocalTunnel domains:

```javascript
cors: {
  origin: function(origin, callback) {
    if (!origin || 
        origin.includes('localhost') || 
        origin.includes('loca.lt') ||
        origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}
```

### Environment Variables

The script dynamically configures the frontend's backend URL:

- **Local Development**: `REACT_APP_BACKEND_URL=http://localhost:3001`
- **Internet Exposure**: `REACT_APP_BACKEND_URL=https://jungle-speed-backend.loca.lt`

## Usage Instructions

### Starting Internet Exposure

1. Ensure both backend and frontend dependencies are installed:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Run the exposure script:
   ```bash
   ./expose-to-internet.sh
   ```

3. Wait for the services to start (approximately 20-25 seconds)

4. Share the frontend URL with players: `https://jungle-speed-frontend.loca.lt`

### Stopping Services

Press `Ctrl+C` in the terminal running the script. This will:
- Stop all running services
- Close all LocalTunnel connections
- Restore local development configuration

### Expected Output

```
Starting Jungle Speed services and exposing to internet...
Configuring frontend to use backend: https://jungle-speed-backend.loca.lt
Configuring backend CORS for frontend: https://jungle-speed-frontend.loca.lt
Starting backend server...
Exposing backend to internet...
Starting frontend server...
Exposing frontend to internet...

🎉 Services exposed to internet:
📡 Backend: https://jungle-speed-backend.loca.lt
🎮 Frontend: https://jungle-speed-frontend.loca.lt

🔗 Share this URL with players: https://jungle-speed-frontend.loca.lt

Press Ctrl+C to stop all services
```

## Troubleshooting

### "Connecting to server..." Issue

If the frontend shows "Connecting to server..." indefinitely:

1. Check that the backend tunnel is working: visit `https://jungle-speed-backend.loca.lt`
2. Verify the frontend `.env` file contains the correct backend URL
3. Check browser console for CORS or connection errors
4. Try restarting the script

### LocalTunnel Rate Limits

LocalTunnel may have rate limits or temporary unavailability:

- Try using different subdomain names if the default ones are taken
- Wait a few minutes and retry if tunnels fail to establish
- Check LocalTunnel status at their website

### Network Issues

- Ensure your firewall allows outbound connections to `loca.lt`
- Check that ports 3000 and 3001 are available locally
- Verify no other services are using these ports

## CloudFlare Tunnel Setup

### Quick Start with CloudFlare Tunnel

```bash
./expose-to-internet-cloudflare-tunnel.sh
```

This script provides a more reliable alternative to LocalTunnel using CloudFlare's infrastructure.

### How CloudFlare Tunnel Works

1. **Automatic Installation**: The script installs `cloudflared` CLI automatically
2. **Quick Tunnels**: Uses `trycloudflare.com` for instant, no-account-required access
3. **Dynamic Configuration**: Automatically configures frontend/backend communication
4. **Better Reliability**: CloudFlare's global network provides better uptime

### Expected Output (CloudFlare Tunnel)

```
Starting Jungle Speed services and exposing to internet via CloudFlare Tunnel...
📡 Using trycloudflare.com (no account required)
⚠️  URLs will be randomly generated and temporary
🔧 Frontend will be configured after backend tunnel is established
🔧 Configuring backend CORS for CloudFlare tunnel
🚀 Starting backend server...
🌐 Creating CloudFlare tunnel for backend...
⏳ Waiting for backend tunnel to establish...
✅ Backend tunnel established: https://abc123.trycloudflare.com
🔧 Configuring frontend to use backend: https://abc123.trycloudflare.com
🚀 Starting frontend server...
🌐 Creating CloudFlare tunnel for frontend...
⏳ Waiting for frontend tunnel to establish...
✅ Frontend tunnel established: https://def456.trycloudflare.com

🎉 Services exposed to internet via CloudFlare Tunnel:
📡 Backend: https://abc123.trycloudflare.com
🎮 Frontend: https://def456.trycloudflare.com

🔗 Share this URL with players: https://def456.trycloudflare.com
```

### Custom Domains (Optional)

To use custom domains with CloudFlare Tunnel:

1. Set up a CloudFlare account
2. Add your domain to CloudFlare
3. Edit the script variables:
   ```bash
   DOMAIN_NAME="yourdomain.com"
   BACKEND_SUBDOMAIN="jungle-speed-backend"
   FRONTEND_SUBDOMAIN="jungle-speed-frontend"
   ```
4. Follow CloudFlare's tunnel authentication setup

### CloudFlare Tunnel Troubleshooting

#### Installation Issues

- **macOS**: Requires Homebrew for automatic installation
- **Linux**: Requires `wget` and `dpkg` for automatic installation
- **Manual Installation**: Download from [CloudFlare releases](https://github.com/cloudflare/cloudflared/releases)

#### Tunnel Connection Issues

- Check `backend-tunnel.log` and `frontend-tunnel.log` for error details
- Verify internet connection and CloudFlare service status
- Try restarting the script if tunnels fail to establish

#### Performance Considerations

- CloudFlare Tunnel generally provides better performance than LocalTunnel
- `trycloudflare.com` domains are temporary and change on each run
- For production use, consider setting up named tunnels with custom domains

## Security Considerations

- LocalTunnel exposes your local services to the public internet
- Anyone with the URLs can access your game
- The tunnels are temporary and will close when the script stops
- Consider using more secure tunneling solutions for production use

## Alternative Solutions

### CloudFlare Tunnel (Recommended Alternative)

For a more reliable solution, use CloudFlare Tunnel:

```bash
./expose-to-internet-cloudflare-tunnel.sh
```

**Advantages:**
- More reliable than LocalTunnel
- Better performance and uptime
- Free tier available with `trycloudflare.com` domains
- No account required for basic usage
- Production-ready infrastructure

**Requirements:**
- `cloudflared` CLI (auto-installed by script)
- For custom domains: CloudFlare account and domain

### Other Alternatives

If neither LocalTunnel nor CloudFlare Tunnel work for your setup:

- **ngrok**: More reliable but requires account for persistent subdomains
- **SSH Tunnels**: If you have access to a public server
- **VPS Deployment**: Deploy to a cloud server for permanent access