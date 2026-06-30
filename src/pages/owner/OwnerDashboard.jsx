import { useState } from 'react';
import { Crown, MapPin, Users, Package, Dumbbell, User } from '../../components/Icons';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import FoodMarquee from '../../components/FoodMarquee';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import { getMenuItems } from '../../data/menuHelper';

import gymUsers from '../../assets/gym_users.png';
import trainerWorkout from '../../assets/trainer_workout.png';
import saladPrep from '../../assets/salad_prep.png';
import foodGeneral from '../../assets/food_general.png';
import workoutSchedule from '../../assets/workout_schedule.png';
import healthyBowl from '../../assets/healthy_bowl.png';
import roastedChicken from '../../assets/roasted_chicken.png';
import sweetDessert from '../../assets/sweet_dessert.png';

const MIND_CATS = [
  { label: 'Members', img: gymUsers },
  { label: 'Trainers', img: trainerWorkout },
  { label: 'Browse Menu', img: saladPrep },
  { label: 'My Orders', img: foodGeneral },
  { label: 'Schedule', img: workoutSchedule },
  { label: 'Nutrition', img: healthyBowl },
  { label: 'Meal Plans', img: roastedChicken },
  { label: 'Analytics', img: sweetDessert }
];

export default function OwnerDashboard() {
  const MENU_ITEMS = getMenuItems();
  const { user, getOwnerClients, getOwnerTrainers, getDirectClients, updateUser } = useAuth();
  const { orders, getDietPlansByTrainer } = useOrders();
  const { showToast } = useNotifications();
  const members = getOwnerClients(user?.id);
  const trainers = getOwnerTrainers(user?.id);
  const directClients = getDirectClients(user?.id);
  const memberOrders = orders.filter(o => members.some(m => m.id === o.customerId));
  const memberRevenue = memberOrders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + (o.total || 0), 0);
  const [showPack, setShowPack] = useState(false);
  const [packName, setPackName] = useState('');
  const [packItems, setPackItems] = useState([]);
  const [packClients, setPackClients] = useState([]);
  const togglePI = (id) => setPackItems(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const togglePC = (id) => setPackClients(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const createPack = () => {
    if (!packName || packItems.length === 0) { showToast('Name and items required', 'error'); return; }
    showToast(` Pack "${packName}" created & sent!`);
    setShowPack(false); setPackName(''); setPackItems([]); setPackClients([]);
  };



  return (
    <DashboardLayout title="Dashboard">
      {showPack && (
        <div className="modal-overlay" onClick={() => setShowPack(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header"><h3 className="modal-title"><Package size={14} style={{marginRight:4}} /> Create Nutrient Pack</h3><button className="modal-close" onClick={() => setShowPack(false)}></button></div>
            <div style={{ marginBottom: 12 }}><label className="form-label">Pack Name</label><input className="form-input" value={packName} onChange={e => setPackName(e.target.value)} placeholder="e.g., Weight Loss Starter Pack" /></div>
            <div style={{ marginBottom: 12 }}><label className="form-label">Select Foods</label><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 6, maxHeight: 180, overflowY: 'auto' }}>{MENU_ITEMS.filter(m => m.available).map(item => (<div key={item.id} className="text-truncate" onClick={() => togglePI(item.id)} style={{ padding: 8, background: packItems.includes(item.id) ? 'rgba(249,115,22,0.08)' : 'var(--bg-tertiary)', border: `1px solid ${packItems.includes(item.id) ? 'var(--accent-orange)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', fontSize: 'var(--fs-xs)' }}>{packItems.includes(item.id) ? ' ' : ''}{item.name} • ₹{item.price}</div>))}</div></div>
            <div style={{ marginBottom: 12 }}><label className="form-label">Send to Clients</label><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{members.map(c => (<button key={c.id} className={`btn btn-sm ${packClients.includes(c.id) ? 'btn-primary' : 'btn-outline'}`} onClick={() => togglePC(c.id)}>{c.name}</button>))}</div></div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowPack(false)}>Cancel</button><button className="btn btn-success" onClick={createPack}><Package size={14} style={{marginRight:4}} /> Create</button></div>
          </div>
        </div>
      )}

      <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 20, background: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(${trainerWorkout}) center/cover`, padding: '48px 40px', color: '#fff' }}>
        <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 800, background: '#22c55e', display: 'inline-block', padding: '4px 14px', borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}><Crown size={14} style={{marginRight:4}} /> GYM OWNER</div>
        <h1 style={{ fontSize: 'var(--fs-heading)', fontWeight: 900, lineHeight: 1.15, marginBottom: 12, maxWidth: 450 }}>{user?.gymName}</h1>
        <p style={{ fontSize: 'var(--fs-xs)', opacity: 0.85 }}><MapPin size={14} style={{marginRight:2}} /> {user?.gymLocation} • {members.length} members • {trainers.length} trainers • ₹{memberRevenue.toLocaleString()} revenue</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ borderLeft: '4px solid #f97316' }}><h4 style={{ fontWeight: 800, fontSize: 'var(--fs-xs)', marginBottom: 6 }}><Users size={14} style={{marginRight:4}} /> Member Management</h4><p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>Manage your gym members, trainers, and create nutrient packs for clients.</p><Link to="/owner/members" style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-orange)', fontWeight: 700 }}>Manage Members →</Link></div>
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}><h4 style={{ fontWeight: 800, fontSize: 'var(--fs-xs)', marginBottom: 6 }}><Package size={14} style={{marginRight:4}} /> Nutrient Packs</h4><p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>Create curated meal packs and send to clients for easy ordering.</p><button className="btn btn-sm btn-outline" onClick={() => setShowPack(true)}>Create Pack →</button></div>
      </div>


      <FoodMarquee />

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 900, fontSize: 'var(--fs-body)', marginBottom: 16 }}>What's on your mind?</h3>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>{MIND_CATS.map((cat, i) => {
          const paths = ['/owner/members', '/owner/trainers', '/owner/menu', '/owner/orders', '/owner/schedule', '/owner/nutrition', '/owner/meal-plans', '/owner/analytics'];
          return (<Link key={i} to={paths[i] || '/owner/dashboard'} style={{ textDecoration: 'none', textAlign: 'center', flexShrink: 0 }}><div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', marginBottom: 6, border: '2px solid #eee' }}><img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div><div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>{cat.label}</div></Link>);
        })}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 20 }}>
        <div className="card"><div className="card-header"><h3 className="card-title"><User size={14} style={{marginRight:4}} /> Direct Clients ({directClients.length})</h3></div>{directClients.length === 0 ? <p style={{ color: 'var(--text-muted)', padding: 12, fontSize: 'var(--fs-xs)' }}>All clients assigned to trainers</p> : directClients.slice(0,5).map(c => (<div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}><div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--fs-xs)', fontWeight: 800, color: '#fff' }}>{c.avatar}</div><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 'var(--fs-xs)' }} className="text-truncate">{c.name}</div><div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{c.goal}</div></div></div>))}</div>
        <div className="card"><div className="card-header"><h3 className="card-title"><Dumbbell size={14} style={{marginRight:4}} /> Trainers ({trainers.length})</h3></div>{trainers.map(t => (<div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}><div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--fs-xs)', fontWeight: 800, color: '#fff' }}>{t.avatar}</div><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 'var(--fs-xs)' }} className="text-truncate">{t.name}</div><div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{t.specialization}</div></div><span className="badge badge-green">{members.filter(m => m.trainerId === t.id).length} clients</span></div>))}</div>
      </div>
    </DashboardLayout>
  );
}
