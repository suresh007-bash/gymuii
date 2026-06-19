import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function MyOwner() {
  const { user, allUsers, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(null);

  // Find the owner of the trainer's gym
  const owner = allUsers.find(u => u.id === user?.ownerId) || allUsers.find(u => u.role === 'owner' && u.gymId === user?.gymId);
  const gym = owner ? { name: owner.gymName, gst: owner.gst } : null;

  // Stats
  const gymTrainers = allUsers.filter(u => u.role === 'trainer' && u.gymId === user?.gymId && !u.blocked);
  const gymClients = allUsers.filter(u => u.role === 'client' && u.gymId === user?.gymId && !u.blocked);

  const handleLeaveGym = () => {
    setConfirm({
      title: '🚪 Leave Gym',
      msg: `Are you sure you want to leave "${gym?.name || 'this gym'}"? You will lose access to all assigned clients and gym features. This action requires admin approval to rejoin.`,
      color: '#ef4444',
      action: () => {
        updateUser(user.id, { gymId: null, ownerId: null, trainerId: null });
        showToast('You have left the gym. Contact admin to rejoin.', 'warning');
        setConfirm(null);
        navigate('/trainer/home');
      }
    });
  };

  const cardStyle = { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 };
  const labelStyle = { fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' };
  const valueStyle = { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' };

  return (
    <DashboardLayout title="My Gym & Owner">
      {/* Confirmation Modal */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, textAlign: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{confirm.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>{confirm.msg}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn" style={{ background: confirm.color, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }} onClick={confirm.action}>Yes, Leave Gym</button>
            </div>
          </div>
        </div>
      )}

      {!owner ? (
        <div className="card" style={{ textAlign: 'center', padding: 50 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
          <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Not Assigned to a Gym</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>You are not currently assigned to any gym. Contact admin to get assigned.</p>
        </div>
      ) : (
        <>
          {/* Gym Info Card */}
          <div style={{ ...cardStyle, marginBottom: 20, background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(249,115,22,0.06))', border: '1px solid rgba(34,197,94,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28
              }}>🏋️</div>
              <div>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 22, margin: 0 }}>{gym?.name || 'My Gym'}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Your current gym</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#22c55e' }}>{gymTrainers.length}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Trainers</div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#3b82f6' }}>{gymClients.length}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Members</div>
              </div>
              {gym?.gst && (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{gym.gst}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>GST No.</div>
                </div>
              )}
            </div>
          </div>

          {/* Owner Profile Card */}
          <div style={{ ...cardStyle, marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, marginBottom: 16 }}>👑 Gym Owner</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #eab308, #f59e0b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 900, color: '#fff',
                boxShadow: '0 4px 16px rgba(234,179,8,0.3)'
              }}>{owner.avatar}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, fontFamily: 'Outfit' }}>{owner.name}</div>
                <span className="badge badge-orange" style={{ fontSize: 10 }}>GYM OWNER</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

          {/* Leave Gym Section */}
          <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.02)' }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, marginBottom: 8, color: '#ef4444' }}>🚪 Leave Gym</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
              If you leave this gym, you will lose access to all your assigned clients, schedules, and gym-specific features. You'll need admin approval to rejoin any gym.
            </p>
            <button className="btn" style={{
              background: 'transparent', border: '2px solid #ef4444', color: '#ef4444',
              padding: '10px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s'
            }} onClick={handleLeaveGym}>
              🚪 Leave {gym?.name || 'Gym'}
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
