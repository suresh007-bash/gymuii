import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import { Icon, UserPlus, CheckCircle2, XCircle, User, Users, MessageSquare, Edit, Bell, Mail, Target, Clock, Save, UserMinus } from '../../components/Icons';


export default function AssignedClients() {

  const { user, getTrainerClients, getOwnerClients, updateUser, addUser, allUsers, blockUser } = useAuth();
  const { } = useOrders();
  const { showToast } = useNotifications();
  const clients = user?.role === 'owner' ? getOwnerClients(user?.id) : getTrainerClients(user?.id);

  // Confirmation modal
  const [confirm, setConfirm] = useState(null);

  // Trainer Request Management
  const [trainerRequests, setTrainerRequests] = useState(() => {
    const saved = localStorage.getItem('trainer_requests');
    return saved ? JSON.parse(saved) : [];
  });

  // Re-read requests periodically to catch new client requests
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('trainer_requests');
      if (saved) setTrainerRequests(JSON.parse(saved));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const pendingRequests = trainerRequests.filter(r => r.trainerId === user?.id && r.status === 'pending');

  const acceptRequest = (reqId) => {
    const saved = localStorage.getItem('trainer_requests');
    let allReqs = saved ? JSON.parse(saved) : [];
    const req = allReqs.find(r => r.id === reqId);
    if (!req) return;
    // Update request status
    allReqs = allReqs.map(r => r.id === reqId ? { ...r, status: 'accepted' } : r);
    localStorage.setItem('trainer_requests', JSON.stringify(allReqs));
    setTrainerRequests(allReqs);
    // Assign client to this trainer
    updateUser(req.clientId, { trainerId: user.id, gymId: user.gymId });
    showToast(`✅ ${req.clientName} is now your client!`);
  };

  const rejectRequest = (reqId) => {
    const saved = localStorage.getItem('trainer_requests');
    let allReqs = saved ? JSON.parse(saved) : [];
    allReqs = allReqs.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r);
    localStorage.setItem('trainer_requests', JSON.stringify(allReqs));
    setTrainerRequests(allReqs);
    const req = allReqs.find(r => r.id === reqId);
    showToast(`Request from ${req?.clientName || 'client'} declined.`, 'info');
  };



  // Message modal state
  const [msgClient, setMsgClient] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMsg, setNewMsg] = useState('');

  // Add Member modal state
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', phone: '' });
  const updMember = (k, v) => setMemberForm(p => ({ ...p, [k]: v }));
  const memberInp = { width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Outfit' };
  const memberLbl = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 };

  const saveMember = () => {
    if (!memberForm.name || !memberForm.email) { showToast('Name and email required', 'error'); return; }
    const avatar = memberForm.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    addUser({
      ...memberForm,
      id: memberForm.email,
      avatar,
      role: 'client',
      trainerId: user.role === 'trainer' ? user.id : null,
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
    showToast(`✅ ${memberForm.name} added as a new member!`);
    setMemberForm({ name: '', email: '', phone: '' });
    setShowAddMember(false);
  };

  // View Profile Modal State
  const [viewProfileClient, setViewProfileClient] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  const openClientProfile = (c) => {
    setViewProfileClient(c);
    setProfileForm({ ...c });
    setIsEditingProfile(false);
  };

  const handleUpdateProfile = () => {
    updateUser(viewProfileClient.id, profileForm);
    showToast(`✅ Profile for ${profileForm.name} updated!`);
    setViewProfileClient({ ...viewProfileClient, ...profileForm });
    setIsEditingProfile(false);
  };



  const sendMessage = () => {
    if (!newMsg.trim()) return;
    const key = msgClient.id;
    const msg = { text: newMsg, sender: 'trainer', time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => ({ ...prev, [key]: [...(prev[key] || []), msg] }));
    setNewMsg('');
    showToast('Message sent! 💬');
  };



  return (
    <DashboardLayout title="My Clients">
      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3 className="modal-title"><Icon icon={UserPlus} size={16} style={{marginRight:6}} /> New Member Registration</h3>
              <button className="modal-close" onClick={() => setShowAddMember(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={memberLbl}>Full Name *</label><input style={memberInp} value={memberForm.name} onChange={e => updMember('name', e.target.value)} placeholder="John Doe" /></div>
              <div><label style={memberLbl}>Email *</label><input style={memberInp} type="email" value={memberForm.email} onChange={e => updMember('email', e.target.value)} placeholder="john@email.com" /></div>
              <div><label style={memberLbl}>Phone</label><input style={memberInp} value={memberForm.phone} onChange={e => updMember('phone', e.target.value)} placeholder="9876543210" /></div>
            </div>
            <div className="modal-footer" style={{ marginTop: 16 }}>
              <button className="btn btn-outline" onClick={() => setShowAddMember(false)}>Cancel</button>
              <button className="btn btn-success" onClick={saveMember} disabled={!memberForm.name || !memberForm.email}><Icon icon={CheckCircle2} size={14} style={{marginRight:4}} /> Save Member</button>
            </div>
          </div>
        </div>
      )}

      {/* Client Profile Modal */}
      {viewProfileClient && (
        <div className="modal-overlay" onClick={() => setViewProfileClient(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3 className="modal-title"><Icon icon={User} size={16} style={{marginRight:6}} /> Client Profile — {profileForm.name}</h3>
              <button className="modal-close" onClick={() => setViewProfileClient(null)}>✕</button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 800, color: '#fff'
              }}>
                {profileForm.avatar}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{profileForm.name}</h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Joined: {profileForm.joinDate || 'N/A'}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 14 }}>
              <div>
                <label style={memberLbl}>Full Name</label>
                <input style={memberInp} value={profileForm.name || ''} readOnly={!isEditingProfile} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={memberLbl}>Gmail ID / Email</label>
                <input style={memberInp} value={profileForm.email || ''} readOnly={!isEditingProfile} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label style={memberLbl}>Phone</label>
                <input style={memberInp} value={profileForm.phone || ''} readOnly={!isEditingProfile} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label style={memberLbl}>Age</label>
                <input style={memberInp} type="number" value={profileForm.age || ''} readOnly={!isEditingProfile} onChange={e => setProfileForm(p => ({ ...p, age: e.target.value }))} />
              </div>
              <div>
                <label style={memberLbl}>Gender</label>
                {isEditingProfile ? (
                  <select style={memberInp} value={profileForm.gender || 'Male'} onChange={e => setProfileForm(p => ({ ...p, gender: e.target.value }))}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                ) : (
                  <input style={memberInp} value={profileForm.gender || ''} readOnly />
                )}
              </div>
              <div>
                <label style={memberLbl}>Fitness Goal</label>
                {isEditingProfile ? (
                  <select style={memberInp} value={profileForm.goal || 'Weight Loss'} onChange={e => setProfileForm(p => ({ ...p, goal: e.target.value }))}>
                    <option>Weight Loss</option>
                    <option>Muscle Gain</option>
                    <option>Maintenance</option>
                  </select>
                ) : (
                  <input style={memberInp} value={profileForm.goal || ''} readOnly />
                )}
              </div>
              <div>
                <label style={memberLbl}>Height (cm)</label>
                <input style={memberInp} type="number" value={profileForm.height || ''} readOnly={!isEditingProfile} onChange={e => setProfileForm(p => ({ ...p, height: e.target.value }))} />
              </div>
              <div>
                <label style={memberLbl}>Weight (kg)</label>
                <input style={memberInp} type="number" value={profileForm.weight || ''} readOnly={!isEditingProfile} onChange={e => setProfileForm(p => ({ ...p, weight: e.target.value }))} />
              </div>
              <div>
                <label style={memberLbl}>Dietary Preference</label>
                {isEditingProfile ? (
                  <select style={memberInp} value={profileForm.diet || 'Non-Veg'} onChange={e => setProfileForm(p => ({ ...p, diet: e.target.value }))}>
                    <option>Non-Veg</option>
                    <option>Veg</option>
                    <option>Vegan</option>
                  </select>
                ) : (
                  <input style={memberInp} value={profileForm.diet || ''} readOnly />
                )}
              </div>
              <div>
                <label style={memberLbl}>Allergies</label>
                <input style={memberInp} value={profileForm.allergies || ''} readOnly={!isEditingProfile} onChange={e => setProfileForm(p => ({ ...p, allergies: e.target.value }))} placeholder="None" />
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {isEditingProfile ? (
                  <>
                    <button className="btn btn-outline" onClick={() => { setProfileForm({ ...viewProfileClient }); setIsEditingProfile(false); }}>Cancel</button>
                    <button className="btn btn-success" onClick={handleUpdateProfile}><Icon icon={Save} size={14} style={{marginRight:4}} /> Save Changes</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-outline" onClick={() => setIsEditingProfile(true)}><Icon icon={Edit} size={14} style={{marginRight:4}} /> Edit Profile</button>
                    <button className="btn btn-outline" onClick={() => setViewProfileClient(null)}>Close</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Message Modal */}
      {msgClient && (
        <div className="modal-overlay" onClick={() => setMsgClient(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title"><Icon icon={MessageSquare} size={16} style={{marginRight:6}} /> Chat — {msgClient.name}</h3>
              <button className="modal-close" onClick={() => setMsgClient(null)}>✕</button>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 12, padding: 8 }}>
              {(messages[msgClient.id] || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 13 }}>No messages yet. Start a conversation!</div>
              ) : (
                (messages[msgClient.id] || []).map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'trainer' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                    <div style={{
                      maxWidth: '70%', padding: '8px 12px', borderRadius: 12, fontSize: 13,
                      background: msg.sender === 'trainer' ? 'var(--accent-orange)' : 'var(--bg-tertiary)',
                      color: msg.sender === 'trainer' ? '#fff' : 'var(--text-primary)',
                    }}>
                      {msg.text}
                      <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>{msg.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type a message..."
                onKeyDown={e => e.key === 'Enter' && sendMessage()} style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(251,191,36,0.3)', background: 'linear-gradient(135deg, rgba(251,191,36,0.04), rgba(249,115,22,0.04))' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ animation: 'pulse 2s infinite' }}><Icon icon={Bell} size={16} color="#fbbf24" /></span> Pending Requests ({pendingRequests.length})
            </h3>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {pendingRequests.map(req => (
              <div key={req.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: 14,
                borderRadius: 14, background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)', transition: 'all 0.2s ease',
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                  background: 'linear-gradient(135deg, #f97316, #fb923c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800, color: '#fff',
                  boxShadow: '0 4px 12px rgba(249,115,22,0.25)',
                }}>{req.clientAvatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 2 }}>{req.clientName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span><Icon icon={Mail} size={11} style={{marginRight:2}} /> {req.clientEmail}</span>
                    <span><Icon icon={Target} size={11} style={{marginRight:2}} /> {req.clientGoal}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    <Icon icon={Clock} size={11} style={{marginRight:2}} /> Requested {new Date(req.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => acceptRequest(req.id)}
                    style={{
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none',
                      color: '#fff', fontWeight: 700, fontSize: 12, padding: '8px 16px',
                      borderRadius: 10, cursor: 'pointer', fontFamily: 'Outfit',
                      boxShadow: '0 3px 10px rgba(34,197,94,0.3)',
                    }}
                  ><Icon icon={CheckCircle2} size={12} style={{marginRight:4}} /> Accept</button>
                  <button
                    className="btn btn-sm"
                    onClick={() => rejectRequest(req.id)}
                    style={{
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                      color: '#ef4444', fontWeight: 700, fontSize: 12, padding: '8px 16px',
                      borderRadius: 10, cursor: 'pointer', fontFamily: 'Outfit',
                    }}
                  ><Icon icon={XCircle} size={12} style={{marginRight:4}} /> Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title"><Icon icon={Users} size={16} style={{marginRight:6}} /> Assigned Clients ({clients.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddMember(true)}><Icon icon={UserPlus} size={14} style={{marginRight:4}} /> Add Member</button>
        </div>
        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icon icon={Users} size={48} color="var(--text-muted)" /></div>
            <div style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No clients assigned yet</div>
            <button className="btn btn-primary" onClick={() => setShowAddMember(true)}><Icon icon={UserPlus} size={14} style={{marginRight:4}} /> Add Your First Member</button>
          </div>
        ) : (
        <table className="data-table"><thead><tr><th>Member</th><th>Goal</th><th>Diet</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>{clients.map(c => (
            <tr key={c.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => openClientProfile(c)}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>{c.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, textDecoration: 'underline' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.email}</div>
                  </div>
                </div>
              </td>
              <td><span className="badge badge-blue">{c.goal || 'Not Set'}</span></td>
              <td>{c.diet || 'Not Set'}</td>
              <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.joinDate}</td>
              <td><div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-outline btn-sm" onClick={() => openClientProfile(c)}><Icon icon={User} size={13} style={{marginRight:4}} /> Profile</button>
                <button className="btn btn-outline btn-sm" style={{ color: '#ef4444' }} onClick={() => setConfirm({
                  title: <><Icon icon={UserMinus} size={18} /> Remove Client</>,
                  msg: `Are you sure you want to remove "${c.name}" from your clients? They will be blocked and cannot login until restored by admin.`,
                  color: '#ef4444',
                  action: () => { blockUser(c.id); showToast(`${c.name} has been removed`, 'warning'); setConfirm(null); }
                })}><Icon icon={UserMinus} size={13} style={{marginRight:4}} /> Remove</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>)}

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
      </div>
    </DashboardLayout>
  );
}
