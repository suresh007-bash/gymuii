import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Users, Crown, ChefHat, Truck, Settings } from 'lucide-react';

const roleMap = { client: '/client/menu', trainer: '/trainer/home', owner: '/owner/menu', kitchen: '/kitchen/dashboard', delivery: '/delivery/dashboard', admin: '/admin/dashboard' };
const roles = [
  { id: 'client', icon: <Dumbbell size={18} color="#f97316" />, label: 'Client' },
  { id: 'trainer', icon: <Users size={18} color="#22c55e" />, label: 'Trainer' },
  { id: 'owner', icon: <Crown size={18} color="#eab308" />, label: 'Owner' },
  { id: 'kitchen', icon: <ChefHat size={18} color="#14b8a6" />, label: 'Kitchen' },
  { id: 'delivery', icon: <Truck size={18} color="#3b82f6" />, label: 'Delivery' },
  { id: 'admin', icon: <Settings size={18} color="#8b5cf6" />, label: 'Admin' },
];
const demoCredentials = [
  { role: 'Client', email: 'ravi@email.com', pass: 'ravi123', icon: <Dumbbell size={16} color="#f97316" /> },
  { role: 'Trainer', email: 'marcus@email.com', pass: 'marcus123', icon: <Users size={16} color="#22c55e" /> },
  { role: 'Owner', email: 'suresh@email.com', pass: 'suresh123', icon: <Crown size={16} color="#eab308" /> },
  { role: 'Kitchen', email: 'rajesh@email.com', pass: 'rajesh123', icon: <ChefHat size={16} color="#14b8a6" /> },
  { role: 'Delivery', email: 'amit@email.com', pass: 'amit123', icon: <Truck size={16} color="#3b82f6" /> },
  { role: 'Admin', email: 'admin@synnoviq.com', pass: 'admin123', icon: <Settings size={16} color="#8b5cf6" /> },
];

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) {
    if (user.requirePasswordChange) return <Navigate to="/change-password" replace />;
    return <Navigate to={roleMap[user.role]} replace />;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    const result = login(email, password);
    if (result.success) {
      if (result.user.requirePasswordChange) navigate('/change-password');
      else if (result.user.profileComplete === false) navigate('/complete-profile');
      else navigate(roleMap[result.user.role]);
    } else setError(result.error);
  };

  const fillDemo = (d) => { setEmail(d.email); setPassword(d.pass); setError(''); };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 440, width: '100%', animation: 'scaleIn 0.4s ease' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>🍽️</span>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg, #f97316, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>Synnoviq Suite</h1>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Sign in to your account</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="Enter your email" required style={{ width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, color: '#111827', fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Enter your password" required style={{ width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, color: '#111827', fontSize: 14 }} />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>❌ {error}</p>}
            <button type="submit" style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', border: 'none', boxShadow: '0 4px 14px rgba(249,115,22,0.3)', transition: 'all 0.3s' }}>Sign In →</button>
          </form>

          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 16 }}>Don't have an account? <Link to="/register" style={{ color: '#f97316', fontWeight: 700 }}>Register</Link></p>
        </div>

        {/* Demo Credentials */}
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: 16, marginTop: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, textAlign: 'center' }}>Quick Demo Login</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6 }}>
            {demoCredentials.map(d => (
              <button key={d.role} onClick={() => fillDemo(d)} style={{ padding: '10px 8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, color: '#111827', fontSize: 11, fontWeight: 600, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                <div style={{ fontSize: 18, marginBottom: 2 }}>{d.icon}</div>
                <div style={{ fontWeight: 800 }}>{d.role}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
