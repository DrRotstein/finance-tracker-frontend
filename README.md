# Finance Tracker — Frontend

React + TypeScript SPA for the Finance Tracker application.

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite 5
- **Language:** TypeScript 5
- **Containerization:** Docker

## Getting Started

### Prerequisites

- Node.js >= 20
- Docker & Docker Compose (optional)

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Docker

```bash
# Build and run
docker-compose up --build
```

## Project Structure

```
src/
├── App.tsx               # Root component
├── main.tsx              # Entry point
├── index.css             # Global styles
├── components/           # Shared components (added per Epic)
├── pages/                # Page components (added per Epic)
└── services/             # API client layer (added per Epic)
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:4000` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint source files |
