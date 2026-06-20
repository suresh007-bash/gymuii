import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { GYMS } from '../../data/mockUsers';

export default function AdminUsers() {
  const { user, allUsers, addUser, deleteUser, blockUser, unblockUser, promoteUser, getUsersByRole } = useAuth();
  const { showToast } = useNotifications();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selRole, setSelRole] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', gymName: '', gst: '', specialization: '', gymId: '', trainerId: '', kitchenName: '', kitchenLocation: '', vehicleType: 'Bike', licenseNo: '' });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inp = { width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 14 };

  // Confirmation modal state
  const [confirm, setConfirm] = useState(null);
  // Promote modal state
  const [promoteModal, setPromoteModal] = useState(null);
  const [newRole, setNewRole] = useState('');

  const activeUsers = allUsers.filter(u => u.role !== 'admin' && !u.blocked && (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())));
  const blockedUsers = allUsers.filter(u => u.blocked && u.role !== 'admin');

  const getGymTrainers = (gymId) => allUsers.filter(u => u.role === 'trainer' && u.gymId === gymId);

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    const avatar = form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    let userData = { name: form.name, email: form.email, phone: form.phone, avatar, password: '12345678', profileComplete: false };

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

  const handleBlock = (u) => {
    setConfirm({
      title: '🚫 Block User',
      msg: `Are you sure you want to block "${u.name}" (${u.role})? They will not be able to login until unblocked.`,
      color: '#ef4444',
      action: () => { blockUser(u.id); showToast(`${u.name} has been blocked`, 'warning'); setConfirm(null); }
    });
  };

  const handleUnblock = (u) => {
    setConfirm({
      title: '✅ Unblock User',
      msg: `Are you sure you want to unblock "${u.name}"? They will be able to login again.`,
      color: '#22c55e',
      action: () => { unblockUser(u.id); showToast(`${u.name} has been unblocked`); setConfirm(null); }
    });
  };

  const handleDeletePermanent = (u) => {
    setConfirm({
      title: '🗑️ Permanently Delete',
      msg: `Are you sure you want to PERMANENTLY delete "${u.name}"? This action cannot be undone.`,
      color: '#ef4444',
      action: () => { deleteUser(u.id); showToast(`${u.name} permanently deleted`, 'warning'); setConfirm(null); }
    });
  };

  const openPromoteModal = (u) => {
    setPromoteModal(u);
    setNewRole(u.role);
  };

  const handlePromote = () => {
    if (!promoteModal || newRole === promoteModal.role) { setPromoteModal(null); return; }
    if (promoteModal.id === user?.id) { showToast('Cannot change your own role', 'error'); setPromoteModal(null); return; }
    const oldRole = promoteModal.role;
    const name = promoteModal.name;
    const userId = promoteModal.id;
    setPromoteModal(null);
    setConfirm({
      title: oldRole < newRole ? '⬆️ Promote User' : '⬇️ Change Role',
      msg: `Change "${name}" from ${oldRole.toUpperCase()} to ${newRole.toUpperCase()}?`,
      color: '#3b82f6',
      action: () => {
        promoteUser(userId, newRole);
        showToast(`${name} is now ${newRole.toUpperCase()}`);
        setConfirm(null);
      }
    });
  };

  const roleBadge = { client: 'badge-blue', trainer: 'badge-purple', owner: 'badge-orange', kitchen: 'badge-green', delivery: 'badge-purple' };
  const roleOptions = ['client', 'trainer', 'owner', 'kitchen', 'delivery'];

  return (
    <DashboardLayout title="User Management">

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

      {/* Promote/Demote Modal */}
      {promoteModal && (
        <div className="modal-overlay" onClick={() => setPromoteModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">🔄 Change Role — {promoteModal.name}</h3>
              <button className="modal-close" onClick={() => setPromoteModal(null)}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Current role: <span className={`badge ${roleBadge[promoteModal.role]}`}>{promoteModal.role.toUpperCase()}</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {roleOptions.map(r => (
                <button key={r} onClick={() => setNewRole(r)} style={{
                  padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, textAlign: 'left', transition: 'all 0.2s',
                  background: newRole === r ? 'rgba(59,130,246,0.1)' : 'var(--bg-tertiary)',
                  border: `2px solid ${newRole === r ? '#3b82f6' : 'var(--border)'}`,
                  color: newRole === r ? '#3b82f6' : 'var(--text-primary)',
                }}>
                  {r === promoteModal.role ? `${r.toUpperCase()} (current)` : r.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setPromoteModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePromote} disabled={newRole === promoteModal.role}>
                {newRole === promoteModal.role ? 'No Change' : `Change to ${newRole.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Owner Form */}
                {selRole === 'owner' && (<>
                  <div><label className="form-label">Owner Name *</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Suresh Kumar" /></div>
                  <div><label className="form-label">Email Address *</label><input style={inp} type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="owner@email.com" /></div>
                  <div><label className="form-label">Phone Number *</label><input style={inp} value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="9876543210" /></div>
                  <div><label className="form-label">Gym Name *</label><input style={inp} value={form.gymName} onChange={e => upd('gymName', e.target.value)} placeholder="Iron Paradise" /></div>
                  <div><label className="form-label">GST Number</label><input style={inp} value={form.gst} onChange={e => upd('gst', e.target.value)} placeholder="27AABCI1234A1Z5" /></div>
                </>)}

                {/* Trainer Form */}
                {selRole === 'trainer' && (<>
                  <div><label className="form-label">Trainer Name *</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Marcus Johnson" /></div>
                  <div><label className="form-label">Email Address *</label><input style={inp} type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="trainer@email.com" /></div>
                  <div><label className="form-label">Phone Number *</label><input style={inp} value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="9876543210" /></div>
                  <div><label className="form-label">Assign to Gym *</label>
                    <select style={inp} value={form.gymId} onChange={e => upd('gymId', e.target.value)}>
                      <option value="">Select Gym</option>
                      {GYMS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div><label className="form-label">Specialization</label><input style={inp} value={form.specialization} onChange={e => upd('specialization', e.target.value)} placeholder="Strength, Yoga, etc." /></div>
                </>)}

                {/* Client Form */}
                {selRole === 'client' && (<>
                  <div><label className="form-label">Member Name *</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Ravi Kumar" /></div>
                  <div><label className="form-label">Email Address *</label><input style={inp} type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="client@email.com" /></div>
                  <div><label className="form-label">Phone Number *</label><input style={inp} value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="9876543210" /></div>
                  <div><label className="form-label">Assign to Gym *</label>
                    <select style={inp} value={form.gymId} onChange={e => upd('gymId', e.target.value)}>
                      <option value="">Select Gym</option>
                      {GYMS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  {form.gymId && (
                    <div><label className="form-label">Assign Trainer (Optional)</label>
                      <select style={inp} value={form.trainerId} onChange={e => upd('trainerId', e.target.value)}>
                        <option value="">No Trainer</option>
                        {getGymTrainers(form.gymId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  )}
                </>)}

                {/* Kitchen Form */}
                {selRole === 'kitchen' && (<>
                  <div><label className="form-label">Kitchen Staff Name *</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Chef Rajesh" /></div>
                  <div><label className="form-label">Email Address *</label><input style={inp} type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="kitchen@email.com" /></div>
                  <div><label className="form-label">Phone Number *</label><input style={inp} value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="9876543210" /></div>
                  <div><label className="form-label">Kitchen Name *</label><input style={inp} value={form.kitchenName} onChange={e => upd('kitchenName', e.target.value)} placeholder="FitKitchen Central" /></div>
                  <div><label className="form-label">Kitchen Location *</label><input style={inp} value={form.kitchenLocation} onChange={e => upd('kitchenLocation', e.target.value)} placeholder="HSR Layout" /></div>
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

      {/* Active Users */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">👥 Active Users ({activeUsers.length})</div>
        </div>

        {/* Desktop Table */}
        <div className="admin-table-desktop">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Detail / Gym</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {activeUsers.map(u => (
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
                      <button className="btn btn-outline btn-sm" title="Change Role" onClick={() => openPromoteModal(u)}>🔄</button>
                      <button className="btn btn-outline btn-sm" style={{ color: '#ef4444' }} title="Block User" onClick={() => handleBlock(u)}>🚫</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="admin-cards-mobile" style={{ display: 'none' }}>
          {activeUsers.map(u => (
            <div key={u.id} style={{
              padding: 14, borderBottom: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{u.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                </div>
                <span className={`badge ${roleBadge[u.role] || 'badge-blue'}`} style={{ flexShrink: 0 }}>{u.role.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span>🏢 {u.gymName || GYMS.find(g => g.id === u.gymId)?.name || u.kitchenName || (u.vehicleType ? `${u.vehicleType}` : '—')}</span>
                <span>📅 {u.joinDate || '—'}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: 12 }} onClick={() => openPromoteModal(u)}>🔄 Change Role</button>
                <button className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: 12, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => handleBlock(u)}>🚫 Block</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blocked Users Section */}
      {blockedUsers.length > 0 && (
        <div className="card" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="card-header" style={{ borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="card-title" style={{ color: '#ef4444' }}>🚫 Blocked Accounts ({blockedUsers.length})</div>
          </div>

          {/* Desktop Table */}
          <div className="admin-table-desktop">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Blocked On</th><th>Actions</th></tr></thead>
              <tbody>
                {blockedUsers.map(u => (
                  <tr key={u.id} style={{ opacity: 0.7 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>{u.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                          <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>BLOCKED</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{u.email}</td>
                    <td><span className={`badge ${roleBadge[u.role] || 'badge-blue'}`}>{u.role.toUpperCase()}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.blockedAt || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-outline btn-sm" style={{ color: '#22c55e' }} title="Unblock" onClick={() => handleUnblock(u)}>✅ Restore</button>
                        <button className="btn btn-outline btn-sm" style={{ color: '#ef4444' }} title="Delete Permanently" onClick={() => handleDeletePermanent(u)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="admin-cards-mobile" style={{ display: 'none' }}>
            {blockedUsers.map(u => (
              <div key={u.id} style={{
                padding: 14, borderBottom: '1px solid rgba(239,68,68,0.1)',
                display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{u.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{u.name}</div>
                    <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 700 }}>🚫 BLOCKED</div>
                  </div>
                  <span className={`badge ${roleBadge[u.role] || 'badge-blue'}`} style={{ flexShrink: 0 }}>{u.role.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {u.email} • Blocked: {u.blockedAt || '—'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: 12, color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)' }} onClick={() => handleUnblock(u)}>✅ Restore</button>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: 12, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => handleDeletePermanent(u)}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
