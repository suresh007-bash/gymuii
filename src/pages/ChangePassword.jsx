import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function ChangePassword() {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!user) return <Navigate to="/login" replace />;
  if (!user.requirePasswordChange) {
    const roleMap = { client: '/client/menu', trainer: '/trainer/home', owner: '/owner/menu', kitchen: '/kitchen/dashboard', delivery: '/delivery/dashboard', admin: '/admin/dashboard' };
    return <Navigate to={roleMap[user.role]} replace />;
  }

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    updateUser(user.id, { password: newPassword, requirePasswordChange: false });
    showToast('🔑 Password changed successfully!', 'success');

    if (user.profileComplete === false) {
      navigate('/complete-profile');
    } else {
      const roleMap = { client: '/client/menu', trainer: '/trainer/home', owner: '/owner/menu', kitchen: '/kitchen/dashboard', delivery: '/delivery/dashboard', admin: '/admin/dashboard' };
      navigate(roleMap[user.role]);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', transition: 'border 0.3s',
  };
  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: 'rgba(255,255,255,0.6)', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.5,
  };

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>

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

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.55), rgba(0,0,0,0.7))',
        backdropFilter: 'blur(2px)',
      }} />

      {/* Card */}
      <div style={{ maxWidth: 440, width: '100%', animation: 'scaleIn 0.5s cubic-bezier(0.16,1,0.3,1)', position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #f97316, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, boxShadow: '0 8px 32px rgba(249,115,22,0.3)',
            animation: 'float 3s ease-in-out infinite',
          }}>🔒</div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
            Create New Password
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            Welcome <strong style={{ color: '#f97316' }}>{user.name}</strong>! Please set your new password to continue.
          </p>
        </div>

        {/* Glassmorphism Form */}
        <div style={{
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)',
          borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
        }}>
          {/* Info Banner */}
          <div style={{
            padding: '10px 14px', borderRadius: 12, marginBottom: 20,
            background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
            fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 18 }}>ℹ️</span>
            Your account was created with a temporary password. Please set a new secure password.
          </div>

          <form onSubmit={handleChangePassword}>
            {/* New Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>New Password</label>
              <input
                type="password" value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(''); }}
                placeholder="Enter new password (min 6 chars)"
                required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
              {newPassword && newPassword.length < 6 && (
                <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 4 }}>⚠️ Must be at least 6 characters</div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password" value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                placeholder="Re-enter your password"
                required style={{
                  ...inputStyle,
                  borderColor: passwordsMatch ? 'rgba(34,197,94,0.5)' : passwordsMismatch ? 'rgba(239,68,68,0.5)' : inputStyle.border,
                }}
                onFocus={e => e.target.style.borderColor = passwordsMatch ? 'rgba(34,197,94,0.6)' : 'rgba(249,115,22,0.6)'}
                onBlur={e => e.target.style.borderColor = passwordsMatch ? 'rgba(34,197,94,0.5)' : passwordsMismatch ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}
              />
              {passwordsMatch && (
                <div style={{ fontSize: 11, color: '#22c55e', marginTop: 4 }}>✅ Passwords match</div>
              )}
              {passwordsMismatch && (
                <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>❌ Passwords do not match</div>
              )}
            </div>

            {error && <p style={{ color: '#fca5a5', fontSize: 13, marginBottom: 12, textAlign: 'center', background: 'rgba(239,68,68,0.15)', padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)' }}>❌ {error}</p>}

            <button type="submit" style={{
              width: '100%', padding: 14,
              background: passwordsMatch ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #f97316, #fb923c)',
              color: '#fff', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer',
              border: 'none', boxShadow: `0 4px 20px ${passwordsMatch ? 'rgba(34,197,94,0.4)' : 'rgba(249,115,22,0.4)'}`,
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
            >
              {passwordsMatch ? '✅ Set Password & Continue' : '🔑 Update Password →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
