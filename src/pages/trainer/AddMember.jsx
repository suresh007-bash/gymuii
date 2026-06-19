import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function AddMember() {
  const { addUser, user } = useAuth();
  const { showToast } = useNotifications();
  const [form, setForm] = useState({ name: '', email: '', phone: '', age: '', gender: 'Male', height: '', weight: '', goal: 'Weight Loss', diet: 'Non-Veg', allergies: '' });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inp = { width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 14 };
  const lbl = { display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 };

  const save = () => {
    if (!form.name || !form.email) return;
    const avatar = form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    addUser({ ...form, avatar, role: 'client', trainerId: user.id, gymId: user.gymId, password: 'member123' });
    showToast('Member added successfully!');
    setForm({ name: '', email: '', phone: '', age: '', gender: 'Male', height: '', weight: '', goal: 'Weight Loss', diet: 'Non-Veg', allergies: '' });
  };

  return (
    <DashboardLayout title="Add Member">
      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card-header"><h3 className="card-title">➕ New Member Registration</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label style={lbl}>First Name</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="John Doe" /></div>
          <div><label style={lbl}>Email</label><input style={inp} type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="john@email.com" /></div>
          <div><label style={lbl}>Phone</label><input style={inp} value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="9876543210" /></div>
          <div><label style={lbl}>Age</label><input style={inp} type="number" value={form.age} onChange={e => upd('age', e.target.value)} /></div>
          <div><label style={lbl}>Gender</label><select style={inp} value={form.gender} onChange={e => upd('gender', e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></div>
          <div><label style={lbl}>Goal</label><select style={inp} value={form.goal} onChange={e => upd('goal', e.target.value)}><option>Weight Loss</option><option>Muscle Gain</option><option>Maintenance</option></select></div>
          <div><label style={lbl}>Height (cm)</label><input style={inp} type="number" value={form.height} onChange={e => upd('height', e.target.value)} /></div>
          <div><label style={lbl}>Weight (kg)</label><input style={inp} type="number" value={form.weight} onChange={e => upd('weight', e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 16 }}><label style={lbl}>Dietary Preference</label><select style={inp} value={form.diet} onChange={e => upd('diet', e.target.value)}><option>Non-Veg</option><option>Veg</option><option>Vegan</option></select></div>
        <div style={{ marginTop: 16 }}><label style={lbl}>Allergies</label><input style={inp} value={form.allergies} onChange={e => upd('allergies', e.target.value)} placeholder="e.g., Nuts, Lactose" /></div>
        <button className="btn btn-success btn-lg" style={{ width: '100%', marginTop: 20 }} onClick={save}>✅ Save Member</button>
      </div>
    </DashboardLayout>
  );
}
