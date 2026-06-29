import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingCart as CartIcon } from '../../components/Icons';
import { Icon, SectionIcon, Flame, Beef, Wheat, Droplets, Target, Settings, Search, ShoppingCart, Calendar, CheckCircle2, AlertTriangle, Leaf, Sparkles, Star, Package, Crown, ChefHat, ClipboardList, Utensils, Clock, XCircle, BarChart3, Edit } from '../../components/Icons';
import DashboardLayout from '../../components/DashboardLayout';
import { NUTRIENT_PACKS, CATEGORIES } from '../../data/mockMenu';
import { getMenuItems } from '../../data/menuHelper';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import { MagicFoodCard, FoodSpotlight, getGlowColor } from '../../components/MagicFoodCard';
import GlareHover from '../../components/GlareHover';
import healthyBowl from '../../assets/healthy_bowl.png';

// Auto-calculate nutrition targets from body data (Mifflin-St Jeor)
function calcTargets(profile) {
  const { weight, height, age, gender, goal, activityLevel } = profile;
  if (!weight || !height || !age) return null;
  // BMR
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += gender === 'Female' ? -161 : 5;
  // Activity multiplier
  const actMult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, athlete: 1.9 };
  const tdee = bmr * (actMult[activityLevel] || 1.55);
  // Goal adjustment
  let calories = Math.round(tdee);
  if (goal === 'Weight Loss') calories = Math.round(tdee * 0.8);
  else if (goal === 'Muscle Gain') calories = Math.round(tdee * 1.15);
  // Macro split
  const protein = Math.round(weight * (goal === 'Muscle Gain' ? 2.2 : 1.8));
  const fat = Math.round(calories * 0.25 / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  return { calories, protein, carbs, fat };
}

// SVG Circular Ring component — Fully Fixed Centering & Outer Content Flow
const Ring = ({ value, target, color, size = 90, stroke = 8, icon, label, unit }) => {
  const [displayed, setDisplayed] = useState(0);
  const prevVal = useRef(0);
  useEffect(() => {
    const start = performance.now(), from = prevVal.current, to = value, dur = 1200;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    let raf;
    const step = (now) => { const p = Math.min((now - start) / dur, 1); setDisplayed(Math.round(from + (to - from) * ease(p))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => { prevVal.current = displayed; cancelAnimationFrame(raf); };
  }, [value]);
  const pct = Math.min((displayed / target) * 100, 100);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const isOver = value > target;
  const gradId = `rg-${label}-${color.replace('#', '')}`;
  const dotAngle = (pct / 100) * 2 * Math.PI;
  return (
    <div className="ring-container" style={{ textAlign: 'center', position: 'relative', width: size, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size, marginBottom: 6 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isOver ? '#ef4444' : color} />
              <stop offset="100%" stopColor={`${isOver ? '#ef4444' : color}88`} />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gradId})`} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
          {pct > 3 && <circle cx={size / 2 + r * Math.cos(dotAngle)} cy={size / 2 + r * Math.sin(dotAngle)} r={stroke / 2 + 1.5} fill={isOver ? '#ef4444' : color} style={{ filter: `drop-shadow(0 0 4px ${isOver ? '#ef4444' : color})`, opacity: 0.8 }} />}
        </svg>

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div className="ring-value" style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'calc(21px + 0.5vw)', color: isOver ? '#ef4444' : color, lineHeight: 1 }}>{displayed}</div>
        </div>
      </div>

      <div className="ring-label" style={{ fontSize: 'calc(17px + 0.5vw)', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{label}</div>
      <div className="ring-sub" style={{ fontSize: 'calc(16px + 0.5vw)', color: isOver ? '#ef4444' : 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>
        {isOver ? <><AlertTriangle size={10} style={{ marginRight: 2 }} /> +{value - target}</> : `${target - value}`} {unit} {isOver ? 'over' : 'left'}
      </div>
    </div>
  );
};

export default function BrowseMenu() {
  const { user, updateUser } = useAuth();
  const { getDietPlansByClient, getTodayNutrition } = useOrders();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const foodGridRef = useRef(null);
  const [menuItems] = useState(() => getMenuItems());
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('menu');
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('synnoviq_cart') || '[]'));
  const [showSchedule, setShowSchedule] = useState(false);
  const [showRings, setShowRings] = useState(true);
  const [showTargetEditor, setShowTargetEditor] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [schedForm, setSchedForm] = useState({ dates: '', timing: 'morning', items: [] });
  const targetKey = `synnoviq_targets_${user?.id || 'default'}`;
  const [targets, setTargets] = useState(() => JSON.parse(localStorage.getItem(targetKey) || 'null') || { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [bioForm, setBioForm] = useState({
    weight: user?.weight || '', height: user?.height || '', age: user?.age || '',
    gender: user?.gender || 'Male', goal: user?.goal || 'Maintenance',
    activityLevel: 'moderate',
  });
  const [editTargets, setEditTargets] = useState({ ...targets });
  const bannerCfg = JSON.parse(localStorage.getItem('synnoviq_banner_config') || 'null');

  useEffect(() => { localStorage.setItem(targetKey, JSON.stringify(targets)); }, [targets, targetKey]);

  const autoCalcAndSet = () => {
    const auto = calcTargets(bioForm);
    if (auto) { setEditTargets(auto); showToast('Targets auto-calculated from your body data!'); }
    else showToast('Fill weight, height & age first', 'error');
  };

  const saveTargets = () => {
    setTargets({ ...editTargets });
    setShowTargetEditor(false);
    if (!user?.targetsSet) {
      updateUser(user.id, { targetsSet: true });
    }
    showToast('Nutrition targets updated!');
  };

  const filtered = menuItems.filter(m => (cat === 'All' || m.category === cat) && m.name.toLowerCase().includes(search.toLowerCase()));
  const myDietPlans = getDietPlansByClient(user?.id);

  const allPacks = [...NUTRIENT_PACKS];

  const addToCart = (item) => {
    const exists = cart.find(c => c.id === item.id);
    let newCart;
    if (exists) newCart = cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
    else newCart = [...cart, { ...item, qty: 1 }];
    setCart(newCart);
    localStorage.setItem('synnoviq_cart', JSON.stringify(newCart));
    showToast(`${item.name} added to cart!`);
  };

  const orderPack = (pack) => {
    const packItems = pack.items.map(id => menuItems.find(m => m.id === id)).filter(Boolean);
    const unavailable = packItems.filter(i => !i.available);
    if (unavailable.length > 0 && unavailable.length < packItems.length) {
      const avail = packItems.filter(i => i.available);
      if (window.confirm(`️ ${unavailable.map(i => i.name).join(', ')} not available.\n\nOrder remaining ${avail.length} items?\n(${avail.map(i => i.name).join(', ')})`)) {
        avail.forEach(item => addToCart(item));
        showToast(`${avail.length} available items from "${pack.name}" added!`);
      }
    } else if (unavailable.length === packItems.length) {
      showToast('All items in this pack are unavailable', 'error');
    } else {
      packItems.forEach(item => addToCart(item));
      showToast(`"${pack.name}" added to cart!`);
    }
  };

  const toggleSchedItem = (id) => setSchedForm(p => ({ ...p, items: p.items.includes(id) ? p.items.filter(x => x !== id) : [...p.items, id] }));

  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  const timeSlots = { morning: '8:00 AM', noon: '12:30 PM', evening: '7:00 PM' };

  // Shared responsive grid style definition
  const sharedGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
    width: '100%',
    boxSizing: 'border-box'
  };

  // Pre-calculate suggested configurations globally to resolve grid separation bugs
  const userGoal = user?.goal || 'Maintenance';
  const goalConfig = {
    'Weight Loss': { label: 'Low-Cal Picks for Weight Loss', LabelIcon: Flame, filter: (m) => m.calories <= 400 && m.protein >= 15, color: '#ef4444', border: 'rgba(239,68,68,0.15)' },
    'Muscle Gain': { label: 'High-Protein for Muscle Gain', LabelIcon: Beef, filter: (m) => m.protein >= 35, color: '#22c55e', border: 'rgba(34,197,94,0.15)' },
    'Maintenance': { label: 'Balanced Meals for Maintenance', LabelIcon: Target, filter: (m) => m.calories >= 300 && m.calories <= 500, color: '#3b82f6', border: 'rgba(59,130,246,0.15)' },
  };
  const cfg = goalConfig[userGoal] || goalConfig['Maintenance'];
  const suggested = menuItems.filter(m => m.available && cfg.filter(m)).slice(0, 4);
  const showSuggested = cat === 'All' && !search && suggested.length > 0;

  return (
    <DashboardLayout title="Home" flush>

      {/* ═══ RESPONSIVE OVERLAY SIDEBAR & SNAP LAYOUT FIXES ═══ */}
      <style>{`
        @media (max-width: 1024px) {
          /* Expand layout container to take full width */
          div:has(> aside), 
          .dashboard-container, 
          .dashboard-layout,
          .main-layout {
            display: block !important;
            padding-left: 0 !important;
            margin-left: 0 !important;
            width: 100% !important;
          }

          /* Transform the static sidebar into a responsive mobile overlay drawer */
          aside, 
          .sidebar, 
          .dashboard-sidebar {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            height: 100vh !important;
            z-index: 9999 !important;
            background: #fff !important;
            box-shadow: 5px 0 25px rgba(0, 0, 0, 0.15) !important;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            
            /* FIXED: Enabled vertical layout scrolling context overlays for long menu sets */
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 30px !important;
          }

          aside:not(.open):not(.active):not(.show),
          .sidebar:not(.open):not(.active):not(.show),
          .dashboard-sidebar:not(.open):not(.active):not(.show) {
            transform: translateX(-100%);
            display: none !important;
          }
          
          .open aside, .open .sidebar, .active .sidebar, .show .sidebar {
            display: block !important;
            transform: translateX(0) !important;
          }

          /* Snap standard page panels completely flat onto the viewport display window */
          main, 
          .main-content, 
          .content-body,
          div[style*="flex: 1"] {
            width: 100% !important;
            max-width: 100% !important;
            margin-left: 0 !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }

        /* ═══ RESPONSIVE NUTRITION RINGS LAYOUT SWITCHER ═══ */
        .nutrition-rings-responsive {
          display: grid !important; 
          grid-template-columns: repeat(4, 1fr) !important; 
          width: 100% !important;
          max-width: 1100px !important;
          margin: 24px auto !important;
          gap: 32px !important;
          justify-items: center !important;
          align-items: center !important;
          padding: 0 16px !important;
        }

        @media (max-width: 1024px) {
          .nutrition-rings-responsive {
            grid-template-columns: repeat(2, 1fr) !important; 
            max-width: 460px !important;
            gap: 24px !important;
          }
        }

        /* ═══ FOOD IMAGE GAP ELIMINATION PATCH ═══ */
        .food-card, [class*="MagicFoodCard"] {
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
        }
        .food-card-img, div:has(> img[style*="object-fit: cover"]) {
          width: 100% !important;
          height: clamp(140px, 45vw, 165px) !important;
          overflow: hidden !important;
          flex-shrink: 0 !important;
        }
        .food-card-img img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: block !important;
        }
      `}</style>
      {/* STOP WRITING HERE */}

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="modal-overlay" onClick={() => setShowSchedule(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header"><h3 className="modal-title"><Icon icon={Calendar} size={16} style={{ marginRight: 6 }} /> Schedule Meals</h3><button className="modal-close" onClick={() => setShowSchedule(false)}></button></div>
            <p style={{ fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-muted)', marginBottom: 16 }}>Select foods and schedule for multiple days</p>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Timing</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {Object.entries(timeSlots).map(([k, v]) => (
                  <button key={k} className={`tab ${schedForm.timing === k ? 'active' : ''}`} onClick={() => setSchedForm(p => ({ ...p, timing: k }))}>{v}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Dates (comma-separated)</label>
              <input className="form-input" value={schedForm.dates} onChange={e => setSchedForm(p => ({ ...p, dates: e.target.value }))} placeholder="2026-06-20, 2026-06-21, 2026-06-22" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Select Foods</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                {menuItems.filter(m => m.available).map(item => (
                  <div key={item.id} onClick={() => toggleSchedItem(item.id)} style={{ padding: 8, background: schedForm.items.includes(item.id) ? 'rgba(249,115,22,0.08)' : 'var(--bg-tertiary)', border: `1px solid ${schedForm.items.includes(item.id) ? 'var(--accent-orange)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', fontSize: 'calc(16px + 0.5vw)' }}>
                    <div style={{ fontWeight: 700 }}>{schedForm.items.includes(item.id) ? <><CheckCircle2 size={12} style={{ marginRight: 4, color: 'var(--accent-green)' }} /></> : ''}{item.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'calc(14px + 0.5vw)' }}><Flame size={10} style={{ marginRight: 2 }} />{item.calories} • ₹{item.price}</div>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-success" style={{ width: '100%' }} disabled={!schedForm.dates || schedForm.items.length === 0} onClick={() => {
              const dateArr = schedForm.dates.split(',').map(d => d.trim()).filter(Boolean);
              schedForm.items.forEach(id => { const item = menuItems.find(m => m.id === id); if (item) addToCart(item); });
              showToast(`Scheduled ${schedForm.items.length} items for ${dateArr.length} day(s) — ${timeSlots[schedForm.timing]}`);
              setShowSchedule(false);
              setSchedForm({ dates: '', timing: 'morning', items: [] });
              const role = user?.role;
              const schedPath = role === 'owner' ? '/owner/schedule' : role === 'trainer' ? '/trainer/my-schedule' : '/client/schedule';
              navigate(schedPath);
            }}><Icon icon={Calendar} size={14} style={{ marginRight: 4 }} /> Schedule & Add to Cart</button>
          </div>
        </div>
      )}

      {/* Main Flow Wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', padding: '0 4px', boxSizing: 'border-box' }}>

        {/* ═══ HERO BANNER ═══ */}
        <div style={{
          borderRadius: 24, overflow: 'hidden', position: 'relative',
          background: bannerCfg?.gradientStart ? `linear-gradient(135deg, ${bannerCfg.gradientStart} 0%, ${bannerCfg.gradientEnd || bannerCfg.gradientStart} 40%, ${bannerCfg.gradientStart} 100%)` : 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
          padding: '0', color: '#fff', minHeight: 'clamp(200px, 40vw, 340px)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)', animation: 'float 6s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite reverse', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ flex: '1 1 300px', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 44px)', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'calc(15px + 0.5vw)', fontWeight: 800, background: 'linear-gradient(135deg, #f97316, #fb923c)', padding: '6px 16px', borderRadius: 24, marginBottom: 16, letterSpacing: 1.2, textTransform: 'uppercase' }}>
              <Leaf size={14} style={{ marginRight: 4 }} /> {bannerCfg?.badge || 'NUTRIENT POWERED'}
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, maxWidth: 420 }}>
              {bannerCfg?.headlineStart || 'Make a'}{' '}
              <span style={{ background: 'linear-gradient(135deg, #f97316, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{bannerCfg?.headlineHighlight || 'Better Life'}</span>
            </h1>
            <p style={{ fontSize: 'calc(19px + 0.5vw)', opacity: 0.7, maxWidth: 380, lineHeight: 1.7, marginBottom: 24, fontWeight: 400 }}>
              {bannerCfg?.subtitle || 'Fuel your body with chef-crafted, nutrient-rich meals — designed for your fitness goals and delivered fresh to your door.'}
            </p>
            <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 24px)', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'calc(26px + 0.5vw)', fontWeight: 900, background: 'linear-gradient(135deg, #f97316, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>500+</div>
                <div style={{ fontSize: 'calc(14px + 0.5vw)', opacity: 0.5, fontWeight: 600, letterSpacing: 0.5 }}>MEALS</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'calc(26px + 0.5vw)', fontWeight: 900, background: 'linear-gradient(135deg, #22c55e, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>100%</div>
                <div style={{ fontSize: 'calc(14px + 0.5vw)', opacity: 0.5, fontWeight: 600, letterSpacing: 0.5 }}>FRESH</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'calc(26px + 0.5vw)', fontWeight: 900, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>24/7</div>
                <div style={{ fontSize: 'calc(14px + 0.5vw)', opacity: 0.5, fontWeight: 600, letterSpacing: 0.5 }}>DELIVERY</div>
              </div>
            </div>
          </div>

          <div style={{ flex: '1 1 280px', maxWidth: 380, position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 3vw, 20px)', margin: '0 auto' }}>
            <div style={{
              position: 'absolute', width: 'clamp(180px, 40vw, 300px)', height: 'clamp(180px, 40vw, 300px)', borderRadius: '50%',
              background: 'conic-gradient(from 0deg, #f97316, #22c55e, #6366f1, #f97316)',
              animation: 'heroSpin 8s linear infinite', opacity: 0.2, filter: 'blur(30px)',
            }} />
            <div style={{
              width: 'clamp(200px, 40vw, 320px)', height: 'clamp(200px, 40vw, 320px)', borderRadius: '50%', overflow: 'hidden',
              position: 'relative', animation: 'heroFloat 4s ease-in-out infinite',
              boxShadow: '0 20px 50px rgba(249,115,22,0.25), 0 0 80px rgba(249,115,22,0.08)',
            }}>
              <img
                src={bannerCfg?.imageUrl || healthyBowl}
                alt="Healthy nutrient bowl"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.1)' }}
              />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                animation: 'heroShimmer 3s ease-in-out infinite', pointerEvents: 'none',
              }} />
            </div>
            <div style={{
              position: 'absolute', top: 30, right: 40, padding: '8px 14px', borderRadius: 16,
              background: 'rgba(34,197,94,0.15)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(34,197,94,0.25)', animation: 'float 3s ease-in-out infinite',
              fontSize: 'calc(16px + 0.5vw)', fontWeight: 700, color: '#4ade80', whiteSpace: 'nowrap',
            }}><Beef size={12} style={{ marginRight: 4 }} /> {bannerCfg?.tag1 || 'High Protein'}</div>
            <div style={{
              position: 'absolute', bottom: 40, left: 0, padding: '8px 14px', borderRadius: 16,
              background: 'rgba(249,115,22,0.15)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(249,115,22,0.25)', animation: 'float 4s ease-in-out infinite 1s',
              fontSize: 'calc(16px + 0.5vw)', fontWeight: 700, color: '#fb923c', whiteSpace: 'nowrap',
            }}><Flame size={12} style={{ marginRight: 4 }} /> {bannerCfg?.tag2 || 'Low Calorie'}</div>
            <div style={{
              position: 'absolute', top: '55%', right: 15, padding: '8px 14px', borderRadius: 16,
              background: 'rgba(99,102,241,0.15)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(99,102,241,0.25)', animation: 'float 5s ease-in-out infinite 0.5s',
              fontSize: 'calc(16px + 0.5vw)', fontWeight: 700, color: '#818cf8', whiteSpace: 'nowrap',
            }}><Beef size={12} style={{ marginRight: 4 }} /> {bannerCfg?.tag3 || 'Macro Balanced'}</div>
          </div>
        </div>

        {/* ═══ FOOD MENU TAB FLOW ═══ */}
        {tab === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Search Action Control Bar */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><Search size={16} color="var(--text-muted)" /></span>
                <input className="form-input" style={{ paddingLeft: 38 }} placeholder="Search meals..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button onClick={() => navigate(`/${user?.role === 'owner' ? 'owner' : user?.role === 'trainer' ? 'trainer' : 'client'}/cart`)} style={{
                background: 'linear-gradient(135deg, #f97316, #fb923c)',
                border: 'none', borderRadius: 12, padding: '8px 12px', cursor: 'pointer',
                fontSize: 'calc(22px + 0.5vw)', display: 'flex', alignItems: 'center', gap: 4,
                color: '#fff', position: 'relative',
              }}>
                <ShoppingCart size={18} />
                {cartCount > 0 && <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: '#ef4444', color: '#fff', fontSize: 'calc(13px + 0.5vw)', fontWeight: 800,
                  width: 18, height: 18, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{cartCount}</span>}
              </button>
            </div>

            {/* Target Editor Modal */}
            {showTargetEditor && (
              <div className="modal-overlay" onClick={() => setShowTargetEditor(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
                  <div className="modal-header">
                    <h3 className="modal-title"><Icon icon={Target} size={16} style={{ marginRight: 6 }} /> Set Nutrition Targets</h3>
                    <button className="modal-close" onClick={() => setShowTargetEditor(false)}></button>
                  </div>

                  <div style={{ padding: 14, background: 'rgba(139,92,246,0.06)', borderRadius: 12, marginBottom: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 'calc(17px + 0.5vw)', marginBottom: 10, color: '#8b5cf6' }}><Icon icon={BarChart3} size={14} style={{ marginRight: 4 }} /> Auto-Calculate from Body Data</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 8, marginBottom: 10 }}>
                      <div>
                        <label style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: 700, color: 'var(--text-muted)' }}>Weight (kg)</label>
                        <input className="form-input" type="number" value={bioForm.weight} onChange={e => setBioForm(p => ({ ...p, weight: Number(e.target.value) }))} style={{ fontSize: 'calc(17px + 0.5vw)' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: 700, color: 'var(--text-muted)' }}>Height (cm)</label>
                        <input className="form-input" type="number" value={bioForm.height} onChange={e => setBioForm(p => ({ ...p, height: Number(e.target.value) }))} style={{ fontSize: 'calc(17px + 0.5vw)' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: 700, color: 'var(--text-muted)' }}>Age</label>
                        <input className="form-input" type="number" value={bioForm.age} onChange={e => setBioForm(p => ({ ...p, age: Number(e.target.value) }))} style={{ fontSize: 'calc(17px + 0.5vw)' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 8, marginBottom: 10 }}>
                      <div>
                        <label style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: 700, color: 'var(--text-muted)' }}>Gender</label>
                        <select className="form-select" value={bioForm.gender} onChange={e => setBioForm(p => ({ ...p, gender: e.target.value }))} style={{ fontSize: 'calc(16px + 0.5vw)' }}>
                          <option>Male</option><option>Female</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: 700, color: 'var(--text-muted)' }}>Goal</label>
                        <select className="form-select" value={bioForm.goal} onChange={e => setBioForm(p => ({ ...p, goal: e.target.value }))} style={{ fontSize: 'calc(16px + 0.5vw)' }}>
                          <option>Weight Loss</option><option>Maintenance</option><option>Muscle Gain</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: 700, color: 'var(--text-muted)' }}>Activity</label>
                        <select className="form-select" value={bioForm.activityLevel} onChange={e => setBioForm(p => ({ ...p, activityLevel: e.target.value }))} style={{ fontSize: 'calc(16px + 0.5vw)' }}>
                          <option value="sedentary">Sedentary</option><option value="light">Light</option><option value="moderate">Moderate</option><option value="active">Active</option><option value="athlete">Athlete</option>
                        </select>
                      </div>
                    </div>
                    <button className="btn btn-outline btn-sm" style={{ width: '100%', color: '#8b5cf6' }} onClick={autoCalcAndSet}><Icon icon={BarChart3} size={14} style={{ marginRight: 4 }} /> Calculate Targets from Body Data</button>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 'calc(17px + 0.5vw)', marginBottom: 10 }}><Icon icon={Edit} size={14} style={{ marginRight: 4 }} /> Manual Targets (or edit calculated values)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 10 }}>
                      {[
                        { key: 'calories', label: 'Calories (kcal)', IconComp: Flame, color: '#f97316' },
                        { key: 'protein', label: 'Protein (g)', IconComp: Beef, color: '#22c55e' },
                        { key: 'carbs', label: 'Carbs (g)', IconComp: Wheat, color: '#3b82f6' },
                        { key: 'fat', label: 'Fat (g)', IconComp: Droplets, color: '#eab308' },
                      ].map(n => (
                        <div key={n.key}>
                          <label style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Icon icon={n.IconComp} size={12} color={n.color} /> {n.label}</label>
                          <input className="form-input" type="number" value={editTargets[n.key]}
                            onChange={e => setEditTargets(p => ({ ...p, [n.key]: Number(e.target.value) }))}
                            style={{ fontSize: 'calc(19px + 0.5vw)', fontFamily: 'Outfit', fontWeight: 800, color: n.color }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-outline" onClick={() => setShowTargetEditor(false)}>Cancel</button>
                    <button className="btn btn-success" onClick={saveTargets}><Icon icon={CheckCircle2} size={14} style={{ marginRight: 4 }} /> Save Targets</button>
                  </div>
                </div>
              </div>
            )}

            {/* Circular Tracker Rings */}
            {showRings && (() => {
              const todayNutr = getTodayNutrition ? getTodayNutrition(user?.id) : { calories: 0, protein: 0, carbs: 0, fat: 0 };
              const calVal = todayNutr.calories;
              const proVal = todayNutr.protein;
              const carbVal = todayNutr.carbs;
              const fatVal = todayNutr.fat;
              const userHasSetTargets = user?.targetsSet === true;
              const hasTargetValues = targets.calories > 0 || targets.protein > 0 || targets.carbs > 0 || targets.fat > 0;
              return (
                <div style={{ padding: '4px 12px 0 12px', animation: 'fadeInUp 0.3s ease' }}>
                  {!userHasSetTargets && !hasTargetValues ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <span style={{ fontFamily: 'Outfit', fontSize: 'calc(19px + 0.5vw)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}><Target size={16} color="#f97316" /> Daily Nutrition</span>
                      </div>
                      <div onClick={() => { setEditTargets({ calories: 2000, protein: 150, carbs: 250, fat: 70 }); setShowTargetEditor(true); }} style={{
                        padding: 28, borderRadius: 16, cursor: 'pointer',
                        background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(34,197,94,0.06))',
                        border: '2px dashed rgba(249,115,22,0.25)', textAlign: 'center',
                        transition: 'all 0.3s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(34,197,94,0.1))'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(34,197,94,0.06))'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ fontSize: 'calc(44px + 0.5vw)', marginBottom: 10 }}><Target size={40} color="#f97316" /></div>
                        <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(22px + 0.5vw)', marginBottom: 6 }}>Set Your Daily Target</h4>
                        <p style={{ fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16, maxWidth: 400, margin: '0 auto 16px' }}>
                          Welcome! Set your daily nutrition goals to start tracking your Calories, Protein, Carbs & Fat intake.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                          {[
                            { IconComp: Flame, label: 'Calories', color: '#f97316' },
                            { IconComp: Beef, label: 'Protein', color: '#22c55e' },
                            { IconComp: Wheat, label: 'Carbs', color: '#3b82f6' },
                            { IconComp: Droplets, label: 'Fat', color: '#eab308' },
                          ].map((n, i) => (
                            <div key={i} style={{
                              padding: '6px 14px', borderRadius: 10,
                              background: `${n.color}10`, border: `1px solid ${n.color}25`,
                              fontSize: 'calc(16px + 0.5vw)', fontWeight: 700, color: n.color,
                            }}>
                              <Icon icon={n.IconComp} size={12} color={n.color} style={{ marginRight: 4 }} /> {n.label}: <span style={{ opacity: 0.5 }}>Not set</span>
                            </div>
                          ))}
                        </div>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                          padding: '12px 28px', borderRadius: 12,
                          background: 'linear-gradient(135deg, #f97316, #fb923c)',
                          color: '#fff', fontWeight: 800, fontSize: 'calc(19px + 0.5vw)', fontFamily: 'Outfit',
                          boxShadow: '0 4px 18px rgba(249,115,22,0.35)',
                        }}>
                          <Target size={16} style={{ marginRight: 6 }} /> Set Target Now
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div>
                          <span style={{ fontFamily: 'Outfit', fontSize: 'calc(19px + 0.5vw)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}><Target size={16} color="#f97316" /> Daily Nutrition</span>
                        </div>
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditTargets({ ...targets }); setShowTargetEditor(true); }} style={{ fontSize: 'calc(15px + 0.5vw)' }}>
                          <Icon icon={Settings} size={12} style={{ marginRight: 4 }} /> Edit Targets
                        </button>
                      </div>
                      <div className="nutrition-rings-responsive">
                        <Ring value={calVal} target={targets.calories} color="#f97316" icon="" label="Calories" unit="kcal" size={125} stroke={10} />
                        <Ring value={proVal} target={targets.protein} color="#22c55e" icon="" label="Protein" unit="g" size={125} stroke={10} />
                        <Ring value={carbVal} target={targets.carbs} color="#3b82f6" icon="" label="Carbs" unit="g" size={125} stroke={10} />
                        <Ring value={fatVal} target={targets.fat} color="#eab308" icon="" label="Fat" unit="g" size={125} stroke={10} />
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Category Navigation Pills */}
            <div className="tabs" style={{ margin: 0 }}>
              {CATEGORIES.map(c => (<button key={c} className={`tab ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>))}
            </div>

            {/* ═══ MASTER CATALOG MAIN FOOD GRID (COMBINED & SINGLE FLOW) ═══ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: 0 }}>

              {/* Smart Meal Optimization Section */}
              {showSuggested && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Icon icon={cfg.LabelIcon} size={18} color={cfg.color} />
                    <span style={{ fontWeight: 800, fontSize: 'calc(20px + 0.5vw)', color: cfg.color }}>Smart Meal Optimization</span>
                  </div>
                  <div style={{ fontSize: 'calc(18px + 0.5vw)', color: 'var(--text-muted)', marginBottom: 16 }}>
                    Based on your <strong>[{userGoal}]</strong> goal and body profile, here are options rated for balanced macros.
                  </div>

                  {/* Recommended Functional Add-ons — full width now that Live Analyzer is removed */}
                  {suggested[1] && (
                    <div className="card" style={{ padding: 16, border: '1px solid var(--border)', background: 'var(--bg-secondary)', borderRadius: 12 }}>
                      <div style={{ fontWeight: 800, fontSize: 'calc(19px + 0.5vw)', marginBottom: 14 }}>Recommended Functional Add-ons</div>

                      {/* Current suggested item */}
                      <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, background: 'var(--bg-primary)', marginBottom: showAlternatives ? 12 : 0 }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                          <img src={suggested[1].image} alt={suggested[1].name} style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: 'calc(20px + 0.5vw)' }}>{suggested[1].name}</div>
                            <div style={{ fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-muted)', margin: '4px 0' }}>Built for {userGoal.toLowerCase()}, fueled for results.</div>
                            <div style={{ display: 'flex', gap: 12, fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>
                              <span>{suggested[1].calories} kcal</span>
                              <span>{suggested[1].protein}g prot.</span>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Score 9.5</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                            <button className="btn btn-primary btn-sm" style={{ padding: '8px 18px', fontSize: 'calc(17px + 0.5vw)' }} onClick={() => addToCart(suggested[1])}>Order</button>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ padding: '8px 14px', fontSize: 'calc(16px + 0.5vw)', background: showAlternatives ? 'rgba(249,115,22,0.08)' : 'transparent', borderColor: showAlternatives ? 'var(--accent-orange)' : undefined, color: showAlternatives ? 'var(--accent-orange)' : undefined }}
                              onClick={() => setShowAlternatives(v => !v)}
                            >
                              {showAlternatives ? ' Close' : 'Not right?\nAlternatives'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Alternatives panel — appears when "Not right?" is clicked */}
                      {showAlternatives && (
                        <div style={{ animation: 'fadeInUp 0.25s ease' }}>
                          <div style={{ fontSize: 'calc(16px + 0.5vw)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}> Alternative Suggestions for <strong>{userGoal}</strong></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {suggested.filter((_, i) => i !== 1).map((alt) => (
                              <div key={alt.id} style={{
                                display: 'flex', gap: 10, alignItems: 'center',
                                padding: '10px 12px', borderRadius: 10,
                                border: '1.5px solid var(--border)', background: 'var(--bg-primary)',
                                transition: 'all 0.2s',
                              }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-orange)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                              >
                                <img src={alt.image} alt={alt.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 800, fontSize: 'calc(17px + 0.5vw)' }}>{alt.name}</div>
                                  <div style={{ display: 'flex', gap: 8, fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)', marginTop: 2 }}>
                                    <span> {alt.calories} kcal</span>
                                    <span> {alt.protein}g</span>
                                    <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>₹{alt.price}</span>
                                  </div>
                                </div>
                                <button className="btn btn-primary btn-sm" style={{ padding: '6px 14px', fontSize: 'calc(16px + 0.5vw)', whiteSpace: 'nowrap' }} onClick={() => { addToCart(alt); setShowAlternatives(false); }}>+ Add</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <FoodSpotlight gridRef={foodGridRef} spotlightRadius={300} />

              {/* SINGLE Wrapper Grid Area for both collections to completely prevent Row Breaks */}
              <div className="food-grid bento-section" ref={foodGridRef} style={{ ...sharedGridStyle, margin: 0 }}>

                {/* SUGGESTED ITEMS REMOVED (Replaced by Smart Meal Optimization above) */}

                {/* 2. RENDER MASTER FILTERED CATALOG CONTINUOUSLY */}
                {filtered.map((item, i) => {
                  const itemGlow = getGlowColor(item.tags);
                  return (
                    <MagicFoodCard
                      key={item.id}
                      glowColor={itemGlow}
                      className="food-card"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <GlareHover
                        glareColor={`rgb(${itemGlow})`}
                        glareOpacity={0.25}
                        glareAngle={-30}
                        glareSize={280}
                        transitionDuration={500}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <div className="food-card-img" style={{ position: 'relative' }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}><span className="badge badge-blue"><Clock size={10} style={{ marginRight: 3 }} /> {item.prepTime} min</span></div>
                          <div style={{ position: 'absolute', top: 8, right: 8 }}><span className="badge badge-green"><Star size={10} style={{ marginRight: 3 }} /> {item.rating}</span></div>
                          {!item.available && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 800, fontSize: 'calc(18px + 0.5vw)' }}>UNAVAILABLE</div>}
                        </div>
                        <div className="food-card-body">
                          <div className="food-card-name">{item.name}</div>
                          <div className="food-card-macros">{item.tags.map(t => <span key={t} className="badge badge-purple" style={{ fontSize: 'calc(14px + 0.5vw)' }}>{t}</span>)}</div>
                          <div style={{ display: 'flex', gap: 8, fontSize: 'calc(14px + 0.5vw)', color: 'var(--text-muted)', marginBottom: 6 }}>
                            <span><Flame size={10} style={{ marginRight: 2 }} /> {item.calories} kcal</span><span><Beef size={10} style={{ marginRight: 2 }} /> {item.protein}g Prot.</span><span><Wheat size={10} style={{ marginRight: 2 }} /> {item.carbs}g Carb.</span><span><Droplets size={10} style={{ marginRight: 2 }} /> {item.fat}g Fat</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div className="food-card-price">₹{item.price}</div>
                              {item.originalPrice && <>
                                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 'calc(16px + 0.5vw)' }}>₹{item.originalPrice}</span>
                                <span style={{ color: '#22c55e', fontSize: 'calc(14px + 0.5vw)', fontWeight: 800 }}>{item.discount}% off</span>
                              </>}
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={() => item.available && addToCart(item)} disabled={!item.available}>{item.available ? '+ Add' : 'N/A'}</button>
                          </div>
                        </div>
                      </GlareHover>
                    </MagicFoodCard>
                  );
                })}
              </div>
              {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No items found</div>}
            </div>

          </div>
        )}

        {/* ═══ NUTRIENT PACKS TAB ═══ */}
        {tab === 'packs' && (
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: 'calc(17px + 0.5vw)', marginBottom: 16 }}>Curated nutrient packs from kitchen, trainers & gym owners. Order a complete meal set!</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {allPacks.filter(p => p.available).map(pack => {
                const items = pack.items.map(id => menuItems.find(m => m.id === id)).filter(Boolean);
                const unavailCount = items.filter(i => !i.available).length;
                return (
                  <div key={pack.id} className="card" style={{ animation: 'fadeInUp 0.4s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(20px + 0.5vw)' }}><Icon icon={Package} size={16} style={{ marginRight: 6 }} /> {pack.name}</h3>
                      <span className={`badge ${pack.creatorRole === 'trainer' ? 'badge-purple' : pack.creatorRole === 'owner' ? 'badge-green' : 'badge-blue'}`}>{pack.creatorRole === 'trainer' ? <><Crown size={10} style={{ marginRight: 3 }} /> Trainer</> : pack.creatorRole === 'owner' ? <><Crown size={10} style={{ marginRight: 3 }} /> Owner</> : <><ChefHat size={10} style={{ marginRight: 3 }} /> Kitchen</>}</span>
                    </div>
                    <p style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)', marginBottom: 10 }}>{pack.description}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                      {items.map(item => (
                        <span key={item.id} style={{ fontSize: 'calc(15px + 0.5vw)', padding: '3px 8px', background: item.available ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: 6, color: item.available ? '#22c55e' : '#ef4444' }}>
                          {item.available ? <CheckCircle2 size={11} style={{ marginRight: 3, color: '#22c55e' }} /> : <XCircle size={11} style={{ marginRight: 3, color: '#ef4444' }} />} {item.name}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)' }}>
                      <span><Flame size={10} style={{ marginRight: 2 }} /> {pack.totalCalories} kcal</span><span><Beef size={10} style={{ marginRight: 2 }} /> {pack.totalProtein}g protein</span>
                    </div>
                    {unavailCount > 0 && <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 8, padding: 8, marginBottom: 10, fontSize: 'calc(15px + 0.5vw)', color: '#f97316', display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> {unavailCount} item(s) unavailable — you'll be asked to confirm</div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Outfit', fontSize: 'calc(26px + 0.5vw)', fontWeight: 900, color: 'var(--accent-green)' }}>₹{pack.price}</span>
                      <button className="btn btn-primary btn-sm" onClick={() => orderPack(pack)}><Icon icon={ShoppingCart} size={12} style={{ marginRight: 4 }} /> Order Pack</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ TRAINER DIET PLANS TAB ═══ */}
        {tab === 'plans' && (
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: 'calc(17px + 0.5vw)', marginBottom: 16 }}>Diet plans assigned to you by your trainer. Order directly!</p>
            {myDietPlans.length === 0 ? <div className="card" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No diet plans assigned yet</div> :
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {myDietPlans.map(plan => {
                  const planItems = (plan.items || []).map(id => menuItems.find(m => m.id === id)).filter(Boolean);
                  return (
                    <div key={plan.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(20px + 0.5vw)' }}><Icon icon={ClipboardList} size={16} style={{ marginRight: 6 }} /> {plan.name}</h3>
                        <span className="badge badge-green">{plan.status}</span>
                      </div>
                      <p style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)', marginBottom: 10 }}>Created: {new Date(plan.createdAt).toLocaleDateString()}</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        {planItems.map(item => (
                          <span key={item.id} style={{ fontSize: 'calc(15px + 0.5vw)', padding: '4px 10px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>{item.name} • ₹{item.price}</span>
                        ))}
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => { planItems.filter(i => i.available).forEach(i => addToCart(i)); showToast('Diet plan items added to cart!'); }}><Icon icon={ShoppingCart} size={12} style={{ marginRight: 4 }} /> Add All to Cart</button>
                    </div>
                  );
                })}
              </div>}
          </div>
        )}

      </div>

      {/* Sticky Cart Bar (Mobile) */}
      {cart.length > 0 && (
        <div className="sticky-cart-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CartIcon size={18} color="#f97316" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 'calc(17px + 0.5vw)' }}>{cart.reduce((a, c) => a + c.qty, 0)} items</div>
              <div style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)' }}>₹{cart.reduce((a, c) => a + c.price * c.qty, 0)}</div>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/client/cart')} style={{ fontWeight: 800, fontSize: 'calc(16px + 0.5vw)', padding: '8px 20px', borderRadius: 10 }}>
            View Cart →
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}