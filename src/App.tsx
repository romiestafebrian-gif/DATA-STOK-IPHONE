import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const { user, profile, loading } = useAuth();

  const isOwner = user?.email === 'romiestafebrian@gmail.com';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan neon-glow-cyan"></div>
      </div>
    );
  }

  const authenticated = (user && profile) || isOwner;

  return (
    <BrowserRouter>
      <Toaster position="top-right" theme="dark" />
      <Routes>
        <Route 
          path="/login" 
          element={authenticated ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/" 
          element={authenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
