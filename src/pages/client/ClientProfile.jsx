import { useState } from 'react';
import { Icon, Package, Edit, CheckCircle2, LogOut } from '../../components/Icons';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';

export default function ClientProfile() {
  const { user, updateUser, logout } = useAuth();
  const { getOrdersByUser } = useOrders();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', age: user?.age || '', height: user?.height || '', weight: user?.weight || '', goal: user?.goal || 'Weight Loss', diet: user?.diet || 'Non-Veg', allergies: user?.allergies || '' });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const totalOrders = getOrdersByUser(user?.id).length;

  const handleSave = () => {
    updateUser(user.id, { ...form, avatar: form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) });
    showToast('Profile updated!');
  };

  const handleLogout = () => { logout(); navigate('/'); };
  const inp = { width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 'clamp(13px, 3vw, 18px)' };

  return (
    <DashboardLayout title="My Profile">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: 32, marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(21px, 3vw, 28px)', fontWeight: 900, color: '#fff', margin: '0 auto 12px' }}>{user?.avatar}</div>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: 4 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 3vw, 17px)' }}>{user?.email} • <Package size={13} style={{marginRight:3, verticalAlign:'middle'}} /> {totalOrders} orders</p>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 className="card-title" style={{ marginBottom: 16, display:'flex', alignItems:'center', gap:6 }}><Edit size={16} /> Edit Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Full Name</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} /></div>
            <div><label className="form-label">Email</label><input style={inp} value={form.email} onChange={e => upd('email', e.target.value)} /></div>
            <div><label className="form-label">Phone</label><input style={inp} value={form.phone} onChange={e => upd('phone', e.target.value)} /></div>
            <div><label className="form-label">Age</label><input style={inp} type="number" value={form.age} onChange={e => upd('age', e.target.value)} /></div>
            <div><label className="form-label">Height (cm)</label><input style={inp} type="number" value={form.height} onChange={e => upd('height', e.target.value)} /></div>
            <div><label className="form-label">Weight (kg)</label><input style={inp} type="number" value={form.weight} onChange={e => upd('weight', e.target.value)} /></div>
            <div><label className="form-label">Fitness Goal</label><select style={inp} value={form.goal} onChange={e => upd('goal', e.target.value)}><option>Weight Loss</option><option>Muscle Gain</option><option>Maintenance</option></select></div>
            <div><label className="form-label">Diet</label><select style={inp} value={form.diet} onChange={e => upd('diet', e.target.value)}><option>Non-Veg</option><option>Veg</option><option>Vegan</option></select></div>
            <div><label className="form-label">Allergies</label><input style={inp} value={form.allergies} onChange={e => upd('allergies', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn btn-success" style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }} onClick={handleSave}><CheckCircle2 size={14} /> Save Changes</button>
            <button className="btn btn-danger" style={{display:'flex', alignItems:'center', gap:6}} onClick={handleLogout}><LogOut size={14} /> Logout</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
