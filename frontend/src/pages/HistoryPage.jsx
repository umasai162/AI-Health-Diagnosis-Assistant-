import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../api/axios';
import { FiFileText, FiTrash2, FiEye, FiSearch, FiFilter } from 'react-icons/fi';

const s = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 800, color: '#f1f5f9' },
  searchBar: {
    display: 'flex', gap: 10, marginBottom: 20,
  },
  searchInput: {
    flex: 1, padding: '10px 14px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#f1f5f9', fontSize: 14,
    fontFamily: 'Inter, sans-serif', outline: 'none',
  },
  filterSelect: {
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#f1f5f9', fontSize: 14,
    fontFamily: 'Inter, sans-serif', outline: 'none',
  },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' },
  th: { padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 },
  td: { padding: '14px 16px', fontSize: 14, color: '#e2e8f0', verticalAlign: 'middle' },
  statusBadge: (s) => ({
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    ...(s === 'analyzed'
      ? { background: 'rgba(16,185,129,0.15)', color: '#10b981' }
      : s === 'uploaded'
      ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8' }
      : { background: 'rgba(239,68,68,0.15)', color: '#ef4444' }),
  }),
  actBtn: (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif',
    background: `rgba(${color},0.1)`, color: `rgb(${color})`,
    textDecoration: 'none', transition: 'all 0.15s',
  }),
  empty: { textAlign: 'center', padding: '60px 0', color: '#64748b' },
};

function fmt(d) {
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function HistoryPage() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/reports/').then((r) => setReports(r.data.reports || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this report? This cannot be undone.')) return;
    try {
      await api.delete(`/reports/${id}`);
      toast.success('Report deleted');
      setReports((r) => r.filter((x) => x.id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = reports.filter((r) => {
    const matchSearch = r.filename.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || r.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <Layout>
      <div className="animate-in">
        <div style={s.header}>
          <h1 style={s.title}>Report History</h1>
          <span style={{ color: '#64748b', fontSize: 14 }}>{reports.length} total</span>
        </div>

        <div style={s.searchBar}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FiSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input style={{ ...s.searchInput, paddingLeft: 36 }} placeholder="Search reports…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select style={s.filterSelect} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="analyzed">Analyzed</option>
            <option value="uploaded">Uploaded</option>
            <option value="error">Error</option>
          </select>
        </div>

        {loading ? (
          <div style={s.empty}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <FiFileText size={40} color="#334155" />
            <p style={{ marginTop: 12 }}>No reports found.</p>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Filename</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} style={s.tr}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FiFileText size={16} color="#64748b" />
                      {r.filename}
                    </div>
                  </td>
                  <td style={{ ...s.td, color: '#64748b', fontSize: 12 }}>{fmt(r.upload_date || r.created_at)}</td>
                  <td style={s.td}><span style={s.statusBadge(r.status)}>{r.status}</span></td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {r.status === 'analyzed' && (
                        <Link to={`/analysis/${r.id}`} style={s.actBtn('59,130,246')}>
                          <FiEye size={13} /> View
                        </Link>
                      )}
                      <button style={s.actBtn('239,68,68')} onClick={() => handleDelete(r.id)}>
                        <FiTrash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
