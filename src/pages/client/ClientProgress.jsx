import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';

export default function ClientProgress() {
  const { user } = useAuth();
  const { getOrdersByUser } = useOrders();
  const allOrders = getOrdersByUser(user?.id).filter(o => o.status !== 'cancelled').sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
  const [tab, setTab] = useState('overview');

  // Group orders by date
  const byDate = {};
  allOrders.forEach(o => {
    const d = o.orderTime.split('T')[0];
    if (!byDate[d]) byDate[d] = { calories: 0, protein: 0, carbs: 0, fat: 0, orders: 0, spent: 0 };
    byDate[d].orders++;
    byDate[d].spent += o.total || 0;
    o.items.forEach(item => {
      byDate[d].calories += (item.calories || 0) * (item.qty || 1);
      byDate[d].protein += (item.protein || 0) * (item.qty || 1);
      byDate[d].carbs += (item.carbs || 0) * (item.qty || 1);
      byDate[d].fat += (item.fat || 0) * (item.qty || 1);
    });
  });

  const dates = Object.keys(byDate).sort().reverse();
  const last7 = dates.slice(0, 7).reverse();
  const calTarget = user?.targetCalories || 2200;
  const proTarget = user?.targetProtein || 150;

  // Stats
  const totalOrders = allOrders.length;
  const totalSpent = allOrders.reduce((a, o) => a + (o.total || 0), 0);
  const avgCalories = dates.length > 0 ? Math.round(dates.reduce((a, d) => a + byDate[d].calories, 0) / dates.length) : 0;
  const daysOnTarget = dates.filter(d => byDate[d].calories >= calTarget * 0.8).length;

  // Bar chart max
  const maxCal = Math.max(calTarget, ...last7.map(d => byDate[d]?.calories || 0));

  return (
    <DashboardLayout title="Progress Analytics">
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>📊 Overview</button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>📅 Nutrition History</button>
        <button className={`tab ${tab === 'goals' ? 'active' : ''}`} onClick={() => setTab('goals')}>🎯 Goal Progress</button>
      </div>

      {tab === 'overview' && (<>
        <div className="stats-grid">
          {[{ icon: '📦', val: totalOrders, label: 'Total Orders', color: '#f97316' }, { icon: '💰', val: `₹${totalSpent.toLocaleString()}`, label: 'Total Spent', color: '#22c55e' }, { icon: '🔥', val: avgCalories, label: 'Avg Calories/Day', color: '#3b82f6' }, { icon: '🎯', val: daysOnTarget, label: 'Days On Target', color: '#8b5cf6' }].map((s, i) => (
            <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-value" style={{ color: s.color }}>{s.val}</div><div className="stat-label">{s.label}</div></div>
          ))}
        </div>

        {/* Weekly Calorie Chart */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h3 className="card-title">🔥 Weekly Calorie Intake</h3><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Target: {calTarget} kcal/day</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, padding: '16px 0' }}>
            {last7.map(d => {
              const cal = byDate[d]?.calories || 0;
              const h = maxCal > 0 ? (cal / maxCal) * 150 : 0;
              const onTarget = cal >= calTarget * 0.8;
              return (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, marginBottom: 4, color: onTarget ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{cal}</span>
                  <div style={{ width: '100%', height: h, background: onTarget ? 'var(--accent-green)' : 'var(--accent-orange)', borderRadius: '8px 8px 0 0', transition: 'height 0.5s ease', minHeight: 4 }} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{d.slice(5)}</span>
                </div>
              );
            })}
          </div>
          {/* Target line label */}
          <div style={{ fontSize: 11, textAlign: 'center', color: 'var(--text-muted)' }}>🟢 On target (&ge;80%) &nbsp; 🟠 Below target</div>
        </div>

        {/* Protein Chart */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">💪 Weekly Protein Intake</h3><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Target: {proTarget}g/day</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 150, padding: '16px 0' }}>
            {last7.map(d => {
              const pro = byDate[d]?.protein || 0;
              const h = proTarget > 0 ? (pro / proTarget) * 120 : 0;
              return (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>{pro}g</span>
                  <div style={{ width: '100%', height: Math.min(h, 120), background: pro >= proTarget ? '#22c55e' : '#3b82f6', borderRadius: '8px 8px 0 0', transition: 'height 0.5s', minHeight: 4 }} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{d.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </>)}

      {tab === 'history' && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">📅 Nutrition History</h3></div>
          {dates.length === 0 ? <p style={{ color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>No nutrition data yet. Place orders to see your history!</p> :
          <table className="data-table">
            <thead><tr><th>Date</th><th>Orders</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>Spent</th><th>Status</th></tr></thead>
            <tbody>{dates.map(d => (
              <tr key={d}>
                <td style={{ fontWeight: 700 }}>{d}</td>
                <td>{byDate[d].orders}</td>
                <td style={{ fontWeight: 700, color: byDate[d].calories >= calTarget * 0.8 ? '#22c55e' : '#f97316' }}>🔥 {byDate[d].calories}</td>
                <td>💪 {byDate[d].protein}g</td>
                <td>🌾 {byDate[d].carbs}g</td>
                <td>🥑 {byDate[d].fat}g</td>
                <td style={{ fontWeight: 700 }}>₹{byDate[d].spent}</td>
                <td><span className={`badge ${byDate[d].calories >= calTarget * 0.8 ? 'badge-green' : 'badge-orange'}`}>{byDate[d].calories >= calTarget * 0.8 ? '🎯 On Target' : '📉 Below'}</span></td>
              </tr>
            ))}</tbody>
          </table>}
        </div>
      )}

      {tab === 'goals' && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header"><h3 className="card-title">🏆 Fitness Goal</h3></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🎯</div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{user?.goal || 'Not Set'}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Current weight: {user?.weight || '—'}kg • Target calories: {calTarget} kcal/day</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Diet: {user?.diet || 'Not Set'} • Allergies: {user?.allergies || 'None'}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header"><h3 className="card-title">📊 Daily Targets</h3></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[['Calories', calTarget, 'kcal', '#f97316'], ['Protein', proTarget, 'g', '#22c55e'], ['Carbs', user?.targetCarbs || 250, 'g', '#3b82f6'], ['Fat', user?.targetFat || 70, 'g', '#8b5cf6']].map(([name, val, unit, color]) => (
                <div key={name} style={{ textAlign: 'center', padding: 20, background: 'var(--bg-tertiary)', borderRadius: 16 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: 'Outfit' }}>{val}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>{name} ({unit})</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">🏅 Achievements</h3></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[{ icon: '🔥', title: 'First Order', desc: 'Placed your first order', done: totalOrders >= 1 }, { icon: '💪', title: '5 Orders', desc: 'Reached 5 total orders', done: totalOrders >= 5 }, { icon: '🎯', title: 'On Target', desc: 'Hit calorie target for a day', done: daysOnTarget >= 1 }, { icon: '📅', title: '7-Day Streak', desc: 'Ordered 7 consecutive days', done: dates.length >= 7 }, { icon: '🏋️', title: 'Protein King', desc: 'Hit protein target 3 times', done: dates.filter(d => byDate[d].protein >= proTarget).length >= 3 }, { icon: '⭐', title: 'Loyal Member', desc: 'Spent ₹5000+ total', done: totalSpent >= 5000 }].map((a, i) => (
                <div key={i} style={{ textAlign: 'center', padding: 16, background: a.done ? 'rgba(34,197,94,0.06)' : 'var(--bg-tertiary)', borderRadius: 12, border: a.done ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)', opacity: a.done ? 1 : 0.5 }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{a.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.desc}</div>
                  {a.done && <span className="badge badge-green" style={{ marginTop: 6 }}>✅ Unlocked</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
