import { Link } from 'react-router-dom';
import StatIcon from '../../components/StatIcon';
import DashboardLayout from '../../components/DashboardLayout';
import FoodMarquee from '../../components/FoodMarquee';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import deliveryDashboard from '../../assets/delivery_dashboard.png';

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const { getOrdersByDriver, getDriverPendingOrders } = useOrders();
  const myOrders = getOrdersByDriver(user?.id);
  const pending = getDriverPendingOrders(user?.id);
  const active = myOrders.filter(o => o.status === 'in_transit');
  const delivered = myOrders.filter(o => o.status === 'delivered');
  const earnings = delivered.length * 85;

  return (
    <DashboardLayout title="Dashboard">
      <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 20, background: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(${deliveryDashboard}) center/cover`, padding: '48px 40px', color: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 800, background: '#8b5cf6', display: 'inline-block', padding: '4px 14px', borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}> DELIVERY PARTNER</div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 12 }}>Welcome, {user?.name?.split(' ')[0]}!</h1>
        <p style={{ fontSize: 14, opacity: 0.85 }}>{user?.vehicleType} •  {user?.rating || '4.8'} rating</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { icon: <StatIcon name="timer" />, val: pending.length, label: 'Pending', color: '#f97316' },
          { icon: <StatIcon name="truck" />, val: active.length, label: 'Active', color: '#8b5cf6' },
          { icon: <StatIcon name="check" />, val: delivered.length, label: 'Delivered', color: '#22c55e' },
          { icon: <StatIcon name="revenue" />, val: `₹${earnings}`, label: 'Earned', color: '#f97316' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ borderLeft: '4px solid #f97316' }}>
          <h4 style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}> Pending Requests</h4>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>
            You have {pending.length} delivery request{pending.length !== 1 ? 's' : ''} waiting for your acceptance.
          </p>
          <Link to="/delivery/my-deliveries" style={{ fontSize: 11, color: 'var(--accent-orange)', fontWeight: 700 }}>Accept/Reject →</Link>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
          <h4 style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}> Earnings & History</h4>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>
            ₹{earnings} earned from {delivered.length} deliveries. View your full history.
          </p>
          <Link to="/delivery/history" style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 700 }}>View History →</Link>
        </div>
      </div>

      <FoodMarquee />

      {/* Pending orders preview */}
      {pending.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <h3 className="card-title"> Pending Requests</h3>
            <Link to="/delivery/my-deliveries" style={{ color: 'var(--accent-orange)', fontSize: 13, fontWeight: 700 }}>View All →</Link>
          </div>
          {pending.slice(0, 3).map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontWeight: 700 }}>#{o.id}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>{o.customerName} • {o.customerAddress}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>₹{o.total}</span>
                <span className="badge badge-orange">PENDING</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active deliveries preview */}
      {active.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <h3 className="card-title"> Active Deliveries</h3>
            <Link to="/delivery/my-deliveries" style={{ color: 'var(--accent-purple)', fontSize: 13, fontWeight: 700 }}>View All →</Link>
          </div>
          {active.map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontWeight: 700 }}>#{o.id}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>{o.customerName} •  {o.customerAddress}</span>
              </div>
              <span className="badge badge-purple">IN TRANSIT</span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
