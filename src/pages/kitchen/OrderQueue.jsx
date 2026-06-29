import { useState, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';

export default function OrderQueue() {
  const { orders, updateOrderStatus } = useOrders();
  const { showToast } = useNotifications();
  
  // Date State: defaults to today
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Mobile column view state (on mobile we show one column at a time)
  const [activeTab, setActiveTab] = useState('pending');

  // Generate next 14 days for the horizontal calendar bar
  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = -2; i < 12; i++) { // Include 2 days ago to 12 days future
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  // Filter & Sort Orders
  const filteredSortedOrders = useMemo(() => {
    return orders
      .filter(o => {
        const orderDateStr = o.orderTime ? o.orderTime.split('T')[0] : '';
        const isScheduledForDate = o.scheduledDates && o.scheduledDates.includes(selectedDate);
        return orderDateStr === selectedDate || isScheduledForDate;
      })
      .sort((a, b) => {
        // Priority Scoring: Morning orders first
        const getScore = (o) => {
          if (o.timing === 'morning' || (o.timeSlot && o.timeSlot.toLowerCase().includes('am'))) {
            return 1; // High priority (morning)
          }
          if (o.timing === 'noon' || (o.timeSlot && o.timeSlot.toLowerCase().includes('pm') && (o.timeSlot.startsWith('12') || o.timeSlot.startsWith('1') || o.timeSlot.startsWith('2')))) {
            return 2; // Medium priority (afternoon)
          }
          return 3; // Standard (evening)
        };
        const scoreA = getScore(a);
        const scoreB = getScore(b);
        if (scoreA !== scoreB) return scoreA - scoreB;
        return new Date(a.orderTime) - new Date(b.orderTime);
      });
  }, [orders, selectedDate]);

  const pending = filteredSortedOrders.filter(o => o.status === 'pending');
  const preparing = filteredSortedOrders.filter(o => o.status === 'preparing');
  const ready = filteredSortedOrders.filter(o => o.status === 'ready');

  const handleStatus = (id, newStatus, label) => {
    updateOrderStatus(id, newStatus);
    showToast(`Order #${id} → ${label}`);
  };

  const fmtDayName = (dStr) => {
    const date = new Date(dStr);
    const today = new Date().toISOString().split('T')[0];
    if (dStr === today) return 'Today';
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  };

  const fmtDayNum = (dStr) => {
    return new Date(dStr).getDate();
  };

  const isMorning = (o) => {
    return o.timing === 'morning' || (o.timeSlot && o.timeSlot.toLowerCase().includes('am'));
  };

  return (
    <DashboardLayout title="Order Queue">
      {/* Date Selection Header */}
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(15px, 3vw, 20px)' }}> Select Preparation Date</h4>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)}
            style={{ 
              padding: '6px 12px', 
              borderRadius: 10, 
              border: '1px solid var(--border)', 
              background: 'var(--bg-input)', 
              color: 'var(--text-primary)',
              fontFamily: 'Outfit',
              fontSize: 'clamp(12px, 3vw, 17px)'
            }}
          />
        </div>

        {/* Horizontal Calendar Bar */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
          {calendarDays.map(day => {
            const isSelected = day === selectedDate;
            return (
              <div 
                key={day} 
                onClick={() => setSelectedDate(day)}
                style={{
                  minWidth: 64,
                  padding: '10px 8px',
                  borderRadius: 12,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-orange)' : '1px solid var(--border)',
                  background: isSelected ? 'rgba(249,115,22,0.08)' : 'var(--bg-tertiary)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 700, color: isSelected ? 'var(--accent-orange)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {fmtDayName(day)}
                </div>
                <div style={{ fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: 900, color: isSelected ? 'var(--accent-orange)' : 'var(--text-primary)', marginTop: 2 }}>
                  {fmtDayNum(day)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Column Select Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}> Queue ({pending.length})</button>
        <button className={`tab ${activeTab === 'preparing' ? 'active' : ''}`} onClick={() => setActiveTab('preparing')}>‍ Prep ({preparing.length})</button>
        <button className={`tab ${activeTab === 'ready' ? 'active' : ''}`} onClick={() => setActiveTab('ready')}> Ready ({ready.length})</button>
      </div>

      {/* KDS Kanban Board Grid */}
      <div className="kds-kanban-grid">
        {/* Column 1: Order Queue (Pending) */}
        {activeTab === 'pending' && (
        <div className="kds-column">
          <div className="kds-column-header" style={{ borderTop: '4px solid var(--accent-orange)' }}>
            <span style={{ fontSize: 'clamp(15px, 3vw, 20px)' }}></span>
            <span style={{ fontWeight: 800 }}>Order Queue ({pending.length})</span>
          </div>
          <div className="kds-column-content">
            {pending.length === 0 ? (
              <div className="kds-empty">No orders in queue</div>
            ) : (
              pending.map(o => (
                <div key={o.id} className="card kds-card" style={{ borderLeft: isMorning(o) ? '4px solid #3b82f6' : '1px solid var(--border)' }}>
                  <div className="kds-card-header">
                    <div>
                      <span className="kds-card-id">#{o.id}</span>
                      {isMorning(o) && <span className="badge badge-blue" style={{ marginLeft: 6, fontSize: 'clamp(12px, 3vw, 13px)' }}> MORNING</span>}
                    </div>
                    <span style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)' }}>
                      {o.timeSlot || new Date(o.orderTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="kds-card-body">
                    <div style={{ fontWeight: 700, fontSize: 'clamp(12px, 3vw, 17px)', marginBottom: 4 }}> {o.customerName}</div>
                    <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)', marginBottom: 8 }}> {o.customerAddress}</div>
                    <div className="kds-items">
                      {o.items.map((item, i) => (
                        <div key={i} className="kds-item">
                          <span style={{ fontWeight: 700 }}>{item.qty}x</span> {item.name}
                          {item.instructions && <div className="kds-instr"> {item.instructions}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="kds-card-footer">
                    <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => handleStatus(o.id, 'preparing', 'Preparing ‍')}>
                      ‍ Start Preparing
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}

        {/* Column 2: Preparing */}
        {activeTab === 'preparing' && (
        <div className="kds-column">
          <div className="kds-column-header" style={{ borderTop: '4px solid #3b82f6' }}>
            <span style={{ fontSize: 'clamp(15px, 3vw, 20px)' }}>‍</span>
            <span style={{ fontWeight: 800 }}>Preparing ({preparing.length})</span>
          </div>
          <div className="kds-column-content">
            {preparing.length === 0 ? (
              <div className="kds-empty">No meals being prepared</div>
            ) : (
              preparing.map(o => (
                <div key={o.id} className="card kds-card" style={{ borderLeft: isMorning(o) ? '4px solid #3b82f6' : '1px solid var(--border)' }}>
                  <div className="kds-card-header">
                    <div>
                      <span className="kds-card-id">#{o.id}</span>
                      {isMorning(o) && <span className="badge badge-blue" style={{ marginLeft: 6, fontSize: 'clamp(12px, 3vw, 13px)' }}> MORNING</span>}
                    </div>
                    <span style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)' }}>
                      {o.timeSlot || new Date(o.orderTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="kds-card-body">
                    <div style={{ fontWeight: 700, fontSize: 'clamp(12px, 3vw, 17px)', marginBottom: 4 }}> {o.customerName}</div>
                    <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)', marginBottom: 8 }}> {o.customerAddress}</div>
                    <div className="kds-items">
                      {o.items.map((item, i) => (
                        <div key={i} className="kds-item">
                          <span style={{ fontWeight: 700 }}>{item.qty}x</span> {item.name}
                          {item.instructions && <div className="kds-instr"> {item.instructions}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="kds-card-footer">
                    <button className="btn btn-success btn-sm" style={{ width: '100%' }} onClick={() => handleStatus(o.id, 'ready', 'Ready ')}>
                       Mark Ready
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}

        {/* Column 3: Ready */}
        {activeTab === 'ready' && (
        <div className="kds-column">
          <div className="kds-column-header" style={{ borderTop: '4px solid var(--accent-green)' }}>
            <span style={{ fontSize: 'clamp(15px, 3vw, 20px)' }}></span>
            <span style={{ fontWeight: 800 }}>Ready ({ready.length})</span>
          </div>
          <div className="kds-column-content">
            {ready.length === 0 ? (
              <div className="kds-empty">No ready orders</div>
            ) : (
              ready.map(o => (
                <div key={o.id} className="card kds-card">
                  <div className="kds-card-header">
                    <div>
                      <span className="kds-card-id">#{o.id}</span>
                      {isMorning(o) && <span className="badge badge-blue" style={{ marginLeft: 6, fontSize: 'clamp(12px, 3vw, 13px)' }}> MORNING</span>}
                    </div>
                    <span style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)' }}>
                      {o.timeSlot || new Date(o.orderTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="kds-card-body">
                    <div style={{ fontWeight: 700, fontSize: 'clamp(12px, 3vw, 17px)', marginBottom: 4 }}> {o.customerName}</div>
                    <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)', marginBottom: 8 }}> {o.customerAddress}</div>
                    <div className="kds-items">
                      {o.items.map((item, i) => (
                        <div key={i} className="kds-item">
                          <span style={{ fontWeight: 700 }}>{item.qty}x</span> {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="kds-card-footer" style={{ textAlign: 'center', fontSize: 'clamp(12px, 3vw, 16px)', color: 'var(--text-muted)', padding: '10px 0' }}>
                     Waiting for dispatch...
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
}
