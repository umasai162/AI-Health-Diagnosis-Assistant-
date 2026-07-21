import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../api/axios';
import {
  FiFileText, FiActivity, FiUpload, FiMessageSquare,
  FiAlertTriangle, FiCheckCircle, FiClock, FiTrendingUp
} from 'react-icons/fi';

const s = {
  greeting: { marginBottom: 32 },
  greetTitle: { fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 },
  greetSub: { color: '#64748b', fontSize: 15 },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16, marginBottom: 32,
  },
  statCard: {
    background: 'var(--bg-card)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, padding: '20px 24px',
    display: 'flex', alignItems: 'center', gap: 16,
    transition: 'all 0.2s',
  },
  statIcon: {
    width: 48, height: 48, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statNum: { fontSize: 28, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 },
  sectionCard: {
    background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, padding: 24,
  },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  reportItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  reportName: { fontSize: 14, fontWeight: 500, color: '#e2e8f0' },
  reportDate: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statusBadge: {
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
  },
  ctaBanner: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: 16, padding: '24px 28px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 32,
  },
  ctaTitle: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 },
  ctaSub: { color: '#94a3b8', fontSize: 14 },
  uploadBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none', borderRadius: 10, color: 'white',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    textDecoration: 'none', whiteSpace: 'nowrap',
    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
  },
};

const statusStyle = (status) => ({
  analyzed: { background: 'rgba(16,185,129,0.15)', color: '#10b981' },
  uploaded: { background: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  error: { background: 'rgba(239,68,68,0.15)', color: '#ef4444' },
}[status] || { background: 'rgba(100,116,139,0.15)', color: '#94a3b8' });

const statsConfig = [
  { label: 'Total Reports', key: 'total', icon: FiFileText, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  { label: 'Analyzed', key: 'analyzed', icon: FiCheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  { label: 'Pending', key: 'pending', icon: FiClock, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { label: 'Chats', key: 'chats', icon: FiMessageSquare, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
];

function fmt(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/').then((r) => setReports(r.data.reports || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: reports.length,
    analyzed: reports.filter((r) => r.status === 'analyzed').length,
    pending: reports.filter((r) => r.status !== 'analyzed').length,
    chats: 0,
  };

  const recent = [...reports].sort((a, b) => new Date(b.upload_date || b.created_at) - new Date(a.upload_date || a.created_at)).slice(0, 5);

  return (
    <Layout>
      <div style={s.greeting} className="animate-in">
        <h1 style={s.greetTitle}>Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={s.greetSub}>Here's an overview of your health reports and recent activity.</p>
      </div>

      {/* CTA Banner */}
      <div style={s.ctaBanner}>
        <div>
          <div style={s.ctaTitle}>Upload a Medical Report</div>
          <div style={s.ctaSub}>Get AI-powered analysis, diet plan, and personalized health guidance.</div>
        </div>
        <Link to="/upload" style={s.uploadBtn}>
          <FiUpload size={16} /> Upload Report
        </Link>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        {statsConfig.map(({ label, key, icon: Icon, color, bg }) => (
          <div key={key} style={s.statCard}>
            <div style={{ ...s.statIcon, background: bg }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={s.statNum}>{stats[key]}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div style={s.sectionCard}>
        <div style={s.sectionTitle}>
          <FiActivity size={18} color="#6366f1" /> Recent Reports
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32 }}><span className="spinner" /></div>
        ) : recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>
            No reports yet. <Link to="/upload" style={{ color: '#818cf8' }}>Upload one</Link> to get started.
          </div>
        ) : (
          recent.map((r) => (
            <div key={r.id} style={s.reportItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FiFileText size={18} color="#64748b" />
                <div>
                  <div style={s.reportName}>{r.filename}</div>
                  <div style={s.reportDate}>{fmt(r.upload_date || r.created_at)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ ...s.statusBadge, ...statusStyle(r.status) }}>{r.status}</span>
                {r.status === 'analyzed' && (
                  <Link to={`/analysis/${r.id}`} style={{ color: '#818cf8', fontSize: 13, textDecoration: 'none' }}>View →</Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
