import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import Stock from './pages/Stock';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Export from './pages/Export';
import Invoice from './pages/Invoice';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import MoneyTransactions from './pages/MoneyTransactions';
import { useStore } from './store/useStore';
import { useEffect } from 'react';

function App() {
  const isDarkMode = useStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        <Route 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/entry" element={<DataEntry />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/money" element={<MoneyTransactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/export" element={<Export />} />
          <Route path="/invoice" element={<Invoice />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
