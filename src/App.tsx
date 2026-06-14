import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth';
import type { UserRole } from './lib/types';
import { Layout } from './components/Layout';
import SignIn from './pages/SignIn';

// Clinician/owner side
import Dashboard from './pages/clinician/Dashboard';
import Clients from './pages/clinician/Clients';
import ClientDetail from './pages/clinician/ClientDetail';
import Schedule from './pages/clinician/Schedule';
import Settings from './pages/clinician/Settings';

// Patient companion (stub)
import CompanionHome from './pages/patient/CompanionHome';
import Journal from './pages/patient/Journal';
import Homework from './pages/patient/Homework';

function RequireRole({
  roles,
  children,
}: {
  roles: UserRole[];
  children: JSX.Element;
}) {
  const { session, profile, loading } = useAuth();
  if (loading) return <div className="centered">Loading…</div>;
  if (!session) return <Navigate to="/signin" replace />;
  if (profile && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const { session, profile } = useAuth();

  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />

      <Route
        path="/"
        element={
          session ? (
            <Navigate
              to={profile?.role === 'patient' ? '/companion' : '/dashboard'}
              replace
            />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />

      {/* Clinician / owner / admin */}
      <Route
        element={
          <RequireRole roles={['owner', 'clinician', 'admin']}>
            <Layout variant="clinician" />
          </RequireRole>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Patient companion */}
      <Route
        element={
          <RequireRole roles={['patient']}>
            <Layout variant="patient" />
          </RequireRole>
        }
      >
        <Route path="/companion" element={<CompanionHome />} />
        <Route path="/companion/journal" element={<Journal />} />
        <Route path="/companion/homework" element={<Homework />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
