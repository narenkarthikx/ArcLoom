import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/Calendar';
import TasksPage from './pages/Tasks';
import HabitsPage from './pages/Habits';
import NotesPage from './pages/Notes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="notes" element={<NotesPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
