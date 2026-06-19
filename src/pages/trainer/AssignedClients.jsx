import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import { MENU_ITEMS } from '../../data/mockMenu';

export default function AssignedClients() {
  const { user, getTrainerClients, updateUser, addUser } = useAuth();
  const { saveDietPlan } = useOrders();
  const { showToast } = useNotifications();
  const clients = getTrainerClients(user?.id);

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

  // Diet modal state
  const [dietClient, setDietClient] = useState(null);
  const [planName, setPlanName] = useState('');
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [search, setSearch] = useState('');

  // Message modal state
  const [msgClient, setMsgClient] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMsg, setNewMsg] = useState('');

  // Add Member modal state
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', phone: '', age: '', gender: 'Male', height: '', weight: '', goal: 'Weight Loss', diet: 'Non-Veg', allergies: '' });
  const updMember = (k, v) => setMemberForm(p => ({ ...p, [k]: v }));
  const memberInp = { width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Outfit' };
  const memberLbl = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 };

  const saveMember = () => {
    if (!memberForm.name || !memberForm.email) { showToast('Name and email required', 'error'); return; }
    const avatar = memberForm.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    addUser({ ...memberForm, id: memberForm.email, avatar, role: 'client', trainerId: user.id, gymId: user.gymId, password: '12345678', requirePasswordChange: true });
    showToast(`✅ ${memberForm.name} added as a new member!`);
    setMemberForm({ name: '', email: '', phone: '', age: '', gender: 'Male', height: '', weight: '', goal: 'Weight Loss', diet: 'Non-Veg', allergies: '' });
    setShowAddMember(false);
  };

  const toggleFood = (id) => setSelectedFoods(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleCreateDiet = () => {
    if (!planName || selectedFoods.length === 0) { showToast('Name and foods required', 'error'); return; }
    saveDietPlan({
      name: planName, trainerId: user.id, trainerName: user.name,
      items: selectedFoods, assignedTo: [dietClient.id],
    });
    showToast(`✅ Diet plan "${planName}" assigned to ${dietClient.name}!`);
    setDietClient(null); setPlanName(''); setSelectedFoods([]); setSearch('');
  };

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    const key = msgClient.id;
    const msg = { text: newMsg, sender: 'trainer', time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => ({ ...prev, [key]: [...(prev[key] || []), msg] }));
    setNewMsg('');
    showToast('Message sent! 💬');
  };

  const filteredFoods = MENU_ITEMS.filter(m => m.available).filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="My Clients">
      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3 className="modal-title">➕ New Member Registration</h3>
              <button className="modal-close" onClick={() => setShowAddMember(false)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><label style={memberLbl}>Full Name *</label><input style={memberInp} value={memberForm.name} onChange={e => updMember('name', e.target.value)} placeholder="John Doe" /></div>
              <div><label style={memberLbl}>Email *</label><input style={memberInp} type="email" value={memberForm.email} onChange={e => updMember('email', e.target.value)} placeholder="john@email.com" /></div>
              <div><label style={memberLbl}>Phone</label><input style={memberInp} value={memberForm.phone} onChange={e => updMember('phone', e.target.value)} placeholder="9876543210" /></div>
              <div><label style={memberLbl}>Age</label><input style={memberInp} type="number" value={memberForm.age} onChange={e => updMember('age', e.target.value)} /></div>
              <div><label style={memberLbl}>Gender</label><select style={memberInp} value={memberForm.gender} onChange={e => updMember('gender', e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></div>
              <div><label style={memberLbl}>Goal</label><select style={memberInp} value={memberForm.goal} onChange={e => updMember('goal', e.target.value)}><option>Weight Loss</option><option>Muscle Gain</option><option>Maintenance</option></select></div>
              <div><label style={memberLbl}>Height (cm)</label><input style={memberInp} type="number" value={memberForm.height} onChange={e => updMember('height', e.target.value)} /></div>
              <div><label style={memberLbl}>Weight (kg)</label><input style={memberInp} type="number" value={memberForm.weight} onChange={e => updMember('weight', e.target.value)} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              <div><label style={memberLbl}>Dietary Preference</label><select style={memberInp} value={memberForm.diet} onChange={e => updMember('diet', e.target.value)}><option>Non-Veg</option><option>Veg</option><option>Vegan</option></select></div>
              <div><label style={memberLbl}>Allergies</label><input style={memberInp} value={memberForm.allergies} onChange={e => updMember('allergies', e.target.value)} placeholder="e.g., Nuts, Lactose" /></div>
            </div>
            <div className="modal-footer" style={{ marginTop: 16 }}>
              <button className="btn btn-outline" onClick={() => setShowAddMember(false)}>Cancel</button>
              <button className="btn btn-success" onClick={saveMember} disabled={!memberForm.name || !memberForm.email}>✅ Save Member</button>
            </div>
          </div>
        </div>
      )}

      {/* Diet Plan Modal */}
      {dietClient && (
        <div className="modal-overlay" onClick={() => { setDietClient(null); setPlanName(''); setSelectedFoods([]); setSearch(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 className="modal-title">🥗 Create Diet Plan — {dietClient.name}</h3>
              <button className="modal-close" onClick={() => { setDietClient(null); setPlanName(''); setSelectedFoods([]); setSearch(''); }}>✕</button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Plan Name</label>
              <input className="form-input" value={planName} onChange={e => setPlanName(e.target.value)} placeholder="e.g., High Protein Plan" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Search & Select Foods</label>
              <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search foods..." style={{ marginBottom: 8 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                {filteredFoods.map(item => (
                  <div key={item.id} onClick={() => toggleFood(item.id)} style={{
                    padding: 8, display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', borderRadius: 8,
                    background: selectedFoods.includes(item.id) ? 'rgba(249,115,22,0.08)' : 'var(--bg-tertiary)',
                    border: `1px solid ${selectedFoods.includes(item.id) ? 'var(--accent-orange)' : 'var(--border)'}`,
                  }}>
                    <img src={item.image} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{selectedFoods.includes(item.id) ? '✅ ' : ''}{item.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>🔥{item.calories} • 💪{item.protein}g • ₹{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {selectedFoods.length > 0 && (
              <div style={{ padding: 10, background: 'rgba(34,197,94,0.06)', borderRadius: 10, marginBottom: 12, fontSize: 12 }}>
                <strong>{selectedFoods.length} items selected •</strong>
                🔥 {selectedFoods.reduce((a, id) => a + (MENU_ITEMS.find(m => m.id === id)?.calories || 0), 0)} kcal •
                💪 {selectedFoods.reduce((a, id) => a + (MENU_ITEMS.find(m => m.id === id)?.protein || 0), 0)}g •
                ₹{selectedFoods.reduce((a, id) => a + (MENU_ITEMS.find(m => m.id === id)?.price || 0), 0)}
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => { setDietClient(null); setPlanName(''); setSelectedFoods([]); }}>Cancel</button>
              <button className="btn btn-success" onClick={handleCreateDiet} disabled={!planName || selectedFoods.length === 0}>✅ Assign Diet Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {msgClient && (
        <div className="modal-overlay" onClick={() => setMsgClient(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">💬 Chat — {msgClient.name}</h3>
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
              <span style={{ animation: 'pulse 2s infinite' }}>🔔</span> Pending Requests ({pendingRequests.length})
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
                    <span>📧 {req.clientEmail}</span>
                    <span>🎯 {req.clientGoal}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    ⏰ Requested {new Date(req.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                  >✅ Accept</button>
                  <button
                    className="btn btn-sm"
                    onClick={() => rejectRequest(req.id)}
                    style={{
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                      color: '#ef4444', fontWeight: 700, fontSize: 12, padding: '8px 16px',
                      borderRadius: 10, cursor: 'pointer', fontFamily: 'Outfit',
                    }}
                  >❌ Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">👥 Assigned Clients ({clients.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddMember(true)}>➕ Add Member</button>
        </div>
        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No clients assigned yet</div>
            <button className="btn btn-primary" onClick={() => setShowAddMember(true)}>➕ Add Your First Member</button>
          </div>
        ) : (
        <table className="data-table"><thead><tr><th>Member</th><th>Goal</th><th>Diet</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>{clients.map(c => (
            <tr key={c.id}>
              <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>{c.avatar}</div>
                <div><div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.email}</div></div>
              </div></td>
              <td><span className="badge badge-blue">{c.goal}</span></td>
              <td>{c.diet}</td>
              <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.joinDate}</td>
              <td><div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-outline btn-sm" onClick={() => { setDietClient(c); setPlanName(''); setSelectedFoods([]); }}>📋 Diet</button>
                <button className="btn btn-outline btn-sm" onClick={() => setMsgClient(c)}>💬 Msg</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>)}
      </div>
    </DashboardLayout>
  );
}
