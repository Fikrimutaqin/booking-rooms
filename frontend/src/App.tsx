import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';

function LoginWrapper() {
  const navigate = useNavigate();
  return <LoginPage onLogin={() => navigate('/dashboard')} />;
}

function DashboardWrapper() {
  const navigate = useNavigate();
  return <DashboardPage onLogout={() => navigate('/login')} />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page awal diarahkan ke /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Route Halaman Login */}
        <Route path="/login" element={<LoginWrapper />} />

        {/* Route Halaman Dashboard */}
        <Route path="/dashboard" element={<DashboardWrapper />} />

        {/* Fallback route untuk URL yang tidak terdaftar */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
