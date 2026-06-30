import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Icon, ClipboardList, ChefHat, CheckCircle2, Car, Sparkles, XCircle, Calendar, MapPin, Edit, Trash2, Utensils, Flame, Lock, Banknote, Smartphone, CreditCard, Package, Clock, AlertTriangle } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';

const stages = ['Placed', 'Preparing', 'Ready', 'In Transit', 'Delivered'];
const statusColors = { pending: '#f97316', preparing: '#3b82f6', ready: '#14b8a6', driver_pending: '#f97316', in_transit: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444' };
const statusBadge = { pending: 'badge-orange', preparing: 'badge-blue', ready: 'badge-teal', driver_pending: 'badge-orange', in_transit: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red' };
const stageMap = { pending: 0, preparing: 1, ready: 2, driver_pending: 3, in_transit: 3, delivered: 4 };
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export default function MyOrders() {
  const { user } = useAuth();
  const { getOrdersByUser, cancelOrder, updateOrderDates, removeDateFromOrder, updateOrderAddress } = useOrders();
  const { showToast } = useNotifications();
  const [tab, setTab] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editAddrOrder, setEditAddrOrder] = useState(null);
  const [addrText, setAddrText] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const myOrders = getOrdersByUser(user?.id).sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));

  // Filter by tab
  let filtered = tab === 'all' ? myOrders
    : tab === 'active' ? myOrders.filter(o => ['pending', 'preparing', 'ready', 'driver_pending', 'in_transit'].includes(o.status))
    : tab === 'scheduled' ? myOrders.filter(o => o.scheduledDates?.length > 0 && o.status !== 'cancelled')
    : myOrders.filter(o => o.status === tab);

  // Filter by date
  if (filterDate) {
    filtered = filtered.filter(o => {
      if (o.scheduledDates?.includes(filterDate)) return true;
      if (o.orderTime?.startsWith(filterDate)) return true;
      return false;
    });
  }

  const isEditable = (order) => ['pending', 'preparing'].includes(order.status);
  const canCancel = (order) => ['pending', 'preparing', 'ready'].includes(order.status);

  const handleCancelDate = (orderId, dateStr) => {
    removeDateFromOrder(orderId, dateStr);
    showToast(`${fmtDate(dateStr)} removed from order`);
  };

  const handleSaveAddress = () => {
    if (!addrText.trim()) { showToast('Address cannot be empty', 'error'); return; }
    updateOrderAddress(editAddrOrder.id, addrText);
    showToast('Address updated!');
    setEditAddrOrder(null);
  };

  // Get all unique dates from orders for date filter
  const allDates = [...new Set(myOrders.flatMap(o => [...(o.scheduledDates || []), o.orderTime?.split('T')[0]]).filter(Boolean))].sort();

  // Group scheduled order items by date
  const getDateItems = (order, dateStr) => {
    if (order.schedule && order.schedule[dateStr]) {
      return order.schedule[dateStr]; // slot-based: [{label, time, items}]
    }
    return null; // all items apply to all dates
  };

  return (
    <DashboardLayout title="My Orders">
      {/* Edit Address Modal */}
      {editAddrOrder && (
        <div className="modal-overlay" onClick={() => setEditAddrOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h3 className="modal-title"><Icon icon={MapPin} size={16} style={{marginRight:6}} /> Edit Delivery Address</h3>
              <button className="modal-close" onClick={() => setEditAddrOrder(null)}></button>
            </div>
            <p style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)', marginBottom: 8 }}>Order #{editAddrOrder.id}</p>
            <textarea className="form-input" value={addrText} onChange={e => setAddrText(e.target.value)}
              rows={3} placeholder="Enter delivery address..." style={{ resize: 'vertical', fontSize: 'clamp(13px, 1.0vw, 15px)' }} />
            <div className="modal-footer" style={{ marginTop: 12 }}>
              <button className="btn btn-outline" onClick={() => setEditAddrOrder(null)}>Cancel</button>
              <button className="btn btn-success" onClick={handleSaveAddress}><Icon icon={CheckCircle2} size={14} style={{marginRight:4}} /> Save Address</button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {[
            { key: 'all', label: `All (${myOrders.length})` },
            { key: 'active', label: `Active (${myOrders.filter(o => ['pending','preparing','ready','driver_pending','in_transit'].includes(o.status)).length})` },
            { key: 'scheduled', label: 'Scheduled', icon: Calendar },
            { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
            { key: 'cancelled', label: 'Cancelled', icon: XCircle },
          ].map(t => (
            <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.icon ? <><Icon icon={t.icon} size={12} style={{marginRight:4}} />{t.label}</> : t.label}</button>
          ))}
        </div>
        {/* Date filter */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="date" className="form-input" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            style={{ padding: '6px 10px', fontSize: 'clamp(12px, 1.0vw, 14px)', width: 140 }} />
          {filterDate && <button className="btn btn-outline btn-sm" onClick={() => setFilterDate('')} style={{ fontSize: 'clamp(12px, 1.0vw, 14px)' }}> Clear</button>}
        </div>
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 'clamp(39px, 1.0vw, 45px)', marginBottom: 12 }}><Package size={48} color="var(--text-muted)" /></div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(13px, 1.0vw, 15px)' }}>No {tab === 'all' ? '' : tab} orders found</p>
          {filterDate && <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 1.0vw, 14px)' }}>Try clearing the date filter</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(order => {
            const isExpanded = expandedOrder === order.id;
            const hasDates = order.scheduledDates?.length > 0;
            const statusColor = statusColors[order.status] || '#888';
            const currentStage = stageMap[order.status] || 0;
            const formattedId = 'ord' + order.id.toString().replace('ord', '').slice(-5).padStart(5, '0');

            return (
              <div key={order.id} className="card" style={{ borderLeft: `4px solid ${statusColor}`, animation: 'fadeInUp 0.4s ease' }}>
                {/* Order Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, cursor: 'pointer' }}
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${statusColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(16px, 1.0vw, 19px)' }}>
                      {order.status === 'pending' ? <ClipboardList size={18} /> : order.status === 'preparing' ? <ChefHat size={18} /> : order.status === 'ready' ? <CheckCircle2 size={18} /> : order.status === 'in_transit' ? <Car size={18} /> : order.status === 'delivered' ? <Sparkles size={18} /> : <XCircle size={18} />}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(14px, 1.0vw, 17px)' }}>
                        #{formattedId}
                        {hasDates && <span style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 600, marginLeft: 6, color: '#8b5cf6' }}><Calendar size={11} style={{marginRight:3}} /> {order.scheduledDates.length} dates</span>}
                      </div>
                      <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)' }}>
                        {new Date(order.orderTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {order.items && <span> • {order.items.length} items</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(15px, 1.0vw, 18px)', color: 'var(--accent-green)' }}>₹{order.total}</span>
                    <span className={`badge ${statusBadge[order.status] || 'badge-blue'}`}>{order.status.replace('_', ' ').toUpperCase()}</span>
                    <span style={{ fontSize: 'clamp(13px, 1.0vw, 15px)', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                  </div>
                </div>

                {/* Status Message */}
                {['pending', 'preparing', 'ready', 'in_transit', 'driver_pending'].includes(order.status) && (
                  <div style={{ padding: '8px 12px', background: `${statusColor}08`, borderRadius: 8, marginBottom: 10, fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 600, color: statusColor }}>
                    {order.status === 'pending' && <><ClipboardList size={12} style={{marginRight:4}} /> Waiting for kitchen confirmation</>}
                    {order.status === 'preparing' && <><ChefHat size={12} style={{marginRight:4}} /> Your food is being freshly prepared</>}
                    {order.status === 'ready' && <><CheckCircle2 size={12} style={{marginRight:4}} /> Food is ready! Waiting for delivery pickup</>}
                    {order.status === 'driver_pending' && <><Clock size={12} style={{marginRight:4}} /> Finding a delivery partner</>}
                    {order.status === 'in_transit' && <><Car size={12} style={{marginRight:4}} /> Your food is on the way!</>}
                  </div>
                )}

                {/* Progress Tracker */}
                {['pending', 'preparing', 'ready', 'in_transit', 'driver_pending'].includes(order.status) && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, margin: '8px 0 12px' }}>
                    {stages.map((s, i) => {
                      const icons = ['', '‍', '', '', ''];
                      const done = i < currentStage;
                      const active = i === currentStage;
                      const upcoming = i > currentStage;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 'clamp(15px, 1.0vw, 18px)', fontWeight: 800, flexShrink: 0, transition: 'all 0.3s',
                              background: done ? 'var(--accent-green)' : active ? statusColor : 'var(--bg-tertiary)',
                              color: upcoming ? 'var(--text-muted)' : '#fff',
                              boxShadow: active ? `0 0 0 4px ${statusColor}25` : 'none',
                            }}>{done ? '' : icons[i]}</div>
                            <span style={{
                              fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800, marginTop: 4, textAlign: 'center', whiteSpace: 'nowrap',
                              color: done ? 'var(--accent-green)' : active ? statusColor : 'var(--text-muted)',
                            }}>{s}</span>
                          </div>
                          {i < stages.length - 1 && <div style={{ flex: 1, height: 3, background: done ? 'var(--accent-green)' : 'var(--bg-tertiary)', margin: '18px -4px 0', alignSelf: 'flex-start' }} />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* OTP */}
                {order.otp && ['pending', 'preparing', 'ready', 'in_transit'].includes(order.status) && (
                  <div style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 10, padding: '6px 12px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 600, color: 'var(--text-secondary)' }}><Lock size={11} style={{marginRight:4}} /> Delivery OTP</span>
                    <span style={{ fontFamily: 'Outfit', fontSize: 'clamp(16px, 1.0vw, 19px)', fontWeight: 900, color: 'var(--accent-orange)', letterSpacing: 4 }}>{order.otp}</span>
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                    {/* Delivery Address */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 8, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display:'flex', alignItems:'center', gap:4 }}><MapPin size={10} /> Delivery Address</div>
                        <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 600, marginTop: 2 }}>{order.customerAddress || 'No address set'}</div>
                      </div>
                      {isEditable(order) && (
                        <button className="btn btn-outline btn-sm" style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', display:'flex', alignItems:'center', gap:3 }} onClick={() => { setEditAddrOrder(order); setAddrText(order.customerAddress || ''); }}><Edit size={10} /> Edit</button>
                      )}
                    </div>

                    {/* Date-wise breakdown for scheduled orders */}
                    {hasDates ? (
                      <div>
                        <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800, marginBottom: 8, color: '#8b5cf6', display:'flex', alignItems:'center', gap:4 }}><Calendar size={12} /> Date-wise Order Breakdown</div>
                        {order.scheduledDates.sort().map(dateStr => {
                          const dateData = getDateItems(order, dateStr);
                          const isPast = new Date(dateStr) < new Date(new Date().toDateString());
                          return (
                            <div key={dateStr} style={{
                              padding: 12, borderRadius: 10, marginBottom: 8,
                              border: `1.5px solid ${isPast ? 'var(--border)' : 'rgba(139,92,246,0.2)'}`,
                              background: isPast ? 'var(--bg-tertiary)' : 'rgba(139,92,246,0.03)',
                              opacity: isPast ? 0.6 : 1,
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontWeight: 800, fontSize: 'clamp(12px, 1.0vw, 14px)' }}>{fmtDate(dateStr)}</span>
                                  {isPast && <span className="badge badge-teal" style={{ fontSize: 'clamp(12px, 1.0vw, 14px)' }}>PAST</span>}
                                </div>
                                {!isPast && isEditable(order) && (
                                  <button className="btn btn-outline btn-sm" style={{ color: 'var(--accent-red)', fontSize: 'clamp(12px, 1.0vw, 14px)', display:'flex', alignItems:'center', gap:3 }}
                                    onClick={() => handleCancelDate(order.id, dateStr)}>
                                    <Trash2 size={10} /> Cancel Date
                                  </button>
                                )}
                              </div>

                              {/* Slot-based items */}
                              {dateData ? (
                                dateData.map((slot, si) => (
                                  <div key={si} style={{ marginBottom: 4 }}>
                                    <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 2 }}>
                                      {slot.label} • {slot.time ? new Date(`2000-01-01T${slot.time}`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }) : ''}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                      {(slot.items || []).map((item, i) => (
                                        <span key={i} style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', padding: '3px 8px', background: 'var(--bg-tertiary)', borderRadius: 6 }} className="text-truncate">
                                          {item.name} × {item.qty}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {(order.items || []).map((item, i) => (
                                    <span key={i} style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', padding: '3px 8px', background: 'var(--bg-tertiary)', borderRadius: 6 }} className="text-truncate">
                                      {item.name} × {item.qty}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Regular order items */
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800, marginBottom: 8, display:'flex', alignItems:'center', gap:4 }}><Utensils size={12} /> Items Ordered</div>
                        {(order.items || []).map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: 'clamp(12px, 1.0vw, 14px)' }} className="text-truncate">{item.name}</span>
                              <span style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)', marginLeft: 6 }}>× {item.qty}</span>
                              {item.calories && <span style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: '#f97316', marginLeft: 6 }}><Flame size={10} style={{marginRight:2}} />{item.calories * item.qty}</span>}
                            </div>
                            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(12px, 1.0vw, 14px)' }}>₹{item.price || (item.qty * (item.unitPrice || 0))}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Payment & Price */}
                    <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 10, marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(12px, 1.0vw, 14px)', marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span>₹{order.subtotal || order.total}</span>
                      </div>
                      {order.deliveryFee > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(12px, 1.0vw, 14px)', marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Delivery</span><span>₹{order.deliveryFee}</span>
                      </div>}
                      {order.tip > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(12px, 1.0vw, 14px)', marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Tip</span><span>₹{order.tip}</span>
                      </div>}
                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '6px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(15px, 1.0vw, 18px)', fontWeight: 900, fontFamily: 'Outfit' }}>
                        <span>Total</span><span style={{ color: 'var(--accent-green)' }}>₹{order.total}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)', marginTop: 4 }}>
                        <span>{order.paymentMethod === 'COD' ? <Banknote size={11} style={{marginRight:3}} /> : order.paymentMethod === 'UPI' ? <Smartphone size={11} style={{marginRight:3}} /> : <CreditCard size={11} style={{marginRight:3}} />} {order.paymentMethod}</span>
                        <span>{order.paymentStatus}</span>
                      </div>
                    </div>

                    {/* Driver info */}
                    {order.driverName && (
                      <div style={{ padding: '8px 12px', background: 'rgba(139,92,246,0.05)', borderRadius: 8, marginBottom: 10, fontSize: 'clamp(12px, 1.0vw, 14px)' }}>
                        <Car size={12} style={{marginRight:4}} /> Driver: <strong>{order.driverName}</strong> • ETA: {order.eta}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {isEditable(order) && (
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditAddrOrder(order); setAddrText(order.customerAddress || ''); }}>
                          <MapPin size={12} style={{marginRight:4}} /> Change Address
                        </button>
                      )}
                      {canCancel(order) && (
                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--accent-red)' }}
                          onClick={() => { cancelOrder(order.id, 'Cancelled by customer'); showToast('Order cancelled'); }}>
                          <XCircle size={12} style={{marginRight:4}} /> Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Collapsed view - quick info */}
                {!isExpanded && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(order.items || []).slice(0, 4).map((item, i) => (
                      <span key={i} style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', padding: '3px 8px', background: 'var(--bg-tertiary)', borderRadius: 6 }} className="text-truncate">
                        {item.name} × {item.qty}
                      </span>
                    ))}
                    {(order.items || []).length > 4 && <span style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', padding: '3px 8px', color: 'var(--text-muted)' }}>+{order.items.length - 4} more</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
