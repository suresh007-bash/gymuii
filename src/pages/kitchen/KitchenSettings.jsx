import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';

export default function KitchenSettings() {
  const { user, updateUser } = useAuth();
  const { scheduledOrders, orders } = useOrders();
  const { showToast, addNotification } = useNotifications();
  const { lang, setLang, t, LANGUAGES } = useLanguage();
  const [tab, setTab] = useState('schedule');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [msgForm, setMsgForm] = useState({ orderId: '', reason: '' });

  // Date-wise scheduled orders
  const dateOrders = scheduledOrders.filter(s => s.status === 'active' && s.dates?.includes(selectedDate));

  // All unique dates from schedules
  const allDates = [...new Set(scheduledOrders.filter(s => s.status === 'active').flatMap(s => s.dates || []))].sort();

  // Form for kitchen profile
  const [form, setForm] = useState({ kitchenName: user?.kitchenName || '', kitchenLocation: user?.kitchenLocation || '', phone: user?.phone || '' });

  const saveSetting = () => { updateUser(user.id, form); showToast('Settings saved! '); };

  const sendUnavailableMsg = () => {
    if (!msgForm.orderId || !msgForm.reason) { showToast('Please fill order ID and reason', 'error'); return; }
    addNotification({ type: 'kitchen', message: `Kitchen: Order #${msgForm.orderId} delayed — ${msgForm.reason}`, forUser: 'u1' });
    showToast('Notification sent to customer! ');
    setMsgForm({ orderId: '', reason: '' });
  };

  return (
    <DashboardLayout title="Kitchen Settings">
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === 'schedule' ? 'active' : ''}`} onClick={() => setTab('schedule')}> Date-Wise Orders</button>
        <button className={`tab ${tab === 'notify' ? 'active' : ''}`} onClick={() => setTab('notify')}> Send Notification</button>
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>️ Kitchen Profile</button>
      </div>

      {/* Date-Wise Scheduled Orders */}
      {tab === 'schedule' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <label className="form-label" style={{ margin: 0 }}>Select Date:</label>
            <input type="date" className="form-input" style={{ width: 200 }} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            <span style={{ fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-muted)' }}>{dateOrders.length} scheduled order(s)</span>
          </div>
          {allDates.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
              {allDates.map(d => (
                <button key={d} className={`btn btn-sm ${selectedDate === d ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSelectedDate(d)}>{d}</button>
              ))}
            </div>
          )}
          {dateOrders.length === 0 ? <div className="card" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No scheduled orders for {selectedDate}</div> :
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dateOrders.map(s => (
              <div key={s.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 800 }}>Schedule #{s.id}</span>
                  <span className="badge badge-blue">{s.timing?.toUpperCase()} — {s.timeSlot}</span>
                </div>
                <div style={{ fontSize: 'calc(17px + 0.5vw)' }}> Customer: {s.customerId}</div>
                <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)', marginTop: 4 }}>️ {s.items?.length || 0} items •  {s.paymentStatus}</div>
              </div>
            ))}
          </div>}
        </div>
      )}

      {/* Send Unavailability Notification */}
      {tab === 'notify' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <div className="card-header"><h3 className="card-title"> Notify Customer — Unavailability</h3></div>
          <p style={{ fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-muted)', marginBottom: 16 }}>Send a message to the customer if you're unable to deliver at the scheduled time.</p>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Order ID</label>
            <select className="form-select" value={msgForm.orderId} onChange={e => setMsgForm(p => ({ ...p, orderId: e.target.value }))}>
              <option value="">Select order...</option>
              {orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).map(o => (
                <option key={o.id} value={o.id}>#{o.id} — {o.customerName}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Reason for Delay</label>
            <textarea className="form-input" style={{ minHeight: 80 }} value={msgForm.reason} onChange={e => setMsgForm(p => ({ ...p, reason: e.target.value }))} placeholder="e.g., Ingredient shortage, Kitchen overload, etc." />
          </div>
          <button className="btn btn-primary" onClick={sendUnavailableMsg}> Send Notification</button>
        </div>
      )}

      {/* Kitchen Profile */}
      {tab === 'profile' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <div className="card-header"><h3 className="card-title">️ Kitchen Profile</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="form-label">Kitchen Name</label><input className="form-input" value={form.kitchenName} onChange={e => setForm(p => ({ ...p, kitchenName: e.target.value }))} /></div>
            <div><label className="form-label">Location</label><input className="form-input" value={form.kitchenLocation} onChange={e => setForm(p => ({ ...p, kitchenLocation: e.target.value }))} /></div>
            <div><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label className="form-label"> {t('language')}</label>
            <select className="form-input" value={lang} onChange={e => { setLang(e.target.value); showToast(`Language changed to ${LANGUAGES.find(l => l.code === e.target.value)?.label}`); }}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>
          <button className="btn btn-success" style={{ marginTop: 16 }} onClick={saveSetting}> Save Settings</button>
        </div>
      )}
    </DashboardLayout>
  );
}
