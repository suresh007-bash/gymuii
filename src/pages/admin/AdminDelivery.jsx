import DashboardLayout from '../../components/DashboardLayout';
import { Car, Package, User, Clock, Star } from '../../components/Icons';
import StatIcon from '../../components/StatIcon';
import { MOCK_USERS } from '../../data/mockUsers';
import { MOCK_ORDERS } from '../../data/mockOrders';

export default function AdminDelivery() {
  const drivers = MOCK_USERS.filter(u => u.role === 'delivery');
  const activeDeliveries = MOCK_ORDERS.filter(o => o.status === 'in_transit');

  return (
    <DashboardLayout title="Delivery Management">
      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[{ icon: <StatIcon name="truck" />, val: drivers.length, label: 'Total Drivers' }, { icon: <StatIcon name="check" />, val: drivers.filter(d => d.available).length, label: 'Available' }, { icon: <StatIcon name="orders" />, val: activeDeliveries.length, label: 'Active Deliveries' }, { icon: <StatIcon name="star" />, val: '4.8', label: 'Avg Rating' }].map((s, i) => (
          <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-value">{s.val}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>

      {/* Driver Cards */}
      <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: 16 }}><Car size={16} style={{marginRight:4}} /> Delivery Drivers</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {drivers.map(d => (
          <div key={d.id} className="card" style={{ animation: 'fadeInUp 0.4s ease' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>{d.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.vehicleType} • {d.licenseNo}</div>
              </div>
              <span className={`badge ${d.available ? 'badge-green' : 'badge-red'}`} style={{ flexShrink: 0, fontSize: 10 }}>{d.available ? '🟢 Free' : '🔴 Busy'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
              <span><Star size={12} style={{marginRight:2}} /> {d.rating} rating</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{d.email}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Deliveries */}
      <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: 16 }}><Package size={16} style={{marginRight:4}} /> Live Deliveries</h3>
      <div className="card">
        {/* Desktop Table */}
        <div className="admin-table-desktop">
          <table className="data-table">
            <thead><tr><th>Order</th><th>Driver</th><th>Customer</th><th>Restaurant</th><th>Status</th><th>ETA</th></tr></thead>
            <tbody>
              {activeDeliveries.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No active deliveries right now</td></tr>
              ) : activeDeliveries.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700 }}>#{o.id}</td>
                  <td>{o.driverName || '—'}</td>
                  <td>{o.customerName}</td>
                  <td style={{ fontSize: 12 }}>{o.restaurantName}</td>
                  <td><span className="badge badge-purple"><Car size={12} style={{marginRight:2}} /> In Transit</span></td>
                  <td>{o.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="admin-cards-mobile" style={{ display: 'none' }}>
          {activeDeliveries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No active deliveries right now</div>
          ) : activeDeliveries.map(o => (
            <div key={o.id} style={{ padding: 14, borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>#{o.id}</div>
                <span className="badge badge-purple" style={{ fontSize: 10 }}><Car size={12} style={{marginRight:2}} /> In Transit</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span><User size={12} style={{marginRight:2}} /> {o.customerName}</span>
                <span><Clock size={12} style={{marginRight:2}} /> {o.eta}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                <span><Car size={12} style={{marginRight:2}} /> {o.driverName || '—'}</span>
                <span>🏪 {o.restaurantName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
