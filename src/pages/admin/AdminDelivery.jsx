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
        {[
          { icon: <StatIcon name="truck" />, val: drivers.length, label: 'Total Drivers', color: '#3b82f6' },
          { icon: <StatIcon name="check" />, val: drivers.filter(d => d.available).length, label: 'Available', color: '#22c55e' },
          { icon: <StatIcon name="orders" />, val: activeDeliveries.length, label: 'Active Deliveries', color: '#f97316' },
          { icon: <StatIcon name="star" />, val: '4.8', label: 'Avg Rating', color: '#eab308' }
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 'var(--fs-body)' }}>{s.val}</div>
            <div className="stat-label" style={{ fontSize: 'var(--fs-xs)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Driver Cards */}
      <h3 style={{ fontWeight: 800, fontSize: 'var(--fs-subheading)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Car size={20} /> Delivery Drivers
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16, marginBottom: 28 }}>
        {drivers.map(d => (
          <div key={d.id} className="card" style={{ animation: 'fadeInUp 0.4s ease' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--fs-sm)', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{d.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 'var(--fs-sm)', marginBottom: 2 }}>{d.name}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.vehicleType} • {d.licenseNo}</div>
              </div>
              <span className={`badge ${d.available ? 'badge-green' : 'badge-red'}`} style={{ flexShrink: 0, fontSize: 'var(--fs-xs)', padding: '5px 10px', fontWeight: 700 }}>
                {d.available ? ' Free' : ' Busy'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={14} /> {d.rating} rating
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%', color: 'var(--text-muted)' }}>{d.email}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Deliveries */}
      <h3 style={{ fontWeight: 800, fontSize: 'var(--fs-subheading)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Package size={20} /> Live Deliveries
      </h3>
      <div className="card">
        {/* Desktop Table */}
        <div className="admin-table-desktop">
          <table className="data-table">
            <thead>
              <tr><th>Order</th><th>Driver</th><th>Customer</th><th>Restaurant</th><th>Status</th><th>ETA</th></tr>
            </thead>
            <tbody>
              {activeDeliveries.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>No active deliveries right now</td></tr>
              ) : activeDeliveries.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 800, fontSize: 'var(--fs-xs)' }}>#{o.id}</td>
                  <td style={{ fontSize: 'var(--fs-xs)' }}>{o.driverName || '—'}</td>
                  <td style={{ fontSize: 'var(--fs-xs)' }}>{o.customerName}</td>
                  <td style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{o.restaurantName}</td>
                  <td><span className="badge badge-purple" style={{ fontSize: 'var(--fs-xs)' }}><Car size={12} style={{ marginRight: 2 }} /> In Transit</span></td>
                  <td style={{ fontSize: 'var(--fs-xs)', fontWeight: 700 }}>{o.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards — larger fonts */}
        <div className="admin-cards-mobile" style={{ display: 'none' }}>
          {activeDeliveries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>No active deliveries right now</div>
          ) : activeDeliveries.map(o => (
            <div key={o.id} style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 900, fontSize: 'var(--fs-sm)' }}>#{o.id}</div>
                <span className="badge badge-purple" style={{ fontSize: 'var(--fs-xs)', padding: '5px 12px' }}><Car size={13} style={{ marginRight: 3 }} /> In Transit</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)' }}>
                <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <User size={14} /> {o.customerName}
                </span>
                <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, color: '#f97316' }}>
                  <Clock size={14} /> {o.eta}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Car size={13} /> {o.driverName || '—'}</span>
                <span> {o.restaurantName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
