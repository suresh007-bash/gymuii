import { useState, useMemo } from 'react';
import StatIcon from '../../components/StatIcon';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';

const RATE_PER_DELIVERY = 85;
const AVG_MINUTES_PER_DELIVERY = 25;

export default function DeliveryHistory() {
  const { user } = useAuth();
  const { getOrdersByDriver } = useOrders();
  const [filter, setFilter] = useState('all'); // 'all', 'week', 'month'

  const completed = getOrdersByDriver(user?.id).filter(o => o.status === 'delivered');

  // Group deliveries by day
  const dayWise = useMemo(() => {
    const map = {};
    completed.forEach(o => {
      const dateStr = (o.deliveredAt || o.orderTime || '').split('T')[0];
      if (!dateStr) return;
      if (!map[dateStr]) map[dateStr] = { date: dateStr, deliveries: 0, earnings: 0, codCollected: 0, orderTotal: 0 };
      map[dateStr].deliveries += 1;
      map[dateStr].earnings += RATE_PER_DELIVERY;
      map[dateStr].orderTotal += (o.total || 0);
      if (o.paymentMethod === 'COD') map[dateStr].codCollected += (o.total || 0);
    });
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [completed]);

  // Filter by time range
  const now = new Date();
  const filtered = useMemo(() => {
    if (filter === 'all') return dayWise;
    const days = filter === 'week' ? 7 : 30;
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - days);
    const cutStr = cutoff.toISOString().split('T')[0];
    return dayWise.filter(d => d.date >= cutStr);
  }, [dayWise, filter]);

  // Totals
  const totalDeliveries = filtered.reduce((a, d) => a + d.deliveries, 0);
  const totalEarnings = filtered.reduce((a, d) => a + d.earnings, 0);
  const totalCOD = filtered.reduce((a, d) => a + d.codCollected, 0);
  const totalHours = Math.round((totalDeliveries * AVG_MINUTES_PER_DELIVERY) / 60 * 10) / 10;
  const totalDays = filtered.length;
  const avgPerDay = totalDays > 0 ? Math.round(totalDeliveries / totalDays) : 0;
  const avgEarnPerDay = totalDays > 0 ? Math.round(totalEarnings / totalDays) : 0;
  const bestDay = filtered.length > 0 ? filtered.reduce((best, d) => d.deliveries > best.deliveries ? d : best, filtered[0]) : null;

  const formatDate = (str) => {
    const d = new Date(str + 'T00:00:00');
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    if (str === today) return 'Today';
    if (str === yStr) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getHours = (count) => {
    const mins = count * AVG_MINUTES_PER_DELIVERY;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <DashboardLayout title="Delivery History & Earnings">
      {/* Summary Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { icon: <StatIcon name="check" />, val: totalDeliveries, label: 'Total Deliveries', color: '#22c55e' },
          { icon: <StatIcon name="revenue" />, val: `₹${totalEarnings}`, label: 'Total Earned', color: '#f97316' },
          { icon: <StatIcon name="calendar" />, val: `${totalHours}h`, label: 'Total Hours', color: '#3b82f6' },
          { icon: <StatIcon name="bike" />, val: avgPerDay, label: 'Avg / Day', color: '#8b5cf6' },
          { icon: <StatIcon name="revenue" />, val: `₹${avgEarnPerDay}`, label: 'Avg Earn / Day', color: '#ec4899' },
          { icon: <StatIcon name="star" />, val: user?.rating || '4.8', label: 'Rating', color: '#eab308' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}> All Time</button>
        <button className={`tab ${filter === 'month' ? 'active' : ''}`} onClick={() => setFilter('month')}> Last 30 Days</button>
        <button className={`tab ${filter === 'week' ? 'active' : ''}`} onClick={() => setFilter('week')}> Last 7 Days</button>
      </div>

      {/* Best Day Highlight */}
      {bestDay && (
        <div style={{ padding: '14px 20px', marginBottom: 16, background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(234,179,8,0.08))', borderRadius: 14, border: '1px solid rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 'clamp(19px, 3vw, 26px)' }}></span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'clamp(12px, 3vw, 17px)', fontFamily: 'Outfit' }}>Best Day — {formatDate(bestDay.date)}</div>
              <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)' }}>{bestDay.deliveries} deliveries • {getHours(bestDay.deliveries)} active</div>
            </div>
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(16px, 3vw, 22px)', color: '#22c55e' }}>₹{bestDay.earnings}</div>
        </div>
      )}

      {/* Day-wise Breakdown Table */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><h3 className="card-title"> Day-wise Breakdown</h3></div>
        {filtered.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>No delivery data found</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Deliveries</th>
                <th>Hours</th>
                <th>Earnings</th>
                <th>COD Collected</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const perf = d.deliveries >= 8 ? { label: ' Excellent', color: '#22c55e' } :
                             d.deliveries >= 5 ? { label: ' Good', color: '#3b82f6' } :
                             d.deliveries >= 3 ? { label: ' Fair', color: '#f97316' } :
                             { label: ' Low', color: 'var(--text-muted)' };
                return (
                  <tr key={d.date}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 'clamp(12px, 3vw, 17px)' }}>{formatDate(d.date)}</div>
                      <div style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: 'var(--text-muted)' }}>{d.date}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(15px, 3vw, 20px)', color: 'var(--text-primary)' }}>{d.deliveries}</span>
                      <span style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)', marginLeft: 4 }}>orders</span>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: 'clamp(12px, 3vw, 17px)' }}> {getHours(d.deliveries)}</td>
                    <td style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(14px, 3vw, 19px)', color: '#22c55e' }}>₹{d.earnings}</td>
                    <td>
                      {d.codCollected > 0 ? (
                        <span style={{ fontWeight: 700, fontSize: 'clamp(12px, 3vw, 17px)', color: '#f97316' }}>₹{d.codCollected}</span>
                      ) : (
                        <span style={{ fontSize: 'clamp(12px, 3vw, 16px)', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td><span style={{ fontSize: 'clamp(12px, 3vw, 15px)', fontWeight: 700, color: perf.color }}>{perf.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Earnings Breakdown Card */}
      <div className="card">
        <div className="card-header"><h3 className="card-title"> Earnings Summary</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12 }}>
          <div style={{ padding: 16, background: 'rgba(34,197,94,0.06)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)', fontWeight: 700 }}>Delivery Fees</div>
            <div style={{ fontFamily: 'Outfit', fontSize: 'clamp(21px, 3vw, 28px)', fontWeight: 900, color: '#22c55e' }}>₹{totalEarnings}</div>
            <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)' }}>₹{RATE_PER_DELIVERY} × {totalDeliveries}</div>
          </div>
          <div style={{ padding: 16, background: 'rgba(249,115,22,0.06)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)', fontWeight: 700 }}>COD Collected</div>
            <div style={{ fontFamily: 'Outfit', fontSize: 'clamp(21px, 3vw, 28px)', fontWeight: 900, color: '#f97316' }}>₹{totalCOD}</div>
            <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)' }}>To deposit to kitchen</div>
          </div>
          <div style={{ padding: 16, background: 'rgba(59,130,246,0.06)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)', fontWeight: 700 }}>Working Days</div>
            <div style={{ fontFamily: 'Outfit', fontSize: 'clamp(21px, 3vw, 28px)', fontWeight: 900, color: '#3b82f6' }}>{totalDays}</div>
            <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)' }}>{totalHours} hours total</div>
          </div>
          <div style={{ padding: 16, background: 'rgba(139,92,246,0.06)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)', fontWeight: 700 }}>Net Payout</div>
            <div style={{ fontFamily: 'Outfit', fontSize: 'clamp(21px, 3vw, 28px)', fontWeight: 900, color: '#8b5cf6' }}>₹{totalEarnings}</div>
            <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)' }}>Your total earnings</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
