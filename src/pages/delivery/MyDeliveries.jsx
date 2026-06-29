import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';

export default function MyDeliveries() {
  const { user } = useAuth();
  const { getOrdersByDriver, getDriverPendingOrders, acceptDelivery, rejectDelivery, completeDelivery } = useOrders();
  const { showToast } = useNotifications();
  const [otpInput, setOtpInput] = useState({});
  const [tab, setTab] = useState('pending');

  const pendingOrders = getDriverPendingOrders(user?.id);
  const activeOrders = getOrdersByDriver(user?.id).filter(o => o.status === 'in_transit');
  const displayOrders = tab === 'pending' ? pendingOrders : activeOrders;

  const handleAccept = (orderId) => {
    acceptDelivery(orderId);
    showToast(' Delivery accepted! Navigate to pickup.');
  };

  const handleReject = (orderId) => {
    rejectDelivery(orderId);
    showToast(' Delivery rejected. Order returned to kitchen.');
  };

  const handleDeliver = (order) => {
    const enteredOtp = otpInput[order.id] || '';
    if (enteredOtp !== order.otp) {
      showToast(' Wrong OTP! Please enter correct OTP from customer.', 'error');
      return;
    }
    completeDelivery(order.id);
    showToast(' Delivery completed! ₹85 earned.');
    setOtpInput(prev => { const n = { ...prev }; delete n[order.id]; return n; });
  };

  return (
    <DashboardLayout title="My Deliveries">
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
           Pending ({pendingOrders.length})
        </button>
        <button className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
           Active ({activeOrders.length})
        </button>
      </div>

      {displayOrders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 50 }}>
          <div style={{ fontSize: 'calc(60px + 0.5vw)', marginBottom: 12 }}>{tab === 'pending' ? '' : ''}</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No {tab === 'pending' ? 'pending' : 'active'} deliveries</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'calc(17px + 0.5vw)' }}>
            {tab === 'pending' ? 'New orders will appear here when kitchen assigns you.' : 'Accept pending orders to start delivering.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayOrders.map(order => (
            <div key={order.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
              {/* Header */}
              <div style={{ background: tab === 'pending' ? 'rgba(249,115,22,0.06)' : 'rgba(139,92,246,0.06)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(20px + 0.5vw)' }}>#{order.id}</span>
                  <span style={{ marginLeft: 8, fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>{new Date(order.orderTime).toLocaleString()}</span>
                </div>
                <span className={`badge ${tab === 'pending' ? 'badge-orange' : 'badge-purple'}`}>
                  {tab === 'pending' ? ' PENDING' : ' IN TRANSIT'}
                </span>
              </div>

              <div style={{ padding: 16 }}>
                {/* Customer & Location */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 12, marginBottom: 14 }}>
                  <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: 800, color: 'var(--text-muted)' }}> DELIVERY LOCATION</div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.customerAddress || order.customerName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '4px 10px', borderRadius: 8,
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          color: '#fff', fontSize: 'calc(14px + 0.5vw)', fontWeight: 700,
                          textDecoration: 'none', cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.3)'; }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                        Navigate
                      </a>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 'calc(17px + 0.5vw)' }}>{order.customerName}</div>
                    <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>{order.customerAddress}</div>
                  </div>
                  <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: 800, color: 'var(--text-muted)' }}> PICKUP FROM</div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.restaurantAddress || 'Koramangala')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '4px 10px', borderRadius: 8,
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          color: '#fff', fontSize: 'calc(14px + 0.5vw)', fontWeight: 700,
                          textDecoration: 'none', cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(34,197,94,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(34,197,94,0.3)'; }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                        Navigate
                      </a>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 'calc(17px + 0.5vw)' }}>{order.restaurantName || 'FitBites Kitchen'}</div>
                    <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>{order.restaurantAddress || 'Koramangala'}</div>
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6 }}>️ ORDER ITEMS</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {order.items.map((item, i) => (
                      <span key={i} style={{ padding: '4px 10px', background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: 'calc(16px + 0.5vw)', fontWeight: 600 }}>
                        {item.name} × {item.qty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 8, marginBottom: 14 }}>
                  <div style={{ padding: 10, background: 'rgba(34,197,94,0.06)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 'calc(14px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 700 }}> TOTAL</div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'calc(22px + 0.5vw)', color: 'var(--accent-green)' }}>₹{order.total}</div>
                  </div>
                  <div style={{ padding: 10, background: 'var(--bg-tertiary)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 'calc(14px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 700 }}> PAYMENT</div>
                    <div style={{ fontWeight: 800, fontSize: 'calc(18px + 0.5vw)' }}>{order.paymentMethod}</div>
                    <div style={{ fontSize: 'calc(14px + 0.5vw)', color: order.paymentStatus === 'Paid' ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{order.paymentStatus}</div>
                  </div>
                  <div style={{ padding: 10, background: 'rgba(249,115,22,0.06)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 'calc(14px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 700 }}>️ EARN</div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'calc(22px + 0.5vw)', color: 'var(--accent-orange)' }}>₹85</div>
                  </div>
                </div>

                {/* Scheduled dates */}
                {order.scheduledDates?.length > 0 && (
                  <div style={{ padding: '6px 12px', background: 'rgba(34,197,94,0.06)', borderRadius: 8, marginBottom: 14, fontSize: 'calc(16px + 0.5vw)' }}>
                     Scheduled: {order.scheduledDates.map(d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })).join(', ')}
                    {order.timing && <span> • {order.timing === 'morning' ? '' : order.timing === 'noon' ? '️' : ''} {order.timing}</span>}
                  </div>
                )}

                {/* Pending: Accept / Reject */}
                {tab === 'pending' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-success" style={{ flex: 1 }} onClick={() => handleAccept(order.id)}> Accept Delivery</button>
                    <button className="btn btn-outline" style={{ flex: 1, color: 'var(--accent-red)' }} onClick={() => handleReject(order.id)}> Reject</button>
                  </div>
                )}

                {/* Active: OTP Verification */}
                {tab === 'active' && (
                  <div>
                    <div style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6 }}> VERIFY DELIVERY OTP</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="form-input"
                        placeholder="Enter 4-digit OTP from customer"
                        value={otpInput[order.id] || ''}
                        onChange={e => setOtpInput(prev => ({ ...prev, [order.id]: e.target.value }))}
                        maxLength={4}
                        style={{ flex: 1, textAlign: 'center', fontSize: 'calc(22px + 0.5vw)', fontWeight: 900, letterSpacing: 8, fontFamily: 'Outfit' }}
                      />
                      <button className="btn btn-success" onClick={() => handleDeliver(order)} disabled={!otpInput[order.id] || otpInput[order.id].length < 4}>
                         Deliver
                      </button>
                    </div>
                    <p style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)', marginTop: 4 }}>Ask customer for OTP to complete delivery</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
