import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { GYMS } from '../../data/mockUsers';

const COMMUNITY_POSTS = [
  { id: 1, author: 'Coach Marcus', avatar: 'CM', role: 'Trainer', time: '2 hours ago', content: '💡 Tip: Having protein within 30 mins of your workout boosts muscle recovery by 40%. Try our Grilled Chicken Bowl post-workout!', likes: 24, comments: 8 },
  { id: 2, author: 'FitBites Team', avatar: 'FB', role: 'Official', time: '5 hours ago', content: '🎉 New menu item alert! Introducing the Avocado Protein Toast — 380 kcal, 28g protein. Available now!', likes: 42, comments: 15 },
  { id: 3, author: 'Priya Sharma', avatar: 'PS', role: 'Member', time: '1 day ago', content: 'Just completed my 30-day nutrition challenge! Lost 3kg while hitting my protein targets daily. FitBites meal scheduling made it so easy 🔥', likes: 56, comments: 21 },
  { id: 4, author: 'Coach Deepa', avatar: 'CD', role: 'Trainer', time: '2 days ago', content: '🥗 Weekly meal prep tip: Order your nutrient packs for the entire week on Sunday. Schedule morning, noon, and evening — automation is key!', likes: 31, comments: 12 },
  { id: 5, author: 'Ravi Kumar', avatar: 'RK', role: 'Member', time: '3 days ago', content: 'The Quinoa Power Bowl is seriously underrated. 450 kcal, 35g protein, and it tastes amazing! Highly recommend for the muscle gain crew 💪', likes: 18, comments: 6 },
];

// Mock achievements for trainers
const TRAINER_ACHIEVEMENTS = {
  't1': { successRate: 94, transformations: 38, avgWeightLoss: '8.5kg', topGoal: 'Strength', rating: 4.9, yearsExp: 6 },
  't2': { successRate: 91, transformations: 25, avgWeightLoss: '6.2kg', topGoal: 'HIIT/Cardio', rating: 4.7, yearsExp: 4 },
  't3': { successRate: 96, transformations: 42, avgWeightLoss: '5.8kg', topGoal: 'Yoga', rating: 4.8, yearsExp: 8 },
};

export default function ClientCommunity() {
  const { user, allUsers, getUsersByRole, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const [tab, setTab] = useState('feed');
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState(COMMUNITY_POSTS);
  const [likedPosts, setLikedPosts] = useState([]);
  const [trainerRequests, setTrainerRequests] = useState(() => {
    const saved = localStorage.getItem('trainer_requests');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  // Sync requests to localStorage
  useEffect(() => {
    localStorage.setItem('trainer_requests', JSON.stringify(trainerRequests));
  }, [trainerRequests]);

  // Re-read requests periodically to catch trainer accepts
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('trainer_requests');
      if (saved) setTrainerRequests(JSON.parse(saved));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const trainers = getUsersByRole('trainer');

  const getTrainerGym = (trainer) => {
    const gym = GYMS.find(g => g.id === trainer.gymId);
    return gym || null;
  };

  const getTrainerStudentCount = (trainerId) => {
    return allUsers.filter(u => u.role === 'client' && u.trainerId === trainerId).length;
  };

  const getRequestStatus = (trainerId) => {
    // If user is already connected to this trainer
    if (user?.trainerId === trainerId) return 'connected';
    const req = trainerRequests.find(r => r.clientId === user?.id && r.trainerId === trainerId);
    if (req) return req.status; // 'pending' or 'accepted' or 'rejected'
    return null;
  };

  const sendRequest = (trainerId) => {
    const existing = trainerRequests.find(r => r.clientId === user?.id && r.trainerId === trainerId);
    if (existing) {
      showToast('Request already sent!', 'warning');
      return;
    }
    const trainer = trainers.find(t => t.id === trainerId);
    const newReq = {
      id: 'req_' + Date.now(),
      clientId: user.id,
      clientName: user.name,
      clientAvatar: user.avatar,
      clientEmail: user.email,
      clientGoal: user.goal || 'General Fitness',
      trainerId: trainerId,
      trainerName: trainer?.name || '',
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    const updated = [...trainerRequests, newReq];
    setTrainerRequests(updated);
    localStorage.setItem('trainer_requests', JSON.stringify(updated));
    showToast(`✅ Request sent to ${trainer?.name}! They'll review it shortly.`);
    setSelectedTrainer(null);
  };

  const addPost = () => {
    if (!newPost.trim()) return;
    setPosts([{ id: Date.now(), author: user?.name, avatar: user?.avatar, role: 'Member', time: 'Just now', content: newPost, likes: 0, comments: 0 }, ...posts]);
    setNewPost('');
    showToast('Post published! 📝');
  };

  const toggleLike = (id) => {
    if (likedPosts.includes(id)) {
      setLikedPosts(l => l.filter(x => x !== id));
      setPosts(p => p.map(x => x.id === id ? { ...x, likes: x.likes - 1 } : x));
    } else {
      setLikedPosts(l => [...l, id]);
      setPosts(p => p.map(x => x.id === id ? { ...x, likes: x.likes + 1 } : x));
    }
  };

  const cardStyle = {
    background: 'var(--bg-secondary)',
    borderRadius: 16,
    border: '1px solid var(--border)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  };

  const statBox = {
    textAlign: 'center',
    padding: '10px 6px',
    background: 'var(--bg-tertiary)',
    borderRadius: 12,
    flex: 1,
  };

  return (
    <DashboardLayout title="Community">
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === 'feed' ? 'active' : ''}`} onClick={() => setTab('feed')}>📱 Feedback</button>
        <button className={`tab ${tab === 'trainers' ? 'active' : ''}`} onClick={() => setTab('trainers')}>💪 Find Trainers</button>
      </div>

      {tab === 'feed' && (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {/* New Post */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{user?.avatar}</div>
              <div style={{ flex: 1 }}>
                <textarea className="form-input" style={{ minHeight: 60, resize: 'none' }} value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Share a tip, achievement, or meal recommendation..." />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={addPost} disabled={!newPost.trim()}>📝 Post</button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed */}
          {posts.map(post => (
            <div key={post.id} className="card" style={{ marginBottom: 12, animation: 'fadeInUp 0.3s ease' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: post.role === 'Official' ? 'linear-gradient(135deg, #f97316, #22c55e)' : post.role === 'Trainer' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{post.avatar}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{post.author} <span className={`badge ${post.role === 'Official' ? 'badge-orange' : post.role === 'Trainer' ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: 9 }}>{post.role}</span></div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{post.time}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{post.content}</p>
              <div style={{ display: 'flex', gap: 16, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <button onClick={() => toggleLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: likedPosts.includes(post.id) ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                  {likedPosts.includes(post.id) ? '❤️' : '🤍'} {post.likes}
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>💬 {post.comments}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'trainers' && (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {/* Header */}
          <div className="card" style={{ padding: 20, marginBottom: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))', borderColor: 'rgba(99,102,241,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 36 }}>🏋️</div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Find Your Perfect Trainer</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Browse trainers across gyms. See their stats, achievements & student success — then send a request to get started!</p>
              </div>
            </div>
          </div>

          {/* Already connected banner */}
          {user?.trainerId && (() => {
            const myTrainer = trainers.find(t => t.id === user.trainerId);
            const myGym = myTrainer ? getTrainerGym(myTrainer) : null;
            return myTrainer ? (
              <div className="card" style={{ padding: 16, marginBottom: 20, background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.08))', borderColor: 'rgba(34,197,94,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{myTrainer.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>✅ Your Current Trainer</div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{myTrainer.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{myGym?.name || 'Gym'} • {myTrainer.specialization}</div>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* Trainer Cards */}
          <div style={{ display: 'grid', gap: 16 }}>
            {trainers.map(trainer => {
              const gym = getTrainerGym(trainer);
              const studentCount = getTrainerStudentCount(trainer.id);
              const achievements = TRAINER_ACHIEVEMENTS[trainer.id] || { successRate: 85, transformations: 10, avgWeightLoss: '5kg', topGoal: 'General', rating: 4.5, yearsExp: 3 };
              const reqStatus = getRequestStatus(trainer.id);

              return (
                <div key={trainer.id} style={cardStyle}>
                  {/* Trainer Header */}
                  <div style={{ padding: '20px 20px 0', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 800, color: '#fff',
                      boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                    }}>
                      {trainer.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <h4 style={{ fontWeight: 800, fontSize: 16 }}>{trainer.name}</h4>
                        <span className="badge badge-purple" style={{ fontSize: 9 }}>Trainer</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {trainer.specialization}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        🏢 {gym?.name || 'Gym'} <span style={{ opacity: 0.5 }}>•</span> 📍 {gym?.location || 'Location'}
                      </div>
                    </div>
                    {/* Rating */}
                    <div style={{ textAlign: 'center', padding: '6px 12px', borderRadius: 12, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#fbbf24' }}>⭐ {achievements.rating}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>RATING</div>
                    </div>
                  </div>

                  {/* Certifications */}
                  {trainer.certifications && (
                    <div style={{ padding: '8px 20px 0' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {trainer.certifications.split(', ').map((cert, i) => (
                          <span key={i} style={{
                            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                            background: 'rgba(59,130,246,0.08)', color: '#3b82f6',
                            border: '1px solid rgba(59,130,246,0.15)',
                          }}>
                            🏅 {cert}
                          </span>
                        ))}
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                          background: 'rgba(34,197,94,0.08)', color: '#22c55e',
                          border: '1px solid rgba(34,197,94,0.15)',
                        }}>
                          📅 {achievements.yearsExp} yrs exp
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div style={{ padding: '14px 20px', display: 'flex', gap: 8 }}>
                    <div style={statBox}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-orange)' }}>{studentCount}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Active Students</div>
                    </div>
                    <div style={statBox}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>{achievements.transformations}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Transformations</div>
                    </div>
                    <div style={statBox}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#6366f1' }}>{achievements.successRate}%</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Success Rate</div>
                    </div>
                    <div style={statBox}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#f43f5e' }}>{achievements.avgWeightLoss}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Avg Result</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div style={{ padding: '0 20px 16px' }}>
                    {reqStatus === 'connected' ? (
                      <div style={{
                        width: '100%', padding: '10px 16px', borderRadius: 12, textAlign: 'center',
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                        color: '#22c55e', fontWeight: 700, fontSize: 13,
                      }}>
                        ✅ Your Trainer — Connected
                      </div>
                    ) : reqStatus === 'pending' ? (
                      <div style={{
                        width: '100%', padding: '10px 16px', borderRadius: 12, textAlign: 'center',
                        background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
                        color: '#f59e0b', fontWeight: 700, fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      }}>
                        <span style={{ animation: 'pulse 2s infinite' }}>⏳</span> Request Pending — Awaiting Trainer Response
                      </div>
                    ) : reqStatus === 'accepted' ? (
                      <div style={{
                        width: '100%', padding: '10px 16px', borderRadius: 12, textAlign: 'center',
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                        color: '#22c55e', fontWeight: 700, fontSize: 13,
                      }}>
                        ✅ Accepted — You're connected!
                      </div>
                    ) : reqStatus === 'rejected' ? (
                      <div style={{
                        width: '100%', padding: '10px 16px', borderRadius: 12, textAlign: 'center',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        color: '#ef4444', fontWeight: 700, fontSize: 13,
                      }}>
                        ❌ Request Declined
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedTrainer(trainer)}
                        style={{
                          width: '100%', padding: '11px 16px', borderRadius: 12, border: 'none',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          color: '#fff',
                          fontWeight: 700, fontSize: 13, cursor: 'pointer',
                          fontFamily: 'Outfit', transition: 'all 0.2s ease',
                          boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                        }}
                      >
                        🤝 Request to Join
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {trainers.length === 0 && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏋️</div>
              <h3 style={{ fontWeight: 800, marginBottom: 8 }}>No Trainers Available</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Check back later for trainer profiles!</p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedTrainer && (
        <div className="modal-overlay" onClick={() => setSelectedTrainer(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">🤝 Send Training Request</h3>
              <button className="modal-close" onClick={() => setSelectedTrainer(null)}>✕</button>
            </div>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18, margin: '0 auto 12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, color: '#fff',
                boxShadow: '0 6px 20px rgba(99,102,241,0.3)',
              }}>
                {selectedTrainer.avatar}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{selectedTrainer.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>{selectedTrainer.specialization}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                🏢 {getTrainerGym(selectedTrainer)?.name} • 📍 {getTrainerGym(selectedTrainer)?.location}
              </p>
            </div>
            <div style={{
              padding: 14, borderRadius: 12, marginBottom: 16,
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)',
            }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                📋 Your request will include your profile info (name, goal, fitness details). The trainer will review and accept or decline your request.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedTrainer(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => sendRequest(selectedTrainer.id)}
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
              >
                🚀 Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
