import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiActivity, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../api/axios';

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f7ff 50%, #dbeafe 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  container: { width: '100%', maxWidth: 440 },
  header: { textAlign: 'center', marginBottom: 40 },
  logoWrap: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 64, height: 64,
    background: 'linear-gradient(135deg, #059669, #34d399)',
    borderRadius: 18, marginBottom: 20,
    boxShadow: '0 8px 30px rgba(5,150,105,0.25)',
  },
  title: { fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 },
  subtitle: { color: '#64748b', fontSize: 15 },
  card: {
    background: '#ffffff',
    border: '1px solid rgba(0,80,160,0.1)', borderRadius: 20,
    padding: '36px 32px', boxShadow: '0 8px 32px rgba(0,80,160,0.08)',
  },
  inputWrap: { position: 'relative', marginBottom: 14 },
  icon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  input: {
    width: '100%', padding: '13px 16px 13px 42px',
    background: '#f8fafc', border: '1px solid rgba(0,80,160,0.12)',
    borderRadius: 10, color: '#0f172a', fontSize: 15, fontFamily: 'Inter, sans-serif', outline: 'none',
  },
  eyeBtn: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
  btn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #059669, #34d399)',
    border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(5,150,105,0.25)',
  },
  footer: { textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: 14 },
  link: { color: '#059669', textDecoration: 'none', fontWeight: 600 },
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <div style={s.logoWrap}><FiActivity size={30} color="white" /></div>
          <h1 style={s.title}>Create Account</h1>
          <p style={s.subtitle}>Join AI Health Diagnosis Assistant</p>
        </div>
        <div style={s.card}>
          <form onSubmit={handleSubmit}>
            <div style={s.inputWrap}>
              <FiUser size={16} style={s.icon} />
              <input id="name" type="text" placeholder="Full Name" style={s.input}
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div style={s.inputWrap}>
              <FiMail size={16} style={s.icon} />
              <input id="email" type="email" placeholder="Email address" style={s.input}
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div style={s.inputWrap}>
              <FiLock size={16} style={s.icon} />
              <input id="password" type={showPass ? 'text' : 'password'} placeholder="Password (min 8 chars)" style={s.input}
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            <button type="submit" style={s.btn} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>
          <div style={s.footer}>
            Already have an account? <Link to="/login" style={s.link}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
