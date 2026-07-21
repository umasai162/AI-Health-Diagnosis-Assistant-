import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FiUser, FiMail, FiPhone, FiLock, FiGlobe, FiSave } from 'react-icons/fi';

const s = {
  title: { fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 28 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  card: {
    background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, padding: 28,
  },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 },
  input: {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 9, color: '#f1f5f9', fontSize: 14,
    fontFamily: 'Inter, sans-serif', outline: 'none',
  },
  select: {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 9, color: '#f1f5f9', fontSize: 14,
    fontFamily: 'Inter, sans-serif', outline: 'none',
  },
  saveBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '11px 24px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none', borderRadius: 9, color: 'white',
    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
    boxShadow: '0 4px 15px rgba(99,102,241,0.3)', marginTop: 4,
  },
  avatar: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 16,
  },
  emailDisplay: { color: '#64748b', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 },
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: '', phone: '', language_preference: 'en' });
  const [password, setPassword] = useState({ old_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (user) setProfile({ name: user.name || '', phone: user.phone || '', language_preference: user.language_preference || 'en' });
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', { name: profile.name, phone: profile.phone, language_preference: profile.language_preference });
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (password.new_password !== password.confirm) { toast.error('New passwords do not match'); return; }
    if (password.new_password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPwdLoading(true);
    try {
      await api.post('/auth/change-password', { old_password: password.old_password, new_password: password.new_password });
      toast.success('Password changed!');
      setPassword({ old_password: '', new_password: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to change password'); }
    finally { setPwdLoading(false); }
  };

  return (
    <Layout>
      <div className="animate-in">
        <h1 style={s.title}>Profile Settings</h1>
        <div style={s.grid}>
          {/* Profile Card */}
          <div style={s.card}>
            <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={s.avatar}>{(user?.name || 'U')[0].toUpperCase()}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>{user?.name}</div>
              <div style={{ ...s.emailDisplay, justifyContent: 'center', marginTop: 4 }}>
                <FiMail size={13} />{user?.email}
              </div>
            </div>
            <div style={s.cardTitle}><FiUser size={16} color="#6366f1" /> Personal Information</div>
            <form onSubmit={saveProfile}>
              <div style={s.formGroup}>
                <label style={s.label}>Full Name</label>
                <input style={s.input} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Phone Number</label>
                <input style={s.input} value={profile.phone} placeholder="+91 9999999999" onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}><FiGlobe size={11} style={{ marginRight: 4 }} />Language Preference</label>
                <select style={s.select} value={profile.language_preference} onChange={(e) => setProfile({ ...profile, language_preference: e.target.value })}>
                  <option value="en">English</option>
                  <option value="te">Telugu (తెలుగు)</option>
                </select>
              </div>
              <button type="submit" style={s.saveBtn} disabled={loading}>
                {loading ? <span className="spinner" /> : <><FiSave size={15} /> Save Changes</>}
              </button>
            </form>
          </div>

          {/* Password Card */}
          <div style={s.card}>
            <div style={s.cardTitle}><FiLock size={16} color="#8b5cf6" /> Change Password</div>
            <form onSubmit={changePassword}>
              <div style={s.formGroup}>
                <label style={s.label}>Current Password</label>
                <input type="password" style={s.input} value={password.old_password}
                  onChange={(e) => setPassword({ ...password, old_password: e.target.value })} />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>New Password</label>
                <input type="password" style={s.input} value={password.new_password}
                  onChange={(e) => setPassword({ ...password, new_password: e.target.value })} />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Confirm New Password</label>
                <input type="password" style={s.input} value={password.confirm}
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })} />
              </div>
              <button type="submit" style={{ ...s.saveBtn, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }} disabled={pwdLoading}>
                {pwdLoading ? <span className="spinner" /> : <><FiLock size={15} /> Update Password</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
