import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatIcon from '../../components/StatIcon';
import { Icon, BarChart3, Calendar, Target, Flame, Beef, Wheat, Droplets, Trophy, Medal, CheckCircle2, TrendingUp } from '../../components/Icons';
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
        <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}><Icon icon={BarChart3} size={12} style={{marginRight:4}} /> Overview</button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}><Icon icon={Calendar} size={12} style={{marginRight:4}} /> Nutrition History</button>
        <button className={`tab ${tab === 'goals' ? 'active' : ''}`} onClick={() => setTab('goals')}><Icon icon={Target} size={12} style={{marginRight:4}} /> Goal Progress</button>
      </div>

      {tab === 'overview' && (<>
        <div className="stats-grid">
          {[{ icon: <StatIcon name="orders" />, val: totalOrders, label: 'Total Orders', color: '#f97316' }, { icon: <StatIcon name="revenue" />, val: `₹${totalSpent.toLocaleString()}`, label: 'Total Spent', color: '#22c55e' }, { icon: <StatIcon name="calories" />, val: avgCalories, label: 'Avg Calories/Day', color: '#3b82f6' }, { icon: <StatIcon name="target" />, val: daysOnTarget, label: 'Days On Target', color: '#8b5cf6' }].map((s, i) => (
            <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-value" style={{ color: s.color }}>{s.val}</div><div className="stat-label">{s.label}</div></div>
          ))}
        </div>

        {/* Weekly Calorie Chart */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h3 className="card-title" style={{display:'flex',alignItems:'center',gap:6}}><Flame size={16} color="#f97316" /> Weekly Calorie Intake</h3><span style={{ fontSize: 'clamp(12px, 3vw, 16px)', color: 'var(--text-muted)' }}>Target: {calTarget} kcal/day</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, padding: '16px 0' }}>
            {last7.map(d => {
              const cal = byDate[d]?.calories || 0;
              const h = maxCal > 0 ? (cal / maxCal) * 150 : 0;
              const onTarget = cal >= calTarget * 0.8;
              return (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 700, marginBottom: 4, color: onTarget ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{cal}</span>
                  <div style={{ width: '100%', height: h, background: onTarget ? 'var(--accent-green)' : 'var(--accent-orange)', borderRadius: '8px 8px 0 0', transition: 'height 0.5s ease', minHeight: 4 }} />
                  <span style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: 'var(--text-muted)', marginTop: 4 }}>{d.slice(5)}</span>
                </div>
              );
            })}
          </div>
          {/* Target line label */}
          <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', textAlign: 'center', color: 'var(--text-muted)' }}> On target (&ge;80%) &nbsp; Below target</div>
        </div>

        {/* Protein Chart */}
        <div className="card">
          <div className="card-header"><h3 className="card-title" style={{display:'flex',alignItems:'center',gap:6}}><Beef size={16} color="#22c55e" /> Weekly Protein Intake</h3><span style={{ fontSize: 'clamp(12px, 3vw, 16px)', color: 'var(--text-muted)' }}>Target: {proTarget}g/day</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 150, padding: '16px 0' }}>
            {last7.map(d => {
              const pro = byDate[d]?.protein || 0;
              const h = proTarget > 0 ? (pro / proTarget) * 120 : 0;
              return (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 700, marginBottom: 4 }}>{pro}g</span>
                  <div style={{ width: '100%', height: Math.min(h, 120), background: pro >= proTarget ? '#22c55e' : '#3b82f6', borderRadius: '8px 8px 0 0', transition: 'height 0.5s', minHeight: 4 }} />
                  <span style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: 'var(--text-muted)', marginTop: 4 }}>{d.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </>)}

      {tab === 'history' && (
        <div className="card">
          <div className="card-header"><h3 className="card-title" style={{display:'flex',alignItems:'center',gap:6}}><Calendar size={16} /> Nutrition History</h3></div>
          {dates.length === 0 ? <p style={{ color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>No nutrition data yet. Place orders to see your history!</p> :
          <table className="data-table">
            <thead><tr><th>Date</th><th>Orders</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>Spent</th><th>Status</th></tr></thead>
            <tbody>{dates.map(d => (
              <tr key={d}>
                <td style={{ fontWeight: 700 }}>{d}</td>
                <td>{byDate[d].orders}</td>
                <td style={{ fontWeight: 700, color: byDate[d].calories >= calTarget * 0.8 ? '#22c55e' : '#f97316' }}><Flame size={10} style={{marginRight:2}} /> {byDate[d].calories}</td>
                <td><Beef size={10} style={{marginRight:2}} /> {byDate[d].protein}g</td>
                <td><Wheat size={10} style={{marginRight:2}} /> {byDate[d].carbs}g</td>
                <td><Droplets size={10} style={{marginRight:2}} /> {byDate[d].fat}g</td>
                <td style={{ fontWeight: 700 }}>₹{byDate[d].spent}</td>
                <td><span className={`badge ${byDate[d].calories >= calTarget * 0.8 ? 'badge-green' : 'badge-orange'}`}>{byDate[d].calories >= calTarget * 0.8 ? <><Target size={10} style={{marginRight:3}} /> On Target</> : <><TrendingUp size={10} style={{marginRight:3}} /> Below</>}</span></td>
              </tr>
            ))}</tbody>
          </table>}
        </div>
      )}

      {tab === 'goals' && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header"><h3 className="card-title" style={{display:'flex',alignItems:'center',gap:6}}><Trophy size={16} color="#f97316" /> Fitness Goal</h3></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(27px, 3vw, 36px)' }}><Target size={32} color="#fff" /></div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: 'clamp(21px, 3vw, 28px)', fontWeight: 900, marginBottom: 4 }}>{user?.goal || 'Not Set'}</div>
                <div style={{ fontSize: 'clamp(12px, 3vw, 17px)', color: 'var(--text-muted)' }}>Current weight: {user?.weight || '—'}kg • Target calories: {calTarget} kcal/day</div>
                <div style={{ fontSize: 'clamp(12px, 3vw, 16px)', color: 'var(--text-muted)' }}>Diet: {user?.diet || 'Not Set'} • Allergies: {user?.allergies || 'None'}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header"><h3 className="card-title" style={{display:'flex',alignItems:'center',gap:6}}><BarChart3 size={16} /> Daily Targets</h3></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 12 }}>
              {[['Calories', calTarget, 'kcal', '#f97316'], ['Protein', proTarget, 'g', '#22c55e'], ['Carbs', user?.targetCarbs || 250, 'g', '#3b82f6'], ['Fat', user?.targetFat || 70, 'g', '#8b5cf6']].map(([name, val, unit, color]) => (
                <div key={name} style={{ textAlign: 'center', padding: 20, background: 'var(--bg-tertiary)', borderRadius: 16 }}>
                  <div style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 900, color, fontFamily: 'Outfit' }}>{val}</div>
                  <div style={{ fontSize: 'clamp(12px, 3vw, 16px)', color: 'var(--text-muted)', fontWeight: 700 }}>{name} ({unit})</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title" style={{display:'flex',alignItems:'center',gap:6}}><Medal size={16} color="#f97316" /> Achievements</h3></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 12 }}>
              {[{ icon: <StatIcon name="calories" />, title: 'First Order', desc: 'Placed your first order', done: totalOrders >= 1 }, { icon: <StatIcon name="protein" />, title: '5 Orders', desc: 'Reached 5 total orders', done: totalOrders >= 5 }, { icon: <StatIcon name="target" />, title: 'On Target', desc: 'Hit calorie target for a day', done: daysOnTarget >= 1 }, { icon: <StatIcon name="calendar" />, title: '7-Day Streak', desc: 'Ordered 7 consecutive days', done: dates.length >= 7 }, { icon: <StatIcon name="dumbbell" />, title: 'Protein King', desc: 'Hit protein target 3 times', done: dates.filter(d => byDate[d].protein >= proTarget).length >= 3 }, { icon: <StatIcon name="star" />, title: 'Loyal Member', desc: 'Spent ₹5000+ total', done: totalSpent >= 5000 }].map((a, i) => (
                <div key={i} style={{ textAlign: 'center', padding: 16, background: a.done ? 'rgba(34,197,94,0.06)' : 'var(--bg-tertiary)', borderRadius: 12, border: a.done ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)', opacity: a.done ? 1 : 0.5 }}>
                  <div style={{ fontSize: 'clamp(24px, 3vw, 32px)', marginBottom: 6 }}>{a.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 'clamp(12px, 3vw, 17px)' }}>{a.title}</div>
                  <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)' }}>{a.desc}</div>
                  {a.done && <span className="badge badge-green" style={{ marginTop: 6 }}><CheckCircle2 size={10} style={{marginRight:3}} /> Unlocked</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
