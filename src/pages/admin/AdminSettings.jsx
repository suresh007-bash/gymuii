import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { GYMS } from '../../data/mockUsers';

export default function AdminSettings() {
  const { allUsers, promoteUser, addUser } = useAuth();
  const { showToast } = useNotifications();
  const [tab, setTab] = useState('promote');
  const [promoUserId, setPromoUserId] = useState('');
  const [promoRole, setPromoRole] = useState('trainer');
  const [promoGym, setPromoGym] = useState('');
  const [kitchenForm, setKitchenForm] = useState({ name: '', email: '', phone: '', kitchenName: '', kitchenLocation: '' });

  const [confirm, setConfirm] = useState(null);

  const askConfirm = (title, msg, color, action) => setConfirm({ title, msg, color, action: () => { action(); setConfirm(null); } });

  const handlePromote = () => {
    if (!promoUserId || !promoRole) { showToast('Select user and role', 'error'); return; }
    const user = allUsers.find(u => u.id === promoUserId);
    askConfirm(
      '⬆️ Promote User',
      `Are you sure you want to promote "${user?.name}" to ${promoRole.toUpperCase()}?`,
      '#3b82f6',
      () => {
        const extra = {};
        if (promoRole === 'trainer' && promoGym) extra.gymId = promoGym;
        if (promoRole === 'owner' && promoGym) extra.gymId = promoGym;
        promoteUser(promoUserId, promoRole, extra);
        showToast(`✅ ${user?.name} promoted to ${promoRole.toUpperCase()}!`);
        setPromoUserId(''); setPromoRole('trainer');
      }
    );
  };

  const handleAddKitchen = () => {
    if (!kitchenForm.name || !kitchenForm.email || !kitchenForm.kitchenName) { showToast('Fill all required fields', 'error'); return; }
    askConfirm(
      '👨‍🍳 Add Kitchen Team',
      `Add "${kitchenForm.name}" as kitchen staff for "${kitchenForm.kitchenName}"?`,
      '#22c55e',
      () => {
        addUser({ ...kitchenForm, role: 'kitchen', avatar: kitchenForm.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) });
        showToast(`👨‍🍳 Kitchen team "${kitchenForm.kitchenName}" added!`);
        setKitchenForm({ name: '', email: '', phone: '', kitchenName: '', kitchenLocation: '' });
      }
    );
  };

  const clients = allUsers.filter(u => u.role === 'client');
  const trainers = allUsers.filter(u => u.role === 'trainer');

  return (
    <DashboardLayout title="Admin Settings">
      {/* Confirmation Modal */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, textAlign: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{confirm.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>{confirm.msg}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn" style={{ background: confirm.color, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }} onClick={confirm.action}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === 'promote' ? 'active' : ''}`} onClick={() => setTab('promote')}>⬆️ Promote User</button>
        <button className={`tab ${tab === 'kitchen' ? 'active' : ''}`} onClick={() => setTab('kitchen')}>👨‍🍳 Add Kitchen Team</button>
        <button className={`tab ${tab === 'roles' ? 'active' : ''}`} onClick={() => setTab('roles')}>👥 Role Overview</button>
      </div>

      {/* Promote User */}
      {tab === 'promote' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <div className="card-header"><h3 className="card-title">⬆️ Promote User</h3></div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Promote a client to trainer, or a user to gym owner role.</p>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Select User to Promote</label>
            <select className="form-select" value={promoUserId} onChange={e => setPromoUserId(e.target.value)}>
              <option value="">Choose user...</option>
              {allUsers.filter(u => ['client', 'trainer'].includes(u.role)).map(u => (
                <option key={u.id} value={u.id}>{u.name} — {u.role.toUpperCase()} ({u.email})</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Promote To</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['trainer', '💪 Trainer'], ['owner', '👑 Owner'], ['admin', '⚙️ Admin']].map(([role, label]) => (
                <button key={role} className={`btn btn-sm ${promoRole === role ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPromoRole(role)}>{label}</button>
              ))}
            </div>
          </div>
          {(promoRole === 'trainer' || promoRole === 'owner') && (
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Assign to Gym</label>
              <select className="form-select" value={promoGym} onChange={e => setPromoGym(e.target.value)}>
                <option value="">Select gym...</option>
                {GYMS.map(g => <option key={g.id} value={g.id}>{g.name} — {g.location}</option>)}
              </select>
            </div>
          )}
          <button className="btn btn-success" onClick={handlePromote} disabled={!promoUserId}>⬆️ Promote User</button>
        </div>
      )}

      {/* Add Kitchen Team */}
      {tab === 'kitchen' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <div className="card-header"><h3 className="card-title">👨‍🍳 Add Food Providing Team</h3></div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Register a new kitchen/food provider team to the system.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="form-label">Person Name *</label><input className="form-input" value={kitchenForm.name} onChange={e => setKitchenForm(p => ({ ...p, name: e.target.value }))} placeholder="Chef Name" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 14 }}>
              <div><label className="form-label">Email *</label><input className="form-input" value={kitchenForm.email} onChange={e => setKitchenForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div><label className="form-label">Phone</label><input className="form-input" value={kitchenForm.phone} onChange={e => setKitchenForm(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div><label className="form-label">Kitchen Name *</label><input className="form-input" value={kitchenForm.kitchenName} onChange={e => setKitchenForm(p => ({ ...p, kitchenName: e.target.value }))} placeholder="FitBites Kitchen" /></div>
            <div><label className="form-label">Kitchen Location</label><input className="form-input" value={kitchenForm.kitchenLocation} onChange={e => setKitchenForm(p => ({ ...p, kitchenLocation: e.target.value }))} placeholder="City, Area" /></div>
          </div>
          <button className="btn btn-success" style={{ marginTop: 16 }} onClick={handleAddKitchen}>➕ Add Kitchen Team</button>
        </div>
      )}

      {/* Role Overview */}
      {tab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 20 }}>
          {[['client', '🏋️', '#f97316'], ['trainer', '💪', '#22c55e'], ['owner', '👑', '#3b82f6'], ['kitchen', '👨‍🍳', '#14b8a6'], ['delivery', '🚗', '#8b5cf6'], ['admin', '⚙️', '#64748b']].map(([role, icon, color]) => {
            const users = allUsers.filter(u => u.role === role);
            return (
              <div key={role} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{icon}</span>
                  <div><span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16 }}>{role.charAt(0).toUpperCase() + role.slice(1)}s</span><span style={{ marginLeft: 8, fontWeight: 900, color }}>{users.length}</span></div>
                </div>
                {users.slice(0, 5).map(u => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <span style={{ fontWeight: 600 }}>{u.name}</span><span style={{ color: 'var(--text-muted)' }}>{u.email}</span>
                  </div>
                ))}
                {users.length > 5 && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>+{users.length - 5} more</div>}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
