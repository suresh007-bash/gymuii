import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import FoodMarquee from '../../components/FoodMarquee';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import { getMenuItems } from '../../data/menuHelper';



const MIND_CATS = [
  { label: 'Diet Plans', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=150&q=80' },
  { label: 'Clients', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&q=80' },
  { label: 'Protein', img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=150&q=80' },
  { label: 'Meal Prep', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&q=80' },
  { label: 'Scheduling', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=150&q=80' },
  { label: 'Workouts', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&q=80' },
  { label: 'Supplements', img: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=150&q=80' },
  { label: 'Recovery', img: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=150&q=80' },
];

export default function TrainerDashboard() {
  const MENU_ITEMS = getMenuItems();
  const { user, getTrainerClients, updateUser } = useAuth();
  const { getDietPlansByTrainer, scheduledOrders } = useOrders();
  const { showToast } = useNotifications();
  const clients = getTrainerClients(user?.id);
  const plans = getDietPlansByTrainer(user?.id);
  const myClientIds = clients.map(c => c.id);
  const activeSchedules = scheduledOrders.filter(s => myClientIds.includes(s.customerId) && s.status === 'active');

  const [showTarget, setShowTarget] = useState(false);
  const [targetClient, setTargetClient] = useState(null);
  const [targets, setTargets] = useState({ calories: 2200, protein: 150, carbs: 250, fat: 70 });

  const assignTarget = () => {
    if (!targetClient) return;
    updateUser(targetClient.id, { targetCalories: Number(targets.calories), targetProtein: Number(targets.protein), targetCarbs: Number(targets.carbs), targetFat: Number(targets.fat), trainerAssignedTarget: true });
    showToast(`🎯 Nutrition targets assigned to ${targetClient.name}!`);
    setShowTarget(false); setTargetClient(null);
  };



  return (
    <DashboardLayout title="Dashboard">
      {showTarget && targetClient && (
        <div className="modal-overlay" onClick={() => setShowTarget(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">🎯 Assign Target — {targetClient.name}</h3><button className="modal-close" onClick={() => setShowTarget(false)}>✕</button></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 12 }}>
              {[['Calories', 'calories'], ['Protein (g)', 'protein'], ['Carbs (g)', 'carbs'], ['Fat (g)', 'fat']].map(([l, k]) => (
                <div key={k}><label className="form-label">{l}</label><input className="form-input" type="number" value={targets[k]} onChange={e => setTargets(p => ({ ...p, [k]: e.target.value }))} /></div>
              ))}
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowTarget(false)}>Cancel</button><button className="btn btn-success" onClick={assignTarget}>✅ Assign</button></div>
          </div>
        </div>
      )}

      {/* ═══ HERO BANNER ═══ */}
      <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', marginBottom: 20, background: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80") center/cover', padding: '48px 40px', color: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 800, background: '#22c55e', display: 'inline-block', padding: '4px 14px', borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}>💪 TRAINER PORTAL</div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 12, maxWidth: 450 }}>Welcome, {user?.name?.split(' ')[0]}!</h1>
        <p style={{ fontSize: 14, opacity: 0.85, maxWidth: 420, lineHeight: 1.6 }}>{user?.specialization} • {clients.length} active clients • {plans.length} diet plans created</p>
      </div>

      {/* ═══ MEAL TIMING CARDS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ borderLeft: '4px solid #f97316' }}>
          <h4 style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>📅 Client Meal Scheduling</h4>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>Create and manage meal schedules for your clients. Set breakfast, lunch & dinner for any dates.</p>
          <Link to="/trainer/meal-scheduling" style={{ fontSize: 11, color: 'var(--accent-orange)', fontWeight: 700 }}>Open Scheduler →</Link>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <h4 style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>🥗 Diet Plans</h4>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>Create personalized nutrient packs and send them directly to your clients for easy ordering.</p>
          <Link to="/trainer/diet-plans" style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 700 }}>Create Diet Plan →</Link>
        </div>
      </div>


      {/* ═══ SCROLLING FOOD IMAGES ═══ */}
      <FoodMarquee />

      {/* ═══ WHAT'S ON YOUR MIND ═══ */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 20, marginBottom: 16 }}>What's on your mind?</h3>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
          {MIND_CATS.map((cat, i) => (
            <Link key={i} to={i < 2 ? '/trainer/diet-plans' : '/trainer/food-scheduling'} style={{ textDecoration: 'none', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', marginBottom: 6, border: '2px solid #eee', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{cat.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ MY CLIENTS ═══ */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title">👥 My Clients ({clients.length})</h3><Link to="/trainer/clients" style={{ color: 'var(--accent-orange)', fontSize: 12, fontWeight: 700 }}>View All →</Link></div>
        {clients.length === 0 ? <p style={{ color: 'var(--text-muted)', padding: 12, fontSize: 13 }}>No clients assigned</p> :
        clients.slice(0, 5).map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>{c.avatar}</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.goal} • {c.diet}</div></div>
            <button className="btn btn-outline btn-sm" onClick={() => { setTargetClient(c); setTargets({ calories: c.targetCalories || 2200, protein: c.targetProtein || 150, carbs: c.targetCarbs || 250, fat: c.targetFat || 70 }); setShowTarget(true); }}>🎯</button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
