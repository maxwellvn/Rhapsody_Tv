# shadcn/ui Setup Guide

## ✅ Setup Complete

The admin app is now configured to use **shadcn/ui** components with the latest stable dependencies.

## 📦 Updated Dependencies

All dependencies have been updated to their latest stable versions:

- **React**: `^19.2.3`
- **React DOM**: `^19.2.3`
- **React Router DOM**: `^7.12.0`
- **Axios**: `^1.13.2`
- **TanStack Query**: `^5.90.19`
- **Zustand**: `^5.0.10`
- **React Hook Form**: `^7.71.1`
- **Zod**: `^4.3.5`
- **Lucide React**: `^0.562.0` (for icons)
- **Sonner**: `^2.0.7` (for toast notifications)
- **Class Variance Authority**: `^0.7.1` (required by shadcn/ui)

## 🎨 shadcn/ui Configuration

### Files Created/Updated:

1. **`components.json`** - shadcn/ui configuration file
   - Configured for TypeScript
   - Uses CSS variables for theming
   - Path aliases set up (`@/components`, `@/lib/utils`, etc.)

2. **`src/lib/utils.ts`** - Utility function for class merging
   - Uses `clsx` and `tailwind-merge` for optimal class merging
   - Required by all shadcn/ui components

3. **`src/components/ui/`** - Directory for shadcn/ui components
   - Components will be added here when you run `npx shadcn@latest add [component]`

4. **`src/styles/globals.css`** - Updated with shadcn/ui CSS variables
   - Light and dark mode support
   - CSS variables for colors, borders, radius, etc.

5. **`tailwind.config.js`** - Updated for shadcn/ui compatibility
   - Dark mode support
   - shadcn/ui color system integrated
   - Maintains backward compatibility with existing app colors

## 🚀 How to Use shadcn/ui

### Adding Components

To add shadcn/ui components to your project, use the CLI:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add form
# ... and more
```

### Using Components

Once added, import components from `@/components/ui`:

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table } from '@/components/ui/table';

function MyComponent() {
  return (
    <div>
      <Button>Click me</Button>
      <Input placeholder="Enter text" />
    </div>
  );
}
```

### Using Icons (Lucide React)

```tsx
import { User, Settings, LogOut } from 'lucide-react';

function MyComponent() {
  return (
    <div>
      <User className="w-5 h-5" />
      <Settings className="w-5 h-5" />
      <LogOut className="w-5 h-5" />
    </div>
  );
}
```

### Using Toast Notifications (Sonner)

The Toaster is already set up in `src/main.tsx`. Use it anywhere in your app:

```tsx
import { toast } from 'sonner';

// Success toast
toast.success('Operation successful!');

// Error toast
toast.error('Something went wrong!');

// Info toast
toast.info('Here is some information');

// Warning toast
toast.warning('Please be careful');

// Custom toast
toast('Custom message', {
  description: 'Additional details here',
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
});
```

## 📚 Available Components

Visit [shadcn/ui](https://ui.shadcn.com/docs/components) to see all available components.

## 🎯 Next Steps

1. **Install dependencies**:
   ```bash
   cd admin-app
   npm install
   ```

2. **Add components as needed**:
   ```bash
   npx shadcn@latest add button
   npx shadcn@latest add table
   npx shadcn@latest add form
   # ... etc
   ```

3. **Start building**:
   ```bash
   npm run dev
   ```

## 📝 Notes

- All shadcn/ui components are fully customizable
- Components are copied to your project (not installed as dependencies)
- You can modify components directly in `src/components/ui/`
- The color scheme matches your mobile app's design
- Dark mode is supported but not enabled by default
