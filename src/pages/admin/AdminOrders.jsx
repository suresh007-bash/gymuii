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

  const sorted = [...orders].sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
  const filtered = sorted.filter(o => (tab === 'all' || o.status === tab) && (o.customerName?.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)));

  return (
    <DashboardLayout title="All Orders">
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}><span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>🔍</span><input className="form-input" style={{ paddingLeft: 38 }} placeholder="Search by order ID or customer..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} orders</span>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>{['all', 'pending', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled'].map(t => (
        <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t === 'all' ? `All (${orders.length})` : t === 'in_transit' ? 'In Transit' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
      ))}</div>

      <div className="card">
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
                  {o.status === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => { updateOrderStatus(o.id, 'preparing'); showToast(`#${o.id} → Preparing`); }}>👨‍🍳</button>}
                  {o.status === 'preparing' && <button className="btn btn-success btn-sm" onClick={() => { updateOrderStatus(o.id, 'ready'); showToast(`#${o.id} → Ready`); }}>✅</button>}
                  {!['delivered', 'cancelled'].includes(o.status) && <button className="btn btn-outline btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => { cancelOrder(o.id, 'Admin cancelled'); showToast(`#${o.id} cancelled`, 'warning'); }}>✕</button>}
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No orders found</div>}
      </div>
    </DashboardLayout>
  );
}
