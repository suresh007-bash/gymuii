import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { GYMS } from '../../data/mockUsers';

export default function AdminUsers() {
  const { allUsers, addUser, deleteUser, getUsersByRole } = useAuth();
  const { showToast } = useNotifications();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selRole, setSelRole] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', gymName: '', gst: '', specialization: '', gymId: '', trainerId: '', kitchenName: '', kitchenLocation: '', vehicleType: 'Bike', licenseNo: '' });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inp = { width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 14 };

  const users = allUsers.filter(u => u.role !== 'admin' && (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())));

  const getGymTrainers = (gymId) => allUsers.filter(u => u.role === 'trainer' && u.gymId === gymId);

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    const avatar = form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    let userData = { name: form.name, email: form.email, phone: form.phone, avatar, password: 'password123' };

    if (selRole === 'owner') {
      userData = { ...userData, role: 'owner', gymName: form.gymName, gst: form.gst, gymId: 'g' + Date.now() };
    } else if (selRole === 'trainer') {
      userData = { ...userData, role: 'trainer', gymId: form.gymId, specialization: form.specialization };
    } else if (selRole === 'client') {
      userData = { ...userData, role: 'client', gymId: form.gymId, trainerId: form.trainerId || null };
    } else if (selRole === 'kitchen') {
      userData = { ...userData, role: 'kitchen', kitchenName: form.kitchenName, kitchenLocation: form.kitchenLocation };
    } else if (selRole === 'delivery') {
      userData = { ...userData, role: 'delivery', vehicleType: form.vehicleType, licenseNo: form.licenseNo, available: true, rating: 5.0 };
    }

    addUser(userData);
    showToast(`${selRole.charAt(0).toUpperCase() + selRole.slice(1)} added successfully!`);
    setShowAdd(false);
    setSelRole('');
    setForm({ name: '', email: '', phone: '', gymName: '', gst: '', specialization: '', gymId: '', trainerId: '', kitchenName: '', kitchenLocation: '', vehicleType: 'Bike', licenseNo: '' });
  };

  const handleDelete = (id) => { if (window.confirm('Delete this user?')) { deleteUser(id); showToast('User deleted', 'warning'); } };

  const roleBadge = { client: 'badge-blue', trainer: 'badge-purple', owner: 'badge-orange', kitchen: 'badge-green', delivery: 'badge-purple' };

  return (
    <DashboardLayout title="User Management">
      {/* Add User Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => { setShowAdd(false); setSelRole(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 className="modal-title">{selRole ? `Add ${selRole.charAt(0).toUpperCase() + selRole.slice(1)}` : 'Add New User'}</h3>
              <button className="modal-close" onClick={() => { setShowAdd(false); setSelRole(''); }}>✕</button>
            </div>

            {!selRole ? (
              /* Role Selection */
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Select User Type:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[{ id: 'owner', icon: '👑', label: 'Gym Owner', desc: 'Manage gym, trainers, and members' },
                    { id: 'trainer', icon: '💪', label: 'Gym Trainer', desc: 'Train and manage assigned clients' },
                    { id: 'client', icon: '👤', label: 'Member', desc: 'Order food and track nutrition' },
                    { id: 'kitchen', icon: '🍳', label: 'Kitchen Staff', desc: 'Manage food orders and dispatching' },
                    { id: 'delivery', icon: '🚗', label: 'Delivery Driver', desc: 'Fulfill deliveries to clients' }
                  ].map(r => (
                    <button key={r.id} onClick={() => setSelRole(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', color: 'var(--text-primary)' }}>
                      <span style={{ fontSize: 28 }}>{r.icon}</span>
                      <div><div style={{ fontWeight: 700, fontSize: 14 }}>{r.label}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.desc}</div></div>
                      <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Role-Specific Form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Gym Owner Form */}
                {selRole === 'owner' && (<>
                  <div><label className="form-label">Gym Name *</label><input style={inp} value={form.gymName} onChange={e => upd('gymName', e.target.value)} placeholder="FitZone Premium" /></div>
                  <div><label className="form-label">Owner Full Name *</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="John Doe" /></div>
                  <div><label className="form-label">Email Address *</label><input style={inp} type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="owner@email.com" /></div>
                  <div><label className="form-label">Phone Number *</label><input style={inp} value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="9876543210" /></div>
                  <div><label className="form-label">Gym Proof (GST Number) *</label><input style={inp} value={form.gst} onChange={e => upd('gst', e.target.value)} placeholder="GST29ABCDE1234F" /></div>
                </>)}

                {/* Gym Trainer Form */}
                {selRole === 'trainer' && (<>
                  <div><label className="form-label">Trainer Name *</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Coach Marcus" /></div>
                  <div><label className="form-label">Email Address *</label><input style={inp} type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="trainer@email.com" /></div>
                  <div><label className="form-label">Phone Number *</label><input style={inp} value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="9876543210" /></div>
                  <div><label className="form-label">Select Assigned Gym *</label>
                    <select style={inp} value={form.gymId} onChange={e => upd('gymId', e.target.value)}>
                      <option value="">Choose gym...</option>
                      {GYMS.map(g => <option key={g.id} value={g.id}>{g.name} — {g.location}</option>)}
                    </select>
                  </div>
                </>)}

                {/* Member Form */}
                {selRole === 'client' && (<>
                  <div><label className="form-label">Member Name *</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Ravi Kumar" /></div>
                  <div><label className="form-label">Email Address *</label><input style={inp} type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="member@email.com" /></div>
                  <div><label className="form-label">Phone Number *</label><input style={inp} value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="9876543210" /></div>
                  <div><label className="form-label">Select Gym *</label>
                    <select style={inp} value={form.gymId} onChange={e => { upd('gymId', e.target.value); upd('trainerId', ''); }}>
                      <option value="">Choose gym...</option>
                      {GYMS.map(g => <option key={g.id} value={g.id}>{g.name} — {g.location}</option>)}
                    </select>
                  </div>
                  {/* Auto-display trainers when gym is selected */}
                  {form.gymId && (
                    <div>
                      <label className="form-label">Assigned Trainer</label>
                      {getGymTrainers(form.gymId).length > 0 ? (
                        <select style={inp} value={form.trainerId} onChange={e => upd('trainerId', e.target.value)}>
                          <option value="">Select trainer...</option>
                          {getGymTrainers(form.gymId).map(t => <option key={t.id} value={t.id}>{t.name} — {t.specialization || 'General'}</option>)}
                        </select>
                      ) : (
                        <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.1)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.3)', color: 'var(--accent-orange)', fontSize: 13, fontWeight: 700 }}>
                          Nil — No trainers assigned to this gym
                        </div>
                      )}
                    </div>
                  )}
                </>)}

                {/* Kitchen Form */}
                {selRole === 'kitchen' && (<>
                  <div><label className="form-label">Kitchen Name *</label><input style={inp} value={form.kitchenName} onChange={e => upd('kitchenName', e.target.value)} placeholder="Central Kitchen" /></div>
                  <div><label className="form-label">Manager Name *</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Chef Rajesh" /></div>
                  <div><label className="form-label">Email Address *</label><input style={inp} type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="kitchen@email.com" /></div>
                  <div><label className="form-label">Phone Number *</label><input style={inp} value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="9876543210" /></div>
                  <div><label className="form-label">Location *</label><input style={inp} value={form.kitchenLocation} onChange={e => upd('kitchenLocation', e.target.value)} placeholder="Koramangala, Bangalore" /></div>
                </>)}

                {/* Delivery Form */}
                {selRole === 'delivery' && (<>
                  <div><label className="form-label">Driver Name *</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Amit Verma" /></div>
                  <div><label className="form-label">Email Address *</label><input style={inp} type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="delivery@email.com" /></div>
                  <div><label className="form-label">Phone Number *</label><input style={inp} value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="9876543210" /></div>
                  <div><label className="form-label">Vehicle Type *</label>
                    <select style={inp} value={form.vehicleType} onChange={e => upd('vehicleType', e.target.value)}>
                      <option value="Bike">Bike</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Car">Car</option>
                    </select>
                  </div>
                  <div><label className="form-label">License Number *</label><input style={inp} value={form.licenseNo} onChange={e => upd('licenseNo', e.target.value)} placeholder="KA01AB1234" /></div>
                </>)}

                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => setSelRole('')}>← Back</button>
                  <button className="btn btn-success" onClick={handleAdd}>✅ Add {selRole.charAt(0).toUpperCase() + selRole.slice(1)}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search + Add */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
          <input className="form-input" style={{ paddingLeft: 40 }} placeholder="Search Users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add User</button>
      </div>

      {/* Users Table */}
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Detail / Gym</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>{u.avatar}</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                  </div>
                </td>
                <td style={{ fontSize: 12 }}>{u.email}</td>
                <td><span className={`badge ${roleBadge[u.role] || 'badge-blue'}`}>{u.role.toUpperCase()}</span></td>
                <td style={{ fontSize: 12 }}>{u.gymName || GYMS.find(g => g.id === u.gymId)?.name || u.kitchenName || (u.vehicleType ? `${u.vehicleType} (${u.licenseNo || 'No License'})` : '') || '—'}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.joinDate || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => handleDelete(u.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
