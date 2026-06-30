import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Users, Crown, ChefHat, Truck, Settings, ArrowLeft } from '../components/Icons';

const roleMap = { client: '/client/menu', trainer: '/trainer/home', owner: '/owner/menu', kitchen: '/kitchen/dashboard', delivery: '/delivery/dashboard', admin: '/admin/dashboard' };
const roleOptions = [
  { id: 'client', icon: <Dumbbell size={20} />, label: 'Client', desc: 'Order meals & track nutrition', color: '#f97316' },
  { id: 'trainer', icon: <Users size={20} />, label: 'Trainer', desc: 'Manage clients & programs', color: '#8b5cf6' },
  { id: 'owner', icon: <Crown size={20} />, label: 'Gym Owner', desc: 'Run your gym business', color: '#22c55e' },
  { id: 'kitchen', icon: <ChefHat size={20} />, label: 'Kitchen', desc: 'Prepare & manage food', color: '#14b8a6' },
  { id: 'delivery', icon: <Truck size={20} />, label: 'Delivery', desc: 'Deliver orders', color: '#0ea5e9' },
  { id: 'admin', icon: <Settings size={20} />, label: 'Admin', desc: 'System administration', color: '#64748b' },
];

export default function RegisterPage() {
  const { register, updateUser, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ role: 'client', name: '', email: '', phone: '', password: '' });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const [onboardingForm, setOnboardingForm] = useState({
    gender: 'Male',
    age: '',
    height: '',
    weight: '',
    foodType: 'Non-veg',
    allergies: ''
  });
  const updOnboarding = (k, v) => setOnboardingForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role || !form.name || !form.email || !form.password) { setError('Please fill all fields'); return; }
    if (form.password !== confirmPass) return setError('Passwords do not match');
    const avatar = form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const result = await register({ ...form, avatar, profileComplete: true, requirePasswordChange: false, targetsSet: false });
    
    if (result.success) {
      setStep(2);
    } else {
      setError(result.error);
    }
  };

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    updateUser(user.id, {
      ...onboardingForm,
      age: onboardingForm.age ? Number(onboardingForm.age) : undefined,
      height: onboardingForm.height ? Number(onboardingForm.height) : undefined,
      weight: onboardingForm.weight ? Number(onboardingForm.weight) : undefined,
    });
    navigate(roleMap[form.role]);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, color: '#fff', fontSize: 'clamp(13px, 1.0vw, 15px)', outline: 'none', transition: 'border 0.3s',
  };
  const labelStyle = {
    display: 'block', fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 700,
    color: 'rgba(255,255,255,0.6)', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.5,
  };

  return (
    <div style={{ minHeight: '112vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>

      {/* Back to Dashboard Button */}
      {step === 1 && (
        <Link to="/" style={{
          position: 'absolute', top: 24, left: 24, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
          fontSize: 14, fontWeight: 700, padding: '10px 18px',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 30, backdropFilter: 'blur(24px)', transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none'; }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      )}

      {/* Background Video */}
      <video
        autoPlay muted loop playsInline
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0,
        }}
      >
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.55), rgba(0,0,0,0.7))',
        backdropFilter: 'blur(2px)',
      }} />

      {/* Register / Onboarding Card */}
      <div style={{ maxWidth: 480, width: '100%', animation: 'scaleIn 0.5s cubic-bezier(0.16,1,0.3,1)', position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #f97316, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'clamp(22px, 1.0vw, 26px)', boxShadow: '0 8px 32px rgba(249,115,22,0.3)',
            animation: 'float 3s ease-in-out infinite',
          }}></div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(22px, 1.0vw, 26px)', fontWeight: 900, color: '#fff', marginBottom: 4 }}>
            {step === 1 ? 'Create Account' : 'Welcome to FitBites'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(12px, 1.0vw, 14px)' }}>
            {step === 1 ? 'Join FitBites in seconds' : "Let's personalize your experience"}
          </p>
        </div>

        {/* Glassmorphism Form Card */}
        <div style={{
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)',
          borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
        }}>
          {step === 1 ? (
            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Full Name</label>
                <input value={form.name} onChange={e => upd('name', e.target.value)} placeholder="John Doe" required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="john@email.com" required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>

              {/* Phone + Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="9876543210" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <input type="password" value={form.password} onChange={e => upd('password', e.target.value)} placeholder="••••••" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
              </div>

              {error && <p style={{ color: '#fca5a5', fontSize: 'clamp(12px, 1.0vw, 14px)', marginBottom: 12, textAlign: 'center', background: 'rgba(239,68,68,0.15)', padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)' }}> {error}</p>}

              <button type="submit" style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', borderRadius: 12, fontSize: 'clamp(14px, 1.0vw, 17px)', fontWeight: 800, cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(249,115,22,0.4)', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(249,115,22,0.5)'; }}
                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(249,115,22,0.4)'; }}
              >Continue →</button>
            </form>
          ) : (
            <form onSubmit={handleOnboardingSubmit} style={{ animation: 'fadeInUp 0.4s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 14 }}>
                {/* Gender */}
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select value={onboardingForm.gender} onChange={e => updOnboarding('gender', e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  >
                    <option value="Male" style={{ background: '#1a1a1a' }}>Male</option>
                    <option value="Female" style={{ background: '#1a1a1a' }}>Female</option>
                    <option value="Other" style={{ background: '#1a1a1a' }}>Other</option>
                  </select>
                </div>
                {/* Age */}
                <div>
                  <label style={labelStyle}>Age</label>
                  <input type="number" value={onboardingForm.age} onChange={e => updOnboarding('age', e.target.value)} placeholder="e.g. 25" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 14 }}>
                {/* Height */}
                <div>
                  <label style={labelStyle}>Height (cm)</label>
                  <input type="number" value={onboardingForm.height} onChange={e => updOnboarding('height', e.target.value)} placeholder="e.g. 175" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
                {/* Weight */}
                <div>
                  <label style={labelStyle}>Weight (kg)</label>
                  <input type="number" value={onboardingForm.weight} onChange={e => updOnboarding('weight', e.target.value)} placeholder="e.g. 70" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
              </div>

              {/* Food Type */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Food Preference</label>
                <select value={onboardingForm.foodType} onChange={e => updOnboarding('foodType', e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                >
                  <option value="Non-veg" style={{ background: '#1a1a1a' }}>Non-veg</option>
                  <option value="Vegetarian" style={{ background: '#1a1a1a' }}>Vegetarian</option>
                  <option value="Vegan" style={{ background: '#1a1a1a' }}>Vegan</option>
                  <option value="Keto" style={{ background: '#1a1a1a' }}>Keto</option>
                </select>
              </div>

              {/* Allergies */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Any Allergies? (Optional)</label>
                <input value={onboardingForm.allergies} onChange={e => updOnboarding('allergies', e.target.value)} placeholder="e.g. Peanuts, Dairy" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>

              <button type="submit" style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', borderRadius: 12, fontSize: 'clamp(14px, 1.0vw, 17px)', fontWeight: 800, cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(249,115,22,0.4)', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(249,115,22,0.5)'; }}
                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(249,115,22,0.4)'; }}
              >Go to Dashboard →</button>
            </form>
          )}

          {step === 1 && (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(12px, 1.0vw, 14px)', marginTop: 16 }}>Already have an account? <Link to="/login" style={{ color: '#f97316', fontWeight: 700 }}>Sign In</Link></p>
          )}
        </div>
      </div>
    </div>
  );
}
