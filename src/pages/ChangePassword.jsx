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
    const roleMap = { client: '/client/dashboard', trainer: '/trainer/dashboard', owner: '/owner/menu', kitchen: '/kitchen/dashboard', delivery: '/delivery/dashboard', admin: '/admin/dashboard' };
    return <Navigate to={roleMap[user.role]} replace />;
  }

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
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
      const roleMap = { client: '/client/dashboard', trainer: '/trainer/dashboard', owner: '/owner/menu', kitchen: '/kitchen/dashboard', delivery: '/delivery/dashboard', admin: '/admin/dashboard' };
      navigate(roleMap[user.role]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 440, width: '100%', animation: 'scaleIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>🔒</span>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg, #f97316, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>Change Password</h1>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>You are required to change your password on first login</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>New Password</label>
              <input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(''); }} placeholder="Enter new password" required style={{ width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, color: '#111827', fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(''); }} placeholder="Confirm new password" required style={{ width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, color: '#111827', fontSize: 14 }} />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>❌ {error}</p>}
            <button type="submit" style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', border: 'none', boxShadow: '0 4px 14px rgba(249,115,22,0.3)', transition: 'all 0.3s' }}>Update Password →</button>
          </form>
        </div>
      </div>
    </div>
  );
}
