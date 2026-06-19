import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';

export default function OrderQueue() {
  const { orders, updateOrderStatus } = useOrders();
  const { showToast } = useNotifications();
  const [tab, setTab] = useState('pending');

  const pending = orders.filter(o => o.status === 'pending');
  const preparing = orders.filter(o => o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');

  const shown = tab === 'pending' ? pending : tab === 'preparing' ? preparing : ready;

  const handleStatus = (id, newStatus, label) => { updateOrderStatus(id, newStatus); showToast(`Order #${id} → ${label}`); };

  return (
    <DashboardLayout title="Order Queue">
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[{ icon: '⏳', val: pending.length, label: 'Pending', color: '#f97316' }, { icon: '👨‍🍳', val: preparing.length, label: 'Preparing', color: '#3b82f6' }, { icon: '✅', val: ready.length, label: 'Ready', color: '#22c55e' }].map((s, i) => (
          <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-value" style={{ color: s.color }}>{s.val}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[['pending', `⏳ Pending (${pending.length})`], ['preparing', `👨‍🍳 Preparing (${preparing.length})`], ['ready', `✅ Ready (${ready.length})`]].map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No {tab} orders</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {shown.map(o => (
            <div key={o.id} className="card" style={{ animation: 'fadeInUp 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div><span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15 }}>#{o.id}</span><span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>{new Date(o.orderTime).toLocaleTimeString()}</span></div>
                <span className={`badge ${tab === 'pending' ? 'badge-orange' : tab === 'preparing' ? 'badge-blue' : 'badge-green'}`}>{tab.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 13, marginBottom: 6 }}>👤 {o.customerName} • 📍 {o.customerAddress}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {o.items.map((item, i) => (
                  <span key={i} style={{ fontSize: 12, padding: '4px 10px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>{item.name} × {item.qty}{item.instructions ? ` (${item.instructions})` : ''}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>₹{o.total} • {o.paymentMethod}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {tab === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => handleStatus(o.id, 'preparing', 'Preparing 👨‍🍳')}>👨‍🍳 Start Preparing</button>}
                  {tab === 'preparing' && <button className="btn btn-success btn-sm" onClick={() => handleStatus(o.id, 'ready', 'Ready ✅')}>✅ Mark Ready</button>}
                  {tab === 'ready' && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Waiting for dispatch...</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
