import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';

const statusColors = { pending: 'badge-orange', preparing: 'badge-blue', ready: 'badge-teal', in_transit: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red' };

export default function AdminOrders() {
  const { orders, updateOrderStatus, cancelOrder } = useOrders();
  const { showToast } = useNotifications();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);

  const sorted = [...orders].sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
  const filtered = sorted.filter(o => (tab === 'all' || o.status === tab) && (o.customerName?.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)));

  const askConfirm = (title, msg, color, action) => setConfirm({ title, msg, color, action: () => { action(); setConfirm(null); } });

  return (
    <DashboardLayout title="All Orders">

      {/* Confirmation Modal */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, textAlign: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{confirm.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>{confirm.msg}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn" style={{ background: confirm.color, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }} onClick={confirm.action}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}><span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>🔍</span><input className="form-input" style={{ paddingLeft: 38 }} placeholder="Search by order ID or customer..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} orders</span>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>{['all', 'pending', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled'].map(t => (
        <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t === 'all' ? `All (${orders.length})` : t === 'in_transit' ? 'In Transit' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
      ))}</div>

      <div className="card">
        {/* Desktop Table */}
        <div className="admin-table-desktop">
          <table className="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Driver</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(o => (
              <tr key={o.id}>
                <td><div style={{ fontWeight: 700 }}>#{o.id}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(o.orderTime).toLocaleString()}</div></td>
                <td>{o.customerName}</td>
                <td style={{ fontSize: 12 }}>{o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</td>
                <td style={{ fontWeight: 800 }}>₹{o.total}</td>
                <td><span className={`badge ${o.paymentStatus === 'Paid' ? 'badge-green' : 'badge-orange'}`}>{o.paymentMethod} • {o.paymentStatus}</span></td>
                <td><span className={`badge ${statusColors[o.status]}`}>{o.status.replace('_', ' ').toUpperCase()}</span></td>
                <td style={{ fontSize: 12 }}>{o.driverName || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {o.status === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => askConfirm('👨‍🍳 Start Preparing?', `Move order #${o.id} (${o.customerName}) to Preparing status?`, '#3b82f6', () => { updateOrderStatus(o.id, 'preparing'); showToast(`#${o.id} → Preparing`); })}>👨‍🍳</button>}
                    {o.status === 'preparing' && <button className="btn btn-success btn-sm" onClick={() => askConfirm('✅ Mark Ready?', `Mark order #${o.id} (${o.customerName}) as Ready for pickup?`, '#22c55e', () => { updateOrderStatus(o.id, 'ready'); showToast(`#${o.id} → Ready`); })}>✅</button>}
                    {!['delivered', 'cancelled'].includes(o.status) && <button className="btn btn-outline btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => askConfirm('❌ Cancel Order?', `Are you sure you want to cancel order #${o.id} for ${o.customerName}? This cannot be undone.`, '#ef4444', () => { cancelOrder(o.id, 'Admin cancelled'); showToast(`#${o.id} cancelled`, 'warning'); })}>✕</button>}
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="admin-cards-mobile" style={{ display: 'none' }}>
          {filtered.map(o => (
            <div key={o.id} style={{ padding: 14, borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>#{o.id}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(o.orderTime).toLocaleString()}</div>
                </div>
                <span className={`badge ${statusColors[o.status]}`}>{o.status.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13 }}>👤 <strong>{o.customerName}</strong></div>
                <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--accent-green)' }}>₹{o.total}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                🍽️ {o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span className={`badge ${o.paymentStatus === 'Paid' ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: 10 }}>{o.paymentMethod} • {o.paymentStatus}</span>
                {o.driverName && <span>🚗 {o.driverName}</span>}
              </div>
              {!['delivered', 'cancelled'].includes(o.status) && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {o.status === 'pending' && <button className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: 12 }} onClick={() => askConfirm('👨‍🍳 Start Preparing?', `Move order #${o.id} to Preparing?`, '#3b82f6', () => { updateOrderStatus(o.id, 'preparing'); showToast(`#${o.id} → Preparing`); })}>👨‍🍳 Prepare</button>}
                  {o.status === 'preparing' && <button className="btn btn-success btn-sm" style={{ flex: 1, fontSize: 12 }} onClick={() => askConfirm('✅ Mark Ready?', `Mark #${o.id} as Ready?`, '#22c55e', () => { updateOrderStatus(o.id, 'ready'); showToast(`#${o.id} → Ready`); })}>✅ Ready</button>}
                  <button className="btn btn-outline btn-sm" style={{ fontSize: 12, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => askConfirm('❌ Cancel Order?', `Cancel order #${o.id}? This cannot be undone.`, '#ef4444', () => { cancelOrder(o.id, 'Admin cancelled'); showToast(`#${o.id} cancelled`, 'warning'); })}>✕ Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No orders found</div>}
      </div>
    </DashboardLayout>
  );
}
