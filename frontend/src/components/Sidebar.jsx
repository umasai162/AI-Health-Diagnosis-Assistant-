import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid, FiUpload, FiMessageSquare,
  FiClock, FiUser, FiLogOut, FiActivity
} from 'react-icons/fi';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/upload', label: 'Upload Report', icon: FiUpload },
  { to: '/chat', label: 'AI Doctor Consulting', icon: FiMessageSquare },
  { to: '/history', label: 'History', icon: FiClock },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

const styles = {
  sidebar: {
    width: 240,
    minHeight: '100vh',
    background: '#ffffff',
    borderRight: '1px solid rgba(0,80,160,0.08)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    flexShrink: 0,
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
    boxShadow: '2px 0 12px rgba(0,80,160,0.04)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 20px 28px',
    borderBottom: '1px solid rgba(0,80,160,0.08)',
    marginBottom: 16,
  },
  logoIcon: {
    width: 36,
    height: 36,
    background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 15,
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.2,
  },
  logoSub: { fontSize: 11, color: '#94a3b8', fontWeight: 400 },
  nav: { flex: 1, padding: '0 10px' },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 14px',
    borderRadius: 10,
    color: '#64748b',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s ease',
    marginBottom: 4,
  },
  footer: {
    padding: '16px 10px 0',
    borderTop: '1px solid rgba(0,80,160,0.08)',
    marginTop: 'auto',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    background: 'none',
    border: 'none',
    color: '#dc2626',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <FiActivity size={18} color="white" />
        </div>
        <div>
          <div style={styles.logoText}>AI Health</div>
          <div style={styles.logoSub}>Diagnosis Assistant</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? {
                background: 'rgba(2,132,199,0.08)',
                color: '#0284c7',
                boxShadow: 'inset 3px 0 0 #0284c7',
              } : {}),
            })}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={styles.footer}>
        {user && (
          <div style={{ padding: '0 14px 12px', fontSize: 12, color: '#94a3b8' }}>
            Logged in as <strong style={{ color: '#475569' }}>{user.name}</strong>
          </div>
        )}
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <FiLogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
