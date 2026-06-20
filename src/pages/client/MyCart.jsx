import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import { getMenuItems } from '../../data/menuHelper';

export default function MyCart() {
  const MENU_ITEMS = getMenuItems();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const rolePrefix = user?.role === 'owner' ? '/owner' : user?.role === 'trainer' ? '/trainer' : '/client';
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('synnoviq_cart') || '[]'));
  const [tip, setTip] = useState(0);
  const [payment, setPayment] = useState('COD');
  const [orderPlaced, setOrderPlaced] = useState(null);

  const updateQty = (id, delta) => { const c = cart.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i); setCart(c); localStorage.setItem('synnoviq_cart', JSON.stringify(c)); };
  const remove = (id) => { const c = cart.filter(i => i.id !== id); setCart(c); localStorage.setItem('synnoviq_cart', JSON.stringify(c)); };
  const clearCart = () => { setCart([]); localStorage.setItem('synnoviq_cart', '[]'); showToast('🗑️ Cart cleared'); };

  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const deliveryFee = cart.length > 0 ? 40 : 0;
  const total = subtotal + deliveryFee + tip;
  const cartCal = cart.reduce((a, c) => a + (c.calories || 0) * c.qty, 0);
  const cartPro = cart.reduce((a, c) => a + (c.protein || 0) * c.qty, 0);

  const handlePlaceOrder = () => {
    if (cart.length === 0) { showToast('Cart is empty', 'error'); return; }
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const enrichedItems = cart.map(item => {
      const mi = MENU_ITEMS.find(m => m.id === item.id);
      return { menuId: item.id, name: item.name, qty: item.qty, price: item.price * item.qty, calories: mi?.calories || 0, protein: mi?.protein || 0, carbs: mi?.carbs || 0, fat: mi?.fat || 0 };
    });
    const newOrder = placeOrder({
      customerId: user.id, customerName: user.name,
      customerAddress: user.address || '45 JP Nagar, 6th Phase, Bangalore',
      items: enrichedItems, subtotal, deliveryFee, tip, total,
      paymentMethod: payment, paymentStatus: payment === 'COD' ? 'Pending' : 'Paid',
      timing: 'now', otp,
    });
    setOrderPlaced({ ...newOrder, otp });
    setCart([]); localStorage.setItem('synnoviq_cart', '[]');
    showToast(`Order placed! OTP: ${otp} 🎉`);
  };

  // Order success
  if (orderPlaced) return (
    <DashboardLayout title="My Cart">
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Order Placed!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Order #{orderPlaced.id}</p>
        <div style={{ background: 'rgba(249,115,22,0.08)', borderRadius: 16, padding: '16px 32px', display: 'inline-block', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>YOUR OTP</div>
          <div style={{ fontFamily: 'Outfit', fontSize: 36, fontWeight: 900, color: 'var(--accent-orange)', letterSpacing: 6 }}>{orderPlaced.otp}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Share with delivery person</div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate(`${rolePrefix}/orders`)}>📦 Track Order</button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate(`${rolePrefix}/menu`)}>🍽️ Order More</button>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="My Cart">
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Your cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Browse the menu to add food items</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate(`${rolePrefix}/menu`)}>🍽️ Browse Menu</button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate(`${rolePrefix}/schedule`)}>📅 Schedule Foods</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 20, alignItems: 'start' }}>
          {/* Cart Items */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">🛒 Cart ({cart.length} items)</h3>
              <button className="btn btn-outline btn-sm" onClick={clearCart} style={{ color: 'var(--accent-red)' }}>🗑️ Clear</button>
            </div>

            {/* Nutrition summary */}
            <div style={{ display: 'flex', gap: 16, padding: '10px 0', marginBottom: 8, borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: '#f97316', fontWeight: 700 }}>🔥 {cartCal} kcal</span>
              <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>💪 {cartPro}g protein</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cart.reduce((a, c) => a + c.qty, 0)} items total</span>
            </div>

            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <img src={item.image} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔥{item.calories * item.qty} kcal • 💪{item.protein * item.qty}g</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-green)' }}>₹{item.price} each</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="btn btn-outline" style={{ width: 32, height: 32, padding: 0, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { if (item.qty <= 1) remove(item.id); else updateQty(item.id, -1); }}>−</button>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 16, minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
                  <button className="btn btn-outline" style={{ width: 32, height: 32, padding: 0, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => updateQty(item.id, 1)}>+</button>
                </div>
                <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 15, minWidth: 50, textAlign: 'right' }}>₹{item.price * item.qty}</span>
                <button onClick={() => remove(item.id)} style={{ color: 'var(--accent-red)', fontSize: 16, cursor: 'pointer', background: 'none', border: 'none' }}>✕</button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="card-header"><h3 className="card-title">📋 Order Summary</h3></div>

              {/* Payment */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>PAYMENT</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['COD', 'UPI', 'Card'].map(p => (
                    <button key={p} onClick={() => setPayment(p)} className={`btn btn-sm ${payment === p ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }}>
                      {p === 'COD' ? '💵' : p === 'UPI' ? '📱' : '💳'} {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tip */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>TIP</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0, 20, 30, 50].map(t => (<button key={t} onClick={() => setTip(t)} className={`btn btn-sm ${tip === t ? 'btn-primary' : 'btn-outline'}`}>₹{t}</button>))}
                </div>
              </div>

              {/* Price */}
              <div style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span>₹{subtotal}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span style={{ color: 'var(--text-muted)' }}>Delivery</span><span>₹{deliveryFee}</span></div>
                {tip > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span style={{ color: 'var(--text-muted)' }}>Tip</span><span>₹{tip}</span></div>}
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 900, fontFamily: 'Outfit' }}>
                  <span>Total</span><span style={{ color: 'var(--accent-green)' }}>₹{total}</span>
                </div>
              </div>

              <button className="btn btn-success btn-lg" style={{ width: '100%', marginTop: 14, fontSize: 16 }} onClick={handlePlaceOrder}>
                ✅ Order Now • ₹{total}
              </button>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>OTP will be generated for delivery verification</p>
            </div>

            {/* Schedule option */}
            <button className="btn btn-outline" style={{ width: '100%', fontSize: 13 }} onClick={() => navigate(`${rolePrefix}/schedule`)}>
              📅 Want to schedule for specific dates? → Schedule Foods
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
