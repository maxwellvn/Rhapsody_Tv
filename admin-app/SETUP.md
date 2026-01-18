# 🚀 Admin App Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager

## Initial Setup

### 1. Install Dependencies

```bash
cd admin-app
npm install
```

### 2. Copy Assets from Mobile App

Copy the assets folder from the mobile app to the admin app:

```bash
# Option 1: Manual copy
# Copy ../assets to admin-app/public/assets

# Option 2: Using the script (if available)
node scripts/copy-assets.js
```

### 3. Environment Configuration

Create a `.env` file in the `admin-app` directory:

```bash
cp .env.example .env
```

Update the `.env` file with your API endpoint:

```env
VITE_API_BASE_URL=https://rhapsody-tv-backend.fly.dev/v1
VITE_APP_NAME=Rhapsody TV Admin
VITE_APP_ENV=development
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## Project Structure

```
admin-app/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable components
│   ├── pages/        # Page components
│   ├── services/     # API services
│   ├── hooks/        # Custom hooks
│   ├── context/      # React context
│   ├── utils/        # Utility functions
│   ├── types/         # TypeScript types
│   └── styles/       # Global styles
└── package.json
```

## Next Steps

1. ✅ Project structure created
2. ✅ Authentication system ready
3. ✅ API client configured
4. ⏳ Wait for API endpoints
5. ⏳ Implement CRUD operations
6. ⏳ Add data tables
7. ⏳ Add forms for create/edit

## Development Workflow

1. **Start dev server**: `npm run dev`
2. **Type check**: `npm run type-check`
3. **Lint code**: `npm run lint`
4. **Format code**: `npm run format`
5. **Build for production**: `npm run build`

## Notes

- The login page currently uses mock authentication
- Replace mock login in `src/pages/auth/Login.tsx` when API is ready
- All API endpoints are configured in `src/config/api.config.ts`
- Services are ready in `src/services/api/` directory
