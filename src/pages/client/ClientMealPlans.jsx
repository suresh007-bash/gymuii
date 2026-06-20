import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import { getMenuItems } from '../../data/menuHelper';

export default function ClientMealPlans() {
  const MENU_ITEMS = getMenuItems();
  const { user } = useAuth();
  const { dietPlans, scheduledOrders, addOrder } = useOrders();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [showOrder, setShowOrder] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [timing, setTiming] = useState('morning');

  // Plans assigned to this user by trainers/owners
  const myPlans = dietPlans.filter(p =>
    (p.assignedTo || []).includes(user?.id) || p.forAll
  );

  // Schedules assigned by trainer
  const mySchedules = scheduledOrders.filter(s =>
    s.customerId === user?.id && s.status === 'active'
  );

  const handleShowOrder = (plan) => {
    if (plan.schedule) {
      navigate('/client/schedule', {
        state: {
          schedule: plan.schedule,
          selectedDates: plan.scheduledDates || Object.keys(plan.schedule)
        }
      });
    } else {
      setShowOrder(plan);
      setSelectedDates([]);
    }
  };

  const toggleDate = (dateStr) => {
    setSelectedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  const orderPlan = (plan) => {
    if (selectedDates.length === 0) { showToast('Select at least one date', 'error'); return; }
    
    if (plan.schedule) {
      const allItems = [];
      Object.values(plan.schedule).forEach(slots => {
        slots.forEach(slot => {
          slot.items.forEach(item => {
            const existing = allItems.find(i => i.id === item.id);
            if (existing) {
              existing.qty += item.qty;
            } else {
              allItems.push({ ...item });
            }
          });
        });
      });

      const otp = String(Math.floor(1000 + Math.random() * 9000));
      addOrder({
        customerId: user?.id,
        customerName: user?.name,
        customerAddress: user?.address || 'Gym Address',
        items: allItems,
        total: allItems.reduce((a, i) => a + i.price * i.qty, 0),
        paymentMethod: 'UPI',
        scheduledDates: plan.scheduledDates || Object.keys(plan.schedule),
        schedule: plan.schedule,
        otp,
        planName: plan.name,
      });
      showToast(`✅ Meal schedule ordered! OTP: ${otp}`);
      setShowOrder(null);
      setSelectedDates([]);
      return;
    }

    const items = (plan.items || []).map(id => MENU_ITEMS.find(m => m.id === id)).filter(Boolean);
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    addOrder({
      customerId: user?.id,
      customerName: user?.name,
      customerAddress: user?.address || 'Gym Address',
      items: items.map(i => ({ ...i, qty: 1 })),
      total: items.reduce((a, i) => a + i.price, 0),
      paymentMethod: 'UPI',
      scheduledDates: selectedDates,
      timing,
      otp,
      planName: plan.name,
    });
    showToast(`✅ Meal plan ordered! OTP: ${otp}`);
    setShowOrder(null);
    setSelectedDates([]);
  };

  // Generate 30 days for calendar
  const today = new Date();
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return (
    <DashboardLayout title="Meal Plans">
      {/* Order Modal with Calendar */}
      {showOrder && (
        <div className="modal-overlay" onClick={() => { setShowOrder(null); setSelectedDates([]); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 className="modal-title">📅 Schedule "{showOrder.name}"</h3>
              <button className="modal-close" onClick={() => { setShowOrder(null); setSelectedDates([]); }}>✕</button>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              {showOrder.schedule
                ? 'This meal schedule has been assigned by your trainer and cannot be modified.'
                : 'Click dates to select multiple delivery days. You can reschedule until delivery.'}
            </p>

            {/* Timing */}
            {!showOrder.schedule && (
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Meal Timing</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['morning', '🌅 Breakfast', '8:00 AM'], ['noon', '☀️ Lunch', '12:30 PM'], ['evening', '🌙 Dinner', '7:00 PM']].map(([k, label, time]) => (
                    <button key={k} className={`btn btn-sm ${timing === k ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTiming(k)} style={{ flex: 1 }}>
                      {label}<br /><span style={{ fontSize: 10, opacity: 0.7 }}>{time}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trainer Pre-assigned Schedule Summary */}
            {showOrder.schedule && (
              <div style={{ marginBottom: 14, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
                <label className="form-label" style={{ color: 'var(--accent-orange)' }}>📋 Pre-assigned Meal Schedule</label>
                {Object.entries(showOrder.schedule).sort((a, b) => a[0].localeCompare(b[0])).map(([dateStr, slots]) => {
                  const hasItems = slots.some(s => s.items && s.items.length > 0);
                  if (!hasItems) return null;
                  return (
                    <div key={dateStr} style={{ marginBottom: 10, padding: 10, background: 'var(--bg-tertiary)', borderRadius: 10 }}>
                      <div style={{ fontWeight: 800, fontSize: 12, borderBottom: '1px solid var(--border)', paddingBottom: 4, marginBottom: 6 }}>
                        📅 {new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                      {slots.filter(s => s.items && s.items.length > 0).map((slot, idx) => (
                        <div key={slot.id || idx} style={{ fontSize: 12, marginBottom: 4, paddingLeft: 6 }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>
                            {slot.label} ({(() => {
                              const [h, m] = slot.time.split(':').map(Number);
                              return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
                            })()})
                          </span>
                          <div style={{ color: 'var(--text-muted)', fontSize: 11, paddingLeft: 8 }}>
                            {slot.items.map(item => `${item.qty}x ${item.name}`).join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Calendar Grid */}
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">
                {showOrder.schedule ? 'Scheduled Delivery Dates (Locked)' : `Select Delivery Dates (${selectedDates.length} selected)`}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(40px, 1fr))', gap: 4 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', padding: 4 }}>{d}</div>
                ))}
                {/* Offset for first day */}
                {Array.from({ length: new Date(calendarDays[0]).getDay() }, (_, i) => (
                  <div key={'empty' + i} />
                ))}
                {calendarDays.map(dateStr => {
                  const d = new Date(dateStr);
                  const isSelected = selectedDates.includes(dateStr);
                  const isToday = dateStr === today.toISOString().split('T')[0];
                  return (
                    <button
                      key={dateStr}
                      onClick={() => !showOrder.schedule && toggleDate(dateStr)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: showOrder.schedule ? 'default' : 'pointer',
                        fontSize: 12,
                        fontWeight: 700,
                        transition: 'all 0.2s',
                        background: isSelected ? 'var(--accent-orange)' : isToday ? 'rgba(249,115,22,0.1)' : 'var(--bg-tertiary)',
                        color: isSelected ? '#fff' : 'var(--text-primary)',
                        opacity: showOrder.schedule && !isSelected ? 0.4 : 1,
                      }}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected dates summary */}
            {selectedDates.length > 0 && (
              <div style={{ padding: 10, background: 'rgba(34,197,94,0.06)', borderRadius: 10, marginBottom: 12, fontSize: 12 }}>
                <strong>📅 {selectedDates.length} dates:</strong> {selectedDates.sort().map(d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })).join(', ')}
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => { setShowOrder(null); setSelectedDates([]); }}>Cancel</button>
              <button className="btn btn-success" onClick={() => orderPlan(showOrder)} disabled={selectedDates.length === 0}>
                📦 Order for {selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assigned Plans */}
      {myPlans.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 18, marginBottom: 14 }}>📋 Plans Assigned to You</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {myPlans.map(plan => {
              const items = (plan.items || []).map(id => MENU_ITEMS.find(m => m.id === id)).filter(Boolean);
              const totalCal = items.reduce((a, i) => a + (i?.calories || 0), 0);
              const totalPro = items.reduce((a, i) => a + (i?.protein || 0), 0);
              const totalPrice = items.reduce((a, i) => a + (i?.price || 0), 0);
              return (
                <div key={plan.id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ background: 'var(--gradient-primary)', padding: '14px 16px', marginBottom: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>{plan.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>By: {plan.trainerName || 'Trainer'}</div>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                      {[['🔥', totalCal, 'kcal'], ['💪', totalPro + 'g', 'protein'], ['₹', totalPrice, 'price']].map(([icon, val, label], i) => (
                        <div key={i} style={{ flex: 1, textAlign: 'center', padding: 8, background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                          <div style={{ fontSize: 14, fontWeight: 900 }}>{icon} {val}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      {items.slice(0, 3).map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
                          <img src={item.image} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>₹{item.price}</span>
                        </div>
                      ))}
                      {items.length > 3 && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{items.length - 3} more items</div>}
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleShowOrder(plan)}>📅 Schedule & Order</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}




      {/* Empty State */}
      {myPlans.length === 0 && mySchedules.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 50 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontWeight: 800, marginBottom: 8 }}>No meal plans assigned yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Your trainer or gym owner will assign personalized meal plans here. You can also browse the menu to order directly!</p>
        </div>
      )}
    </DashboardLayout>
  );
}
