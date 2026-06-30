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
  const { dietPlans, scheduledOrders, addOrder, deleteDietPlan } = useOrders();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [showOrder, setShowOrder] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [timing, setTiming] = useState('morning');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ═══ LOCKED STATE: Only accessible when user has a trainer ═══
  if (!user?.trainerId) {
    return (
      <DashboardLayout title="Trainer Recommendation">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="card" style={{ textAlign: 'center', padding: 'clamp(32px, 2.1vw, 42px)', maxWidth: 480 }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%', margin: '0 auto 20px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed rgba(99,102,241,0.3)',
            }}>
              <span style={{ fontSize: 'clamp(33px, 1.0vw, 38px)' }}></span>
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(18px, 1.0vw, 21px)', marginBottom: 8 }}>
              Trainer Required
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(13px, 1.0vw, 15px)', lineHeight: 1.7, marginBottom: 24 }}>
              Trainer Recommendations are only available when you have a personal trainer. 
              Join a gym and hire a trainer to unlock personalized meal plans and recommendations.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/client/community')}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', padding: '12px 32px', borderRadius: 12,
                fontWeight: 700, fontSize: 'clamp(13px, 1.0vw, 15px)', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.3)'; }}
            >
               Join Gym & Hire Trainer
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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

  const handleDeletePlan = (planId) => {
    deleteDietPlan(planId);
    showToast(' Plan deleted successfully!');
    setConfirmDelete(null);
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
      showToast(` Meal schedule ordered! OTP: ${otp}`);
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
    showToast(` Meal plan ordered! OTP: ${otp}`);
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
    <DashboardLayout title="Trainer Recommendation">
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title"> Delete Plan</h3>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}></button>
            </div>
            <div style={{ padding: '16px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(39px, 1.0vw, 45px)', marginBottom: 12 }}></div>
              <p style={{ fontSize: 'clamp(13px, 1.0vw, 15px)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
                Are you sure you want to delete <strong>"{confirmDelete.name}"</strong>?
              </p>
              <p style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)' }}>
                This action cannot be undone. The plan will be permanently removed.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="btn"
                onClick={() => handleDeletePlan(confirmDelete.id)}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff', border: 'none', fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
                }}
              >
                 Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal with Calendar */}
      {showOrder && (
        <div className="modal-overlay" onClick={() => { setShowOrder(null); setSelectedDates([]); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 className="modal-title"> Schedule "{showOrder.name}"</h3>
              <button className="modal-close" onClick={() => { setShowOrder(null); setSelectedDates([]); }}></button>
            </div>

            <p style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)', marginBottom: 12 }}>
              {showOrder.schedule
                ? 'This meal schedule has been assigned by your trainer and cannot be modified.'
                : 'Click dates to select multiple delivery days. You can reschedule until delivery.'}
            </p>

            {/* Timing */}
            {!showOrder.schedule && (
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Meal Timing</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['morning', ' Breakfast', '8:00 AM'], ['noon', ' Lunch', '12:30 PM'], ['evening', ' Dinner', '7:00 PM']].map(([k, label, time]) => (
                    <button key={k} className={`btn btn-sm ${timing === k ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTiming(k)} style={{ flex: 1 }}>
                      {label}<br /><span style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', opacity: 0.7 }}>{time}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trainer Pre-assigned Schedule Summary */}
            {showOrder.schedule && (
              <div style={{ marginBottom: 14, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
                <label className="form-label" style={{ color: 'var(--accent-orange)' }}> Pre-assigned Meal Schedule</label>
                {Object.entries(showOrder.schedule).sort((a, b) => a[0].localeCompare(b[0])).map(([dateStr, slots]) => {
                  const hasItems = slots.some(s => s.items && s.items.length > 0);
                  if (!hasItems) return null;
                  return (
                    <div key={dateStr} style={{ marginBottom: 10, padding: 10, background: 'var(--bg-tertiary)', borderRadius: 10 }}>
                      <div style={{ fontWeight: 800, fontSize: 'clamp(12px, 1.0vw, 14px)', borderBottom: '1px solid var(--border)', paddingBottom: 4, marginBottom: 6 }}>
                         {new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                      {slots.filter(s => s.items && s.items.length > 0).map((slot, idx) => (
                        <div key={slot.id || idx} style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', marginBottom: 4, paddingLeft: 6 }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>
                            {slot.label} ({(() => {
                              const [h, m] = slot.time.split(':').map(Number);
                              return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
                            })()})
                          </span>
                          <div style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 1.0vw, 14px)', paddingLeft: 8 }} className="text-truncate">
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
                  <div key={d} style={{ textAlign: 'center', fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800, color: 'var(--text-muted)', padding: 4 }}>{d}</div>
                ))}
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
                        fontSize: 'clamp(12px, 1.0vw, 14px)',
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

            {selectedDates.length > 0 && (
              <div style={{ padding: 10, background: 'rgba(34,197,94,0.06)', borderRadius: 10, marginBottom: 12, fontSize: 'clamp(12px, 1.0vw, 14px)' }}>
                <strong> {selectedDates.length} dates:</strong> {selectedDates.sort().map(d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })).join(', ')}
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => { setShowOrder(null); setSelectedDates([]); }}>Cancel</button>
              <button className="btn btn-success" onClick={() => orderPlan(showOrder)} disabled={selectedDates.length === 0}>
                 Order for {selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assigned Plans */}
      {myPlans.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(16px, 1.0vw, 19px)', marginBottom: 14 }}> Plans Assigned to You</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {myPlans.map(plan => {
              const items = (plan.items || []).map(id => MENU_ITEMS.find(m => m.id === id)).filter(Boolean);
              const totalCal = items.reduce((a, i) => a + (i?.calories || 0), 0);
              const totalPro = items.reduce((a, i) => a + (i?.protein || 0), 0);
              const totalPrice = items.reduce((a, i) => a + (i?.price || 0), 0);
              return (
                <div key={plan.id} className="card" style={{ overflow: 'hidden', position: 'relative' }}>
                  {/* Delete Button */}
                  <button
                    onClick={() => setConfirmDelete(plan)}
                    style={{
                      position: 'absolute', top: 12, right: 12, zIndex: 3,
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: 'clamp(13px, 1.0vw, 15px)', transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.9)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1)'; }}
                    title="Delete plan"
                  >
                    
                  </button>

                  <div style={{ background: 'var(--gradient-primary)', padding: '14px 16px', marginBottom: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(14px, 1.0vw, 17px)' }} className="text-truncate">{plan.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(12px, 1.0vw, 14px)' }}>By: {plan.trainerName || 'Trainer'}</div>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                      {[['', totalCal, 'kcal'], ['', totalPro + 'g', 'protein'], ['₹', totalPrice, 'price']].map(([icon, val, label], i) => (
                        <div key={i} style={{ flex: 1, textAlign: 'center', padding: 8, background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                          <div style={{ fontSize: 'clamp(13px, 1.0vw, 15px)', fontWeight: 900 }}>{icon} {val}</div>
                          <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      {items.slice(0, 3).map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
                          <img src={item.image} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                          <span style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 600 }} className="text-truncate">{item.name}</span>
                          <span style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)', marginLeft: 'auto' }}>₹{item.price}</span>
                        </div>
                      ))}
                      {items.length > 3 && <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)' }}>+{items.length - 3} more items</div>}
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleShowOrder(plan)}> Schedule & Order</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State — Waiting for Trainer */}
      {myPlans.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '55vh' }}>
          <div className="card" style={{ textAlign: 'center', padding: 'clamp(28px, 1.7vw, 35px)', maxWidth: 500 }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%', margin: '0 auto 20px',
              background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(34,197,94,0.08))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed rgba(249,115,22,0.25)',
              animation: 'float 4s ease-in-out infinite',
            }}>
              <span style={{ fontSize: 'clamp(36px, 1.0vw, 42px)' }}></span>
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(18px, 1.0vw, 21px)', marginBottom: 8 }}>
              Waiting for Trainer Recommendation
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(13px, 1.0vw, 15px)', lineHeight: 1.7, marginBottom: 20 }}>
              Your trainer hasn't scheduled any meals for you yet. Once your trainer creates a personalized diet plan or schedules foods, it will appear right here.
            </p>

            <div style={{
              background: 'var(--bg-tertiary)', borderRadius: 14, padding: 16, marginBottom: 20,
              border: '1px solid var(--border)', textAlign: 'left',
            }}>
              <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 10 }}> What to expect:</div>
              {[
                ['', 'Personalized meal plans based on your fitness goals'],
                ['', 'Scheduled meals for breakfast, lunch & dinner'],
                ['', 'Macro-tracked recommendations matching your targets'],
                ['', 'One-click ordering for trainer-assigned meals'],
              ].map(([icon, text], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                  <span style={{ fontSize: 'clamp(15px, 1.0vw, 18px)' }}>{icon}</span>
                  <span style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)', marginBottom: 16 }}>
              In the meantime, you can browse the menu and order your own meals!
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/client/menu')}
              style={{ padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 'clamp(13px, 1.0vw, 15px)' }}
            >
               Browse Menu
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
