# Rhapsody TV Admin Dashboard

Admin web application for managing Rhapsody TV platform.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your API base URL:
```
VITE_API_BASE_URL=https://rhapsody-tv-backend.fly.dev/v1
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── services/      # API services
├── hooks/         # Custom React hooks
├── context/       # React context providers
├── utils/         # Utility functions
├── types/         # TypeScript types
├── styles/        # Global styles
└── config/        # Configuration files
```

## 🔐 Authentication

The admin app uses JWT tokens stored in localStorage. Tokens are automatically refreshed when they expire.

## 📚 Documentation

See `IMPLEMENTATION_PLAN.md` for detailed implementation plan and architecture.

## 🛠️ Tech Stack

- React 18
- TypeScript
- Vite
- React Router v6
- TanStack Query
- Zustand
- Tailwind CSS
- Axios
