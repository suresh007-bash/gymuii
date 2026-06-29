import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GYMS } from '../data/mockUsers';

const roleMap = { client: '/client/menu', trainer: '/trainer/home', owner: '/owner/menu', kitchen: '/kitchen/dashboard', delivery: '/delivery/dashboard', admin: '/admin/dashboard' };

export default function CompleteProfile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    age: '', gender: 'Male', height: '', weight: '', goal: 'Weight Loss', diet: 'Non-Veg',
    allergies: '', address: '', specialization: '', certifications: '', gymId: '',
    gymName: '', gymLocation: '', gst: '', kitchenName: '', kitchenLocation: '',
    vehicleType: 'Bike', licenseNo: '',
  });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (!user) return null;

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, color: '#fff', fontSize: 'calc(18px + 0.5vw)', outline: 'none', transition: 'border 0.3s',
  };
  const labelStyle = {
    display: 'block', fontSize: 'calc(15px + 0.5vw)', fontWeight: 700,
    color: 'rgba(255,255,255,0.6)', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.5,
  };
  const selectStyle = {
    ...inputStyle, appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
  };
  const sectionStyle = {
    fontSize: 'calc(16px + 0.5vw)', fontWeight: 800, color: '#f97316', letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 8, paddingBottom: 6,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  };

  const handleSave = () => {
    // Filter out empty values
    const updates = {};
    Object.entries(form).forEach(([k, v]) => { if (v) updates[k] = v; });
    updateUser(user.id, { ...updates, profileComplete: true });
    showToast(` Welcome to FitBites, ${user.name}! Your profile is ready.`, 'success');
    navigate(roleMap[user.role]);
  };

  const handleSkip = () => {
    updateUser(user.id, { profileComplete: true });
    showToast(` Welcome, ${user.name}! You can complete your profile later.`);
    navigate(roleMap[user.role]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>

      {/* Background Video */}
      <video
        autoPlay muted loop playsInline
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
      >
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.55), rgba(0,0,0,0.7))',
        backdropFilter: 'blur(2px)',
      }} />

      {/* Card */}
      <div style={{ maxWidth: 520, width: '100%', animation: 'scaleIn 0.5s cubic-bezier(0.16,1,0.3,1)', position: 'relative', zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'calc(32px + 0.5vw)', fontWeight: 900, color: '#fff', margin: '0 auto 14px',
            boxShadow: '0 8px 32px rgba(249,115,22,0.3)',
            animation: 'float 3s ease-in-out infinite',
          }}>{user.avatar}</div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 'calc(30px + 0.5vw)', fontWeight: 900, color: '#fff', marginBottom: 4 }}>
            Welcome, {user.name}! 
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'calc(17px + 0.5vw)' }}>Complete your profile to get the best experience</p>
        </div>

        {/* Glassmorphism Form */}
        <div style={{
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)',
          borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
        }}>

          {/* ═══ CLIENT / TRAINER / OWNER — Health & Diet ═══ */}
          {(user.role === 'client' || user.role === 'trainer' || user.role === 'owner') && (
            <div style={{ marginBottom: 20 }}>
              <div style={sectionStyle}>️ Health & Diet Profile</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Age</label>
                  <input style={inputStyle} type="number" value={form.age} onChange={e => upd('age', e.target.value)} placeholder="25"
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Height (cm)</label>
                  <input style={inputStyle} type="number" value={form.height} onChange={e => upd('height', e.target.value)} placeholder="175"
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Weight (kg)</label>
                  <input style={inputStyle} type="number" value={form.weight} onChange={e => upd('weight', e.target.value)} placeholder="72"
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select style={selectStyle} value={form.gender} onChange={e => upd('gender', e.target.value)}>
                    <option style={{ background: '#1a1a1a' }}>Male</option>
                    <option style={{ background: '#1a1a1a' }}>Female</option>
                    <option style={{ background: '#1a1a1a' }}>Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Fitness Goal</label>
                  <select style={selectStyle} value={form.goal} onChange={e => upd('goal', e.target.value)}>
                    <option style={{ background: '#1a1a1a' }}>Weight Loss</option>
                    <option style={{ background: '#1a1a1a' }}>Muscle Gain</option>
                    <option style={{ background: '#1a1a1a' }}>Maintenance</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Dietary Preference</label>
                  <select style={selectStyle} value={form.diet} onChange={e => upd('diet', e.target.value)}>
                    <option style={{ background: '#1a1a1a' }}>Non-Veg</option>
                    <option style={{ background: '#1a1a1a' }}>Veg</option>
                    <option style={{ background: '#1a1a1a' }}>Vegan</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Allergies</label>
                  <input style={inputStyle} value={form.allergies} onChange={e => upd('allergies', e.target.value)} placeholder="e.g., Nuts, Lactose"
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} value={form.address} onChange={e => upd('address', e.target.value)} placeholder="Your delivery address"
                  onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
            </div>
          )}

          {/* ═══ TRAINER — Credentials ═══ */}
          {user.role === 'trainer' && (
            <div style={{ marginBottom: 20 }}>
              <div style={sectionStyle}> Trainer Credentials</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Specialization</label>
                  <input style={inputStyle} value={form.specialization} onChange={e => upd('specialization', e.target.value)} placeholder="e.g., Strength, HIIT"
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Certifications</label>
                  <input style={inputStyle} value={form.certifications} onChange={e => upd('certifications', e.target.value)} placeholder="e.g., ACE, NASM"
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══ OWNER — Gym Business ═══ */}
          {user.role === 'owner' && (
            <div style={{ marginBottom: 20 }}>
              <div style={sectionStyle}> Gym Business Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Gym Name</label>
                  <input style={inputStyle} value={form.gymName} onChange={e => upd('gymName', e.target.value)} placeholder="FitZone Pro Gym"
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Gym Location</label>
                  <input style={inputStyle} value={form.gymLocation} onChange={e => upd('gymLocation', e.target.value)} placeholder="Bangalore, Koramangala"
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>GST Number</label>
                  <input style={inputStyle} value={form.gst} onChange={e => upd('gst', e.target.value)} placeholder="GST29ABCDE1234F"
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══ KITCHEN ═══ */}
          {user.role === 'kitchen' && (
            <div style={{ marginBottom: 20 }}>
              <div style={sectionStyle}> Kitchen Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Kitchen Name</label>
                  <input style={inputStyle} value={form.kitchenName} onChange={e => upd('kitchenName', e.target.value)} placeholder="FitBites Central Kitchen"
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Kitchen Location</label>
                  <input style={inputStyle} value={form.kitchenLocation} onChange={e => upd('kitchenLocation', e.target.value)} placeholder="Bangalore, HSR Layout"
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══ DELIVERY ═══ */}
          {user.role === 'delivery' && (
            <div style={{ marginBottom: 20 }}>
              <div style={sectionStyle}> Delivery Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Vehicle Type</label>
                  <select style={selectStyle} value={form.vehicleType} onChange={e => upd('vehicleType', e.target.value)}>
                    <option style={{ background: '#1a1a1a' }}>Bike</option>
                    <option style={{ background: '#1a1a1a' }}>Scooter</option>
                    <option style={{ background: '#1a1a1a' }}>Car</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>License Number</label>
                  <input style={inputStyle} value={form.licenseNo} onChange={e => upd('licenseNo', e.target.value)} placeholder="KA01AB1234"
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══ ADMIN ═══ */}
          {user.role === 'admin' && (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ fontSize: 'calc(44px + 0.5vw)', marginBottom: 8 }}>️</div>
              <p style={{ fontSize: 'calc(18px + 0.5vw)', color: 'rgba(255,255,255,0.5)' }}>You're all set! No additional info needed for admin accounts.</p>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button onClick={handleSkip} style={{
              flex: 1, padding: 14, background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
              color: 'rgba(255,255,255,0.6)', fontSize: 'calc(18px + 0.5vw)', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            >Skip for Now</button>
            <button onClick={handleSave} style={{
              flex: 1, padding: 14,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff', borderRadius: 12, fontSize: 'calc(18px + 0.5vw)', fontWeight: 800, cursor: 'pointer',
              border: 'none', boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(34,197,94,0.5)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(34,197,94,0.4)'; }}
            > Save & Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
}
