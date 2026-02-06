import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { CheckIns } from './pages/CheckIns';
import { Meals } from './pages/Meals';
import { Gym } from './pages/Gym';
import { SessionDetail } from './pages/SessionDetail';
import { Habits } from './pages/Habits';
import { Goals } from './pages/Goals';
import { PRs } from './pages/PRs';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <DataProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />
            <main>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/check-ins" element={<CheckIns />} />
                <Route path="/meals" element={<Meals />} />
                <Route path="/gym" element={<Gym />} />
                <Route path="/gym/:id" element={<SessionDetail />} />
                <Route path="/habits" element={<Habits />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/prs" element={<PRs />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </DataProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
