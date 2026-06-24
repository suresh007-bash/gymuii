import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Package, Users } from '../../components/Icons';
import StatIcon from '../../components/StatIcon';
import DashboardLayout from '../../components/DashboardLayout';
import FoodMarquee from '../../components/FoodMarquee';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';

const MIND_CATS = [
  { label: 'Users', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&q=80' },
  { label: 'Orders', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80' },
  { label: 'Analytics', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=150&q=80' },
  { label: 'Delivery', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&q=80' },
  { label: 'Kitchen', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&q=80' },
  { label: 'Promote', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&q=80' },
  { label: 'Revenue', img: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=150&q=80' },
  { label: 'Settings', img: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=150&q=80' }
];

export default function AdminDashboard() {
  const { allUsers } = useAuth();
  const { orders, getStats } = useOrders();
  const stats = getStats();
  const recentOrders = orders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime)).slice(0, 6);

  return (
    <DashboardLayout title="Dashboard">
      <style>{`
        .admin-page-wrapper { width: 100%; box-sizing: border-box; }

        /* Hero */
        .hero-banner { padding: clamp(28px, 5vw, 72px) clamp(20px, 5vw, 56px); border-radius: 20px; margin-bottom: 24px; }
        .hero-tag { font-size: clamp(13px, 1.5vw, 15px); padding: 8px 18px; margin-bottom: 14px; display: inline-flex; align-items: center; border-radius: 20px; letterSpacing: 1.5px; }
        .hero-title { font-size: clamp(28px, 5vw, 54px); margin-bottom: 12px; line-height: 1.1; }
        .hero-sub { font-size: clamp(15px, 2.5vw, 22px); opacity: 0.92; font-weight: 600; }

        /* Module Cards */
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 20px; margin-bottom: 24px; }
        .module-card { padding: clamp(20px, 3vw, 32px); border-radius: 18px; }
        .module-title { font-size: clamp(18px, 2.5vw, 24px); margin-bottom: 12px; font-weight: 900; display: flex; align-items: center; gap: 10px; }
        .module-desc { font-size: clamp(14px, 1.8vw, 17px); margin-bottom: 16px; color: var(--text-muted); line-height: 1.6; }
        .module-link { font-size: clamp(15px, 1.8vw, 18px); font-weight: 800; text-decoration: none; }

        /* Mind Panel */
        .mind-panel { padding: clamp(20px, 3vw, 36px) clamp(16px, 3vw, 32px); margin-bottom: 24px; border-radius: 20px; }
        .mind-title { font-size: clamp(20px, 3vw, 28px); margin-bottom: 20px; font-weight: 950; }
        .mind-scroll { display: flex; align-items: flex-start; overflow-x: auto; gap: clamp(16px, 2.5vw, 32px); padding-bottom: 12px; -webkit-overflow-scrolling: touch; }
        .mind-item { flex: 0 0 clamp(80px, 12vw, 120px); text-align: center; display: flex; flex-direction: column; align-items: center; text-decoration: none; }
        .mind-img-wrapper { width: clamp(80px, 12vw, 120px); height: clamp(80px, 12vw, 120px); border-radius: 50%; overflow: hidden; border: 3px solid var(--border); box-shadow: 0 4px 14px rgba(0,0,0,0.08); margin-bottom: 10px; }
        .mind-label { font-size: clamp(13px, 1.6vw, 16px); font-weight: 800; color: var(--text-primary); white-space: normal; word-wrap: break-word; line-height: 1.2; }

        /* Insight Cards */
        .insight-card { padding: clamp(18px, 3vw, 32px); border-radius: 20px; display: flex; flex-direction: column; }
        .insight-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 2px solid var(--border); }
        .insight-title { font-size: clamp(16px, 2.5vw, 22px); font-weight: 900; margin: 0; display: flex; align-items: center; gap: 8px; }
        .insight-link { font-size: clamp(14px, 1.6vw, 17px); color: var(--accent-orange); font-weight: 800; text-decoration: none; white-space: nowrap; }

        .recent-row { display: flex; justify-content: space-between; align-items: center; padding: clamp(12px, 2vw, 16px) 0; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 8px; }
        .recent-id { font-weight: 900; font-size: clamp(15px, 2vw, 18px); }
        .recent-name { font-size: clamp(13px, 1.8vw, 16px); color: var(--text-muted); margin-left: 8px; }
        .recent-badge { font-size: clamp(11px, 1.4vw, 13px); padding: 5px 12px; font-weight: 800; }

        .role-row { display: flex; align-items: center; padding: clamp(12px, 2vw, 16px) 0; border-bottom: 1px solid var(--border); gap: clamp(12px, 2vw, 18px); }
        .role-icon { font-size: clamp(22px, 3vw, 28px); display: flex; align-items: center; flex-shrink: 0; }
        .role-name { flex: 1; font-weight: 700; text-transform: capitalize; font-size: clamp(15px, 2vw, 18px); }
        .role-count { font-family: Outfit; font-weight: 950; font-size: clamp(20px, 3vw, 26px); }
      `}</style>

      <div className="admin-page-wrapper">

        {/* Hero Banner */}
        <div className="hero-banner" style={{
          overflow: 'hidden',
          background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80") center/cover',
          color: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }}>
          <div className="hero-tag" style={{ fontWeight: 900, background: '#f97316' }}>
            <SettingsIcon size={16} style={{ marginRight: 8 }} /> ADMIN PANEL
          </div>
          <h1 className="hero-title" style={{ fontFamily: 'Outfit', fontWeight: 950, letterSpacing: '-0.5px' }}>
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
              <div className="stat-value" style={{ color: s.color, fontSize: 'clamp(18px, 3vw, 26px)' }}>{s.val}</div>
              <div className="stat-label" style={{ fontSize: 'clamp(11px, 1.4vw, 13px)' }}>{s.label}</div>
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
              <Link key={i} to={['/admin/users','/admin/orders','/admin/analytics','/admin/delivery','/admin/settings','/admin/settings','/admin/analytics','/admin/settings'][i]} className="mind-item">
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
              {recentOrders.map(o => (
                <div key={o.id} className="recent-row">
                  <div>
                    <span className="recent-id">#{o.id}</span>
                    <span className="recent-name">{o.customerName}</span>
                  </div>
                  <span className={`badge recent-badge ${o.status === 'pending' ? 'badge-orange' : o.status === 'preparing' ? 'badge-blue' : o.status === 'delivered' ? 'badge-green' : 'badge-purple'}`}>
                    {o.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))}
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