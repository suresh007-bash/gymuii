import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import FoodMarquee from '../../components/FoodMarquee';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';




export default function KitchenDashboard() {
  const { user } = useAuth();
  const { orders, getStats } = useOrders();
  const stats = getStats();
  const recentOrders = orders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime)).slice(0, 5);



  return (
    <DashboardLayout title="Dashboard">
      <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 20, background: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80") center/cover', padding: '48px 40px', color: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 800, background: '#14b8a6', display: 'inline-block', padding: '4px 14px', borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}>👨‍🍳 KITCHEN PORTAL</div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 12 }}>{user?.kitchenName || 'Kitchen Dashboard'}</h1>
        <p style={{ fontSize: 14, opacity: 0.85 }}>{stats.pending} pending • {stats.preparing} preparing • ₹{stats.revenue.toLocaleString()} total revenue</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ borderLeft: '4px solid #f97316' }}><h4 style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>📋 Pending Orders</h4><p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>You have {stats.pending} orders waiting to be prepared. Start cooking!</p><Link to="/kitchen/queue" style={{ fontSize: 11, color: 'var(--accent-orange)', fontWeight: 700 }}>Open Queue →</Link></div>
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}><h4 style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>🚀 Ready to Dispatch</h4><p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>{orders.filter(o => o.status === 'ready').length} orders are ready. Assign drivers for delivery.</p><Link to="/kitchen/dispatch" style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 700 }}>Dispatch →</Link></div>
      </div>


      <FoodMarquee />



      <div className="card">
        <div className="card-header"><h3 className="card-title">📦 Recent Orders</h3><Link to="/kitchen/queue" style={{ color: 'var(--accent-orange)', fontSize: 12, fontWeight: 700 }}>View All →</Link></div>
        {recentOrders.map(o => (
          <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div><span style={{ fontWeight: 700 }}>#{o.id}</span><span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>{o.customerName} • {o.items.map(i => i.name).join(', ')}</span></div>
            <span className={`badge ${o.status === 'pending' ? 'badge-orange' : o.status === 'preparing' ? 'badge-blue' : o.status === 'ready' ? 'badge-green' : 'badge-purple'}`}>{o.status.replace('_', ' ').toUpperCase()}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
