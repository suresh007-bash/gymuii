import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Calendar, Package, CheckCircle2 } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';

const stages = ['Placed', 'Preparing', 'Ready', 'In Transit', 'Delivered'];
const statusColors = { pending: 'badge-orange', preparing: 'badge-blue', ready: 'badge-teal', in_transit: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red' };
const stageMap = { pending: 0, preparing: 1, ready: 2, in_transit: 3, delivered: 4 };

export default function OwnerOrders() {
  const { user } = useAuth();
  const { getOrdersByUser, cancelOrder, updateOrderDates } = useOrders();
  const { showToast } = useNotifications();
  const [tab, setTab] = useState('all');
  const [rescheduleOrder, setRescheduleOrder] = useState(null);
  const [newDates, setNewDates] = useState([]);
  const [newTiming, setNewTiming] = useState('noon');

  const myOrders = getOrdersByUser(user?.id).sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
  const filtered = tab === 'all' ? myOrders : myOrders.filter(o => o.status === tab);
  const today = new Date();
  const calendarDays = Array.from({ length: 30 }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() + i); return d.toISOString().split('T')[0]; });
  const toggleDate = (ds) => setNewDates(p => p.includes(ds) ? p.filter(d => d !== ds) : [...p, ds]);

  const handleReschedule = () => {
    if (newDates.length === 0) { showToast('Select at least one date', 'error'); return; }
    if (updateOrderDates) updateOrderDates(rescheduleOrder.id, newDates, newTiming);
    showToast(' Rescheduled!'); setRescheduleOrder(null); setNewDates([]);
  };

  return (
    <DashboardLayout title="My Orders">
      {rescheduleOrder && (
        <div className="modal-overlay" onClick={() => { setRescheduleOrder(null); setNewDates([]); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header"><h3 className="modal-title"><Calendar size={16} style={{marginRight:4}} /> Reschedule #{rescheduleOrder.id}</h3><button className="modal-close" onClick={() => { setRescheduleOrder(null); setNewDates([]); }}></button></div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {[['morning', ' Breakfast'], ['noon', ' Lunch'], ['evening', ' Dinner']].map(([k, l]) => (
                <button key={k} className={`btn btn-sm ${newTiming === k ? 'btn-primary' : 'btn-outline'}`} onClick={() => setNewTiming(k)} style={{ flex: 1 }}>{l}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(40px, 1fr))', gap: 4, marginBottom: 12 }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 'var(--fs-xs)', fontWeight: 800, color: 'var(--text-muted)', padding: 4 }}>{d}</div>)}
              {Array.from({ length: new Date(calendarDays[0]).getDay() }, (_, i) => <div key={'e' + i} />)}
              {calendarDays.map(ds => <button key={ds} onClick={() => toggleDate(ds)} style={{ padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 'var(--fs-xs)', fontWeight: 700, background: newDates.includes(ds) ? 'var(--accent-orange)' : 'var(--bg-tertiary)', color: newDates.includes(ds) ? '#fff' : 'var(--text-primary)' }}>{new Date(ds).getDate()}</button>)}
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => { setRescheduleOrder(null); setNewDates([]); }}>Cancel</button><button className="btn btn-success" onClick={handleReschedule} disabled={newDates.length === 0}><CheckCircle2 size={14} style={{marginRight:4}} /> Reschedule</button></div>
          </div>
        </div>
      )}

      <div className="tabs">{['all', 'pending', 'preparing', 'delivered', 'cancelled'].map(t => (
        <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t === 'all' ? `All (${myOrders.length})` : t.charAt(0).toUpperCase() + t.slice(1)}</button>
      ))}</div>

      {filtered.length === 0 ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><div style={{ fontSize: 'var(--fs-hero)', marginBottom: 12 }}><Package size={48} color="var(--text-muted)" /></div><p>No orders found</p></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(order => (
            <div key={order.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div><span style={{ fontWeight: 800, fontSize: 'var(--fs-sm)' }}>#{order.id}</span><span style={{ marginLeft: 8, fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{new Date(order.orderTime).toLocaleString()}</span></div>
                <span className={`badge ${statusColors[order.status] || 'badge-blue'}`}>{order.status.replace('_', ' ').toUpperCase()}</span>
              </div>
              {['pending', 'preparing', 'ready', 'in_transit'].includes(order.status) && (
                <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0' }}>
                  {stages.map((s, i) => { const cs = stageMap[order.status] || 0; return (<div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}><div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--fs-xs)', fontWeight: 800, background: i <= cs ? (i === cs ? 'var(--accent-orange)' : 'var(--accent-green)') : 'var(--bg-tertiary)', color: i <= cs ? '#fff' : 'var(--text-muted)', flexShrink: 0 }}>{i < cs ? '' : i + 1}</div>{i < stages.length - 1 && <div style={{ flex: 1, height: 3, background: i < cs ? 'var(--accent-green)' : 'var(--bg-tertiary)', margin: '0 -2px' }} />}</div>); })}
                </div>
              )}
              {order.otp && ['pending', 'preparing', 'ready', 'in_transit'].includes(order.status) && (
                <div style={{ background: 'rgba(249,115,22,0.08)', borderRadius: 10, padding: '8px 14px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 600 }}>Delivery OTP</span>
                  <span style={{ fontSize: 'var(--fs-body)', fontWeight: 900, color: 'var(--accent-orange)', letterSpacing: 4 }}>{order.otp}</span>
                </div>
              )}
              {order.scheduledDates?.length > 0 && <div style={{ padding: '6px 12px', background: 'rgba(34,197,94,0.06)', borderRadius: 8, marginBottom: 10, fontSize: 'var(--fs-xs)' }}><Calendar size={12} style={{marginRight:2}} /> {order.scheduledDates.map(d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })).join(', ')}</div>}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>{order.items.map((item, i) => <span key={i} style={{ fontSize: 'var(--fs-xs)', padding: '4px 10px', background: 'var(--bg-tertiary)', borderRadius: 8 }} className="text-truncate">{item.name} × {item.qty}</span>)}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: 'var(--accent-green)' }}>₹{order.total}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['pending', 'preparing', 'ready'].includes(order.status) && <button className="btn btn-outline btn-sm" onClick={() => { setRescheduleOrder(order); setNewDates(order.scheduledDates || []); setNewTiming(order.timing || 'noon'); }}><Calendar size={12} style={{marginRight:2}} /> Reschedule</button>}
                  {order.status === 'pending' && <button className="btn btn-outline btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => cancelOrder(order.id, 'Cancelled')}>Cancel</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
