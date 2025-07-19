# Claude Instructions for Jungle Speed Project

## Project Structure
This is a multiplayer web-based Jungle Speed card game with:
- **Frontend**: React TypeScript application in `/frontend/`
- **Backend**: Node.js Socket.IO server in `/backend/`

## Important: Directories to Ignore
- **`backend-rust/`** - Experimental Rust backend, do not use or reference
- Use only the Node.js backend in `/backend/` directory

## Development Preferences
- Focus on the Node.js/TypeScript stack
- Main backend server file: `/backend/server.js`
- Frontend uses React with TypeScript and Socket.IO client

## Running the Application

### Local Development
- Backend tests: `npm test` in `/backend/`
- Frontend tests: `npm test` in `/frontend/`
- To run backend: `npm start` in `/backend/`
- To run frontend: `npm start` in `/frontend/`

### Internet Exposure
To expose the game to the internet for remote multiplayer:

#### Option 1: LocalTunnel (Simple)
```bash
./expose-to-internet.sh
```

#### Option 2: CloudFlare Tunnel (Recommended)
```bash
./expose-to-internet-cloudflare-tunnel.sh
```

Both scripts:
- Automatically install required tunneling software
- Configure both frontend and backend for internet access
- Handle CORS and environment configuration
- Restore local configuration when stopped with Ctrl+C

**LocalTunnel**: Uses predictable URLs (`jungle-speed-frontend.loca.lt`)
**CloudFlare Tunnel**: More reliable, uses random URLs (`abc123.trycloudflare.com`)

Share the frontend URL with players to join from anywhere on the internet.

See `INTERNET_EXPOSURE.md` for detailed documentation on both tunneling options.