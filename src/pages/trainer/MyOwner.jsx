import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { GYMS } from '../../data/mockUsers';
import { Icon, MapPin, Star, Users, Dumbbell, Clock, FileText, Target, CheckCircle2, Building2, Crown, LogOut, Eye, Handshake } from '../../components/Icons';

export default function MyOwner() {
  const { user, allUsers, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(null);
  const [view, setView] = useState('current'); // 'current' | 'browse' | 'detail'
  const [selectedGym, setSelectedGym] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [joinRequests, setJoinRequests] = useState(() => {
    const saved = localStorage.getItem('trainer_gym_requests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('trainer_gym_requests', JSON.stringify(joinRequests));
  }, [joinRequests]);

  // Find the owner of the trainer's gym
  const owner = allUsers.find(u => u.id === user?.ownerId) || allUsers.find(u => u.role === 'owner' && u.gymId === user?.gymId);
  const currentGymData = GYMS.find(g => g.id === user?.gymId);
  const gym = owner ? { name: owner.gymName, gst: owner.gst } : null;

  // Stats
  const gymTrainers = allUsers.filter(u => u.role === 'trainer' && u.gymId === user?.gymId && !u.blocked);
  const gymClients = allUsers.filter(u => u.role === 'client' && u.gymId === user?.gymId && !u.blocked);

  const handleLeaveGym = () => {
    setConfirm({
      title: ' Leave Gym',
      msg: `Are you sure you want to leave "${gym?.name || 'this gym'}"? You will lose access to all assigned clients and gym features.`,
      color: '#ef4444',
      action: () => {
        updateUser(user.id, { gymId: null, ownerId: null });
        showToast('You have left the gym. You can now browse and request to join another gym.', 'warning');
        setConfirm(null);
      }
    });
  };

  const getRequestStatus = (gymId) => {
    const req = joinRequests.find(r => r.trainerId === user?.id && r.gymId === gymId);
    return req ? req.status : null;
  };

  const sendJoinRequest = (gymData) => {
    const existing = joinRequests.find(r => r.trainerId === user?.id && r.gymId === gymData.id);
    if (existing) {
      showToast('Request already sent!', 'warning');
      return;
    }
    const gymOwner = allUsers.find(u => u.role === 'owner' && u.gymId === gymData.id);
    const newReq = {
      id: 'treq_' + Date.now(),
      trainerId: user.id,
      trainerName: user.name,
      trainerAvatar: user.avatar,
      trainerSpecialization: user.specialization,
      gymId: gymData.id,
      gymName: gymData.name,
      ownerId: gymOwner?.id || gymData.ownerId,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    setJoinRequests(prev => [...prev, newReq]);
    showToast(` Join request sent to ${gymData.name}! The owner will review it.`);
    setSelectedGym(null);
    setView('browse');
  };

  const cardStyle = { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 };
  const labelStyle = { fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' };
  const valueStyle = { fontSize: 'calc(18px + 0.5vw)', fontWeight: 700, color: 'var(--text-primary)' };

  // ═══ NO GYM — BROWSE & REQUEST VIEW ═══
  if (!user?.gymId) {
    // Detail View
    if (view === 'detail' && selectedGym) {
      const gymTrainersForGym = allUsers.filter(u => u.role === 'trainer' && u.gymId === selectedGym.id && !u.blocked);
      const gymClientsForGym = allUsers.filter(u => u.role === 'client' && u.gymId === selectedGym.id && !u.blocked);
      const reqStatus = getRequestStatus(selectedGym.id);

      return (
        <DashboardLayout title="My Gym & Owner">
          {/* Back */}
          <button onClick={() => { setView('browse'); setSelectedGym(null); setImageIndex(0); }} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
            fontSize: 'calc(18px + 0.5vw)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: 0,
          }}>
            ← Back to Gyms
          </button>

          {/* Image Carousel */}
          {selectedGym.images && selectedGym.images.length > 0 && (
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 20, height: 'clamp(180px, 30vw, 280px)' }}>
              <img src={selectedGym.images[imageIndex]} alt={selectedGym.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.5s ease' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
              {/* Nav Arrows */}
              {selectedGym.images.length > 1 && (
                <>
                  <button onClick={() => setImageIndex(i => (i - 1 + selectedGym.images.length) % selectedGym.images.length)} style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 'calc(20px + 0.5vw)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>‹</button>
                  <button onClick={() => setImageIndex(i => (i + 1) % selectedGym.images.length)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 'calc(20px + 0.5vw)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>›</button>
                </>
              )}
              {/* Dots */}
              <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                {selectedGym.images.map((_, i) => (
                  <button key={i} onClick={() => setImageIndex(i)} style={{
                    width: imageIndex === i ? 20 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
                    background: imageIndex === i ? '#f97316' : 'rgba(255,255,255,0.5)', transition: 'all 0.3s',
                  }} />
                ))}
              </div>
              {/* Gym Name Overlay */}
              <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
                <h2 style={{ color: '#fff', fontFamily: 'Outfit', fontWeight: 900, fontSize: 'calc(28px + 0.5vw)', margin: 0 }}>{selectedGym.name}</h2>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'calc(17px + 0.5vw)', marginTop: 4 }}><Icon icon={MapPin} size={13} style={{marginRight:4}} /> {selectedGym.location}</div>
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div className="card" style={{ textAlign: 'center', padding: 14 }}>
              <div style={{ fontSize: 'calc(26px + 0.5vw)', fontWeight: 900, color: '#f97316' }}><Icon icon={Star} size={20} color="#f97316" style={{marginRight:4}} /> {selectedGym.rating}</div>
              <div style={{ fontSize: 'calc(14px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 600 }}>Rating</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: 14 }}>
              <div style={{ fontSize: 'calc(26px + 0.5vw)', fontWeight: 900, color: '#3b82f6' }}><Icon icon={Users} size={20} color="#3b82f6" style={{marginRight:4}} /> {gymClientsForGym.length || selectedGym.members}</div>
              <div style={{ fontSize: 'calc(14px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 600 }}>Members</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: 14 }}>
              <div style={{ fontSize: 'calc(26px + 0.5vw)', fontWeight: 900, color: '#22c55e' }}><Icon icon={Dumbbell} size={20} color="#22c55e" style={{marginRight:4}} /> {gymTrainersForGym.length || selectedGym.trainers}</div>
              <div style={{ fontSize: 'calc(14px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 600 }}>Trainers</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: 14 }}>
              <div style={{ fontSize: 'calc(16px + 0.5vw)', fontWeight: 700, color: 'var(--text-primary)' }}><Icon icon={Clock} size={14} /></div>
              <div style={{ fontSize: 'calc(14px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>{selectedGym.hours || 'N/A'}</div>
            </div>
          </div>

          {/* About */}
          {selectedGym.description && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(20px + 0.5vw)', marginBottom: 10 }}><Icon icon={FileText} size={16} style={{marginRight:6}} /> About</h3>
              <p style={{ fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{selectedGym.description}</p>
            </div>
          )}

          {/* Amenities */}
          {selectedGym.amenities && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(20px + 0.5vw)', marginBottom: 12 }}><Icon icon={Target} size={16} style={{marginRight:6}} /> Amenities</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedGym.amenities.map((a, i) => (
                  <span key={i} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 'calc(16px + 0.5vw)', fontWeight: 600,
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                  }}><Icon icon={CheckCircle2} size={12} style={{marginRight:4}} /> {a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Current Trainers */}
          {gymTrainersForGym.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(20px + 0.5vw)', marginBottom: 12 }}><Icon icon={Dumbbell} size={16} style={{marginRight:6}} /> Current Trainers</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {gymTrainersForGym.map(t => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                    background: 'var(--bg-tertiary)', borderRadius: 12,
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 'calc(18px + 0.5vw)', fontWeight: 800, color: '#fff', flexShrink: 0,
                    }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'calc(18px + 0.5vw)' }}>{t.name}</div>
                      <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>{t.specialization || 'Trainer'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request to Join Button */}
          <div style={{ marginBottom: 20 }}>
            {reqStatus === 'pending' ? (
              <div style={{
                width: '100%', padding: '14px 20px', borderRadius: 14, textAlign: 'center',
                background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
                color: '#f59e0b', fontWeight: 700, fontSize: 'calc(18px + 0.5vw)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <span style={{ animation: 'pulse 2s infinite' }}></span> Join Request Pending — Awaiting Owner Approval
              </div>
            ) : reqStatus === 'accepted' ? (
              <div style={{
                width: '100%', padding: '14px 20px', borderRadius: 14, textAlign: 'center',
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                color: '#22c55e', fontWeight: 700, fontSize: 'calc(18px + 0.5vw)',
              }}>
                 Request Accepted — Welcome!
              </div>
            ) : (
              <button
                onClick={() => sendJoinRequest(selectedGym)}
                style={{
                  width: '100%', padding: '14px 20px', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff', fontWeight: 800, fontSize: 'calc(19px + 0.5vw)', cursor: 'pointer',
                  fontFamily: 'Outfit', transition: 'all 0.3s ease',
                  boxShadow: '0 4px 18px rgba(34,197,94,0.3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(34,197,94,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(34,197,94,0.3)'; }}
              >
                 Request to Join {selectedGym.name}
              </button>
            )}
          </div>
        </DashboardLayout>
      );
    }

    // Browse View
    return (
      <DashboardLayout title="My Gym & Owner">
        {/* Header */}
        <div className="card" style={{
          padding: 20, marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(249,115,22,0.08))',
          borderColor: 'rgba(34,197,94,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 'calc(40px + 0.5vw)' }}><Icon icon={Building2} size={36} color="#22c55e" /></div>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: 'calc(22px + 0.5vw)', marginBottom: 4 }}>Browse Available Gyms</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'calc(17px + 0.5vw)' }}>
                You're not currently assigned to a gym. Browse available gyms below and send a join request to the gym owner.
              </p>
            </div>
          </div>
        </div>

        {/* Pending Requests Banner */}
        {joinRequests.filter(r => r.trainerId === user?.id && r.status === 'pending').length > 0 && (
          <div style={{
            padding: '12px 16px', borderRadius: 12, marginBottom: 16,
            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
            fontSize: 'calc(17px + 0.5vw)', color: '#f59e0b', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
             You have {joinRequests.filter(r => r.trainerId === user?.id && r.status === 'pending').length} pending join request(s)
          </div>
        )}

        {/* Gym Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 16 }}>
          {GYMS.map(gymItem => {
            const reqStatus = getRequestStatus(gymItem.id);
            return (
              <div key={gymItem.id} className="card" style={{
                overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'pointer',
              }}
                onClick={() => { setSelectedGym(gymItem); setView('detail'); setImageIndex(0); }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Cover Image */}
                {gymItem.images && gymItem.images[0] && (
                  <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                    <img src={gymItem.images[0]} alt={gymItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 10, right: 10, padding: '4px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.6)', color: '#fbbf24', fontSize: 'calc(16px + 0.5vw)', fontWeight: 700 }}>
                       {gymItem.rating}
                    </div>
                    {reqStatus === 'pending' && (
                      <div style={{ position: 'absolute', top: 10, left: 10, padding: '4px 10px', borderRadius: 8, background: 'rgba(251,191,36,0.9)', color: '#fff', fontSize: 'calc(14px + 0.5vw)', fontWeight: 700 }}>
                         PENDING
                      </div>
                    )}
                  </div>
                )}
                <div style={{ padding: 16 }}>
                  <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(21px + 0.5vw)', marginBottom: 6 }}>{gymItem.name}</h4>
                  <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon icon={MapPin} size={12} style={{marginRight:4}} /> {gymItem.location}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <div style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--bg-tertiary)', fontSize: 'calc(16px + 0.5vw)', fontWeight: 600 }}>
                      <Icon icon={Users} size={12} style={{marginRight:4}} /> {gymItem.members} Members
                    </div>
                    <div style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--bg-tertiary)', fontSize: 'calc(16px + 0.5vw)', fontWeight: 600 }}>
                      <Icon icon={Dumbbell} size={12} style={{marginRight:4}} /> {gymItem.trainers} Trainers
                    </div>
                  </div>
                  <div style={{
                    width: '100%', padding: '10px', borderRadius: 10, textAlign: 'center',
                    background: reqStatus === 'pending' ? 'rgba(251,191,36,0.1)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: reqStatus === 'pending' ? '#f59e0b' : '#fff',
                    border: reqStatus === 'pending' ? '1px solid rgba(251,191,36,0.3)' : 'none',
                    fontWeight: 700, fontSize: 'calc(17px + 0.5vw)',
                  }}>
                    {reqStatus === 'pending' ? ' Request Pending' : <><Icon icon={Eye} size={14} style={{marginRight:4}} /> View Details & Join</>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DashboardLayout>
    );
  }

  // ═══ HAS GYM — CURRENT GYM VIEW ═══
  return (
    <DashboardLayout title="My Gym & Owner">
      {/* Confirmation Modal */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 'calc(52px + 0.5vw)', marginBottom: 12 }}>️</div>
            <h3 style={{ fontSize: 'calc(22px + 0.5vw)', fontWeight: 800, marginBottom: 12 }}>{confirm.title}</h3>
            <p style={{ fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>{confirm.msg}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn" style={{ background: confirm.color, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }} onClick={confirm.action}>Yes, Leave Gym</button>
            </div>
          </div>
        </div>
      )}

      {/* Gym Info Card */}
      <div style={{ ...cardStyle, marginBottom: 20, background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(249,115,22,0.06))', border: '1px solid rgba(34,197,94,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'linear-gradient(135deg, #22c55e, #4ade80)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'calc(32px + 0.5vw)'
          }}><Icon icon={Dumbbell} size={28} color="#fff" /></div>
          <div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'calc(26px + 0.5vw)', margin: 0 }}>{gym?.name || 'My Gym'}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'calc(16px + 0.5vw)', margin: 0 }}>Your current gym</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'calc(28px + 0.5vw)', fontWeight: 900, color: '#22c55e' }}>{gymTrainers.length}</div>
            <div style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 600 }}>Trainers</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'calc(28px + 0.5vw)', fontWeight: 900, color: '#3b82f6' }}>{gymClients.length}</div>
            <div style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 600 }}>Members</div>
          </div>
          {gym?.gst && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'calc(16px + 0.5vw)', fontWeight: 700, color: 'var(--text-primary)' }}>{gym.gst}</div>
              <div style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 600 }}>GST No.</div>
            </div>
          )}
        </div>
      </div>

      {/* Owner Profile Card */}
      {owner && (
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(20px + 0.5vw)', marginBottom: 16 }}><Icon icon={Crown} size={16} style={{marginRight:6}} /> Gym Owner</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #eab308, #f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'calc(26px + 0.5vw)', fontWeight: 900, color: '#fff',
              boxShadow: '0 4px 16px rgba(234,179,8,0.3)'
            }}>{owner.avatar}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'calc(22px + 0.5vw)', fontFamily: 'Outfit' }}>{owner.name}</div>
              <span className="badge badge-orange" style={{ fontSize: 'calc(14px + 0.5vw)' }}>GYM OWNER</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 16 }}>
            <div>
              <div style={labelStyle}>Email</div>
              <div style={valueStyle}>{owner.email}</div>
            </div>
            <div>
              <div style={labelStyle}>Phone</div>
              <div style={valueStyle}>{owner.phone || 'Not provided'}</div>
            </div>
            <div>
              <div style={labelStyle}>Gym Name</div>
              <div style={valueStyle}>{owner.gymName || '—'}</div>
            </div>
            <div>
              <div style={labelStyle}>Member Since</div>
              <div style={valueStyle}>{owner.joinDate || '—'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Gym Section */}
      <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.02)' }}>
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(20px + 0.5vw)', marginBottom: 8, color: '#ef4444' }}><Icon icon={LogOut} size={16} style={{marginRight:6}} /> Leave Gym</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 'calc(17px + 0.5vw)', marginBottom: 16, lineHeight: 1.6 }}>
          If you leave this gym, you will lose access to all your assigned clients, schedules, and gym-specific features. You can then browse and request to join another gym.
        </p>
        <button className="btn" style={{
          background: 'transparent', border: '2px solid #ef4444', color: '#ef4444',
          padding: '10px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.2s'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
          onClick={handleLeaveGym}
        >
          <Icon icon={LogOut} size={14} style={{marginRight:6}} /> Leave {gym?.name || 'Gym'}
        </button>
      </div>
    </DashboardLayout>
  );
}
