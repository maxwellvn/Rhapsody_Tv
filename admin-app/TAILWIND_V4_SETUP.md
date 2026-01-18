# Tailwind CSS v4 Setup (Official Method)

## ✅ Updated to Tailwind v4 with Official Vite Plugin

I've updated the setup to use **Tailwind CSS v4** with the official `@tailwindcss/vite` plugin, which is the recommended approach for 2024/2025.

## What Changed

### 1. Package Dependencies
- ✅ Updated to `tailwindcss@^4.0.0`
- ✅ Added `@tailwindcss/vite@^4.0.0` plugin
- ❌ Removed `postcss` and `autoprefixer` (handled by Vite plugin now)

### 2. Vite Configuration
- ✅ Added `tailwindcss()` plugin to Vite config
- ✅ No need for PostCSS config anymore

### 3. CSS Import
- ✅ Changed from `@tailwind` directives to `@import "tailwindcss"`
- ✅ This is the new v4 syntax

### 4. Config File
- ✅ Kept `tailwind.config.js` for custom theme extensions
- ✅ In v4, config file is optional but still needed for custom colors/themes

## Official Setup Process (For Reference)

According to Tailwind v4 docs, the proper setup is:

```bash
# Install Tailwind v4 and Vite plugin
npm install -D tailwindcss@next @tailwindcss/vite

# No need for: npx tailwindcss init
# No need for: postcss.config.js
```

Then in `vite.config.ts`:
```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add this
  ],
})
```

And in CSS:
```css
@import "tailwindcss";
```

## Benefits of v4

- ✅ **5x faster builds** - Massive performance improvement
- ✅ **Simpler setup** - No PostCSS config needed
- ✅ **Vite plugin** - Native integration
- ✅ **CSS-first config** - Can configure in CSS if preferred
- ✅ **Modern browsers** - Optimized for current browsers

## Installation

After updating `package.json`, run:

```bash
cd admin-app
npm install
```

This will install:
- `tailwindcss@^4.0.0`
- `@tailwindcss/vite@^4.0.0`

And remove (if they exist):
- `postcss` (no longer needed)
- `autoprefixer` (handled by plugin)

## Verification

After installation, verify it works:

```bash
npm run dev
```

Tailwind classes should work immediately. The Vite plugin handles everything automatically.

---

**Note**: Tailwind v4 requires Node.js 20+. Make sure you have the latest Node.js version.
