import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function DispatchPage() {
  const { orders, assignDriver } = useOrders();
  const { allUsers } = useAuth();
  const { showToast } = useNotifications();
  const [selectedDrivers, setSelectedDrivers] = useState({});
  const [tab, setTab] = useState('ready');

  const readyOrders = orders.filter(o => o.status === 'ready');
  const pendingDriverOrders = orders.filter(o => o.status === 'driver_pending');
  const inTransitOrders = orders.filter(o => o.status === 'in_transit');
  const drivers = allUsers.filter(u => u.role === 'delivery');

  const getDriverActiveCount = (driverId) => orders.filter(o => o.driverId === driverId && ['driver_pending', 'in_transit'].includes(o.status)).length;

  // Auto-assign: pick driver with least active orders
  const autoAssign = (orderId) => {
    const sorted = [...drivers].sort((a, b) => getDriverActiveCount(a.id) - getDriverActiveCount(b.id));
    const best = sorted[0];
    if (!best) { showToast('No drivers available!', 'error'); return; }
    assignDriver(orderId, best.id, best.name);
    showToast(` Auto-assigned to ${best.name} (pending acceptance)`);
  };

  // Manual assign
  const handleManualAssign = (orderId) => {
    const driverId = selectedDrivers[orderId];
    if (!driverId) { showToast('Select a driver first', 'error'); return; }
    const driver = drivers.find(d => d.id === driverId);
    assignDriver(orderId, driverId, driver?.name || 'Unknown');
    showToast(` Assigned to ${driver?.name} (pending acceptance)`);
  };

  // Reassign rejected order
  const handleReassign = (orderId) => {
    const driverId = selectedDrivers[orderId];
    if (!driverId) { showToast('Select a new driver', 'error'); return; }
    const driver = drivers.find(d => d.id === driverId);
    assignDriver(orderId, driverId, driver?.name || 'Unknown');
    showToast(` Reassigned to ${driver?.name}`);
  };

  const displayOrders = tab === 'ready' ? readyOrders : tab === 'pending' ? pendingDriverOrders : inTransitOrders;

  return (
    <DashboardLayout title="Dispatch">
      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === 'ready' ? 'active' : ''}`} onClick={() => setTab('ready')}> Ready ({readyOrders.length})</button>
        <button className={`tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}> Pending ({pendingDriverOrders.length})</button>
        <button className={`tab ${tab === 'transit' ? 'active' : ''}`} onClick={() => setTab('transit')}> In Transit ({inTransitOrders.length})</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 20 }}>
        {/* Orders */}
        <div>
          {displayOrders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 'var(--fs-hero)', marginBottom: 8 }}>{tab === 'ready' ? '' : tab === 'pending' ? '' : ''}</div>
              No {tab === 'ready' ? 'ready' : tab === 'pending' ? 'pending driver' : 'in transit'} orders
            </div>
          ) : displayOrders.map(o => (
            <div key={o.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 'var(--fs-xs)' }}>#{o.id}</span>
                <span className={`badge ${o.status === 'ready' ? 'badge-green' : o.status === 'driver_pending' ? 'badge-orange' : 'badge-purple'}`}>
                  {o.status === 'driver_pending' ? ' PENDING DRIVER' : o.status === 'in_transit' ? ' IN TRANSIT' : ' READY'}
                </span>
              </div>

              <div style={{ fontSize: 'var(--fs-xs)', marginBottom: 4 }}> {o.customerName}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 4 }}> {o.customerAddress}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 4 }}> {o.items.map(i => i.name).join(', ')}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 'var(--fs-xs)', marginBottom: 8 }}>
                <span style={{ fontWeight: 800, color: 'var(--accent-green)' }}>₹{o.total}</span>
                <span> {o.paymentMethod}</span>
                <span>{o.paymentStatus}</span>
                {o.otp && <span> OTP: <strong>{o.otp}</strong></span>}
              </div>

              {/* Scheduled dates */}
              {o.scheduledDates?.length > 0 && (
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 8 }}>
                   Scheduled: {o.scheduledDates.map(d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })).join(', ')}
                </div>
              )}

              {/* Driver info for pending/transit */}
              {o.driverName && (
                <div style={{ padding: '6px 12px', background: o.status === 'driver_pending' ? 'rgba(249,115,22,0.06)' : 'rgba(34,197,94,0.06)', borderRadius: 8, marginBottom: 8, fontSize: 'var(--fs-xs)' }}>
                   Assigned to: <strong>{o.driverName}</strong>
                  {o.status === 'driver_pending' && <span style={{ color: 'var(--accent-orange)', marginLeft: 8 }}>• Waiting for acceptance</span>}
                  {o.status === 'in_transit' && <span style={{ color: 'var(--accent-green)', marginLeft: 8 }}>• Accepted & delivering</span>}
                </div>
              )}

              {/* Ready → Assign */}
              {o.status === 'ready' && (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <select className="form-select" style={{ flex: 1 }} value={selectedDrivers[o.id] || ''} onChange={e => setSelectedDrivers(p => ({ ...p, [o.id]: e.target.value }))}>
                      <option value="">Select Driver...</option>
                      {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.vehicleType}) • {getDriverActiveCount(d.id)} active</option>)}
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={() => handleManualAssign(o.id)}> Assign</button>
                  </div>
                  <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={() => autoAssign(o.id)}> Auto-Assign Best Driver</button>
                </div>
              )}

              {/* Pending → Reassign if needed (kitchen sees rejected come back as ready) */}
              {o.status === 'driver_pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <select className="form-select" style={{ flex: 1 }} value={selectedDrivers[o.id] || ''} onChange={e => setSelectedDrivers(p => ({ ...p, [o.id]: e.target.value }))}>
                    <option value="">Change Driver...</option>
                    {drivers.filter(d => d.id !== o.driverId).map(d => <option key={d.id} value={d.id}>{d.name} ({d.vehicleType})</option>)}
                  </select>
                  <button className="btn btn-outline btn-sm" onClick={() => handleReassign(o.id)}> Reassign</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Drivers Panel */}
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 'var(--fs-xs)' }}> Drivers ({drivers.length})</h3>
          {drivers.map(d => {
            const activeCount = getDriverActiveCount(d.id);
            const pendingCount = orders.filter(o => o.driverId === d.id && o.status === 'driver_pending').length;
            const deliveredCount = orders.filter(o => o.driverId === d.id && o.status === 'delivered').length;
            return (
              <div key={d.id} className="card" style={{ marginBottom: 10, padding: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--fs-xs)', fontWeight: 800, color: '#fff' }}>{d.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--fs-xs)' }}>{d.name}</div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{d.vehicleType} • {d.licenseNo}</div>
                  </div>
                  <span className={`badge ${activeCount === 0 ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: 'var(--fs-xs)' }}>
                    {activeCount === 0 ? ' Free' : ` ${activeCount}`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                  <span> {d.rating}</span>
                  <span> {pendingCount} pending</span>
                  <span> {deliveredCount} done</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
