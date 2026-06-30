import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Package, Users } from '../../components/Icons';
import StatIcon from '../../components/StatIcon';
import DashboardLayout from '../../components/DashboardLayout';
import FoodMarquee from '../../components/FoodMarquee';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';

import gymUsers from '../../assets/gym_users.png';
import foodGeneral from '../../assets/food_general.png';
import saladPrep from '../../assets/salad_prep.png';
import pizzaDelivery from '../../assets/pizza_delivery.png';
import kitchenGeneral from '../../assets/kitchen_general.png';
import trainerWorkout from '../../assets/trainer_workout.png';
import roastedChicken from '../../assets/roasted_chicken.png';
import sweetDessert from '../../assets/sweet_dessert.png';

const MIND_CATS = [
  { label: 'Users', img: gymUsers },
  { label: 'Orders', img: foodGeneral },
  { label: 'Analytics', img: saladPrep },
  { label: 'Delivery', img: pizzaDelivery },
  { label: 'Kitchen', img: kitchenGeneral },
  { label: 'Promote', img: trainerWorkout },
  { label: 'Revenue', img: roastedChicken },
  { label: 'Settings', img: sweetDessert }
];

export default function AdminDashboard() {
  const { allUsers } = useAuth();
  const { orders, getStats } = useOrders();
  const stats = getStats();
  const recentOrders = orders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime)).slice(0, 6);

  return (
    <DashboardLayout title="Home">
      <style>{`
        .admin-page-wrapper { width: 100%; box-sizing: border-box; }

        /* Hero */
        .hero-banner { padding: clamp(28px, 1.7vw, 51px) clamp(20px, 1.7vw, 40px); border-radius: 20px; margin-bottom: 24px; }
        .hero-tag { font-size: clamp(13px, 0.6vw, 15px); padding: 8px 18px; margin-bottom: 14px; display: inline-flex; align-items: center; border-radius: 20px; letterSpacing: 1.5px; }
        .hero-title { font-size: clamp(28px, 1.7vw, 38px); margin-bottom: 12px; line-height: 1.1; }
        .hero-sub { font-size: clamp(15px, 0.9vw, 18px); opacity: 0.92; font-weight: 600; }

        /* Module Cards */
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 20px; margin-bottom: 24px; }
        .module-card { padding: clamp(20px, 1.0vw, 23px); border-radius: 18px; }
        .module-title { font-size: clamp(18px, 0.9vw, 21px); margin-bottom: 12px; font-weight: 900; display: flex; align-items: center; gap: 10px; }
        .module-desc { font-size: clamp(14px, 0.7vw, 17px); margin-bottom: 16px; color: var(--text-muted); line-height: 1.6; }
        .module-link { font-size: clamp(15px, 0.7vw, 18px); font-weight: 800; text-decoration: none; }

        /* Mind Panel */
        .mind-panel { padding: clamp(20px, 1.0vw, 26px) clamp(16px, 1.0vw, 23px); margin-bottom: 24px; border-radius: 20px; }
        .mind-title { font-size: clamp(20px, 1.0vw, 23px); margin-bottom: 20px; font-weight: 950; }
        .mind-scroll { display: flex; align-items: flex-start; overflow-x: auto; gap: clamp(16px, 0.9vw, 23px); padding-bottom: 12px; -webkit-overflow-scrolling: touch; }
        .mind-item { flex: 0 0 clamp(80px, 4.1vw, 92px); text-align: center; display: flex; flex-direction: column; align-items: center; text-decoration: none; }
        .mind-img-wrapper { width: clamp(80px, 4.1vw, 92px); height: clamp(80px, 4.1vw, 92px); border-radius: 50%; overflow: hidden; border: 3px solid var(--border); box-shadow: 0 4px 14px rgba(0,0,0,0.08); margin-bottom: 10px; }
        .mind-label { font-size: clamp(13px, 0.6vw, 15px); font-weight: 800; color: var(--text-primary); white-space: normal; word-wrap: break-word; line-height: 1.2; }

        /* Insight Cards */
        .insight-card { padding: clamp(18px, 1.0vw, 23px); border-radius: 20px; display: flex; flex-direction: column; }
        .insight-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 2px solid var(--border); }
        .insight-title { font-size: clamp(22px, 1.0vw, 26px); font-weight: 900; margin: 0; display: flex; align-items: center; gap: 8px; }
        .insight-link { font-size: clamp(14px, 0.6vw, 17px); color: var(--accent-orange); font-weight: 800; text-decoration: none; white-space: nowrap; }

        .recent-row { display: flex; justify-content: space-between; align-items: center; padding: clamp(12px, 0.7vw, 14px) 0; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 8px; }
        .recent-id { font-weight: 900; font-size: clamp(15px, 0.7vw, 18px); }
        .recent-name { font-size: clamp(13px, 0.7vw, 15px); color: var(--text-muted); margin-left: 8px; }
        .recent-badge { font-size: clamp(11px, 0.5vw, 13px); padding: 5px 12px; font-weight: 800; }

        .role-row { display: flex; align-items: center; padding: clamp(12px, 0.7vw, 14px) 0; border-bottom: 1px solid var(--border); gap: clamp(12px, 0.7vw, 14px); }
        .role-icon { font-size: clamp(22px, 1.0vw, 26px); display: flex; align-items: center; flex-shrink: 0; }
        .role-name { flex: 1; font-weight: 700; text-transform: capitalize; font-size: clamp(15px, 0.7vw, 18px); }
        .role-count { font-family: Outfit; font-weight: 950; font-size: clamp(20px, 1.0vw, 23px); }
      `}</style>

      <div className="admin-page-wrapper">

        {/* Hero Banner */}
        <div className="hero-banner" style={{
          overflow: 'hidden',
          background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${foodGeneral}) center/cover`,
          color: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }}>
          <div className="hero-tag" style={{ fontWeight: 900, background: '#f97316' }}>
            <SettingsIcon size={16} style={{ marginRight: 8 }} /> ADMIN PANEL
          </div>
          <h1 className="hero-title" style={{ fontWeight: 950, letterSpacing: '-0.5px' }}>
            System Overview
          </h1>
          <p className="hero-sub">
            {allUsers.length} users • {stats.total} orders • ₹{stats.revenue.toLocaleString()} revenue
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { icon: <StatIcon name="revenue" />, val: `₹${stats.revenue.toLocaleString()}`, label: 'Revenue', color: '#22c55e' },
            { icon: <StatIcon name="orders" />, val: stats.total, label: 'Orders', color: '#3b82f6' },
            { icon: <StatIcon name="users" />, val: allUsers.length, label: 'Users', color: '#f97316' },
            { icon: <StatIcon name="barChart" />, val: stats.avgOrderValue > 0 ? `₹${stats.avgOrderValue}` : '₹0', label: 'Avg Order', color: '#8b5cf6' }
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value" style={{ color: s.color, fontSize: 'var(--fs-body)' }}>{s.val}</div>
              <div className="stat-label" style={{ fontSize: 'var(--fs-xs)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Module Cards */}
        <div className="dashboard-grid">
          <div className="card module-card" style={{ borderLeft: '6px solid #f97316' }}>
            <h4 className="module-title"><Package size={22} /> Order Management</h4>
            <p className="module-desc">{stats.pending} pending, {stats.preparing} preparing, {stats.inTransit} in transit.</p>
            <Link to="/admin/orders" className="module-link" style={{ color: 'var(--accent-orange)' }}>Manage Orders →</Link>
          </div>
          <div className="card module-card" style={{ borderLeft: '6px solid #22c55e' }}>
            <h4 className="module-title"><Users size={22} /> User Management</h4>
            <p className="module-desc">{allUsers.length} registered users across all system roles.</p>
            <Link to="/admin/users" className="module-link" style={{ color: '#22c55e' }}>Manage Users →</Link>
          </div>
        </div>

        {/* Marquee */}
        <div style={{ marginBottom: 24 }}><FoodMarquee /></div>

        {/* What's on your mind */}
        <div className="mind-panel card" style={{ background: 'var(--bg-card)' }}>
          <h3 className="mind-title">What's on your mind?</h3>
          <div className="mind-scroll">
            {MIND_CATS.map((cat, i) => (
              <Link key={i} to={['/admin/users', '/admin/orders', '/admin/analytics', '/admin/delivery', '/admin/settings', '/admin/settings', '/admin/analytics', '/admin/settings'][i]} className="mind-item">
                <div className="mind-img-wrapper">
                  <img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="mind-label">{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Insight Cards */}
        <div className="dashboard-grid" style={{ marginBottom: 0 }}>

          {/* Recent Orders */}
          <div className="card insight-card">
            <div className="insight-header">
              <h3 className="insight-title"><Package size={20} /> Recent Orders</h3>
              <Link to="/admin/orders" className="insight-link">View All →</Link>
            </div>
            <div style={{ flex: 1 }}>
              {recentOrders.map(o => {
                const formattedId = 'ord' + o.id.toString().replace('ord', '').slice(-5).padStart(5, '0');
                return (
                  <div key={o.id} className="recent-row">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="recent-id" style={{ display: 'inline-block', minWidth: 110 }}>#{formattedId}</span>
                      <span className="recent-name">{o.customerName}</span>
                    </div>
                    <span className={`badge recent-badge ${o.status === 'pending' ? 'badge-orange' : o.status === 'preparing' ? 'badge-blue' : o.status === 'delivered' ? 'badge-green' : 'badge-purple'}`}>
                      {o.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Users by Role */}
          <div className="card insight-card">
            <div className="insight-header">
              <h3 className="insight-title"><Users size={20} /> Users by Role</h3>
            </div>
            <div style={{ flex: 1 }}>
              {[
                ['client', <StatIcon name="dumbbell" />, '#f97316'],
                ['trainer', <StatIcon name="protein" />, '#22c55e'],
                ['owner', <StatIcon name="award" />, '#3b82f6'],
                ['kitchen', <StatIcon name="chef" />, '#14b8a6'],
                ['delivery', <StatIcon name="truck" />, '#8b5cf6'],
                ['admin', <StatIcon name="target" />, '#64748b']
              ].map(([role, icon, color]) => {
                const count = allUsers.filter(u => u.role === role).length;
                return (
                  <div key={role} className="role-row">
                    <span className="role-icon">{icon}</span>
                    <span className="role-name">{role}s</span>
                    <span className="role-count" style={{ color }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}