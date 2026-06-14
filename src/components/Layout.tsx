import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const CLINICIAN_NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/clients', label: 'Clients' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/settings', label: 'Settings' },
];

const PATIENT_NAV = [
  { to: '/companion', label: 'Home' },
  { to: '/companion/journal', label: 'Journal' },
  { to: '/companion/homework', label: 'Exercises' },
];

export function Layout({ variant }: { variant: 'clinician' | 'patient' }) {
  const { profile, signOut } = useAuth();
  const loc = useLocation();
  const nav = variant === 'clinician' ? CLINICIAN_NAV : PATIENT_NAV;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Wellspring</div>
        <nav>
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={loc.pathname === n.to ? 'active' : ''}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="muted">{profile?.full_name ?? profile?.email}</div>
          <button onClick={signOut} className="link-btn">
            Sign out
          </button>
          <p className="disclaimer">
            Wellbeing &amp; admin support. Not a medical device.
          </p>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
