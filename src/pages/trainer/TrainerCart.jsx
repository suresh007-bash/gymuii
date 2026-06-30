import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import { getMenuItems } from '../../data/menuHelper';
import { Icon, Sparkles, Package, Utensils, ShoppingCart, Flame, Calendar, ClipboardList } from '../../components/Icons';

export default function TrainerCart() {
  const MENU_ITEMS = getMenuItems();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('synnoviq_trainer_cart') || '[]'));
  const [tip, setTip] = useState(0);
  const [payment, setPayment] = useState('UPI');
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [timing, setTiming] = useState('noon');

  const updateQty = (id, delta) => { const c = cart.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i); setCart(c); localStorage.setItem('synnoviq_trainer_cart', JSON.stringify(c)); };
  const remove = (id) => { const c = cart.filter(i => i.id !== id); setCart(c); localStorage.setItem('synnoviq_trainer_cart', JSON.stringify(c)); };
  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const deliveryFee = cart.length > 0 ? 40 : 0;
  const total = subtotal + deliveryFee + tip;

  const toggleDate = (dateStr) => setSelectedDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]);
  const today = new Date();
  const calendarDays = Array.from({ length: 30 }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() + i); return d.toISOString().split('T')[0]; });

  const handlePlaceOrder = () => {
    if (selectedDates.length === 0) { showToast('Select delivery dates first', 'error'); return; }
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const enrichedItems = cart.map(item => {
      const m = MENU_ITEMS.find(x => x.id === item.id);
      return { menuId: item.id, name: item.name, qty: item.qty, price: item.price * item.qty, calories: m?.calories || 0, protein: m?.protein || 0, carbs: m?.carbs || 0, fat: m?.fat || 0 };
    });
    const newOrder = placeOrder({ customerId: user.id, customerName: user.name, customerAddress: user.address || 'Trainer Address', items: enrichedItems, subtotal, deliveryFee, tip, total, paymentMethod: payment, paymentStatus: payment === 'COD' ? 'Pending' : 'Paid', scheduledDates: selectedDates, timing, otp });
    setOrderPlaced({ ...newOrder, otp }); setCart([]); setSelectedDates([]);
    localStorage.setItem('synnoviq_trainer_cart', '[]');
    showToast(`Order placed! OTP: ${otp} `);
  };

  if (orderPlaced) return (
    <DashboardLayout title="My Cart">
      <div style={{ textAlign: 'center', padding: 60, animation: 'scaleIn 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><Icon icon={Sparkles} size={72} color="#f97316" /></div>
        <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(24px, 1.0vw, 28px)', fontWeight: 800, marginBottom: 8 }}>Order Placed!</h2>
        <div style={{ background: 'rgba(249,115,22,0.08)', borderRadius: 16, padding: '16px 32px', display: 'inline-block', marginBottom: 16 }}>
          <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)', fontWeight: 700 }}>YOUR OTP</div>
          <div style={{ fontFamily: 'Outfit', fontSize: 'clamp(30px, 1.0vw, 35px)', fontWeight: 900, color: 'var(--accent-orange)', letterSpacing: 6 }}>{orderPlaced.otp}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/trainer/orders')}><Icon icon={Package} size={16} style={{marginRight:4}} /> Track Order</button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/trainer/menu')}><Icon icon={Utensils} size={16} style={{marginRight:4}} /> Order More</button>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="My Cart">
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><Icon icon={ShoppingCart} size={64} color="var(--text-muted)" /></div>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: 8 }}>Your cart is empty</h3>
          <button className="btn btn-primary" onClick={() => navigate('/trainer/menu')}>Browse Menu</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 24, alignItems: 'start' }}>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><h3 className="card-title"><Icon icon={ShoppingCart} size={16} style={{marginRight:6}} /> Cart ({cart.length})</h3></div>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 'clamp(13px, 1.0vw, 15px)' }} className="text-truncate">{item.name}</div><div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)' }}><Icon icon={Flame} size={11} style={{marginRight:2}} /> {item.calories} kcal</div></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => updateQty(item.id, -1)}>−</button>
                    <span style={{ fontWeight: 800 }}>{item.qty}</span>
                    <button className="btn btn-outline btn-sm" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 800, minWidth: 60, textAlign: 'right' }}>₹{item.price * item.qty}</div>
                  <button onClick={() => remove(item.id)} style={{ color: 'var(--accent-red)', fontSize: 'clamp(15px, 1.0vw, 18px)', cursor: 'pointer', background: 'none', border: 'none' }}></button>
                </div>
              ))}
            </div>
            {/* Calendar */}
            <div className="card">
              <div className="card-header"><h3 className="card-title"><Icon icon={Calendar} size={16} style={{marginRight:6}} /> Schedule Delivery</h3></div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {[['morning', ' Breakfast'], ['noon', ' Lunch'], ['evening', ' Dinner']].map(([k, l]) => (
                  <button key={k} className={`btn btn-sm ${timing === k ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTiming(k)} style={{ flex: 1 }}>{l}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(40px, 1fr))', gap: 4, marginBottom: 12 }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800, color: 'var(--text-muted)', padding: 4 }}>{d}</div>)}
                {Array.from({ length: new Date(calendarDays[0]).getDay() }, (_, i) => <div key={'e' + i} />)}
                {calendarDays.map(dateStr => {
                  const isSelected = selectedDates.includes(dateStr);
                  return <button key={dateStr} onClick={() => toggleDate(dateStr)} style={{ padding: '10px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 700, background: isSelected ? 'var(--accent-orange)' : 'var(--bg-tertiary)', color: isSelected ? '#fff' : 'var(--text-primary)' }}>{new Date(dateStr).getDate()}</button>;
                })}
              </div>
              {selectedDates.length > 0 && <div style={{ padding: 10, background: 'rgba(34,197,94,0.06)', borderRadius: 10, fontSize: 'clamp(12px, 1.0vw, 14px)' }}><strong><Icon icon={Calendar} size={12} style={{marginRight:4}} /> {selectedDates.length} dates:</strong> {selectedDates.sort().map(d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })).join(', ')}</div>}
            </div>
          </div>
          <div className="card" style={{ position: 'sticky', top: 88 }}>
            <div className="card-header"><h3 className="card-title"><Icon icon={ClipboardList} size={16} style={{marginRight:6}} /> Summary</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(12px, 1.0vw, 14px)' }}><span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span>₹{subtotal}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(12px, 1.0vw, 14px)' }}><span style={{ color: 'var(--text-muted)' }}>Delivery</span><span>₹{deliveryFee}</span></div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(15px, 1.0vw, 18px)', fontWeight: 800, fontFamily: 'Outfit' }}><span>Total</span><span style={{ color: 'var(--accent-green)' }}>₹{total}</span></div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>PAYMENT</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['COD', 'UPI', 'Card'].map(p => <button key={p} onClick={() => setPayment(p)} className={`btn btn-sm ${payment === p ? 'btn-primary' : 'btn-outline'}`}>{p}</button>)}
              </div>
            </div>
            <button className="btn btn-success btn-lg" style={{ width: '100%' }} onClick={handlePlaceOrder} disabled={selectedDates.length === 0}>
               {selectedDates.length > 0 ? `Place Order • ₹${total}` : <><Icon icon={Calendar} size={14} style={{marginRight:4}} /> Select Dates</>}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
