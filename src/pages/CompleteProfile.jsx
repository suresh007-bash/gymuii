import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GYMS } from '../data/mockUsers';

const roleMap = { client: '/client/dashboard', trainer: '/trainer/dashboard', owner: '/owner/menu', kitchen: '/kitchen/dashboard', delivery: '/delivery/dashboard', admin: '/admin/dashboard' };

export default function CompleteProfile() {
  const { user, updateUser, allUsers } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ age: '', gender: 'Male', height: '', weight: '', goal: 'Weight Loss', diet: 'Non-Veg', allergies: '', specialization: '', certifications: '', gymId: '', gymName: '', gymLocation: '', gst: '', kitchenName: '', kitchenLocation: '', vehicleType: 'Bike', licenseNo: '' });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const inp = { width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, color: '#111827', fontSize: 14 };
  const lbl = { display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 };

  const handleSave = () => {
    updateUser(user.id, { ...form, profileComplete: true });
    navigate(roleMap[user.role]);
  };

  const handleSkip = () => {
    updateUser(user.id, { profileComplete: true });
    navigate(roleMap[user.role]);
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 520, width: '100%', animation: 'fadeInUp 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 auto 12px' }}>{user.avatar}</div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 900, color: '#111827', marginBottom: 4 }}>Welcome, {user.name}! 🎉</h1>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Complete your profile to get the best experience</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          {/* Health & Diet Profile (For Client, Trainer, Owner) */}
          {(user.role === 'client' || user.role === 'trainer' || user.role === 'owner') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderBottom: (user.role === 'trainer' || user.role === 'owner') ? '1px solid #e5e7eb' : 'none', paddingBottom: (user.role === 'trainer' || user.role === 'owner') ? 20 : 0, marginBottom: (user.role === 'trainer' || user.role === 'owner') ? 20 : 0 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#f97316', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Health & Diet Profile</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
                <div><label style={lbl}>Age</label><input style={inp} type="number" value={form.age} onChange={e => upd('age', e.target.value)} placeholder="25" /></div>
                <div><label style={lbl}>Height (cm)</label><input style={inp} type="number" value={form.height} onChange={e => upd('height', e.target.value)} placeholder="175" /></div>
                <div><label style={lbl}>Weight (kg)</label><input style={inp} type="number" value={form.weight} onChange={e => upd('weight', e.target.value)} placeholder="72" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 14 }}>
                <div><label style={lbl}>Gender</label><select style={inp} value={form.gender} onChange={e => upd('gender', e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></div>
                <div><label style={lbl}>Fitness Goal</label><select style={inp} value={form.goal} onChange={e => upd('goal', e.target.value)}><option>Weight Loss</option><option>Muscle Gain</option><option>Maintenance</option></select></div>
              </div>
              <div><label style={lbl}>Dietary Preference</label><select style={inp} value={form.diet} onChange={e => upd('diet', e.target.value)}><option>Non-Veg</option><option>Veg</option><option>Vegan</option></select></div>
              <div><label style={lbl}>Allergies (if any)</label><input style={inp} value={form.allergies} onChange={e => upd('allergies', e.target.value)} placeholder="e.g., Nuts, Lactose" /></div>
            </div>
          )}

          {/* TRAINER BIO */}
          {user.role === 'trainer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#f97316', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Trainer Credentials</h3>
              <div><label style={lbl}>Specialization</label><input style={inp} value={form.specialization} onChange={e => upd('specialization', e.target.value)} placeholder="e.g., Strength Training, HIIT" /></div>
              <div><label style={lbl}>Certifications</label><input style={inp} value={form.certifications} onChange={e => upd('certifications', e.target.value)} placeholder="e.g., ACE, NASM, ISSA" /></div>
              <div><label style={lbl}>Select Gym</label><select style={inp} value={form.gymId} onChange={e => upd('gymId', e.target.value)}><option value="">Choose gym...</option>{GYMS.map(g => <option key={g.id} value={g.id}>{g.name} — {g.location}</option>)}</select></div>
            </div>
          )}

          {/* OWNER BIO */}
          {user.role === 'owner' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#f97316', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Gym Business Details</h3>
              <div><label style={lbl}>Gym Name</label><input style={inp} value={form.gymName} onChange={e => upd('gymName', e.target.value)} placeholder="FitZone Pro Gym" /></div>
              <div><label style={lbl}>Gym Location</label><input style={inp} value={form.gymLocation} onChange={e => upd('gymLocation', e.target.value)} placeholder="Bangalore, Koramangala" /></div>
              <div><label style={lbl}>GST Number</label><input style={inp} value={form.gst} onChange={e => upd('gst', e.target.value)} placeholder="GST29ABCDE1234F" /></div>
            </div>
          )}

          {/* KITCHEN BIO */}
          {user.role === 'kitchen' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={lbl}>Kitchen Name</label><input style={inp} value={form.kitchenName} onChange={e => upd('kitchenName', e.target.value)} placeholder="FitBites Central Kitchen" /></div>
              <div><label style={lbl}>Kitchen Location</label><input style={inp} value={form.kitchenLocation} onChange={e => upd('kitchenLocation', e.target.value)} placeholder="Bangalore, HSR Layout" /></div>
            </div>
          )}

          {/* DELIVERY BIO */}
          {user.role === 'delivery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={lbl}>Vehicle Type</label><select style={inp} value={form.vehicleType} onChange={e => upd('vehicleType', e.target.value)}><option>Bike</option><option>Scooter</option><option>Car</option></select></div>
              <div><label style={lbl}>License Number</label><input style={inp} value={form.licenseNo} onChange={e => upd('licenseNo', e.target.value)} placeholder="KA01AB1234" /></div>
            </div>
          )}

          {/* ADMIN — no bio needed */}
          {user.role === 'admin' && (
            <div style={{ textAlign: 'center', padding: 24, color: '#6b7280' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>⚙️</div>
              <p style={{ fontSize: 14 }}>You're all set! No additional info needed for admin accounts.</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={handleSkip} style={{ flex: 1, padding: 14, background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 12, color: '#6b7280', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Skip for Now</button>
            <button onClick={handleSave} style={{ flex: 1, padding: 14, background: 'linear-gradient(135deg, #22c55e, #4ade80)', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', border: 'none', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}>✅ Save & Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
}
