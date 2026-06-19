import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';

function Ring({ val, max, color, label, unit }) {
  const pct = Math.min(100, Math.round((val / max) * 100));
  const isOver = val > max;
  const r = 42, c = 2 * Math.PI * r, off = c - (Math.min(pct, 100) / 100) * c;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth="9" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={isOver ? '#ef4444' : color} strokeWidth="9"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }} />
        <text x="55" y="50" textAnchor="middle" fontSize="20" fontWeight="900" fill={isOver ? '#ef4444' : 'var(--text-primary)'} fontFamily="Outfit">{val}</text>
        <text x="55" y="66" textAnchor="middle" fontSize="10" fill="var(--text-muted)">{unit}</text>
      </svg>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 9, color: isOver ? '#ef4444' : 'var(--text-muted)', fontWeight: 600 }}>
        {isOver ? `⚠️ +${val - max} over` : pct >= 100 ? '🎯 Target hit!' : `${max - val}${unit} left`}
      </div>
    </div>
  );
}

export default function ClientNutrition() {
  const { user } = useAuth();
  const { getTodayNutrition, getOrdersByUser } = useOrders();
  const today = new Date().toISOString().split('T')[0];
  const nutrition = getTodayNutrition(user?.id);

  // Sync targets from Home page (localStorage)
  const [targets, setTargets] = useState(() => JSON.parse(localStorage.getItem('synnoviq_targets') || 'null') || { calories: 2500, protein: 180, carbs: 280, fat: 80 });

  // Listen for storage changes (when Home page updates targets)
  useEffect(() => {
    const syncTargets = () => {
      const saved = JSON.parse(localStorage.getItem('synnoviq_targets') || 'null');
      if (saved) setTargets(saved);
    };
    window.addEventListener('storage', syncTargets);
    // Also poll every 2s for same-tab updates
    const interval = setInterval(syncTargets, 2000);
    return () => { window.removeEventListener('storage', syncTargets); clearInterval(interval); };
  }, []);

  const allOrders = getOrdersByUser(user?.id).filter(o => o.status !== 'cancelled');
  const todayOrders = allOrders.filter(o => o.orderTime.startsWith(today));

  // Build nutrition history — group orders by date
  const historyMap = {};
  allOrders.forEach(o => {
    const dateKey = o.orderTime.split('T')[0];
    if (!historyMap[dateKey]) historyMap[dateKey] = { calories: 0, protein: 0, carbs: 0, fat: 0, orders: 0 };
    historyMap[dateKey].orders += 1;
    (o.items || []).forEach(item => {
      const qty = item.qty || 1;
      historyMap[dateKey].calories += (item.calories || 0) * qty;
      historyMap[dateKey].protein += (item.protein || 0) * qty;
      historyMap[dateKey].carbs += (item.carbs || 0) * qty;
      historyMap[dateKey].fat += (item.fat || 0) * qty;
    });
  });

  // Sort dates descending, exclude today (shown separately)
  const historyDates = Object.keys(historyMap).filter(d => d !== today).sort((a, b) => b.localeCompare(a));

  // Streak: consecutive days with orders
  const sortedDates = Object.keys(historyMap).sort((a, b) => b.localeCompare(a));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const check = d.toISOString().split('T')[0];
    if (historyMap[check]) { streak++; d.setDate(d.getDate() - 1); } else break;
  }

  const fmtDate = (ds) => new Date(ds).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  const totalPct = Math.round((nutrition.calories / targets.calories) * 100);

  return (
    <DashboardLayout title="Nutrition Tracker">
      {/* Hero */}
      <div className="hero-banner"><div className="hero-tag">NUTRITION</div>
        <div className="hero-title">Today's Nutrition</div>
        <div className="hero-subtitle">{todayOrders.length > 0 ? `${todayOrders.length} meal${todayOrders.length > 1 ? 's' : ''} tracked today` : 'No meals tracked today — order from the menu!'}</div>
        <div className="hero-stats"><div><div className="hero-stat-val">🔥 {streak}</div><div className="hero-stat-lbl">Day Streak</div></div><div><div className="hero-stat-val">📦 {allOrders.length}</div><div className="hero-stat-lbl">Total Orders</div></div></div>
      </div>

      {/* Today's Macro Rings */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">📊 Today's Macro Progress</h3>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🎯 Targets synced from Home</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, justifyItems: 'center', padding: '16px 0' }}>
          <Ring val={nutrition.calories} max={targets.calories} color="#f97316" label="Calories" unit=" kcal" />
          <Ring val={nutrition.protein} max={targets.protein} color="#22c55e" label="Protein" unit="g" />
          <Ring val={nutrition.carbs} max={targets.carbs} color="#3b82f6" label="Carbs" unit="g" />
          <Ring val={nutrition.fat} max={targets.fat} color="#8b5cf6" label="Fat" unit="g" />
        </div>
        {todayOrders.length > 0 && (
          <div style={{ textAlign: 'center', padding: '4px 0 12px', fontSize: 13, fontWeight: 700, color: totalPct >= 100 ? '#22c55e' : totalPct >= 80 ? '#f97316' : 'var(--text-muted)' }}>
            {totalPct >= 100 ? '🎉 You hit your daily calorie target!' : totalPct >= 80 ? `🔥 ${totalPct}% — almost there!` : `📊 ${totalPct}% of daily calorie goal`}
          </div>
        )}
      </div>

      {/* Daily Targets Bars */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title">🎯 Daily Targets</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[['Calories', nutrition.calories, targets.calories, 'kcal', '#f97316'], ['Protein', nutrition.protein, targets.protein, 'g', '#22c55e'], ['Carbs', nutrition.carbs, targets.carbs, 'g', '#3b82f6'], ['Fat', nutrition.fat, targets.fat, 'g', '#8b5cf6']].map(([name, val, max, unit, color]) => (
            <div key={name} style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontWeight: 700, fontSize: 13 }}>{name}</span><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{val}/{max}{unit}</span></div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (val / max) * 100)}%`, height: '100%', background: val > max ? '#ef4444' : color, borderRadius: 4, transition: 'width 1s ease' }} />
              </div>
              <div style={{ fontSize: 10, color: val >= max ? (val > max ? '#ef4444' : color) : 'var(--text-muted)', fontWeight: 700, marginTop: 4 }}>
                {val > max ? `⚠️ Over by ${val - max}${unit}` : val >= max ? '🎯 Target reached!' : `${max - val}${unit} remaining`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Meals */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title">🍽️ Today's Meals</h3></div>
        {todayOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div>
            <p>No meals today yet. <a href={`/${user?.role === 'owner' ? 'owner' : user?.role === 'trainer' ? 'trainer' : 'client'}/menu`} style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>Browse Menu →</a></p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayOrders.map(o => (
              <div key={o.id} style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{o.items.map(i => i.name).join(', ')}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(o.orderTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • #{o.id}</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316' }}>🔥 {o.items.reduce((a, i) => a + (i.calories || 0) * (i.qty || 1), 0)}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>💪 {o.items.reduce((a, i) => a + (i.protein || 0) * (i.qty || 1), 0)}g</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nutrition History */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">📅 Nutrition History</h3></div>
        {historyDates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 13 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
            No past nutrition data yet. Your history will appear here after each day.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {historyDates.slice(0, 14).map(dateStr => {
              const data = historyMap[dateStr];
              const calPct = Math.round((data.calories / targets.calories) * 100);
              const hitTarget = calPct >= 100;
              return (
                <div key={dateStr} style={{
                  padding: 14, borderRadius: 12, border: `1.5px solid ${hitTarget ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
                  background: hitTarget ? 'rgba(34,197,94,0.03)' : 'var(--bg-tertiary)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 13 }}>{fmtDate(dateStr)}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{data.orders} order{data.orders > 1 ? 's' : ''}</span>
                    </div>
                    {hitTarget ? (
                      <span className="badge badge-green" style={{ fontSize: 9 }}>🎯 TARGET HIT</span>
                    ) : (
                      <span className="badge badge-orange" style={{ fontSize: 9 }}>{calPct}%</span>
                    )}
                  </div>
                  {/* Mini progress bars */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {[
                      { label: '🔥 Cal', val: data.calories, max: targets.calories, color: '#f97316', unit: '' },
                      { label: '💪 Pro', val: data.protein, max: targets.protein, color: '#22c55e', unit: 'g' },
                      { label: '🌾 Carb', val: data.carbs, max: targets.carbs, color: '#3b82f6', unit: 'g' },
                      { label: '🥑 Fat', val: data.fat, max: targets.fat, color: '#8b5cf6', unit: 'g' },
                    ].map(n => (
                      <div key={n.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 3 }}>
                          <span>{n.label}</span><span>{n.val}{n.unit}</span>
                        </div>
                        <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, (n.val / n.max) * 100)}%`, height: '100%', background: n.val > n.max ? '#ef4444' : n.color, borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {historyDates.length > 14 && (
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: 8 }}>
                Showing last 14 days of {historyDates.length} total
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
