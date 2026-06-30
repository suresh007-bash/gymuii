import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Icon, UserPlus, CheckCircle2 } from '../../components/Icons';

export default function AddMember() {
  const { addUser, user } = useAuth();
  const { showToast } = useNotifications();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inp = { width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 'clamp(13px, 1.0vw, 15px)' };
  const lbl = { display: 'block', fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 };

  const save = () => {
    if (!form.name || !form.email) return;
    const avatar = form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    addUser({
      ...form,
      id: form.email,
      avatar,
      role: 'client',
      trainerId: user.id,
      gymId: user.gymId,
      password: '12345678',
      requirePasswordChange: true,
      age: '',
      gender: 'Male',
      height: '',
      weight: '',
      goal: 'Weight Loss',
      diet: 'Non-Veg',
      allergies: ''
    });
    showToast('Member added successfully!');
    setForm({ name: '', email: '', phone: '' });
  };

  return (
    <DashboardLayout title="Add Member">
      <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
        <div className="card-header"><h3 className="card-title"><Icon icon={UserPlus} size={16} style={{marginRight:6}} /> New Member Registration</h3></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={lbl}>Full Name *</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="John Doe" /></div>
          <div><label style={lbl}>Email / Gmail ID *</label><input style={inp} type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="john@email.com" /></div>
          <div><label style={lbl}>Phone</label><input style={inp} value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="9876543210" /></div>
        </div>
        <button className="btn btn-success btn-lg" style={{ width: '100%', marginTop: 24 }} onClick={save} disabled={!form.name || !form.email}><Icon icon={CheckCircle2} size={14} style={{marginRight:4}} /> Save Member</button>
      </div>
    </DashboardLayout>
  );
}
