import { useState } from 'react';
import StatIcon from '../../components/StatIcon';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';

export default function DeliveryHistory() {
  const { user } = useAuth();
  const { getOrdersByDriver } = useOrders();
  const [tab, setTab] = useState('all');

  const allOrders = getOrdersByDriver(user?.id).sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
  const completed = allOrders.filter(o => o.status === 'delivered');
  const totalEarnings = completed.length * 85;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDeliveries = completed.filter(o => o.deliveredAt?.startsWith(todayStr) || o.orderTime.startsWith(todayStr));
  const todayEarnings = todayDeliveries.length * 85;

  const codCollected = completed.filter(o => o.paymentMethod === 'COD').reduce((a, o) => a + (o.total || 0), 0);
  const displayed = tab === 'all' ? completed : tab === 'today' ? todayDeliveries : completed.filter(o => o.paymentMethod === 'COD');

  return (
    <DashboardLayout title="Delivery History & Earnings">
      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { icon: <StatIcon name="check" />, val: completed.length, label: 'Total Deliveries', color: '#22c55e' },
          { icon: <StatIcon name="revenue" />, val: `₹${totalEarnings}`, label: 'Total Earned', color: '#f97316' },
          { icon: <StatIcon name="calendar" />, val: todayDeliveries.length, label: 'Today Deliveries', color: '#3b82f6' },
          { icon: <StatIcon name="bike" />, val: `₹${todayEarnings}`, label: 'Today Earned', color: '#8b5cf6' },
          { icon: <StatIcon name="revenue" />, val: `₹${codCollected}`, label: 'COD Collected', color: '#ef4444' },
          { icon: <StatIcon name="star" />, val: user?.rating || '4.8', label: 'Rating', color: '#eab308' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All ({completed.length})</button>
        <button className={`tab ${tab === 'today' ? 'active' : ''}`} onClick={() => setTab('today')}>Today ({todayDeliveries.length})</button>
        <button className={`tab ${tab === 'cod' ? 'active' : ''}`} onClick={() => setTab('cod')}>COD Collected</button>
      </div>

      {/* History Table */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">📜 Delivery History</h3></div>
        {displayed.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>No deliveries found</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Earned</th><th>Date</th></tr></thead>
            <tbody>{displayed.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight: 700 }}>#{o.id}</td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{o.customerName}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{o.customerAddress}</div>
                </td>
                <td style={{ fontSize: 12 }}>{o.items.map(i => i.name).join(', ')}</td>
                <td style={{ fontWeight: 700 }}>₹{o.total}</td>
                <td>
                  <span className={`badge ${o.paymentMethod === 'COD' ? 'badge-orange' : 'badge-green'}`} style={{ fontSize: 10 }}>
                    {o.paymentMethod === 'COD' ? '💵' : '📱'} {o.paymentMethod}
                  </span>
                  <div style={{ fontSize: 10, color: 'var(--accent-green)' }}>{o.paymentStatus}</div>
                </td>
                <td style={{ color: 'var(--accent-green)', fontWeight: 800, fontFamily: 'Outfit' }}>+₹85</td>
                <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(o.deliveredAt || o.orderTime).toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {/* Earnings Summary Card */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><h3 className="card-title">💰 Earnings Breakdown</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div style={{ padding: 16, background: 'rgba(34,197,94,0.06)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>Delivery Fee Earned</div>
            <div style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 900, color: 'var(--accent-green)' }}>₹{totalEarnings}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>₹85 × {completed.length} deliveries</div>
          </div>
          <div style={{ padding: 16, background: 'rgba(249,115,22,0.06)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>COD Collected</div>
            <div style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 900, color: 'var(--accent-orange)' }}>₹{codCollected}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>To be deposited to kitchen</div>
          </div>
          <div style={{ padding: 16, background: 'rgba(139,92,246,0.06)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>Net Payout</div>
            <div style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 900, color: 'var(--accent-purple)' }}>₹{totalEarnings}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Your total earnings</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
