import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import FoodMarquee from '../../components/FoodMarquee';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import { getMenuItems } from '../../data/menuHelper';
import { Icon, SectionIcon, Dumbbell, Calendar, Salad, Users, Target, CheckCircle2 } from '../../components/Icons';

import saladPrep from '../../assets/salad_prep.png';
import gymUsers from '../../assets/gym_users.png';
import workoutSchedule from '../../assets/workout_schedule.png';
import healthyBowl from '../../assets/healthy_bowl.png';
import foodGeneral from '../../assets/food_general.png';
import trainerWorkout from '../../assets/trainer_workout.png';
import supplement from '../../assets/supplement.png';
import recovery from '../../assets/recovery.png';

const MIND_CATS = [
  { label: 'Diet Plans', img: saladPrep },
  { label: 'Clients', img: gymUsers },
  { label: 'Protein', img: workoutSchedule },
  { label: 'Meal Prep', img: healthyBowl },
  { label: 'Scheduling', img: foodGeneral },
  { label: 'Workouts', img: trainerWorkout },
  { label: 'Supplements', img: supplement },
  { label: 'Recovery', img: recovery },
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
    showToast(` Nutrition targets assigned to ${targetClient.name}!`);
    setShowTarget(false); setTargetClient(null);
  };

  return (
    <DashboardLayout title="Dashboard">
      {/* Dynamic layout patches to align components edge-to-edge */}
      <style>{`
        .mind-categories-scroller {
          display: flex !important;
          gap: 24px !important;
          overflow-x: auto !important;
          flex-wrap: nowrap !important;
          width: 100% !important;
          padding: 4px 2px 12px 2px !important;
          -webkit-overflow-scrolling: touch;
        }
        .mind-categories-scroller::-webkit-scrollbar {
          height: 6px;
        }
        .mind-categories-scroller::-webkit-scrollbar-thumb {
          background-color: var(--border, #eee);
          border-radius: 10px;
        }
        .mind-cat-circle {
          width: 84px !important;
          min-width: 84px !important;
          height: 84px !important;
          min-height: 84px !important;
          border-radius: 50% !important;
          overflow: hidden !important;
          margin-bottom: 8px !important;
          border: 2px solid #eee !important;
          transition: transform 0.2s ease !important;
          flex-shrink: 0 !important;
        }
        /* Forces the marquee block to take full available space width layout */
        .food-marquee-container, div:has(> .food-marquee) {
          width: 100% !important;
          max-width: 100% !important;
        }
      `}</style>

      {showTarget && targetClient && (
        <div className="modal-overlay" onClick={() => setShowTarget(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title"><Icon icon={Target} size={16} style={{marginRight:6}} /> Assign Target — {targetClient.name}</h3><button className="modal-close" onClick={() => setShowTarget(false)}></button></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 12 }}>
              {[['Calories', 'calories'], ['Protein (g)', 'protein'], ['Carbs (g)', 'carbs'], ['Fat (g)', 'fat']].map(([l, k]) => (
                <div key={k}><label className="form-label">{l}</label><input className="form-input" type="number" value={targets[k]} onChange={e => setTargets(p => ({ ...p, [k]: e.target.value }))} /></div>
              ))}
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowTarget(false)}>Cancel</button><button className="btn btn-success" onClick={assignTarget}><Icon icon={CheckCircle2} size={14} style={{marginRight:4}} /> Assign</button></div>
          </div>
        </div>
      )}

      {/* ═══ HERO BANNER ═══ */}
      <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', marginBottom: 24, background: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(${trainerWorkout}) center/cover`, padding: '48px 40px', color: '#fff', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 11, fontWeight: 800, background: '#22c55e', display: 'inline-block', padding: '4px 14px', borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}><Icon icon={Dumbbell} size={12} style={{marginRight:4}} /> TRAINER PORTAL</div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 12, maxWidth: 450 }}>Welcome, {user?.name?.split(' ')[0]}!</h1>
        <p style={{ fontSize: 14, opacity: 0.85, maxWidth: 420, lineHeight: 1.6 }}>{user?.specialization} • {clients.length} active clients • {plans.length} diet plans created</p>
      </div>

      {/* ═══ MEAL TIMING CARDS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20, marginBottom: 24, width: '100%' }}>
        <div className="card" style={{ borderLeft: '4px solid #f97316', margin: 0 }}>
          <h4 style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}><Icon icon={Calendar} size={14} style={{marginRight:4}} /> Client Meal Scheduling</h4>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>Create and manage meal schedules for your clients. Set breakfast, lunch & dinner for any dates.</p>
          <Link to="/trainer/meal-scheduling" style={{ fontSize: 12, color: 'var(--accent-orange)', fontWeight: 700, textDecoration: 'none' }}>Open Scheduler →</Link>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #22c55e', margin: 0 }}>
          <h4 style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}><Icon icon={Salad} size={14} style={{marginRight:4}} /> Diet Plans</h4>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>Create personalized nutrient packs and send them directly to your clients for easy ordering.</p>
          <Link to="/trainer/diet-plans" style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 700, textDecoration: 'none' }}>Create Diet Plan →</Link>
        </div>
      </div>

      {/* ═══ SCROLLING FOOD IMAGES ═══ */}
      <div style={{ width: '100%', overflow: 'hidden', marginBottom: 24 }}>
        <FoodMarquee />
      </div>

      {/* ═══ WHAT'S ON YOUR MIND ═══ */}
      <div style={{ marginBottom: 28, width: '100%' }}>
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 20, marginBottom: 16 }}>What's on your mind?</h3>
        <div className="mind-categories-scroller">
          {MIND_CATS.map((cat, i) => (
            <Link key={i} to={i < 2 ? '/trainer/diet-plans' : '/trainer/meal-scheduling'} style={{ textDecoration: 'none', textAlign: 'center', flexShrink: 0, width: 86 }}>
              <div className="mind-cat-circle" onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'normal', lineHeight: 1.2 }}>{cat.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ MY CLIENTS ═══ */}
      <div className="card" style={{ marginBottom: 20, width: '100%', boxSizing: 'border-box' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 className="card-title" style={{ display: 'flex', alignItems: 'center' }}><Icon icon={Users} size={16} style={{marginRight:6}} /> My Clients ({clients.length})</h3><Link to="/trainer/clients" style={{ color: 'var(--accent-orange)', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>View All →</Link></div>
        {clients.length === 0 ? <p style={{ color: 'var(--text-muted)', padding: 12, fontSize: 13 }}>No clients assigned</p> :
        clients.slice(0, 5).map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>{c.avatar}</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.goal} • {c.diet}</div></div>
            <button className="btn btn-outline btn-sm" onClick={() => { setTargetClient(c); setTargets({ calories: c.targetCalories || 2200, protein: c.targetProtein || 150, carbs: c.targetCarbs || 250, fat: c.targetFat || 70 }); setShowTarget(true); }}><Icon icon={Target} size={14} /></button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}