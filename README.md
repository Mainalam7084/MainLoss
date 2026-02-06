# MainLoss

A clean, modern, and minimal fitness tracking application. Track your weight loss journey, nutrition, workouts, and habits - all offline-first. Built with React, Vite, TailwindCSS, and IndexedDB.

## Features

### 📊 Monthly Check-ins
- Track weight, height, waist measurements
- Automatic BMI calculation and categorization
- Weight trend visualization
- Plateau detection alerts

### 🍽️ Meals & Nutrition
- Log meals with photos
- Track calories, protein, carbs, and fat
- Daily totals and weekly averages
- Water intake tracking

### 💪 Gym Sessions
- Log workouts with intensity ratings
- Calendar and list views
- Cardio tracking
- Weekly workout count and streak tracking

### 🏋️ Exercises & Sets
- Track exercises per session
- Automatic volume calculation (sets × reps × weight)
- Exercise history
- Machine photos

### ✓ Habit Tracker
- Daily tracking: water, steps, creatine, stretching, sleep
- Habit score calculation
- Calendar view with visual indicators

### 🎯 Goals & Plan
- Set and track multiple goals
- Progress visualization
- Status indicators (ahead/on track/behind)
- Deadline tracking

### 🏆 PR Tracker
- Automatic personal record detection
- Exercise-specific PRs
- New PR highlights

### ⚙️ Settings
- Export all data as JSON
- Import data from backup
- Clear all data option

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: TailwindCSS with custom design system
- **Animations**: Framer Motion
- **Database**: IndexedDB with Dexie
- **Charts**: Recharts
- **Routing**: React Router DOM
- **Date Handling**: date-fns

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Start the app**: Run `npm run dev` and open http://localhost:5173
2. **Add your first check-in**: Track your starting weight and measurements
3. **Log meals**: Record your nutrition throughout the day
4. **Track workouts**: Log gym sessions and exercises
5. **Monitor habits**: Track daily habits for consistency
6. **Set goals**: Define your targets and track progress
7. **Celebrate PRs**: Watch for automatic personal record detection

## Offline Support

This app works completely offline! All data is stored locally in your browser using IndexedDB. No internet connection required after the initial load.

## Data Management

- **Export**: Download all your data as a JSON file for backup
- **Import**: Restore data from a previous export
- **Privacy**: All data stays on your device - nothing is sent to any server

## Accessibility

- Full keyboard navigation support
- ARIA labels for screen readers
- Focus state indicators
- Respects `prefers-reduced-motion` for animations
- Mobile-first responsive design

## Browser Support

Works in all modern browsers that support:
- ES6+
- IndexedDB
- CSS Grid & Flexbox

## License

MIT

## Contributing

This is a personal project, but feel free to fork and customize for your own use!
