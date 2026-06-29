import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Users, Crown, ChefHat, Truck, Settings, ArrowLeft } from '../components/Icons';

const roleMap = { client: '/client/menu', trainer: '/trainer/home', owner: '/owner/menu', kitchen: '/kitchen/dashboard', delivery: '/delivery/dashboard', admin: '/admin/dashboard' };
const demoCredentials = [
  { role: 'Client', email: 'ravi@email.com', pass: 'ravi123', icon: <Dumbbell size={13} color="#f97316" />, color: '#f97316' },
  { role: 'Trainer', email: 'marcus@email.com', pass: 'marcus123', icon: <Users size={13} color="#22c55e" />, color: '#22c55e' },
  { role: 'Owner', email: 'suresh@email.com', pass: 'suresh123', icon: <Crown size={13} color="#eab308" />, color: '#eab308' },
  { role: 'Kitchen', email: 'rajesh@email.com', pass: 'rajesh123', icon: <ChefHat size={13} color="#14b8a6" />, color: '#14b8a6' },
  { role: 'Delivery', email: 'amit@email.com', pass: 'amit123', icon: <Truck size={13} color="#3b82f6" />, color: '#3b82f6' },
  { role: 'Admin', email: 'admin@synnoviq.com', pass: 'admin123', icon: <Settings size={13} color="#8b5cf6" />, color: '#8b5cf6' },
];

export default function LoginPage() {
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) {
    if (user.requirePasswordChange) return <Navigate to="/change-password" replace />;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
        <div style={{ maxWidth: 400, width: '100%', textAlign: 'center', animation: 'scaleIn 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)',
            borderRadius: 20, padding: 32, border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 'calc(26px + 0.5vw)', fontWeight: 900, color: '#fff' }}>{user.avatar || '?'}</div>
            <h2 style={{ color: '#fff', fontSize: 'calc(24px + 0.5vw)', fontWeight: 800, marginBottom: 4 }}>Welcome back, {user.name?.split(' ')[0]}!</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'calc(17px + 0.5vw)', marginBottom: 24 }}>You're signed in as <span style={{ color: '#f97316', fontWeight: 700 }}>{user.role?.toUpperCase()}</span></p>
            <button onClick={() => navigate(roleMap[user.role])} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', borderRadius: 12, fontSize: 'calc(19px + 0.5vw)', fontWeight: 800, cursor: 'pointer', border: 'none', marginBottom: 10, boxShadow: '0 4px 20px rgba(249,115,22,0.4)' }}>
              Continue to Dashboard →
            </button>
            <button onClick={() => { logout(); }} style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', borderRadius: 12, fontSize: 'calc(17px + 0.5vw)', fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
              Switch Account / Sign Out
            </button>
          </div>
        </div>
      </div>
    );
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>

      {/* Back to Dashboard Button */}
      <Link to="/" style={{
        position: 'absolute', top: 24, left: 24, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 8,
        color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
        fontSize: 'calc(18px + 0.5vw)', fontWeight: 700, padding: '10px 18px',
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 30, backdropFilter: 'blur(24px)', transition: 'all 0.2s',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none'; }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Background Video */}
      <video
        autoPlay muted loop playsInline
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0,
        }}
      >
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay on video */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.55), rgba(0,0,0,0.7))',
        backdropFilter: 'blur(2px)',
      }} />

      {/* Login Card */}
      <div style={{ maxWidth: 400, width: '100%', animation: 'scaleIn 0.5s cubic-bezier(0.16,1,0.3,1)', position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #f97316, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'calc(30px + 0.5vw)', boxShadow: '0 8px 32px rgba(249,115,22,0.3)',
            animation: 'float 3s ease-in-out infinite',
          }}>️</div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 'calc(30px + 0.5vw)', fontWeight: 900, color: '#fff', marginBottom: 4 }}>
            <span style={{ color: '#22c55e' }}>Fit</span>Bites
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'calc(17px + 0.5vw)' }}>Sign in to your account</p>
        </div>

        {/* Form Card - Glassmorphism */}
        <div style={{
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)',
          borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
        }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 'calc(15px + 0.5vw)', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="Enter your email" required style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff', fontSize: 'calc(18px + 0.5vw)', outline: 'none', transition: 'border 0.3s' }} onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 'calc(15px + 0.5vw)', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Enter your password" required style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff', fontSize: 'calc(18px + 0.5vw)', outline: 'none', transition: 'border 0.3s' }} onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
            </div>
            {error && <p style={{ color: '#fca5a5', fontSize: 'calc(17px + 0.5vw)', marginBottom: 12, textAlign: 'center', background: 'rgba(239,68,68,0.15)', padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)' }}> {error}</p>}
            <button type="submit" style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', borderRadius: 12, fontSize: 'calc(19px + 0.5vw)', fontWeight: 800, cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(249,115,22,0.4)', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(249,115,22,0.5)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(249,115,22,0.4)'; }}
            >Sign In →</button>
          </form>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 'calc(17px + 0.5vw)', marginTop: 16 }}>Don't have an account? <Link to="/register" style={{ color: '#f97316', fontWeight: 700 }}>Register</Link></p>
        </div>

        {/* Compact Demo Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14, justifyContent: 'center' }}>
          {demoCredentials.map(d => (
            <button key={d.role} onClick={() => fillDemo(d)} style={{
              padding: '5px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontSize: 'calc(14px + 0.5vw)', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${d.color}20`; e.currentTarget.style.borderColor = `${d.color}50`; e.currentTarget.style.color = d.color; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {d.icon} {d.role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
