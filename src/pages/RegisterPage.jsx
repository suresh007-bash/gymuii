import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleMap = { client: '/client/dashboard', trainer: '/trainer/dashboard', owner: '/owner/menu', kitchen: '/kitchen/dashboard', delivery: '/delivery/dashboard', admin: '/admin/dashboard' };
const roleOptions = [
  { id: 'client', icon: '🏋️', label: 'Client', desc: 'Order meals & track nutrition', color: '#f97316' },
  { id: 'trainer', icon: '💪', label: 'Trainer', desc: 'Manage clients & programs', color: '#8b5cf6' },
  { id: 'owner', icon: '👑', label: 'Gym Owner', desc: 'Run your gym business', color: '#22c55e' },
  { id: 'kitchen', icon: '👨‍🍳', label: 'Kitchen', desc: 'Prepare & manage food', color: '#14b8a6' },
  { id: 'delivery', icon: '🚗', label: 'Delivery', desc: 'Deliver orders', color: '#0ea5e9' },
  { id: 'admin', icon: '⚙️', label: 'Admin', desc: 'System administration', color: '#64748b' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({ role: '', name: '', email: '', phone: '', password: '' });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.role || !form.name || !form.email || !form.password) { setError('Please fill all fields'); return; }
    const avatar = form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const result = register({ ...form, avatar, profileComplete: false });
    if (result.success) navigate(roleMap[form.role]);
    else setError(result.error);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 480, width: '100%', animation: 'scaleIn 0.4s ease' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>🍽️</span>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg, #f97316, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>Create Account</h1>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Join Synnoviq Suite in seconds</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {roleOptions.map(r => (
                  <button key={r.id} type="button" onClick={() => upd('role', r.id)} style={{ padding: 12, background: form.role === r.id ? `${r.color}10` : '#f9fafb', border: `2px solid ${form.role === r.id ? r.color : '#e5e7eb'}`, borderRadius: 12, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', color: '#111827' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: form.role === r.id ? r.color : '#6b7280' }}>{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Full Name</label>
              <input value={form.name} onChange={e => upd('name', e.target.value)} placeholder="John Doe" required style={{ width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, color: '#111827', fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Email</label>
              <input type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="john@email.com" required style={{ width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, color: '#111827', fontSize: 14 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Phone</label>
                <input value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="9876543210" style={{ width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, color: '#111827', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Password</label>
                <input type="password" value={form.password} onChange={e => upd('password', e.target.value)} placeholder="••••••" required style={{ width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, color: '#111827', fontSize: 14 }} />
              </div>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>❌ {error}</p>}

            <button type="submit" style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', border: 'none', boxShadow: '0 4px 14px rgba(249,115,22,0.3)', transition: 'all 0.3s' }}>Create Account →</button>
          </form>

          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 16 }}>Already have an account? <Link to="/login" style={{ color: '#f97316', fontWeight: 700 }}>Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
