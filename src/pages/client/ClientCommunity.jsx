import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { GYMS } from '../../data/mockUsers';

const AMENITY_ICONS = {
  'Free Weights': '', 'Cardio Zone': '', 'Yoga Studio': '', 'Steam & Sauna': '',
  'Locker Rooms': '', 'Protein Bar': '', 'Parking': '', 'CrossFit Area': '',
  'Boxing Ring': '', 'Shower Rooms': '', 'Juice Bar': '', 'AC Training Hall': '',
  'Olympic Weights': '', 'Squat Racks': '', 'Deadlift Platforms': '', 'Swimming Pool': '',
  'Sports Nutrition Store': '', 'Recovery Zone': '', 'Personal Training Rooms': '',
};

export default function ClientCommunity() {
  const { user, allUsers, getUsersByRole, updateUser } = useAuth();
  const { showToast } = useNotifications();

  const userGym = user?.gymId ? GYMS.find(g => g.id === user.gymId) : null;

  const [view, setView] = useState(userGym ? 'myGym' : 'browse');
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [showTrainerPayment, setShowTrainerPayment] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [hoveredTrainer, setHoveredTrainer] = useState(null);
  const [hoveredAmenity, setHoveredAmenity] = useState(null);

  useEffect(() => {
    if (userGym && view === 'browse') setView('myGym');
  }, [user?.gymId]);

  useEffect(() => {
    setImageIndex(0);
  }, [selectedGym?.id]);

  const getTrainersForGym = (gymId) => {
    return getUsersByRole('trainer').filter(t => t.gymId === gymId);
  };

  const getTrainerStudentCount = (trainerId) => {
    return allUsers.filter(u => u.role === 'client' && u.trainerId === trainerId).length;
  };

  const handleJoinGym = () => {
    if (!selectedPlan || !selectedGym) return;
    setProcessing(true);
    setTimeout(() => {
      updateUser(user.id, { gymId: selectedGym.id });
      showToast(` Welcome to ${selectedGym.name}! Your ${selectedPlan.name} membership is active.`);
      setProcessing(false);
      setShowPayment(false);
      setSelectedPlan(null);
      setView('myGym');
    }, 2000);
  };

  const handleHireTrainer = () => {
    if (!selectedTrainer) return;
    setProcessing(true);
    setTimeout(() => {
      updateUser(user.id, { trainerId: selectedTrainer.id });
      showToast(` ${selectedTrainer.name} is now your personal trainer!`);
      setProcessing(false);
      setShowTrainerPayment(false);
      setSelectedTrainer(null);
    }, 2000);
  };

  // ─── Browse Gyms View ───
  const renderBrowse = () => (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div className="card" style={{
        padding: 24, marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,146,60,0.06))',
        borderColor: 'rgba(249,115,22,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #f97316, #fb923c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'var(--fs-subheading)', boxShadow: '0 6px 20px rgba(249,115,22,0.3)',
          }}></div>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 'var(--fs-body)', marginBottom: 4 }}>
              Find Your Perfect Gym
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)', lineHeight: 1.5 }}>
              Browse premium fitness centers, compare plans, and join with a single tap. Your fitness journey starts here!
            </p>
          </div>
        </div>
      </div>

      {/* Gym Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340, 1fr))',
        gap: 20,
      }}>
        {GYMS.map((gym, idx) => (
          <div
            key={gym.id}
            className="card"
            style={{
              overflow: 'hidden', padding: 0, cursor: 'pointer',
              transform: hoveredCard === gym.id ? 'translateY(-4px)' : 'translateY(0)',
              boxShadow: hoveredCard === gym.id ? '0 12px 32px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
            onMouseEnter={() => setHoveredCard(gym.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => { setSelectedGym(gym); setSelectedPlan(gym.plans.find(p => p.popular) || gym.plans[0]); setView('detail'); }}
          >
            {/* Cover Image */}
            <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
              <img
                src={gym.images[0]}
                alt={gym.name}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'transform 0.5s ease',
                  transform: hoveredCard === gym.id ? 'scale(1.06)' : 'scale(1)',
                }}
              />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
              }} />
              <div style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                padding: '5px 10px', borderRadius: 20,
                color: '#fff', fontSize: 'var(--fs-xs)', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                 {gym.rating}
              </div>
              <div style={{
                position: 'absolute', bottom: 12, left: 14,
                color: '#fff', fontSize: 'var(--fs-xs)', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                 {gym.location}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '16px 18px 18px' }}>
              <h4 style={{ fontWeight: 800, fontSize: 'var(--fs-sm)', marginBottom: 10 }}>
                {gym.name}
              </h4>

              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600,
                }}>
                   {gym.members} members
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600,
                }}>
                   {gym.trainers} trainers
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>From </span>
                  <span style={{
                    fontWeight: 800, fontSize: 'var(--fs-sm)',
                    background: 'linear-gradient(135deg, #f97316, #fb923c)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>₹1,000</span>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>/mo</span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #fb923c)',
                    border: 'none', fontWeight: 700,
                    fontSize: 'var(--fs-xs)', padding: '8px 16px', borderRadius: 10,
                  }}
                  onClick={(e) => { e.stopPropagation(); setSelectedGym(gym); setSelectedPlan(gym.plans.find(p => p.popular) || gym.plans[0]); setView('detail'); }}
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Gym Detail View ───
  const renderDetail = () => {
    if (!selectedGym) return null;
    const gymTrainers = getTrainersForGym(selectedGym.id);
    const images = selectedGym.images || [];

    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => { setView('browse'); setSelectedGym(null); setSelectedPlan(null); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 'var(--fs-xs)', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 16, padding: 0, }}
        >
          ← Back to all gyms
        </button>

        {/* Image Carousel */}
        <div className="card" style={{ overflow: 'hidden', padding: 0, marginBottom: 20, borderRadius: 18 }}>
          <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${selectedGym.name} ${i + 1}`}
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  objectFit: 'cover',
                  opacity: imageIndex === i ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out',
                }}
              />
            ))}
            {/* Navigation Arrows */}
            <button
              onClick={() => setImageIndex((imageIndex - 1 + images.length) % images.length)}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
                border: 'none', cursor: 'pointer', color: '#fff', fontSize: 'var(--fs-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >‹</button>
            <button
              onClick={() => setImageIndex((imageIndex + 1) % images.length)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
                border: 'none', cursor: 'pointer', color: '#fff', fontSize: 'var(--fs-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >›</button>
            {/* Dots */}
            <div style={{
              position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 8,
            }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  style={{
                    width: imageIndex === i ? 24 : 8, height: 8, borderRadius: 4,
                    background: imageIndex === i ? '#f97316' : 'rgba(255,255,255,0.5)',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Gym Info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h2 style={{ fontWeight: 900, fontSize: 'var(--fs-body)', marginBottom: 6 }}>
                {selectedGym.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                   {selectedGym.location}
                </span>
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                   {selectedGym.rating}
                </span>
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            background: 'var(--bg-tertiary)', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600,
          }}>
             {selectedGym.hours}
          </div>
        </div>

        {/* About */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ fontWeight: 800, fontSize: 'var(--fs-xs)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
             About
          </h4>
          <p style={{ fontSize: 'var(--fs-xs)', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            {selectedGym.description}
          </p>
        </div>

        {/* Amenities */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ fontWeight: 800, fontSize: 'var(--fs-xs)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
             Amenities
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {selectedGym.amenities.map((a, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredAmenity(i)}
                onMouseLeave={() => setHoveredAmenity(null)}
                style={{
                  padding: '8px 14px', borderRadius: 12,
                  background: hoveredAmenity === i ? 'rgba(249,115,22,0.1)' : 'var(--bg-tertiary)',
                  border: hoveredAmenity === i ? '1px solid rgba(249,115,22,0.3)' : '1px solid var(--border)',
                  fontSize: 'var(--fs-xs)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s ease', cursor: 'default',
                }}
              >
                <span>{AMENITY_ICONS[a] || ''}</span> {a}
              </div>
            ))}
          </div>
        </div>

        {/* Membership Plans */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ fontWeight: 800, fontSize: 'var(--fs-xs)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
             Membership Plans
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {selectedGym.plans.map((plan, i) => {
              const isSelected = selectedPlan?.name === plan.name;
              return (
                <div
                  key={plan.name}
                  onClick={() => setSelectedPlan(plan)}
                  onMouseEnter={() => setHoveredPlan(i)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  style={{
                    position: 'relative', padding: '18px 14px', borderRadius: 16,
                    border: isSelected ? '2px solid #f97316' : '1.5px solid var(--border)',
                    background: isSelected ? 'rgba(249,115,22,0.06)' : hoveredPlan === i ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all 0.25s ease',
                    transform: (isSelected || hoveredPlan === i) ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: isSelected ? '0 6px 20px rgba(249,115,22,0.15)' : 'none',
                  }}
                >
                  {plan.popular && (
                    <div style={{
                      position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                      padding: '3px 12px', borderRadius: 20, fontSize: 'var(--fs-xs)', fontWeight: 800,
                      background: 'linear-gradient(135deg, #f97316, #fb923c)',
                      color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5,
                      whiteSpace: 'nowrap',
                    }}>
                       Most Popular
                    </div>
                  )}
                  <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }} className="text-truncate">
                    {plan.name}
                  </div>
                  <div style={{
                    fontWeight: 900, fontSize: 'var(--fs-subheading)', marginBottom: 4,
                    background: isSelected ? 'linear-gradient(135deg, #f97316, #fb923c)' : 'none',
                    WebkitBackgroundClip: isSelected ? 'text' : 'unset',
                    WebkitTextFillColor: isSelected ? 'transparent' : 'inherit',
                  }}>
                    ₹{plan.price.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {plan.duration}
                  </div>
                  {isSelected && (
                    <div style={{
                      marginTop: 10, fontSize: 'var(--fs-xs)', fontWeight: 700,
                      color: '#f97316', textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>
                       Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Trainers at this Gym */}
        {gymTrainers.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h4 style={{ fontWeight: 800, fontSize: 'var(--fs-xs)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
               Available Trainers
            </h4>
            <div style={{ display: 'grid', gap: 10 }}>
              {gymTrainers.map(trainer => (
                <div key={trainer.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 14, borderRadius: 14,
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'var(--fs-xs)', fontWeight: 800, color: '#fff',
                    boxShadow: '0 4px 12px rgba(99,102,241,0.25)',
                  }}>{trainer.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 'var(--fs-xs)' }}>{trainer.name}</div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {trainer.specialization}
                    </div>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: 'var(--fs-xs)' }}>Trainer</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join CTA */}
        <button
          onClick={() => setShowPayment(true)}
          disabled={!selectedPlan}
          style={{
            width: '100%', padding: '15px 24px', borderRadius: 14, border: 'none',
            background: selectedPlan ? 'linear-gradient(135deg, #f97316, #fb923c)' : 'var(--bg-tertiary)',
            color: selectedPlan ? '#fff' : 'var(--text-muted)',
            fontWeight: 800, fontSize: 'var(--fs-sm)', cursor: selectedPlan ? 'pointer' : 'not-allowed',
            boxShadow: selectedPlan ? '0 6px 24px rgba(249,115,22,0.35)' : 'none',
            transition: 'all 0.3s ease', marginBottom: 20,
          }}
        >
          {selectedPlan ? ` Join ${selectedGym.name} — ₹${selectedPlan.price.toLocaleString()}` : 'Select a plan to continue'}
        </button>
      </div>
    );
  };

  // ─── My Gym View ───
  const renderMyGym = () => {
    const gym = GYMS.find(g => g.id === user?.gymId);
    if (!gym) {
      return (
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 'var(--fs-hero)', marginBottom: 16 }}></div>
          <h3 style={{ fontWeight: 800, fontSize: 'var(--fs-body)', marginBottom: 8 }}>No Gym Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)', marginBottom: 20 }}>Browse and join a gym to get started!</p>
          <button className="btn btn-primary" onClick={() => setView('browse')}
            style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', border: 'none', fontWeight: 700 }}
          >
             Browse Gyms
          </button>
        </div>
      );
    }

    const gymTrainers = getTrainersForGym(gym.id);

    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* My Gym Banner */}
        <div className="card" style={{
          overflow: 'hidden', padding: 0, marginBottom: 20, borderRadius: 18,
          border: '1.5px solid rgba(34,197,94,0.3)',
        }}>
          <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
            <img
              src={gym.images ? gym.images[0] : ''}
              alt={gym.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '40px 20px 16px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
            }}>
              <div style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                background: 'rgba(34,197,94,0.9)', color: '#fff',
                fontSize: 'var(--fs-xs)', fontWeight: 800, letterSpacing: 0.5, marginBottom: 8,
                textTransform: 'uppercase',
              }}> Your Current Gym</div>
              <h2 style={{ fontWeight: 900, fontSize: 'var(--fs-body)', color: '#fff', marginBottom: 4 }}>
                {gym.name}
              </h2>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'rgba(255,255,255,0.8)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                 {gym.location} <span style={{ opacity: 0.5 }}>•</span> {gym.rating}
              </div>
            </div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <div style={{
              display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14,
            }}>
              <div style={{
                flex: 1, minWidth: 100, textAlign: 'center', padding: '10px 8px',
                background: 'var(--bg-tertiary)', borderRadius: 12,
              }}>
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 800 }}> {gym.members}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Members</div>
              </div>
              <div style={{
                flex: 1, minWidth: 100, textAlign: 'center', padding: '10px 8px',
                background: 'var(--bg-tertiary)', borderRadius: 12,
              }}>
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 800 }}> {gym.trainers}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Trainers</div>
              </div>
              <div style={{
                flex: 1, minWidth: 100, textAlign: 'center', padding: '10px 8px',
                background: 'var(--bg-tertiary)', borderRadius: 12,
              }}>
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 800 }}> {gym.rating}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Rating</div>
              </div>
            </div>
            <div style={{
              padding: '8px 14px', borderRadius: 10,
              background: 'var(--bg-tertiary)', fontSize: 'var(--fs-xs)',
              color: 'var(--text-muted)', fontWeight: 600,
            }}>
               {gym.hours}
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ fontWeight: 800, fontSize: 'var(--fs-xs)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
             About
          </h4>
          <p style={{ fontSize: 'var(--fs-xs)', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            {gym.description}
          </p>
        </div>

        {/* Amenities */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ fontWeight: 800, fontSize: 'var(--fs-xs)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
             Amenities
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {gym.amenities.map((a, i) => (
              <div key={i} style={{
                padding: '8px 14px', borderRadius: 12,
                background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                fontSize: 'var(--fs-xs)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>{AMENITY_ICONS[a] || ''}</span> {a}
              </div>
            ))}
          </div>
        </div>

        {/* Available Trainers */}
        {gymTrainers.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h4 style={{ fontWeight: 800, fontSize: 'var(--fs-xs)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
               Available Trainers
            </h4>
            <div style={{ display: 'grid', gap: 12 }}>
              {gymTrainers.map((trainer, idx) => {
                const studentCount = getTrainerStudentCount(trainer.id);
                const isMyTrainer = user?.trainerId === trainer.id;
                return (
                  <div
                    key={trainer.id}
                    onMouseEnter={() => setHoveredTrainer(trainer.id)}
                    onMouseLeave={() => setHoveredTrainer(null)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: 16, borderRadius: 16,
                      background: isMyTrainer ? 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(16,185,129,0.04))' : 'var(--bg-tertiary)',
                      border: isMyTrainer ? '1.5px solid rgba(34,197,94,0.3)' : '1px solid var(--border)',
                      transition: 'all 0.25s ease',
                      transform: hoveredTrainer === trainer.id ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: hoveredTrainer === trainer.id ? '0 6px 20px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                      background: isMyTrainer
                        ? 'linear-gradient(135deg, #22c55e, #4ade80)'
                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 'var(--fs-sm)', fontWeight: 800, color: '#fff',
                      boxShadow: isMyTrainer
                        ? '0 4px 14px rgba(34,197,94,0.3)'
                        : '0 4px 14px rgba(99,102,241,0.25)',
                    }}>
                      {trainer.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 'var(--fs-xs)', marginBottom: 2 }}>
                        {trainer.name}
                        {isMyTrainer && (
                          <span style={{
                            marginLeft: 8, fontSize: 'var(--fs-xs)', fontWeight: 700, color: '#22c55e',
                          }}> Your Trainer</span>
                        )}
                      </div>
                      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                        {trainer.specialization}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                        <span> {studentCount} students</span>
                        <span> {trainer.certifications}</span>
                      </div>
                    </div>
                    {isMyTrainer ? (
                      <div style={{
                        padding: '8px 14px', borderRadius: 10,
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                        color: '#22c55e', fontWeight: 700, fontSize: 'var(--fs-xs)', whiteSpace: 'nowrap',
                      }}>
                         Hired
                      </div>
                    ) : (
                      <button
                        onClick={() => { setSelectedTrainer(trainer); setShowTrainerPayment(true); }}
                        style={{
                          padding: '9px 14px', borderRadius: 10, border: 'none',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          color: '#fff', fontWeight: 700, fontSize: 'var(--fs-xs)', cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 4px 12px rgba(99,102,241,0.25)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Hire — ₹1,500/mo
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Payment Modal (Gym) ───
  const renderPaymentModal = () => {
    if (!showPayment || !selectedGym || !selectedPlan) return null;
    const paymentMethods = [
      { key: 'upi', label: 'UPI', icon: '' },
      { key: 'card', label: 'Card', icon: '' },
      { key: 'netbanking', label: 'Net Banking', icon: '' },
    ];

    return (
      <div className="modal-overlay" onClick={() => { if (!processing) { setShowPayment(false); } }}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
          <div className="modal-header">
            <h3 className="modal-title"> Complete Payment</h3>
            {!processing && <button className="modal-close" onClick={() => setShowPayment(false)}></button>}
          </div>
          <div style={{ padding: '8px 0 16px' }}>
            {/* Order Summary */}
            <div style={{
              padding: 16, borderRadius: 14, marginBottom: 18,
              background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(251,146,60,0.04))',
              border: '1px solid rgba(249,115,22,0.15)',
            }}>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Joining
              </div>
              <div style={{ fontWeight: 800, fontSize: 'var(--fs-sm)', marginBottom: 2 }}>
                {selectedGym.name}
              </div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
                 {selectedGym.location}
              </div>
              <div style={{
                marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700 }}>{selectedPlan.name} Plan ({selectedPlan.duration})</span>
                <span style={{
                  fontWeight: 900, fontSize: 'var(--fs-body)',
                  background: 'linear-gradient(135deg, #f97316, #fb923c)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>₹{selectedPlan.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Payment Method
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {paymentMethods.map(m => (
                  <button
                    key={m.key}
                    onClick={() => setPaymentMethod(m.key)}
                    style={{
                      flex: 1, padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                      border: paymentMethod === m.key ? '2px solid #f97316' : '1.5px solid var(--border)',
                      background: paymentMethod === m.key ? 'rgba(249,115,22,0.06)' : 'var(--bg-secondary)',
                      textAlign: 'center', transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: 'var(--fs-body)', marginBottom: 4 }}>{m.icon}</div>
                    <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: paymentMethod === m.key ? '#f97316' : 'var(--text-secondary)' }}>
                      {m.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            {!processing && (
              <button className="btn btn-outline" onClick={() => setShowPayment(false)}>Cancel</button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleJoinGym}
              disabled={processing}
              style={{
                background: 'linear-gradient(135deg, #f97316, #fb923c)',
                border: 'none', fontWeight: 700,
                minWidth: 160, position: 'relative', overflow: 'hidden',
              }}
            >
              {processing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', display: 'inline-block',
                  }} />
                  Processing...
                </span>
              ) : (
                `Pay ₹${selectedPlan.price.toLocaleString()}`
              )}
            </button>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  };

  // ─── Trainer Payment Modal ───
  const renderTrainerPaymentModal = () => {
    if (!showTrainerPayment || !selectedTrainer) return null;
    const paymentMethods = [
      { key: 'upi', label: 'UPI', icon: '' },
      { key: 'card', label: 'Card', icon: '' },
      { key: 'netbanking', label: 'Net Banking', icon: '' },
    ];

    return (
      <div className="modal-overlay" onClick={() => { if (!processing) { setShowTrainerPayment(false); setSelectedTrainer(null); } }}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
          <div className="modal-header">
            <h3 className="modal-title"> Hire Personal Trainer</h3>
            {!processing && <button className="modal-close" onClick={() => { setShowTrainerPayment(false); setSelectedTrainer(null); }}></button>}
          </div>
          <div style={{ padding: '8px 0 16px' }}>
            {/* Trainer Info */}
            <div style={{
              textAlign: 'center', padding: '12px 0 20px',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18, margin: '0 auto 12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--fs-body)', fontWeight: 800, color: '#fff',
                boxShadow: '0 6px 20px rgba(99,102,241,0.3)',
              }}>
                {selectedTrainer.avatar}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 'var(--fs-sm)', marginBottom: 4 }}>{selectedTrainer.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>{selectedTrainer.specialization}</p>
            </div>

            {/* Price */}
            <div style={{
              padding: 16, borderRadius: 14, marginBottom: 18,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))',
              border: '1px solid rgba(99,102,241,0.15)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700 }}>Personal Training (Monthly)</span>
              <span style={{
                fontWeight: 900, fontSize: 'var(--fs-body)',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>₹1,500</span>
            </div>

            {/* Payment Methods */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Payment Method
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {paymentMethods.map(m => (
                  <button
                    key={m.key}
                    onClick={() => setPaymentMethod(m.key)}
                    style={{
                      flex: 1, padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                      border: paymentMethod === m.key ? '2px solid #6366f1' : '1.5px solid var(--border)',
                      background: paymentMethod === m.key ? 'rgba(99,102,241,0.06)' : 'var(--bg-secondary)',
                      textAlign: 'center', transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: 'var(--fs-body)', marginBottom: 4 }}>{m.icon}</div>
                    <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: paymentMethod === m.key ? '#6366f1' : 'var(--text-secondary)' }}>
                      {m.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            {!processing && (
              <button className="btn btn-outline" onClick={() => { setShowTrainerPayment(false); setSelectedTrainer(null); }}>Cancel</button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleHireTrainer}
              disabled={processing}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', fontWeight: 700,
                minWidth: 160, position: 'relative', overflow: 'hidden',
              }}
            >
              {processing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', display: 'inline-block',
                  }} />
                  Processing...
                </span>
              ) : (
                'Pay ₹1,500'
              )}
            </button>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  };

  return (
    <DashboardLayout title="Join Gym">
      {/* View Tabs (only when user has a gym) */}
      {user?.gymId && (
        <div style={{
          display: 'flex', gap: 8, marginBottom: 20,
          maxWidth: 700, margin: '0 auto 20px',
        }}>
          {[
            { key: 'myGym', label: ' My Gym' },
            { key: 'browse', label: ' Browse Gyms' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setView(t.key); if (t.key === 'browse') { setSelectedGym(null); setSelectedPlan(null); } }}
              style={{
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: view === t.key || (view === 'detail' && t.key === 'browse')
                  ? 'linear-gradient(135deg, #f97316, #fb923c)'
                  : 'var(--bg-tertiary)',
                color: view === t.key || (view === 'detail' && t.key === 'browse') ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: 'var(--fs-xs)', cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: view === t.key || (view === 'detail' && t.key === 'browse')
                  ? '0 4px 14px rgba(249,115,22,0.3)'
                  : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {view === 'browse' && renderBrowse()}
      {view === 'detail' && renderDetail()}
      {view === 'myGym' && renderMyGym()}

      {renderPaymentModal()}
      {renderTrainerPaymentModal()}
    </DashboardLayout>
  );
}
