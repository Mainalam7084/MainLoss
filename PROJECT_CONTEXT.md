# MainLoss - Project Context

> **Last Updated**: February 6, 2026  
> **Version**: 1.0.0  
> **Status**: Production Ready

## Project Overview

**MainLoss** is a clean, modern, and minimal fitness tracking Progressive Web App (PWA) built with React, Vite, and TailwindCSS. The app works completely offline using IndexedDB for local data persistence.

### Key Features
- 📊 **Dashboard** - Overview of fitness metrics and progress
- ⚖️ **Check-ins** - Monthly weight tracking with plateau detection
- 🍽️ **Meals** - Nutrition logging with macros and water intake
- 💪 **Gym** - Workout session tracking with exercise details
- ✓ **Habits** - Daily habit tracking (water, steps, sleep, supplements)
- 🎯 **Goals** - Goal setting and progress monitoring
- 🏆 **PRs** - Personal records tracking
- ⚙️ **Settings** - Data export/import and app information

---

## Tech Stack

### Core Technologies
- **React** 18.3.1 - UI library
- **Vite** 7.3.1 - Build tool and dev server
- **TailwindCSS** 3.4.17 - Utility-first CSS framework
- **Framer Motion** 11.15.0 - Animation library
- **React Router DOM** 7.1.1 - Client-side routing

### Data & Storage
- **Dexie.js** 4.0.10 - IndexedDB wrapper for offline data persistence
- **date-fns** 4.1.0 - Date manipulation utilities

### Icons & UI
- **Lucide React** - Modern icon system (outline style)
- Custom Icon component with size system and accessibility

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## Project Structure

```
MainLoss/
├── public/
│   ├── icons/                    # PWA icons (16-512px + maskable)
│   ├── mainloss-icons-pack/      # Original icon source files
│   ├── favicon.ico               # Browser favicon
│   └── manifest.webmanifest      # PWA manifest
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Icon.jsx          # Reusable icon wrapper
│   │   │   └── index.jsx         # UI component exports
│   │   └── Navigation.jsx        # App navigation
│   ├── context/
│   │   ├── DataContext.jsx       # Global data state
│   │   └── ToastContext.jsx      # Toast notifications
│   ├── db/
│   │   └── database.js           # Dexie IndexedDB setup
│   ├── pages/
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── CheckIns.jsx          # Weight check-ins
│   │   ├── Meals.jsx             # Meal logging
│   │   ├── Gym.jsx               # Gym sessions
│   │   ├── SessionDetail.jsx     # Exercise details
│   │   ├── Habits.jsx            # Habit tracking
│   │   ├── Goals.jsx             # Goal management
│   │   ├── PRs.jsx               # Personal records
│   │   └── Settings.jsx          # App settings
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # App entry point
│   └── index.css                 # Global styles
├── index.html                    # HTML entry point
├── package.json                  # Dependencies
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind configuration
└── README.md                     # Project documentation
```

---

## Design System

### Color Palette
- **Primary Accent**: Emerald (`emerald-600` / `emerald-400`)
- **Neutral Base**: Zinc/Gray for backgrounds and text
- **Dark Theme**: `#09090B` (zinc-950) - Used for PWA theme

### Contextual Colors
- **Blue**: Water tracking
- **Purple**: Supplements (creatine)
- **Green**: Stretching/flexibility
- **Indigo**: Sleep tracking
- **Red**: Danger/delete actions
- **Yellow**: Warnings

### Icon System
**Size System:**
- `sm` (16px) - Navigation, inline icons, small buttons
- `md` (20px) - Toast notifications, form icons
- `lg` (24px) - Section headers, app logo
- `xl` (32px) - Dashboard stat cards, feature highlights

**Icon Mapping:**
- Dashboard: `LayoutDashboard`
- Check-ins: `Scale`
- Meals: `Flame`
- Gym: `Dumbbell`
- Habits: `CheckCircle`
- Goals: `Target`
- PRs: `Trophy`
- Settings: `Settings`

### Typography
- **Font Family**: System font stack (optimized for performance)
- **Headings**: Bold, larger sizes with proper hierarchy
- **Body**: Regular weight, readable line height

---

## Database Schema (IndexedDB via Dexie)

### Tables

#### `checkIns`
```javascript
{
  id: number (auto-increment),
  date: string (YYYY-MM-DD),
  weightKg: number,
  bodyFatPercent: number | null,
  muscleMassKg: number | null,
  notes: string | null,
  photoBlob: Blob | null
}
```

#### `meals`
```javascript
{
  id: number (auto-increment),
  datetime: string (ISO),
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  waterMl: number | null,
  notes: string | null,
  photoBlob: Blob | null
}
```

#### `gymSessions`
```javascript
{
  id: number (auto-increment),
  datetime: string (ISO),
  workoutType: 'strength' | 'cardio' | 'mixed' | 'flexibility',
  durationMin: number,
  intensity: number (1-10),
  notes: string | null
}
```

#### `exercises`
```javascript
{
  id: number (auto-increment),
  sessionId: number (foreign key),
  exerciseName: string,
  sets: number,
  reps: number,
  weightKg: number,
  restSec: number | null,
  machinePhotoBlob: Blob | null,
  volume: number (calculated: sets × reps × weightKg)
}
```

#### `habits`
```javascript
{
  id: number (auto-increment),
  date: string (YYYY-MM-DD),
  waterMl: number | null,
  steps: number | null,
  creatine: boolean,
  stretching: boolean,
  sleepHours: number | null,
  score: number (calculated percentage)
}
```

#### `goals`
```javascript
{
  id: number (auto-increment),
  title: string,
  targetValue: number,
  currentValue: number,
  unit: string,
  deadline: string (YYYY-MM-DD),
  category: 'weight' | 'strength' | 'cardio' | 'habit' | 'other',
  completed: boolean
}
```

#### `prs`
```javascript
{
  id: number (auto-increment),
  exerciseName: string,
  prType: 'max_weight' | 'max_reps' | 'max_volume' | 'fastest_time',
  value: number,
  unit: string,
  achievedDate: string (YYYY-MM-DD),
  notes: string | null
}
```

---

## PWA Configuration

### Manifest (`manifest.webmanifest`)
- **Name**: MainLoss
- **Display**: Standalone
- **Theme Color**: #09090B (dark zinc)
- **Background Color**: #09090B
- **Orientation**: Portrait-primary
- **Icons**: 9 standard sizes + 2 maskable icons

### Icons Available
- 16×16, 32×32, 48×48, 64×64, 128×128, 180×180, 192×192, 256×256, 512×512
- Maskable: 192×192, 512×512

### Installation
- **Desktop**: Install button in Chrome address bar
- **Mobile**: "Add to Home Screen" prompt
- **iOS**: Apple Touch Icon (180×180)

---

## Key Features & Implementation Details

### 1. Offline-First Architecture
- All data stored in IndexedDB via Dexie
- No backend required
- Works completely offline
- Data persists across sessions

### 2. Data Export/Import
- Export all data as JSON file
- Import data from JSON backup
- Clear all data functionality

### 3. Plateau Detection
- Automatic detection of weight plateaus
- Alert shown on dashboard when detected
- Based on recent check-in trends

### 4. PR Tracking
- Automatic PR detection when logging exercises
- Toast notification for new PRs
- Manual PR entry also supported

### 5. Habit Scoring
- Automatic calculation of daily habit completion percentage
- Visual indicators (badges) based on score
- Calendar view with color-coded days

### 6. Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly UI elements

### 7. Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- Respects `prefers-reduced-motion`

---

## Development Workflow

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
npm run preview
```

### Linting
```bash
npm run lint
```

---

## Important Notes for Future Development

### Icon System
- **Always use the `Icon` component** from `src/components/ui/Icon.jsx`
- **Never use emoji icons** - use Lucide React icons instead
- **Available icon**: Check Lucide React documentation for valid icon names
- **Note**: `Stretching` icon doesn't exist - use `Activity` instead

### Database Operations
- Use `dbHelpers` from `src/db/database.js` for CRUD operations
- Always refresh context after mutations
- Handle errors gracefully with try-catch

### Styling
- Use Tailwind utility classes
- Follow existing color scheme (emerald accent)
- Maintain dark mode support
- Keep mobile-first responsive design

### State Management
- Global state via `DataContext`
- Toast notifications via `ToastContext`
- Local state for component-specific data

### Routing
- All routes defined in `App.jsx`
- Use `<Link>` from `react-router-dom` for navigation
- Maintain consistent navigation structure

---

## Recent Changes (February 2026)

### Rebranding to MainLoss
- Updated app name from "Weight Loss Journey" to "MainLoss"
- Changed branding across all files
- Updated README and documentation

### Icon System Overhaul
- Replaced all emoji icons with Lucide React icons
- Created reusable `Icon` component
- Implemented size system (sm, md, lg, xl)
- Added accessibility features
- Added motion animations with reduced-motion support

### PWA Implementation
- Created `/public/icons/` folder structure
- Added all required icon sizes
- Created `manifest.webmanifest`
- Updated `index.html` with PWA metadata
- App now installable on desktop and mobile

---

## Repository Information

- **GitHub**: https://github.com/Mainalam7084/MainLoss.git
- **Branch**: main
- **Initial Commit**: February 6, 2026

---

## Contact & Support

For issues, questions, or contributions, please refer to the GitHub repository.

---

## License

This project is private and proprietary.
