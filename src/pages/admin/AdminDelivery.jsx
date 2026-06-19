import DashboardLayout from '../../components/DashboardLayout';
import { MOCK_USERS } from '../../data/mockUsers';
import { MOCK_ORDERS } from '../../data/mockOrders';

export default function AdminDelivery() {
  const drivers = MOCK_USERS.filter(u => u.role === 'delivery');
  const activeDeliveries = MOCK_ORDERS.filter(o => o.status === 'in_transit');

  return (
    <DashboardLayout title="Delivery Management">
      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[{ icon: '🚗', val: drivers.length, label: 'Total Drivers' }, { icon: '🟢', val: drivers.filter(d => d.available).length, label: 'Available' }, { icon: '📦', val: activeDeliveries.length, label: 'Active Deliveries' }, { icon: '⭐', val: '4.8', label: 'Avg Rating' }].map((s, i) => (
          <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-value">{s.val}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>

      {/* Driver Cards */}
      <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: 16 }}>🚗 Delivery Drivers</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {drivers.map(d => (
          <div key={d.id} className="card" style={{ animation: 'fadeInUp 0.4s ease' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>{d.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.vehicleType} • {d.licenseNo}</div>
              </div>
              <span className={`badge ${d.available ? 'badge-green' : 'badge-red'}`}>{d.available ? '🟢 Available' : '🔴 On Delivery'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
              <span>⭐ {d.rating} rating</span>
              <span>{d.email}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Deliveries */}
      <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: 16 }}>📦 Live Deliveries</h3>
      <div className="card">
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
                <td><span className="badge badge-purple">🚗 In Transit</span></td>
                <td>{o.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
