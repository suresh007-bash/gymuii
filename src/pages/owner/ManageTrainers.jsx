import { useState, useEffect } from 'react';
import { Dumbbell, Users, AlertTriangle, CheckCircle2, XCircle, Inbox, Mail } from '../../components/Icons';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function ManageTrainers() {
  const { user, getOwnerTrainers, getTrainerClients, addUser, getDirectClients, allUsers, updateUser, blockUser } = useAuth();
  const { showToast } = useNotifications();
  const trainers = getOwnerTrainers(user?.id);
  const directClients = getDirectClients(user?.id);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTrainer, setActiveTrainer] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [tab, setTab] = useState('trainers'); // 'trainers' | 'requests'
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialization: '' });

  // Trainer join requests from localStorage (shared with MyOwner.jsx)
  const [trainerRequests, setTrainerRequests] = useState(() => {
    const saved = localStorage.getItem('trainer_gym_requests');
    return saved ? JSON.parse(saved) : [];
  });

  // Also check client trainer requests
  const [clientTrainerRequests, setClientTrainerRequests] = useState(() => {
    const saved = localStorage.getItem('trainer_requests');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync from localStorage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const saved1 = localStorage.getItem('trainer_gym_requests');
      if (saved1) setTrainerRequests(JSON.parse(saved1));
      const saved2 = localStorage.getItem('trainer_requests');
      if (saved2) setClientTrainerRequests(JSON.parse(saved2));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Filter requests for this owner's gym
  const pendingGymRequests = trainerRequests.filter(
    r => (r.ownerId === user?.id || r.gymId === user?.gymId) && r.status === 'pending'
  );
  const processedGymRequests = trainerRequests.filter(
    r => (r.ownerId === user?.id || r.gymId === user?.gymId) && r.status !== 'pending'
  );

  // Client requests for trainers at this gym
  const pendingClientRequests = clientTrainerRequests.filter(r => {
    const trainer = allUsers.find(u => u.id === r.trainerId);
    return trainer && trainer.gymId === user?.gymId && r.status === 'pending';
  });
  const processedClientRequests = clientTrainerRequests.filter(r => {
    const trainer = allUsers.find(u => u.id === r.trainerId);
    return trainer && trainer.gymId === user?.gymId && r.status !== 'pending';
  });

  const totalPending = pendingGymRequests.length + pendingClientRequests.length;

  const handleAcceptTrainer = (req) => {
    // Update trainer's gymId and ownerId
    updateUser(req.trainerId, { gymId: req.gymId, ownerId: user.id });
    // Update request status
    const updated = trainerRequests.map(r => r.id === req.id ? { ...r, status: 'accepted' } : r);
    setTrainerRequests(updated);
    localStorage.setItem('trainer_gym_requests', JSON.stringify(updated));
    showToast(` ${req.trainerName} has been accepted and added to your gym!`);
  };

  const handleRejectTrainer = (req) => {
    const updated = trainerRequests.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r);
    setTrainerRequests(updated);
    localStorage.setItem('trainer_gym_requests', JSON.stringify(updated));
    showToast(` ${req.trainerName}'s request has been declined.`, 'warning');
  };

  const handleAcceptClientReq = (req) => {
    updateUser(req.clientId, { trainerId: req.trainerId });
    const updated = clientTrainerRequests.map(r => r.id === req.id ? { ...r, status: 'accepted' } : r);
    setClientTrainerRequests(updated);
    localStorage.setItem('trainer_requests', JSON.stringify(updated));
    showToast(` ${req.clientName} assigned to ${req.trainerName}!`);
  };

  const handleRejectClientReq = (req) => {
    const updated = clientTrainerRequests.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r);
    setClientTrainerRequests(updated);
    localStorage.setItem('trainer_requests', JSON.stringify(updated));
    showToast(` ${req.clientName}'s trainer request declined.`, 'warning');
  };

  const upd = (k,v) => setForm(p=>({...p,[k]:v}));
  const inp = {width:'100%',padding:'10px 14px',background:'var(--bg-input)',border:'1px solid var(--border)',borderRadius:12,color:'var(--text-primary)',fontSize: 'calc(18px + 0.5vw)'};
  const save = () => { if(!form.name||!form.email) return; const avatar = form.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); addUser({...form,avatar,role:'trainer',gymId:user.gymId,ownerId:user.id,password:'12345678',profileComplete:false}); showToast('Trainer added!'); setShowAdd(false); setForm({name:'',email:'',phone:'',specialization:''}); };

  return (
    <DashboardLayout title="Manage Trainers">
      {/* Confirmation Modal */}
      {confirm && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 'calc(52px + 0.5vw)', marginBottom: 12 }}><AlertTriangle size={48} color="#f59e0b" /></div>
            <h3 style={{ fontSize: 'calc(22px + 0.5vw)', fontWeight: 800, marginBottom: 12 }}>{confirm.title}</h3>
            <p style={{ fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>{confirm.msg}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn" style={{ background: confirm.color, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }} onClick={confirm.action}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setTab('trainers')}
          style={{
            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 'calc(18px + 0.5vw)', fontFamily: 'Outfit', transition: 'all 0.3s',
            background: tab === 'trainers' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'var(--bg-tertiary)',
            color: tab === 'trainers' ? '#fff' : 'var(--text-secondary)',
          }}
        >
          <Dumbbell size={14} style={{marginRight:4}} /> My Trainers ({trainers.length})
        </button>
        <button
          onClick={() => setTab('requests')}
          style={{
            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 'calc(18px + 0.5vw)', fontFamily: 'Outfit', transition: 'all 0.3s',
            background: tab === 'requests' ? 'linear-gradient(135deg, #f97316, #fb923c)' : 'var(--bg-tertiary)',
            color: tab === 'requests' ? '#fff' : 'var(--text-secondary)',
            position: 'relative',
          }}
        >
          <Mail size={14} style={{marginRight:4}} /> Requests
          {totalPending > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              width: 22, height: 22, borderRadius: '50%',
              background: '#ef4444', color: '#fff', fontSize: 'calc(15px + 0.5vw)', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
              animation: 'pulse 2s infinite',
            }}>{totalPending}</span>
          )}
        </button>
      </div>

      {/* ═══ TRAINERS TAB ═══ */}
      {tab === 'trainers' && (<>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:20, alignItems: 'center'}}>
          <h2 style={{fontFamily:'Outfit',fontWeight:800, margin: 0}}><Dumbbell size={16} style={{marginRight:4}} /> Trainers ({trainers.length})</h2>
          <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ Add Trainer</button>
        </div>

        {showAdd && <div className="modal-overlay" onClick={()=>setShowAdd(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}>
          <div className="modal-header"><h3 className="modal-title">Add New Trainer</h3><button className="modal-close" onClick={()=>setShowAdd(false)}></button></div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div><label className="form-label">Name</label><input style={inp} value={form.name} onChange={e=>upd('name',e.target.value)}/></div>
            <div><label className="form-label">Email</label><input style={inp} value={form.email} onChange={e=>upd('email',e.target.value)}/></div>
            <div><label className="form-label">Phone</label><input style={inp} value={form.phone} onChange={e=>upd('phone',e.target.value)}/></div>
            <div><label className="form-label">Specialization</label><input style={inp} value={form.specialization} onChange={e=>upd('specialization',e.target.value)}/></div>
          </div>
          <div className="modal-footer"><button className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn btn-success" onClick={save}>Add Trainer</button></div>
        </div></div>}
        
        {activeTrainer && (
          <div className="modal-overlay" onClick={() => setActiveTrainer(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
              <div className="modal-header">
                <h3 className="modal-title"><Users size={14} style={{marginRight:4}} /> Assign Client to {activeTrainer.name}</h3>
                <button className="modal-close" onClick={() => setActiveTrainer(null)}></button>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
                {allUsers.filter(u => u.role === 'client' && u.gymId === user.gymId && !u.blocked).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>No clients found in this gym.</div>
                ) : (
                  allUsers.filter(u => u.role === 'client' && u.gymId === user.gymId && !u.blocked).map(client => {
                    const currentTrainer = allUsers.find(u => u.id === client.trainerId);
                    const isAssignedToThis = client.trainerId === activeTrainer.id;
                    return (
                      <div key={client.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: 10,
                        borderRadius: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border)'
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #f97316, #fb923c)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 'calc(17px + 0.5vw)', fontWeight: 800, color: '#fff'
                        }}>{client.avatar}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 'calc(17px + 0.5vw)' }}>{client.name}</div>
                          <div style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)' }}>
                            {currentTrainer ? `Trainer: ${currentTrainer.name}` : 'Direct Client'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {isAssignedToThis ? (<>
                            <span style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--accent-green)', fontWeight: 700 }}>Assigned </span>
                            <button className="btn btn-outline btn-sm" style={{ color: '#ef4444', fontSize: 'calc(14px + 0.5vw)', padding: '4px 8px' }} onClick={() => setConfirm({
                              title: ' Remove Client',
                              msg: `Remove "${client.name}" from ${activeTrainer.name}? They will become a direct client with no trainer assigned.`,
                              color: '#ef4444',
                              action: () => { updateUser(client.id, { trainerId: null }); showToast(`${client.name} unassigned from ${activeTrainer.name}`); setConfirm(null); }
                            })}>Remove</button>
                          </>) : (
                            <button className="btn btn-primary btn-sm" onClick={() => setConfirm({
                              title: ' Assign Client',
                              msg: `Assign "${client.name}" to ${activeTrainer.name}?${currentTrainer ? ` They are currently with ${currentTrainer.name}.` : ''}`,
                              color: '#22c55e',
                              action: () => { updateUser(client.id, { trainerId: activeTrainer.id }); showToast(` Assigned ${client.name} to ${activeTrainer.name}`); setConfirm(null); }
                            })}>Assign</button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="modal-footer" style={{ marginTop: 14 }}>
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveTrainer(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
          {trainers.map(t=>{const tc=getTrainerClients(t.id); return (
            <div key={t.id} className="card" style={{animation:'fadeInUp 0.4s ease'}}>
              <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
                <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#4f46e5,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize: 'calc(20px + 0.5vw)',fontWeight:800,color:'#fff'}}>{t.avatar}</div>
                <div><div style={{fontWeight:700,fontSize: 'calc(19px + 0.5vw)'}}>{t.name}</div><div style={{fontSize: 'calc(15px + 0.5vw)',color:'var(--text-muted)'}}>{t.specialization||'General'}</div></div>
              </div>
              <div style={{display:'flex',gap:8,marginBottom:12}}>
                <span className="badge badge-blue"><Users size={12} style={{marginRight:2}} /> {tc.length} clients</span>
                <span className="badge badge-green">{t.certifications||'Certified'}</span>
              </div>
              <button className="btn btn-outline btn-sm" style={{width:'100%'}} onClick={() => setActiveTrainer(t)}>Assign Client</button>
            </div>
          );})}
        </div>

        {trainers.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 'calc(52px + 0.5vw)', marginBottom: 12 }}><Dumbbell size={48} color="#8b5cf6" /></div>
            <h3 style={{ fontWeight: 800, marginBottom: 8 }}>No Trainers Yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'calc(17px + 0.5vw)' }}>Add trainers or wait for join requests from trainers.</p>
          </div>
        )}
      </>)}

      {/* ═══ REQUESTS TAB ═══ */}
      {tab === 'requests' && (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {/* Trainer Join Requests Section */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(22px + 0.5vw)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Dumbbell size={16} style={{marginRight:4}} /> Trainer Join Requests
              {pendingGymRequests.length > 0 && (
                <span style={{
                  padding: '2px 10px', borderRadius: 20, fontSize: 'calc(16px + 0.5vw)', fontWeight: 700,
                  background: 'rgba(249,115,22,0.1)', color: '#f97316',
                }}>{pendingGymRequests.length} pending</span>
              )}
            </h3>

            {pendingGymRequests.length === 0 && processedGymRequests.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 'calc(40px + 0.5vw)', marginBottom: 8 }}><Inbox size={36} color="var(--text-muted)" /></div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'calc(17px + 0.5vw)' }}>No trainer join requests yet. Trainers can find your gym and send requests to join.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Pending First */}
                {pendingGymRequests.map(req => (
                  <div key={req.id} className="card" style={{
                    padding: 16, border: '1px solid rgba(249,115,22,0.2)',
                    background: 'rgba(249,115,22,0.03)', animation: 'fadeInUp 0.3s ease',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'calc(21px + 0.5vw)', fontWeight: 800, color: '#fff',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                      }}>{req.trainerAvatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 'calc(19px + 0.5vw)' }}>{req.trainerName}</div>
                        <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>{req.trainerSpecialization || 'General Trainer'}</div>
                        <div style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)', marginTop: 2 }}>
                          Requested {new Date(req.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleAcceptTrainer(req)}
                          style={{
                            padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
                            fontWeight: 700, fontSize: 'calc(17px + 0.5vw)', transition: 'all 0.2s',
                            boxShadow: '0 3px 10px rgba(34,197,94,0.3)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        > Accept</button>
                        <button
                          onClick={() => handleRejectTrainer(req)}
                          style={{
                            padding: '8px 18px', borderRadius: 10, border: '2px solid #ef4444',
                            background: 'transparent', color: '#ef4444', cursor: 'pointer',
                            fontWeight: 700, fontSize: 'calc(17px + 0.5vw)', transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
                        > Reject</button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Processed */}
                {processedGymRequests.map(req => (
                  <div key={req.id} className="card" style={{ padding: 14, opacity: 0.7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: req.status === 'accepted' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'calc(18px + 0.5vw)', fontWeight: 800, color: '#fff',
                      }}>{req.trainerAvatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 'calc(18px + 0.5vw)' }}>{req.trainerName}</div>
                        <div style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)' }}>{req.trainerSpecialization || 'Trainer'}</div>
                      </div>
                      <span className={`badge ${req.status === 'accepted' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 'calc(15px + 0.5vw)' }}>
                        {req.status === 'accepted' ? ' Accepted' : ' Rejected'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Client-Trainer Requests Section */}
          <div>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(22px + 0.5vw)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} style={{marginRight:4}} /> Client Trainer Requests
              {pendingClientRequests.length > 0 && (
                <span style={{
                  padding: '2px 10px', borderRadius: 20, fontSize: 'calc(16px + 0.5vw)', fontWeight: 700,
                  background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                }}>{pendingClientRequests.length} pending</span>
              )}
            </h3>

            {pendingClientRequests.length === 0 && processedClientRequests.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 'calc(40px + 0.5vw)', marginBottom: 8 }}><Inbox size={36} color="var(--text-muted)" /></div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'calc(17px + 0.5vw)' }}>No client trainer requests yet. Clients can request trainers from the "Join Gym" page.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendingClientRequests.map(req => {
                  const trainer = allUsers.find(u => u.id === req.trainerId);
                  return (
                    <div key={req.id} className="card" style={{
                      padding: 16, border: '1px solid rgba(99,102,241,0.2)',
                      background: 'rgba(99,102,241,0.03)', animation: 'fadeInUp 0.3s ease',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                          background: 'linear-gradient(135deg, #f97316, #fb923c)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 'calc(21px + 0.5vw)', fontWeight: 800, color: '#fff',
                        }}>{req.clientAvatar}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 'calc(19px + 0.5vw)' }}>{req.clientName}</div>
                          <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>
                            Wants trainer: <strong>{trainer?.name || req.trainerName}</strong>
                          </div>
                          <div style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)', marginTop: 2 }}>
                            Goal: {req.clientGoal} • {new Date(req.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleAcceptClientReq(req)}
                            style={{
                              padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                              background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
                              fontWeight: 700, fontSize: 'calc(17px + 0.5vw)', transition: 'all 0.2s',
                              boxShadow: '0 3px 10px rgba(34,197,94,0.3)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          > Accept</button>
                          <button
                            onClick={() => handleRejectClientReq(req)}
                            style={{
                              padding: '8px 18px', borderRadius: 10, border: '2px solid #ef4444',
                              background: 'transparent', color: '#ef4444', cursor: 'pointer',
                              fontWeight: 700, fontSize: 'calc(17px + 0.5vw)', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
                          > Reject</button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {processedClientRequests.map(req => (
                  <div key={req.id} className="card" style={{ padding: 14, opacity: 0.7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: req.status === 'accepted' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'calc(18px + 0.5vw)', fontWeight: 800, color: '#fff',
                      }}>{req.clientAvatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 'calc(18px + 0.5vw)' }}>{req.clientName}</div>
                        <div style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)' }}>Requested: {req.trainerName}</div>
                      </div>
                      <span className={`badge ${req.status === 'accepted' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 'calc(15px + 0.5vw)' }}>
                        {req.status === 'accepted' ? ' Accepted' : ' Rejected'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
