import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiMail, FiLock, FiActivity, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f7ff 50%, #dbeafe 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  container: { width: '100%', maxWidth: 440 },
  header: { textAlign: 'center', marginBottom: 40 },
  logoWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64, height: 64,
    background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    borderRadius: 18,
    marginBottom: 20,
    boxShadow: '0 8px 30px rgba(2,132,199,0.25)',
  },
  title: { fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 },
  subtitle: { color: '#64748b', fontSize: 15 },
  card: {
    background: '#ffffff',
    border: '1px solid rgba(0,80,160,0.1)',
    borderRadius: 20,
    padding: '36px 32px',
    boxShadow: '0 8px 32px rgba(0,80,160,0.08)',
  },
  inputWrap: { position: 'relative', marginBottom: 16 },
  inputIcon: {
    position: 'absolute',
    left: 14, top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
  },
  inputStyled: {
    width: '100%',
    padding: '13px 16px 13px 42px',
    background: '#f8fafc',
    border: '1px solid rgba(0,80,160,0.12)',
    borderRadius: 10,
    color: '#0f172a',
    fontSize: 15,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'all 0.2s',
  },
  eyeBtn: {
    position: 'absolute', right: 14, top: '50%',
    transform: 'translateY(-50%)',
    background: 'none', border: 'none',
    color: '#94a3b8', cursor: 'pointer',
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    border: 'none',
    borderRadius: 10,
    color: 'white',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 4px 20px rgba(2,132,199,0.25)',
    transition: 'all 0.2s',
  },
  footer: { textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: 14 },
  link: { color: '#0284c7', textDecoration: 'none', fontWeight: 600 },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.access_token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logoWrap}><FiActivity size={30} color="white" /></div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your AI Health Assistant</p>
        </div>

        <div style={styles.card}>
          <form onSubmit={handleSubmit}>
            <div style={styles.inputWrap}>
              <FiMail size={16} style={styles.inputIcon} />
              <input
                id="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={styles.inputStyled}
                required
              />
            </div>

            <div style={styles.inputWrap}>
              <FiLock size={16} style={styles.inputIcon} />
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={styles.inputStyled}
                required
              />
              <button type="button" style={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <div style={styles.footer}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
