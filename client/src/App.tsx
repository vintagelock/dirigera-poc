import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStatus } from './api/queries';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Devices } from './pages/Devices';
import { Setup } from './pages/Setup';
import { Debug } from './pages/Debug';

function App() {
  const { data, isLoading } = useAuthStatus();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-text-muted">Connecting…</div>;
  }

  const paired = data?.paired ?? false;

  return (
    <AppShell paired={paired}>
      <Routes>
        <Route path="/" element={paired ? <Dashboard /> : <Setup />} />
        <Route path="/devices" element={paired ? <Devices /> : <Navigate to="/" replace />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default App;
