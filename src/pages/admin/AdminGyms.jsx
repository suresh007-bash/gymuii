import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { GYMS } from '../../data/mockUsers';
import { useOrders } from '../../context/OrderContext';

export default function AdminGyms() {
  const { allUsers } = useAuth();
  const { orders } = useOrders();
  const [selectedGym, setSelectedGym] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');

  const getGymClients = (gymId) => allUsers.filter(u => u.role === 'client' && u.gymId === gymId && !u.blocked);
  const getGymTrainers = (gymId) => allUsers.filter(u => u.role === 'trainer' && u.gymId === gymId && !u.blocked);
  const getGymOwner = (gymId) => allUsers.find(u => u.role === 'owner' && u.gymId === gymId);
  const getTrainerClients = (trainerId) => allUsers.filter(u => u.role === 'client' && u.trainerId === trainerId);
  const getGymOrders = (gymId) => {
    const gymClientIds = getGymClients(gymId).map(c => c.id);
    return orders.filter(o => gymClientIds.includes(o.customerId));
  };

  // ═══ GYM DETAIL VIEW ═══
  if (selectedGym) {
    const clients = getGymClients(selectedGym.id);
    const trainers = getGymTrainers(selectedGym.id);
    const owner = getGymOwner(selectedGym.id);
    const gymOrders = getGymOrders(selectedGym.id);
    const totalRevenue = gymOrders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + (o.total || 0), 0);
    const activeClients = clients.filter(c => c.trainerId).length;
    const unassignedClients = clients.filter(c => !c.trainerId).length;

    return (
      <DashboardLayout title="Manage Gyms">
        {/* Back */}
        <button onClick={() => { setSelectedGym(null); setDetailTab('overview'); }} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
          fontSize: 'calc(20px + 0.5vw)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: 0,
        }}>
          ← Back to All Gyms
        </button>

        {/* Gym Header */}
        <div style={{
          borderRadius: 20, overflow: 'hidden', marginBottom: 24, position: 'relative',
          height: 'clamp(160px, 25vw, 220px)',
        }}>
          {selectedGym.images && selectedGym.images[0] && (
            <img src={selectedGym.images[0]} alt={selectedGym.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 24 }}>
            <h2 style={{ color: '#fff', fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(22px, 3vw, 30px)', margin: 0 }}>
              {selectedGym.name}
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'calc(19px + 0.5vw)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span> {selectedGym.location}</span>
              <span> {selectedGym.rating}</span>
              {owner && <span> {owner.name}</span>}
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { icon: '', value: clients.length, label: 'Total Clients', color: '#3b82f6' },
            { icon: '️', value: trainers.length, label: 'Trainers', color: '#8b5cf6' },
            { icon: '', value: activeClients, label: 'With Trainer', color: '#22c55e' },
            { icon: '️', value: unassignedClients, label: 'No Trainer', color: '#f59e0b' },
            { icon: '', value: gymOrders.length, label: 'Total Orders', color: '#f97316' },
            { icon: '', value: `₹${totalRevenue.toLocaleString()}`, label: 'Revenue', color: '#10b981' },
          ].map((stat, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: 16 }}>
              <div style={{ fontSize: 'calc(24px + 0.5vw)', marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 'calc(26px + 0.5vw)', fontWeight: 900, color: stat.color, fontFamily: 'Outfit' }}>{stat.value}</div>
              <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Detail Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { key: 'overview', label: ' Overview' },
            { key: 'trainers', label: `️ Trainers (${trainers.length})` },
            { key: 'clients', label: ` Clients (${clients.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setDetailTab(t.key)} style={{
              padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 'calc(19px + 0.5vw)', transition: 'all 0.3s',
              background: detailTab === t.key ? 'linear-gradient(135deg, #f97316, #fb923c)' : 'var(--bg-tertiary)',
              color: detailTab === t.key ? '#fff' : 'var(--text-secondary)',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {detailTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16 }}>
            {/* Gym Info */}
            <div className="card">
              <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(21px + 0.5vw)', marginBottom: 12 }}> About</h4>
              <p style={{ fontSize: 'calc(19px + 0.5vw)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>{selectedGym.description}</p>
              <div style={{ fontSize: 'calc(18px + 0.5vw)', color: 'var(--text-muted)', marginBottom: 8 }}>
                <strong> Hours:</strong> {selectedGym.hours}
              </div>
              {selectedGym.amenities && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {selectedGym.amenities.map((a, i) => (
                    <span key={i} style={{
                      padding: '4px 10px', borderRadius: 16, fontSize: 'calc(17px + 0.5vw)', fontWeight: 600,
                      background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                    }}> {a}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Owner Details */}
            {owner && (
              <div className="card">
                <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(21px + 0.5vw)', marginBottom: 12 }}> Owner Details</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #eab308, #f59e0b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'calc(24px + 0.5vw)', fontWeight: 800, color: '#fff',
                  }}>{owner.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 'calc(22px + 0.5vw)' }}>{owner.name}</div>
                    <span className="badge badge-orange" style={{ fontSize: 'calc(16px + 0.5vw)' }}>GYM OWNER</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {[
                    [' Email', owner.email],
                    [' Phone', owner.phone || 'N/A'],
                    [' GST', owner.gst || 'N/A'],
                    [' Joined', owner.joinDate || 'N/A'],
                  ].map(([label, value], i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 'calc(18px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 'calc(19px + 0.5vw)', fontWeight: 700 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trainer Distribution */}
            <div className="card">
              <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(21px + 0.5vw)', marginBottom: 12 }}> Trainer Load Distribution</h4>
              {trainers.length === 0 ? (
                <p style={{ fontSize: 'calc(19px + 0.5vw)', color: 'var(--text-muted)' }}>No trainers in this gym.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {trainers.map(trainer => {
                    const tc = getTrainerClients(trainer.id);
                    const maxClients = Math.max(...trainers.map(t => getTrainerClients(t.id).length), 1);
                    const pct = (tc.length / maxClients) * 100;
                    return (
                      <div key={trainer.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 'calc(19px + 0.5vw)', fontWeight: 700 }}>{trainer.name}</span>
                          <span style={{ fontSize: 'calc(18px + 0.5vw)', color: 'var(--text-muted)' }}>{tc.length} clients</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 4, transition: 'width 0.8s ease',
                            width: `${pct}%`,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                  {unassignedClients > 0 && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 'calc(19px + 0.5vw)', fontWeight: 700, color: '#f59e0b' }}>️ Unassigned</span>
                        <span style={{ fontSize: 'calc(18px + 0.5vw)', color: '#f59e0b' }}>{unassignedClients} clients</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 4, width: `${(unassignedClients / Math.max(clients.length, 1)) * 100}%`,
                          background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Membership Plans */}
            {selectedGym.plans && (
              <div className="card">
                <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(21px + 0.5vw)', marginBottom: 12 }}> Membership Plans</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedGym.plans.map((plan, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: 12, borderRadius: 10, background: 'var(--bg-tertiary)',
                      border: plan.popular ? '1px solid rgba(249,115,22,0.3)' : '1px solid var(--border)',
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 'calc(20px + 0.5vw)' }}>
                          {plan.name} {plan.popular && <span className="badge badge-orange" style={{ fontSize: 'calc(15px + 0.5vw)' }}>POPULAR</span>}
                        </div>
                        <div style={{ fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-muted)' }}>{plan.duration}</div>
                      </div>
                      <div style={{ fontSize: 'calc(24px + 0.5vw)', fontWeight: 900, color: '#f97316', fontFamily: 'Outfit' }}>₹{plan.price.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ TRAINERS TAB ═══ */}
        {detailTab === 'trainers' && (
          <div>
            {trainers.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 'calc(52px + 0.5vw)', marginBottom: 12 }}>️</div>
                <h3 style={{ fontWeight: 800, marginBottom: 8 }}>No Trainers</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'calc(19px + 0.5vw)' }}>This gym has no trainers registered.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: 16 }}>
                {trainers.map(trainer => {
                  const tc = getTrainerClients(trainer.id);
                  return (
                    <div key={trainer.id} className="card" style={{ overflow: 'hidden' }}>
                      {/* Trainer Header */}
                      <div style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
                      }}>
                        <div style={{
                          width: 50, height: 50, borderRadius: 14,
                          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 'calc(24px + 0.5vw)', fontWeight: 800, color: '#fff', flexShrink: 0,
                        }}>{trainer.avatar}</div>
                        <div>
                          <div style={{ color: '#fff', fontWeight: 800, fontSize: 'calc(22px + 0.5vw)' }}>{trainer.name}</div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'calc(18px + 0.5vw)' }}>{trainer.specialization || 'General'}</div>
                        </div>
                      </div>
                      <div style={{ padding: 16 }}>
                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                          <div style={{ textAlign: 'center', padding: 8, background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                            <div style={{ fontSize: 'calc(24px + 0.5vw)', fontWeight: 900, color: '#3b82f6' }}>{tc.length}</div>
                            <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>Clients</div>
                          </div>
                          <div style={{ textAlign: 'center', padding: 8, background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                            <div style={{ fontSize: 'calc(18px + 0.5vw)', fontWeight: 700 }}>{trainer.certifications || 'N/A'}</div>
                            <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>Certs</div>
                          </div>
                          <div style={{ textAlign: 'center', padding: 8, background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                            <div style={{ fontSize: 'calc(18px + 0.5vw)', fontWeight: 700 }}>{trainer.joinDate || 'N/A'}</div>
                            <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>Joined</div>
                          </div>
                        </div>
                        {/* Contact */}
                        <div style={{ fontSize: 'calc(18px + 0.5vw)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div> {trainer.email}</div>
                          <div> {trainer.phone || 'N/A'}</div>
                        </div>
                        {/* Client list */}
                        {tc.length > 0 && (
                          <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                            <div style={{ fontSize: 'calc(17px + 0.5vw)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Assigned Clients</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {tc.map(c => (
                                <div key={c.id} style={{
                                  display: 'flex', alignItems: 'center', gap: 6,
                                  padding: '4px 10px', borderRadius: 8, background: 'var(--bg-tertiary)',
                                  fontSize: 'calc(18px + 0.5vw)', fontWeight: 600,
                                }}>
                                  <div style={{
                                    width: 20, height: 20, borderRadius: '50%', fontSize: 'calc(12px + 0.5vw)', fontWeight: 800,
                                    background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>{c.avatar}</div>
                                  {c.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ CLIENTS TAB ═══ */}
        {detailTab === 'clients' && (
          <div>
            {clients.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 'calc(52px + 0.5vw)', marginBottom: 12 }}></div>
                <h3 style={{ fontWeight: 800, marginBottom: 8 }}>No Clients</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'calc(19px + 0.5vw)' }}>This gym has no clients registered.</p>
              </div>
            ) : (<>
              {/* Summary Bar */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 'calc(19px + 0.5vw)', fontWeight: 700, color: '#22c55e' }}>
                   {activeClients} with Trainer
                </div>
                <div style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 'calc(19px + 0.5vw)', fontWeight: 700, color: '#f59e0b' }}>
                  ️ {unassignedClients} Unassigned
                </div>
              </div>

              {/* Client Table */}
              <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'calc(19px + 0.5vw)' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border)' }}>
                        {['Client', 'Age', 'Gender', 'Goal', 'Trainer', 'Diet', 'Joined'].map(h => (
                          <th key={h} style={{
                            padding: '12px 14px', textAlign: 'left', fontWeight: 800, fontSize: 'calc(17px + 0.5vw)',
                            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((client, idx) => {
                        const trainer = allUsers.find(u => u.id === client.trainerId);
                        return (
                          <tr key={client.id} style={{
                            borderBottom: '1px solid var(--border)',
                            background: idx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)',
                            transition: 'background 0.2s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)'}
                          >
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                  background: 'linear-gradient(135deg, #f97316, #fb923c)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 'calc(17px + 0.5vw)', fontWeight: 800, color: '#fff',
                                }}>{client.avatar}</div>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 'calc(19px + 0.5vw)' }}>{client.name}</div>
                                  <div style={{ fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-muted)' }}>{client.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 600 }}>{client.age || '—'}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <span className={`badge ${client.gender === 'Male' ? 'badge-blue' : 'badge-purple'}`} style={{ fontSize: 'calc(16px + 0.5vw)' }}>
                                {client.gender || '—'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span className={`badge ${client.goal === 'Weight Loss' ? 'badge-orange' : client.goal === 'Muscle Gain' ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: 'calc(16px + 0.5vw)' }}>
                                {client.goal || '—'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              {trainer ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <div style={{
                                    width: 22, height: 22, borderRadius: '50%', fontSize: 'calc(12px + 0.5vw)', fontWeight: 800,
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>{trainer.avatar}</div>
                                  <span style={{ fontSize: 'calc(18px + 0.5vw)', fontWeight: 600 }}>{trainer.name}</span>
                                </div>
                              ) : (
                                <span style={{ fontSize: 'calc(18px + 0.5vw)', color: '#f59e0b', fontWeight: 600 }}>️ None</span>
                              )}
                            </td>
                            <td style={{ padding: '10px 14px', fontSize: 'calc(18px + 0.5vw)', fontWeight: 600 }}>{client.diet || '—'}</td>
                            <td style={{ padding: '10px 14px', fontSize: 'calc(18px + 0.5vw)', color: 'var(--text-muted)' }}>{client.joinDate || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>)}
          </div>
        )}
      </DashboardLayout>
    );
  }

  // ═══ GYMS LIST VIEW ═══
  return (
    <DashboardLayout title="Manage Gyms">
      {/* Header */}
      <div className="card" style={{
        padding: 20, marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(34,197,94,0.06))',
        borderColor: 'rgba(249,115,22,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 'calc(40px + 0.5vw)' }}></div>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 'calc(24px + 0.5vw)', marginBottom: 4, fontFamily: 'Outfit' }}>All Gyms</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'calc(19px + 0.5vw)' }}>
              {GYMS.length} registered gyms • {allUsers.filter(u => u.role === 'client' && !u.blocked).length} total clients • {allUsers.filter(u => u.role === 'trainer' && !u.blocked).length} total trainers
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: '', value: GYMS.length, label: 'Total Gyms', color: '#f97316' },
          { icon: '', value: allUsers.filter(u => u.role === 'client' && !u.blocked).length, label: 'Total Clients', color: '#3b82f6' },
          { icon: '️', value: allUsers.filter(u => u.role === 'trainer' && !u.blocked).length, label: 'Total Trainers', color: '#8b5cf6' },
          { icon: '', value: allUsers.filter(u => u.role === 'owner').length, label: 'Owners', color: '#eab308' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: 16, transition: 'all 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: 'calc(26px + 0.5vw)', marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: 'calc(30px + 0.5vw)', fontWeight: 900, color: stat.color, fontFamily: 'Outfit' }}>{stat.value}</div>
            <div style={{ fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Gym Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: 16 }}>
        {GYMS.map(gymItem => {
          const gymClients = getGymClients(gymItem.id);
          const gymTrainers = getGymTrainers(gymItem.id);
          const gymOwner = getGymOwner(gymItem.id);

          return (
            <div key={gymItem.id} className="card" style={{
              overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease',
            }}
              onClick={() => setSelectedGym(gymItem)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Cover */}
              {gymItem.images && gymItem.images[0] && (
                <div style={{ height: 140, overflow: 'hidden', position: 'relative' }}>
                  <img src={gymItem.images[0]} alt={gymItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', top: 10, right: 10, padding: '4px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.6)', color: '#fbbf24', fontSize: 'calc(18px + 0.5vw)', fontWeight: 700 }}>
                     {gymItem.rating}
                  </div>
                  <div style={{ position: 'absolute', bottom: 10, left: 12, color: '#fff' }}>
                    <div style={{ fontWeight: 800, fontSize: 'calc(23px + 0.5vw)', fontFamily: 'Outfit' }}>{gymItem.name}</div>
                    <div style={{ fontSize: 'calc(17px + 0.5vw)', opacity: 0.9 }}> {gymItem.location}</div>
                  </div>
                </div>
              )}

              <div style={{ padding: 16 }}>
                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div style={{ textAlign: 'center', padding: 8, background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                    <div style={{ fontSize: 'calc(24px + 0.5vw)', fontWeight: 900, color: '#3b82f6' }}>{gymClients.length}</div>
                    <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>Clients</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 8, background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                    <div style={{ fontSize: 'calc(24px + 0.5vw)', fontWeight: 900, color: '#8b5cf6' }}>{gymTrainers.length}</div>
                    <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>Trainers</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 8, background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                    <div style={{ fontSize: 'calc(18px + 0.5vw)', fontWeight: 700 }}>{gymOwner?.name || '—'}</div>
                    <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>Owner</div>
                  </div>
                </div>

                <button style={{
                  width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff',
                  fontWeight: 700, fontSize: 'calc(19px + 0.5vw)', cursor: 'pointer', fontFamily: 'Outfit',
                }}>
                   View Details & Analytics
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
