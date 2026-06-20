import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import FoodMarquee from '../../components/FoodMarquee';
import { useAuth } from '../../context/AuthContext';
import { getMenuItems } from '../../data/menuHelper';

export default function ClientDashboard() {
  const MENU_ITEMS = getMenuItems();
  const { user } = useAuth();

  return (
    <DashboardLayout title="Dashboard">
      {/* ═══ HERO BANNER ═══ */}
      <div style={{
        borderRadius: 20, overflow: 'hidden', position: 'relative', marginBottom: 20,
        background: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80") center/cover',
        padding: '48px 40px', color: '#fff',
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, background: '#f97316', display: 'inline-block', padding: '4px 14px', borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}>🍽️ FOOD DELIVERY</div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 12, maxWidth: 450 }}>
          Order Food Online<br />in Chennai
        </h1>
        <p style={{ fontSize: 14, opacity: 0.85, maxWidth: 420, lineHeight: 1.6 }}>
          Get fresh, delicious meals delivered fast — curated for your health goals and everyday cravings.
        </p>
      </div>

      {/* ═══ MEAL TIMING CARDS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ borderLeft: '4px solid #f97316' }}>
          <h4 style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>🌅 Breakfast order timing</h4>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>Order breakfast by 8:00 AM to receive it fresh by 9:00 AM. Best for early training and morning recovery.</p>
          <span style={{ fontSize: 11, color: 'var(--accent-orange)', fontWeight: 700 }}>Recommended order window: 7:45 AM - 8:15 AM</span>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <h4 style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>☀️ Lunch order timing</h4>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>Place your lunch order by 12:30 PM to get it delivered by 1:30 PM. Ideal for a mid-day nutrition reset.</p>
          <span style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 700 }}>Recommended order window: 12:00 PM - 12:30 PM</span>
        </div>
      </div>

      {/* ═══ SCROLLING FOOD IMAGES ═══ */}
      <FoodMarquee />

      {/* ═══ QUICK BROWSE ═══ */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 18 }}>🔥 Popular Items</h3>
          <Link to="/client/menu" style={{ color: 'var(--accent-orange)', fontSize: 13, fontWeight: 700 }}>See all →</Link>
        </div>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {MENU_ITEMS.filter(m => m.available).slice(0, 6).map(item => (
            <Link key={item.id} to="/client/menu" style={{ textDecoration: 'none', flexShrink: 0, width: 160 }}>
              <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #eee', background: 'var(--bg-card)', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
                <div style={{ padding: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--text-primary)', marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>🔥{item.calories} • ₹{item.price}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
