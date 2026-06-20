import DashboardLayout from '../../components/DashboardLayout';
import StatIcon from '../../components/StatIcon';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';

export default function AdminAnalytics() {
  const { allUsers } = useAuth();
  const { orders, getStats } = useOrders();
  const stats = getStats();

  const byStatus = [['Pending', stats.pending, '#f97316'], ['Preparing', stats.preparing, '#3b82f6'], ['Ready', orders.filter(o => o.status === 'ready').length, '#14b8a6'], ['In Transit', stats.inTransit, '#8b5cf6'], ['Delivered', stats.delivered, '#22c55e'], ['Cancelled', stats.cancelled, '#ef4444']];
  const byRole = [['Client', <StatIcon name="dumbbell" />, '#f97316'], ['Trainer', <StatIcon name="protein" />, '#22c55e'], ['Owner', <StatIcon name="award" />, '#3b82f6'], ['Kitchen', <StatIcon name="chef" />, '#14b8a6'], ['Delivery', <StatIcon name="truck" />, '#8b5cf6'], ['Admin', <StatIcon name="target" />, '#64748b']];

  return (
    <DashboardLayout title="Analytics">
      <div className="stats-grid">
        {[{ icon: <StatIcon name="revenue" />, val: `₹${stats.revenue.toLocaleString()}`, label: 'Total Revenue', color: '#22c55e' }, { icon: <StatIcon name="orders" />, val: stats.total, label: 'Total Orders', color: '#3b82f6' }, { icon: <StatIcon name="users" />, val: allUsers.length, label: 'Total Users', color: '#f97316' }, { icon: <StatIcon name="barChart" />, val: stats.avgOrderValue > 0 ? `₹${stats.avgOrderValue}` : '₹0', label: 'Avg Order Value', color: '#8b5cf6' }].map((s, i) => (
          <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-value" style={{ color: s.color }}>{s.val}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 20 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">📊 Orders by Status</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {byStatus.map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, minWidth: 80, fontWeight: 600 }}>{label}</span>
                <div style={{ flex: 1, height: 10, background: 'var(--bg-tertiary)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${stats.total ? (val / stats.total) * 100 : 0}%`, height: '100%', background: color, borderRadius: 5, transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 16, minWidth: 30, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">👥 Users by Role</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {byRole.map(([role, icon, color]) => {
              const count = allUsers.filter(u => u.role === role.toLowerCase()).length;
              return (
                <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ fontSize: 13, minWidth: 60, fontWeight: 600 }}>{role}</span>
                  <div style={{ flex: 1, height: 10, background: 'var(--bg-tertiary)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${allUsers.length ? (count / allUsers.length) * 100 : 0}%`, height: '100%', background: color, borderRadius: 5 }} />
                  </div>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 16, minWidth: 30, color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3 className="card-title">📈 Key Metrics</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16 }}>
          {[['Completion Rate', stats.total > 0 ? `${Math.round((stats.delivered / stats.total) * 100)}%` : '0%', '#22c55e'], ['Cancellation Rate', stats.total > 0 ? `${Math.round((stats.cancelled / stats.total) * 100)}%` : '0%', '#ef4444'], ['Active Rate', stats.total > 0 ? `${Math.round(((stats.pending + stats.preparing + stats.inTransit) / stats.total) * 100)}%` : '0%', '#3b82f6']].map(([label, val, color]) => (
            <div key={label} style={{ textAlign: 'center', padding: 20, background: 'var(--bg-tertiary)', borderRadius: 16 }}>
              <div style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 900, color, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
