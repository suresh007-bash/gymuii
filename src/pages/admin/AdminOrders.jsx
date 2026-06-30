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
            <h3 style={{ fontSize: 'clamp(18px, 1.0vw, 21px)', fontWeight: 800, marginBottom: 12 }}>{confirm.title}</h3>
            <p style={{ fontSize: 'clamp(14px, 1.0vw, 17px)', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>{confirm.msg}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn" style={{ background: confirm.color, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }} onClick={confirm.action}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(15px, 1.0vw, 18px)' }}></span>
          <input className="form-input" style={{ paddingLeft: 38, fontSize: 'clamp(14px, 1.0vw, 17px)' }} placeholder="Search by order ID or customer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize: 'clamp(13px, 1.0vw, 15px)', color: 'var(--text-muted)', fontWeight: 600 }}>{filtered.length} orders</span>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {['all', 'pending', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 700 }}>
            {t === 'all' ? `All (${orders.length})` : t === 'in_transit' ? 'In Transit' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        {/* Desktop Table */}
        <div className="admin-table-desktop">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Items</th><th>Total</th>
                <th>Payment</th><th>Status</th><th>Driver</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: 'clamp(14px, 1.0vw, 17px)' }}>#{o.id}</div>
                    <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)', marginTop: 2 }}>{new Date(o.orderTime).toLocaleString()}</div>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: 'clamp(13px, 1.0vw, 15px)' }}>{o.customerName}</td>
                  <td style={{ fontSize: 'clamp(12px, 1.0vw, 14px)' }}>{o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</td>
                  <td style={{ fontWeight: 900, fontSize: 'clamp(15px, 1.0vw, 18px)', color: 'var(--accent-green)' }}>₹{o.total}</td>
                  <td><span className={`badge ${o.paymentStatus === 'Paid' ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: 'clamp(12px, 1.0vw, 14px)' }}>{o.paymentMethod} • {o.paymentStatus}</span></td>
                  <td><span className={`badge ${statusColors[o.status]}`} style={{ fontSize: 'clamp(12px, 1.0vw, 14px)' }}>{o.status.replace('_', ' ').toUpperCase()}</span></td>
                  <td style={{ fontSize: 'clamp(12px, 1.0vw, 14px)' }}>{o.driverName || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards — bigger font sizes */}
        <div className="admin-cards-mobile" style={{ display: 'none' }}>
          {filtered.map(o => (
            <div key={o.id} style={{ padding: '18px 16px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              {/* Row 1: Order ID + Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 'clamp(16px, 1.0vw, 19px)', color: 'var(--text-primary)' }}>#{o.id}</div>
                  <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)', marginTop: 2 }}>{new Date(o.orderTime).toLocaleString()}</div>
                </div>
                <span className={`badge ${statusColors[o.status]}`} style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', padding: '6px 12px', fontWeight: 800 }}>
                  {o.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Row 2: Customer + Price */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 'clamp(15px, 1.0vw, 18px)', fontWeight: 700, color: 'var(--text-primary)' }}>
                   {o.customerName}
                </div>
                <div style={{ fontWeight: 900, fontSize: 'clamp(18px, 1.0vw, 21px)', color: '#22c55e' }}>₹{o.total}</div>
              </div>

              {/* Row 3: Items */}
              <div style={{ fontSize: 'clamp(13px, 1.0vw, 15px)', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-tertiary)', borderRadius: 10, padding: '10px 12px' }}>
                 {o.items.map(i => `${i.name} ×${i.qty}`).join(' • ')}
              </div>

              {/* Row 4: Payment + Driver */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span className={`badge ${o.paymentStatus === 'Paid' ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', padding: '5px 10px' }}>
                  {o.paymentMethod} • {o.paymentStatus}
                </span>
                {o.driverName && <span style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)', fontWeight: 600 }}> {o.driverName}</span>}
              </div>

            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 'clamp(14px, 1.0vw, 17px)' }}>
            <div style={{ fontSize: 'clamp(33px, 1.0vw, 38px)', marginBottom: 12 }}></div>
            No orders found
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
