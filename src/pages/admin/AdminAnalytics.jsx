import DashboardLayout from '../../components/DashboardLayout';
import { BarChart3 as BarChartIcon, Users, TrendingUp } from '../../components/Icons';
import StatIcon from '../../components/StatIcon';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';

export default function AdminAnalytics() {
  const { allUsers } = useAuth();
  const { orders, getStats } = useOrders();
  const stats = getStats();

  const byStatus = [
    ['Pending', stats.pending, '#f97316'],
    ['Preparing', stats.preparing, '#3b82f6'],
    ['Ready', orders.filter(o => o.status === 'ready').length, '#14b8a6'],
    ['In Transit', stats.inTransit, '#8b5cf6'],
    ['Delivered', stats.delivered, '#22c55e'],
    ['Cancelled', stats.cancelled, '#ef4444']
  ];

  const byRole = [
    ['Client', <StatIcon name="dumbbell" />, '#f97316'],
    ['Trainer', <StatIcon name="protein" />, '#22c55e'],
    ['Owner', <StatIcon name="award" />, '#3b82f6'],
    ['Kitchen', <StatIcon name="chef" />, '#14b8a6'],
    ['Delivery', <StatIcon name="truck" />, '#8b5cf6'],
    ['Admin', <StatIcon name="target" />, '#64748b']
  ];

  return (
    <DashboardLayout title="Analytics">
      {/* Top Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { icon: <StatIcon name="revenue" />, val: `₹${stats.revenue.toLocaleString()}`, label: 'Total Revenue', color: '#22c55e' },
          { icon: <StatIcon name="orders" />, val: stats.total, label: 'Total Orders', color: '#3b82f6' },
          { icon: <StatIcon name="users" />, val: allUsers.length, label: 'Total Users', color: '#f97316' },
          { icon: <StatIcon name="barChart" />, val: stats.avgOrderValue > 0 ? `₹${stats.avgOrderValue}` : '₹0', label: 'Avg Order Value', color: '#8b5cf6' }
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 'clamp(20px, 3vw, 28px)' }}>{s.val}</div>
            <div className="stat-label" style={{ fontSize: 'clamp(12px, 1.5vw, 14px)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20, alignItems: 'stretch', marginBottom: 20 }}>

        {/* Orders by Status */}
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: 'clamp(15px, 3vw, 20px)', fontWeight: 800 }}>
              <BarChartIcon size={18} style={{ marginRight: 6 }} /> Orders by Status
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'space-between' }}>
            {byStatus.map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 36 }}>
                <span style={{ fontSize: 'clamp(13px, 3vw, 18px)', minWidth: 84, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
                <div style={{ flex: 1, height: 12, background: 'var(--bg-tertiary)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${stats.total ? (val / stats.total) * 100 : 0}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(16px, 3vw, 22px)', minWidth: 32, color, textAlign: 'right' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Users by Role */}
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: 'clamp(15px, 3vw, 20px)', fontWeight: 800 }}>
              <Users size={18} style={{ marginRight: 6 }} /> Users by Role
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'space-between' }}>
            {byRole.map(([role, icon, color]) => {
              const count = allUsers.filter(u => u.role === role.toLowerCase()).length;
              return (
                <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 36 }}>
                  <span style={{ fontSize: 'clamp(18px, 3vw, 24px)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 'clamp(13px, 3vw, 18px)', minWidth: 64, fontWeight: 700, color: 'var(--text-primary)' }}>{role}</span>
                  <div style={{ flex: 1, height: 12, background: 'var(--bg-tertiary)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${allUsers.length ? (count / allUsers.length) * 100 : 0}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 1s ease' }} />
                  </div>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(16px, 3vw, 22px)', minWidth: 32, color, textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ fontSize: 'clamp(15px, 3vw, 20px)', fontWeight: 800 }}>
            <TrendingUp size={18} style={{ marginRight: 6 }} /> Key Metrics
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 16 }}>
          {[
            ['Completion Rate', stats.total > 0 ? `${Math.round((stats.delivered / stats.total) * 100)}%` : '0%', '#22c55e'],
            ['Cancellation Rate', stats.total > 0 ? `${Math.round((stats.cancelled / stats.total) * 100)}%` : '0%', '#ef4444'],
            ['Active Rate', stats.total > 0 ? `${Math.round(((stats.pending + stats.preparing + stats.inTransit) / stats.total) * 100)}%` : '0%', '#3b82f6']
          ].map(([label, val, color]) => (
            <div key={label} style={{ textAlign: 'center', padding: '20px 16px', background: 'var(--bg-tertiary)', borderRadius: 16 }}>
              <div style={{ fontFamily: 'Outfit', fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 900, color, marginBottom: 6 }}>{val}</div>
              <div style={{ fontSize: 'clamp(12px, 1.5vw, 14px)', color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}