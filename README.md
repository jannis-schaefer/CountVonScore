# Star Realms Counter - PWA

A multiplayer resource counter for the turn-based card game **Star Realms**, built as a Progressive Web App (PWA).

## Features

- 🎮 **Two Game Modes**: Shared Device (turn-based) and Multiplayer (individual tracking)
- 📱 **Mobile-First**: Responsive design for phones, tablets, and desktops
- 🎨 **Dual Themes**: Generic dark/light mode + Star Realms branding
- 💾 **Offline Support**: Full PWA with service worker and local storage
- ⚡ **Installable**: Add to home screen on any device
- 🕐 **50-Action History**: Undo recent moves easily
- ⚙️ **Customizable**: Rename counters, add players, adjust game settings

## Quick Start

Install a current Node.js LTS release, then run:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run lint checks
npm run lint
```

If `npm` is unavailable, install Node.js from https://nodejs.org/ and open a new terminal.

## Development

### Project Structure
```
src/
├── store/gameStore.ts          # Zustand state management
├── context/ThemeContext.tsx    # Theme provider
├── components/                 # Reusable components
├── pages/                      # Page components
├── styles/                     # CSS themes (generic + Star Realms)
└── hooks/                      # Custom hooks (useServiceWorker)

public/
├── manifest.json              # PWA configuration
└── sw.js                      # Service worker for offline support
```

### Key Technologies
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Zustand** - State management
- **React Router** - Navigation
- **localforage** - Persistent local storage

## Game Modes

### Shared Device (Turn-based)
- Players take turns on one device
- Large counter display (Authority, Money, Attack)
- Turn navigation with Previous/Next buttons
- View other players' current standings

### Multiplayer (Individual)
- Each player tracks their own resources independently
- Player selection tabs
- All-players standings panel
- Perfect for multiple devices

## Features Explained

### Resources
- **Authority** (green) - Life/health
- **Money** (gold) - Currency
- **Attack** (red) - Combat damage

### Themes
- **Generic** - Neutral dark/light mode
- **Star Realms** - Game-specific styling with vibrant colors

### Game Controls
- **+/−** buttons - Increment/decrement counters
- **Click counter** - Edit value directly
- **Undo** - Revert last 50 actions
- **Reset** - Start new game (with confirmation)
- **Settings** - Customize players, counter names, theme

## PWA Features

The app is fully configured as a PWA:

- ✅ **Installable** - Add to home screen via `manifest.json`
- ✅ **Offline-Ready** - Service worker caches assets
- ✅ **Fast** - Vite builds optimized bundles
- ✅ **Responsive** - Works on all screen sizes
- ✅ **App-like** - Standalone display mode

### Installation

1. **On mobile**: Open in browser → Menu → "Add to Home Screen"
2. **On desktop**: Click address bar icon or Menu → "Install app"

### Deployment

```bash
npm run build
# Output in ./dist/ - upload to your web server
```

## Customization

### Add/Remove Players
Settings → Players section

### Rename Counters
Settings → Counter Names (or use presets)

### Switch Themes
Settings → Theme → Switch Theme

### Quick Presets
Settings → Presets (Star Realms, Magic-Like, etc.)

## Support

Having issues? Try:

1. Confirm Node.js is installed and `npm --version` succeeds.
2. Run `npm install` again.
3. Clear the browser cache.
4. Close and reopen the app.
5. Check the browser console for errors.

## License

MIT
