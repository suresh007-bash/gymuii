import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function TrainerProfile() {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', specialization: user?.specialization || '', certifications: user?.certifications || '' });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => { updateUser(user.id, { ...form, avatar: form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) }); showToast('Profile updated! ✅'); };
  const handleLogout = () => { logout(); navigate('/'); };
  const inp = { width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 14 };

  return (
    <DashboardLayout title="Trainer Profile">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: 32, marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 auto 12px' }}>{user?.avatar}</div>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: 4 }}>{user?.name}</h2>
          <p style={{ color: 'var(--accent-orange)', fontSize: 13, fontWeight: 700 }}>{user?.specialization}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{user?.certifications}</p>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 className="card-title" style={{ marginBottom: 16 }}>✏️ Edit Profile</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="form-label">Full Name</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><label className="form-label">Email</label><input style={inp} value={form.email} onChange={e => upd('email', e.target.value)} /></div>
              <div><label className="form-label">Phone</label><input style={inp} value={form.phone} onChange={e => upd('phone', e.target.value)} /></div>
            </div>
            <div><label className="form-label">Specialization</label><input style={inp} value={form.specialization} onChange={e => upd('specialization', e.target.value)} /></div>
            <div><label className="form-label">Certifications</label><input style={inp} value={form.certifications} onChange={e => upd('certifications', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn btn-success" style={{ flex: 1 }} onClick={handleSave}>✅ Save Changes</button>
            <button className="btn btn-danger" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
