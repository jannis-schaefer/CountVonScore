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

### Using Helper Scripts (Recommended on Windows)

If npm/node aren't in your PATH, use these helper scripts:

**PowerShell:**
```powershell
# Start development server
.\dev.ps1

# Build for production
.\build.ps1

# General npm wrapper
.\npm-wrapper.ps1 run dev
.\npm-wrapper.ps1 install
.\npm-wrapper.ps1 run build
```

**Command Prompt (batch file):**
```bash
npm-wrapper.bat run dev
npm-wrapper.bat run build
npm-wrapper.bat install
```

### Direct npm Commands

If npm/node work in your terminal:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm lint
```

## Troubleshooting npm/node Issues

### Quick Fixes

1. **Use helper scripts** (easiest):
   ```powershell
   .\dev.ps1              # Start dev server
   .\build.ps1            # Build for production
   .\npm-wrapper.ps1 install   # Run any npm command
   ```

2. **Fix PATH permanently** (PowerShell):
   - Open PowerShell as Admin
   - Run: `notepad $PROFILE`
   - Add this line:
     ```powershell
     $env:PATH = "C:\Program Files\nodejs;$env:PATH"
     ```
   - Save, close, reopen PowerShell

3. **Check if Node.js is installed**:
   ```powershell
   & 'C:\Program Files\nodejs\node.exe' --version
   ```

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

1. Use `.\dev.ps1` or `.\npm-wrapper.ps1 run dev` if npm isn't working
2. Clear browser cache (Ctrl+Shift+Delete)
3. Close/reopen the app
4. Check browser console for errors (F12)
5. Ensure JavaScript is enabled

For persistent npm issues:
```powershell
# Add Node.js path permanently
$profile_content = @"
if (Test-Path 'C:\Program Files\nodejs') {
    `$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH
}
"@

Add-Content -Path $PROFILE -Value $profile_content
```

## License

MIT
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
