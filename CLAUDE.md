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

```bash
./expose-to-internet.sh
```

This script:
- Installs and uses LocalTunnel to create public URLs
- Configures both frontend and backend for internet access
- Exposes frontend at: `https://jungle-speed-frontend.loca.lt`
- Exposes backend at: `https://jungle-speed-backend.loca.lt`
- Automatically handles CORS and environment configuration
- Restores local configuration when stopped with Ctrl+C

Share the frontend URL with players to join from anywhere on the internet.

See `INTERNET_EXPOSURE.md` for detailed documentation on how internet exposure works.