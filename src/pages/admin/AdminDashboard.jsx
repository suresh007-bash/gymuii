import { Link } from 'react-router-dom';
import StatIcon from '../../components/StatIcon';
import DashboardLayout from '../../components/DashboardLayout';
import FoodMarquee from '../../components/FoodMarquee';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';


const MIND_CATS = [{ label: 'Users', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&q=80' },{ label: 'Orders', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=150&q=80' },{ label: 'Analytics', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=150&q=80' },{ label: 'Delivery', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&q=80' },{ label: 'Kitchen', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&q=80' },{ label: 'Promote', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&q=80' },{ label: 'Revenue', img: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=150&q=80' },{ label: 'Settings', img: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=150&q=80' }];

export default function AdminDashboard() {
  const { allUsers } = useAuth();
  const { orders, getStats } = useOrders();
  const stats = getStats();
  const recentOrders = orders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime)).slice(0, 5);



  return (
    <DashboardLayout title="Dashboard">
      <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 20, background: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80") center/cover', padding: '48px 40px', color: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 800, background: '#f97316', display: 'inline-block', padding: '4px 14px', borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}>⚙️ ADMIN PANEL</div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 12 }}>System Overview</h1>
        <p style={{ fontSize: 14, opacity: 0.85 }}>{allUsers.length} users • {stats.total} orders • ₹{stats.revenue.toLocaleString()} revenue</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ borderLeft: '4px solid #f97316' }}><h4 style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>📦 Order Management</h4><p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>{stats.pending} pending, {stats.preparing} preparing, {stats.inTransit} in transit. Manage all orders.</p><Link to="/admin/orders" style={{ fontSize: 11, color: 'var(--accent-orange)', fontWeight: 700 }}>Manage Orders →</Link></div>
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}><h4 style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>👥 User Management</h4><p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>{allUsers.length} registered users across all roles. Promote, edit, or manage access.</p><Link to="/admin/users" style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 700 }}>Manage Users →</Link></div>
      </div>


      <FoodMarquee />

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 20, marginBottom: 16 }}>What's on your mind?</h3>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>{MIND_CATS.map((cat, i) => (<Link key={i} to={['/admin/users','/admin/orders','/admin/analytics','/admin/delivery','/admin/settings','/admin/settings','/admin/analytics','/admin/settings'][i]} style={{ textDecoration: 'none', textAlign: 'center', flexShrink: 0 }}><div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', marginBottom: 6, border: '2px solid #eee' }}><img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{cat.label}</div></Link>))}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 20 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">📦 Recent Orders</h3><Link to="/admin/orders" style={{ color: 'var(--accent-orange)', fontSize: 12, fontWeight: 700 }}>View All →</Link></div>
          {recentOrders.map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div><span style={{ fontWeight: 700 }}>#{o.id}</span><span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>{o.customerName}</span></div>
              <span className={`badge ${o.status === 'pending' ? 'badge-orange' : o.status === 'preparing' ? 'badge-blue' : o.status === 'delivered' ? 'badge-green' : 'badge-purple'}`}>{o.status.replace('_', ' ').toUpperCase()}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">👥 Users by Role</h3></div>
          {[['client', <StatIcon name="dumbbell" />, '#f97316'], ['trainer', <StatIcon name="protein" />, '#22c55e'], ['owner', <StatIcon name="award" />, '#3b82f6'], ['kitchen', <StatIcon name="chef" />, '#14b8a6'], ['delivery', <StatIcon name="truck" />, '#8b5cf6'], ['admin', <StatIcon name="target" />, '#64748b']].map(([role, icon, color]) => {
            const count = allUsers.filter(u => u.role === role).length;
            return (<div key={role} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>{role}s</span>
              <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 16, color }}>{count}</span>
            </div>);
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
