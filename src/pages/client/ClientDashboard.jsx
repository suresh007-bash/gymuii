import { Link } from 'react-router-dom';
import { Icon, Utensils, Flame, Clock, Sun, Moon } from '../../components/Icons'; 
import DashboardLayout from '../../components/DashboardLayout';
import FoodMarquee from '../../components/FoodMarquee';
import { useAuth } from '../../context/AuthContext';
import { getMenuItems } from '../../data/menuHelper';
import foodGeneral from '../../assets/food_general.png';

export default function ClientDashboard() {
  const MENU_ITEMS = getMenuItems();
  const { user } = useAuth();

  return (
    <DashboardLayout title="Dashboard">
      {/* ═══ HERO BANNER ═══ */}
      <div style={{
        borderRadius: 20, overflow: 'hidden', position: 'relative', marginBottom: 20,
        background: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(${foodGeneral}) center/cover`,
        padding: '48px 40px', color: '#fff',
      }}>
        <div style={{ fontSize: 'calc(15px + 0.5vw)', fontWeight: 800, background: '#f97316', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}><Utensils size={12} /> FOOD DELIVERY</div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 12, maxWidth: 450 }}>
          Make a Better Life
        </h1>
        <p style={{ fontSize: 'calc(18px + 0.5vw)', opacity: 0.85, maxWidth: 420, lineHeight: 1.6 }}>
          Fuel your body with chef-crafted, nutrient-rich meals — designed for your fitness goals and delivered fresh to your door.
        </p>
      </div>

      {/* ═══ SEARCH BAR ═══ */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          placeholder="Search meals..."
          style={{
            flex: 1,
            minWidth: 220,
            padding: '14px 18px',
            borderRadius: 14,
            border: '1px solid #e5e7eb',
            outline: 'none',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
          }}
        />
        <button style={{ width: 50, height: 50, borderRadius: 14, border: 'none', background: '#f97316', color: '#fff', cursor: 'pointer' }}>️</button>
        <button style={{ width: 50, height: 50, borderRadius: 14, border: 'none', background: '#f97316', color: '#fff', cursor: 'pointer' }}></button>
      </div>

      {/* ═══ SECTION HEADER TITLE ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 'calc(18px + 0.5vw)', color: 'var(--text-primary)' }}>
          <span style={{ color: '#f97316' }}></span> Daily Nutrition
        </div>
        <button style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', fontSize: 'calc(16px + 0.5vw)', fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)' }}>
          ️ Edit Targets
        </button>
      </div>

      {/* ═══ PERFECT HORIZONTAL SINGLE-ROW NUTRITION CARD (MATCHED TO MOCKUP) ═══ */}
      <div 
        style={{ 
          marginBottom: 28, 
          width: '100%',
          background: '#ffffff',
          borderRadius: 20,
          padding: '32px 16px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.02)',
          border: '1px solid #f1f5f9',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            gap: 8,
            width: '100%',
            justifyContent: 'space-around',
            alignItems: 'center'
          }}
        >
          {[
            { value: '450', unit: 'kcal', color: '#f97316', strokeDash: '110, 220' },
            { value: '38', unit: 'g', color: '#22c55e', strokeDash: '140, 220' },
            { value: '8', unit: 'g', color: '#3b82f6', strokeDash: '40, 220' },
            { value: '28', unit: 'g', color: '#a855f7', strokeDash: '160, 220' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: '1 1 0%',
                minWidth: 0
              }}
            >
              {/* Dynamic Symmetrical SVG Progress Ring */}
              <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  {/* Track line layer */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="2.8" />
                  {/* Fill progress color ring */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="2.8"
                    strokeDasharray={item.strokeDash}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center Content Typography */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.1
                }}>
                  <span style={{ fontWeight: 800, fontSize: 'calc(21px + 0.5vw)', color: '#1e293b', fontFamily: 'Outfit' }}>{item.value}</span>
                  <span style={{ fontSize: 'calc(13px + 0.5vw)', color: '#94a3b8', fontWeight: 600 }}>{item.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ MEAL TIMING CARDS ═══ */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', 
        gap: 16, 
        marginBottom: 24,
        alignItems: 'stretch'
      }}>
        <div className="card" style={{ borderLeft: '4px solid #f97316', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box', padding: '24px 20px', minHeight: '190px' }}>
          <div style={{ marginBottom: 12 }}>
            <h4 style={{ fontWeight: 800, fontSize: 'calc(18px + 0.5vw)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} color="#f97316" /> Breakfast order timing
            </h4>
            <p style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Order breakfast by 8:00 AM to receive it fresh by 9:00 AM. Best for early training and morning recovery.
            </p>
          </div>
          <span style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--accent-orange)', fontWeight: 700, marginTop: 'auto' }}>Recommended order window: 7:45 AM - 8:15 AM</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #22c55e', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box', padding: '24px 20px', minHeight: '190px' }}>
          <div style={{ marginBottom: 12 }}>
            <h4 style={{ fontWeight: 800, fontSize: 'calc(18px + 0.5vw)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sun size={14} color="#22c55e" /> Lunch order timing
            </h4>
            <p style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Place your lunch order by 12:30 PM to get it delivered by 1:30 PM. Ideal for a mid-day nutrition reset.
            </p>
          </div>
          <span style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--accent-green)', fontWeight: 700, marginTop: 'auto' }}>Recommended order window: 12:00 PM - 12:30 PM</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #a855f7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box', padding: '24px 20px', minHeight: '190px' }}>
          <div style={{ marginBottom: 12 }}>
            <h4 style={{ fontWeight: 800, fontSize: 'calc(18px + 0.5vw)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Moon size={14} color="#a855f7" /> Dinner order timing
            </h4>
            <p style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Secure your dinner by 7:30 PM for arrival by 8:30 PM. Perfect fueling for overnight post-workout repair.
            </p>
          </div>
          <span style={{ fontSize: 'calc(15px + 0.5vw)', color: '#a855f7', fontWeight: 700, marginTop: 'auto' }}>Recommended order window: 7:00 PM - 7:30 PM</span>
        </div>
      </div>

      {/* ═══ SCROLLING FOOD IMAGES ═══ */}
      <FoodMarquee />

      {/* ═══ QUICK BROWSE & CATEGORIES ═══ */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'calc(22px + 0.5vw)', display: 'flex', alignItems: 'center', gap: 6 }}><Flame size={18} color="#f97316" /> Popular Items</h3>
          <Link to="/client/menu" style={{ color: 'var(--accent-orange)', fontSize: 'calc(17px + 0.5vw)', fontWeight: 700 }}>See all →</Link>
        </div>

        {/* CATEGORIES */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', marginBottom: 24, paddingBottom: 8 }}>
          {['Protein', 'Salads', 'Smoothies', 'Meal Prep', 'Low Carb', 'Weight Loss'].map((cat) => (
            <button key={cat} style={{ border: 'none', background: '#f97316', color: '#fff', borderRadius: 999, padding: '10px 18px', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* POPULAR ITEMS GRID */}
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {MENU_ITEMS.filter(m => m.available).slice(0, 6).map(item => (
            <Link key={item.id} to="/client/menu" style={{ textDecoration: 'none', flexShrink: 0, width: 'clamp(170px,22vw,220px)' }}>
              <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #eee', background: 'var(--bg-card)', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
                <div style={{ padding: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-primary)', marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 'calc(14px + 0.5vw)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 2 }}><Flame size={10} />{item.calories} • ₹{item.price}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}