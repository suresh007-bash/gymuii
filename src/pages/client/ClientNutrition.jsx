import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatIcon from '../../components/StatIcon';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { getMenuItems } from '../../data/menuHelper';

function Ring({ val, max, color, label, unit }) {
  const [displayed, setDisplayed] = useState(0);
  const prevVal = useRef(0);
  useEffect(() => {
    const start = performance.now(), from = prevVal.current, to = val, dur = 1200;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    let raf;
    const step = (now) => { const p = Math.min((now - start) / dur, 1); setDisplayed(Math.round(from + (to - from) * ease(p))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => { prevVal.current = displayed; cancelAnimationFrame(raf); };
  }, [val]);
  const pct = Math.min(100, Math.round((displayed / max) * 100));
  const isOver = val > max;
  const r = 42, c = 2 * Math.PI * r, off = c - (Math.min(pct, 100) / 100) * c;
  const gradId = `nr-${label}-${color.replace('#', '')}`;
  const dotAngle = (Math.min(pct, 100) / 100) * 2 * Math.PI;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isOver ? '#ef4444' : color} />
            <stop offset="100%" stopColor={`${isOver ? '#ef4444' : color}88`} />
          </linearGradient>
        </defs>
        <circle cx="55" cy="55" r={r} fill="none" stroke={`${color}18`} strokeWidth="9" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={`url(#${gradId})`} strokeWidth="9"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 55 55)" />
        {pct > 3 && <circle cx={55 + r * Math.cos(dotAngle - Math.PI/2)} cy={55 + r * Math.sin(dotAngle - Math.PI/2)} r="6" fill={isOver ? '#ef4444' : color} style={{ filter: `drop-shadow(0 0 4px ${isOver ? '#ef4444' : color})`, opacity: 0.8 }} />}
        <text x="55" y="50" textAnchor="middle" fontSize="20" fontWeight="900" fill={isOver ? '#ef4444' : 'var(--text-primary)'} fontFamily="Outfit">{displayed}</text>
        <text x="55" y="66" textAnchor="middle" fontSize="10" fill="var(--text-muted)">{unit}</text>
      </svg>
    </div>
  );
}

export default function ClientNutrition() {
  const { user } = useAuth();
  const { getTodayNutrition, getOrdersByUser } = useOrders();
  const today = new Date().toISOString().split('T')[0];
  const nutrition = getTodayNutrition(user?.id);

  const [menuItems] = useState(() => getMenuItems());
  const [showProteinModal, setShowProteinModal] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState(() => {
    const items = getMenuItems();
    return items && items.length > 0 ? items[0].id : '';
  });
  const [selectedMacro, setSelectedMacro] = useState('protein');

  const MACROS = [
    { id: 'calories', label: 'Calories', icon: '🔥', color: '#f97316', unit: ' kcal', range: 50 },
    { id: 'protein', label: 'Protein', icon: '💪', color: '#22c55e', unit: 'g', range: 5 },
    { id: 'carbs', label: 'Carbs', icon: '🌾', color: '#3b82f6', unit: 'g', range: 10 },
    { id: 'fat', label: 'Fat', icon: '🥑', color: '#eab308', unit: 'g', range: 5 }
  ];
  const activeMacro = MACROS.find(m => m.id === selectedMacro) || MACROS[1];

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

  const selectedFood = menuItems.find(m => m.id === selectedFoodId) || menuItems[0];
  const similarFoods = selectedFood
    ? menuItems
        .filter(m => m.id !== selectedFood.id && Math.abs((m[activeMacro.id] || 0) - (selectedFood[activeMacro.id] || 0)) <= activeMacro.range)
        .sort((a, b) => Math.abs((a[activeMacro.id] || 0) - (selectedFood[activeMacro.id] || 0)) - Math.abs((b[activeMacro.id] || 0) - (selectedFood[activeMacro.id] || 0)))
        .slice(0, 5)
    : [];

  return (
    <DashboardLayout title="Nutrition Tracker">
      {/* Hero */}
      <div className="hero-banner"><div className="hero-tag">NUTRITION</div>
        <div className="hero-title">Today's Nutrition</div>
        <div className="hero-subtitle">{todayOrders.length > 0 ? `${todayOrders.length} meal${todayOrders.length > 1 ? 's' : ''} tracked today` : 'No meals tracked today — order from the menu!'}</div>
        <div className="hero-stats"><div><div className="hero-stat-val">🔥 {streak}</div><div className="hero-stat-lbl">Day Streak</div></div><div><div className="hero-stat-val">📦 {allOrders.length}</div><div className="hero-stat-lbl">Total Orders</div></div></div>
      </div>

      {/* Today's Macro Progress Diagram based on Preference */}
      <div className="card" style={{ marginBottom: 20 }}>


        {/* 1. Circular Rings */}
        {(!user?.preferredDiagram || user?.preferredDiagram === 'ring') && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 16, justifyItems: 'center', padding: '16px 0' }}>
            <div onClick={() => { setSelectedMacro('calories'); setShowProteinModal(true); }} style={{ cursor: 'pointer' }} title="Click for Calories breakdown & alternatives">
              <Ring val={nutrition.calories} max={targets.calories} color="#f97316" label="Calories" unit="kcal" />
            </div>
            <div onClick={() => { setSelectedMacro('protein'); setShowProteinModal(true); }} style={{ cursor: 'pointer' }} title="Click for Protein breakdown & alternatives">
              <Ring val={nutrition.protein} max={targets.protein} color="#22c55e" label="Protein" unit="g" />
            </div>
            <div onClick={() => { setSelectedMacro('carbs'); setShowProteinModal(true); }} style={{ cursor: 'pointer' }} title="Click for Carbs breakdown & alternatives">
              <Ring val={nutrition.carbs} max={targets.carbs} color="#3b82f6" label="Carbs" unit="g" />
            </div>
            <div onClick={() => { setSelectedMacro('fat'); setShowProteinModal(true); }} style={{ cursor: 'pointer' }} title="Click for Fat breakdown & alternatives">
              <Ring val={nutrition.fat} max={targets.fat} color="#8b5cf6" label="Fat" unit="g" />
            </div>
          </div>
        )}

        {/* 2. Bar Chart Progress */}
        {user?.preferredDiagram === 'bar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px' }}>
            {[
              { name: 'Calories', val: nutrition.calories, max: targets.calories, unit: 'kcal', color: '#f97316', icon: <StatIcon name="calories" />, onClick: () => { setSelectedMacro('calories'); setShowProteinModal(true); } },
              { name: 'Protein', val: nutrition.protein, max: targets.protein, unit: 'g', color: '#22c55e', icon: <StatIcon name="protein" />, onClick: () => { setSelectedMacro('protein'); setShowProteinModal(true); } },
              { name: 'Carbs', val: nutrition.carbs, max: targets.carbs, unit: 'g', color: '#3b82f6', icon: <StatIcon name="carbs" />, onClick: () => { setSelectedMacro('carbs'); setShowProteinModal(true); } },
              { name: 'Fat', val: nutrition.fat, max: targets.fat, unit: 'g', color: '#8b5cf6', icon: <StatIcon name="fat" />, onClick: () => { setSelectedMacro('fat'); setShowProteinModal(true); } }
            ].map(m => {
              const pct = Math.min(100, Math.round((m.val / m.max) * 100));
              return (
                <div key={m.name} onClick={m.onClick} style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: 12, cursor: m.onClick ? 'pointer' : 'default' }} title={m.onClick ? `Click for ${m.name} breakdown & alternatives` : ''}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{m.icon}</span><span>{m.name}</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>
                      {m.val} / {m.max} {m.unit} <span style={{ color: m.color }}>({pct}%)</span>
                    </div>
                  </div>
                  <div style={{ height: 10, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: m.val > m.max ? '#ef4444' : m.color, borderRadius: 6, transition: 'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Goal Progress Cards */}
        {user?.preferredDiagram === 'cards' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 12, padding: '16px' }}>
            {[
              { name: 'Calories', val: nutrition.calories, max: targets.calories, unit: 'kcal', color: '#f97316', icon: <StatIcon name="calories" />, desc: 'Energy intake target', onClick: () => { setSelectedMacro('calories'); setShowProteinModal(true); } },
              { name: 'Protein', val: nutrition.protein, max: targets.protein, unit: 'g', color: '#22c55e', icon: <StatIcon name="protein" />, desc: 'Muscle repair & growth', onClick: () => { setSelectedMacro('protein'); setShowProteinModal(true); } },
              { name: 'Carbs', val: nutrition.carbs, max: targets.carbs, unit: 'g', color: '#3b82f6', icon: <StatIcon name="carbs" />, desc: 'Daily energy levels', onClick: () => { setSelectedMacro('carbs'); setShowProteinModal(true); } },
              { name: 'Fat', val: nutrition.fat, max: targets.fat, unit: 'g', color: '#8b5cf6', icon: <StatIcon name="fat" />, desc: 'Hormonal support', onClick: () => { setSelectedMacro('fat'); setShowProteinModal(true); } }
            ].map(m => {
              const completed = m.val >= m.max;
              return (
                <div key={m.name} onClick={m.onClick} style={{
                  background: 'var(--bg-tertiary)', borderRadius: 16, padding: 14,
                  border: `1.5px solid ${completed ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                  display: 'flex', gap: 12, alignItems: 'center', cursor: m.onClick ? 'pointer' : 'default'
                }} title={m.onClick ? `Click for ${m.name} breakdown & alternatives` : ''}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: `${m.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                  }}>{m.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>{m.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{m.desc}</div>
                    <div style={{ fontSize: 13, fontWeight: 900 }}>
                      {m.val} <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>/ {m.max}{m.unit}</span>
                    </div>
                  </div>
                  <div>
                    {completed ? (
                      <span className="badge badge-green" style={{ fontSize: 9, padding: '4px 8px' }}>🎯 HIT</span>
                    ) : (
                      <span className="badge badge-blue" style={{ fontSize: 9, padding: '4px 8px' }}>⚡ ACTIVE</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}


      </div>

      {/* Daily Targets Bars */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title">🎯 Daily Targets</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 12 }}>
          {[
            ['Calories', nutrition.calories, targets.calories, 'kcal', '#f97316', () => { setSelectedMacro('calories'); setShowProteinModal(true); }],
            ['Protein', nutrition.protein, targets.protein, 'g', '#22c55e', () => { setSelectedMacro('protein'); setShowProteinModal(true); }],
            ['Carbs', nutrition.carbs, targets.carbs, 'g', '#3b82f6', () => { setSelectedMacro('carbs'); setShowProteinModal(true); }],
            ['Fat', nutrition.fat, targets.fat, 'g', '#8b5cf6', () => { setSelectedMacro('fat'); setShowProteinModal(true); }]
          ].map(([name, val, max, unit, color, onClick]) => (
            <div key={name} onClick={onClick} style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: 16, cursor: onClick ? 'pointer' : 'default' }} title={onClick ? `Click for ${name} breakdown & alternatives` : ''}>
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

      {/* ═══ DETAILED FOOD NUTRITION INSIGHTS ═══ */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 className="card-title">💪 Food Nutrition Insights & Recommendations</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Macro Selector Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MACROS.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMacro(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: `1.5px solid ${selectedMacro === m.id ? m.color : 'var(--border)'}`,
                  background: selectedMacro === m.id ? `${m.color}15` : 'var(--bg-secondary)',
                  color: selectedMacro === m.id ? m.color : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 800 }}>Select a Food Item to View Details & Alternatives</label>
            <select className="form-select" value={selectedFoodId} onChange={e => setSelectedFoodId(e.target.value)} style={{ width: '100%', fontSize: 13 }}>
              {menuItems.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m[activeMacro.id]}{activeMacro.unit.trim()} {activeMacro.label.toLowerCase()})</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Selected Food Detail Card */}
            {selectedFood && (
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ position: 'relative', height: 150 }}>
                  <img src={selectedFood.image} alt={selectedFood.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                    <span className="badge badge-blue" style={{ fontSize: 9 }}>⏱ {selectedFood.prepTime} min</span>
                    <span className="badge badge-green" style={{ fontSize: 9 }}>⭐ {selectedFood.rating}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
                    <span className="badge" style={{ fontSize: 10, fontWeight: 900, padding: '4px 8px', background: activeMacro.color, color: '#fff' }}>
                      {activeMacro.icon} {selectedFood[activeMacro.id]}{activeMacro.unit}
                    </span>
                  </div>
                </div>
                <div style={{ padding: 14 }}>
                  <h4 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 15, marginBottom: 6 }}>{selectedFood.name}</h4>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{selectedFood.description || 'Nutrient-rich, premium meal designed to hit your daily targets.'}</p>
                  
                  {selectedFood.tags && selectedFood.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                      {selectedFood.tags.map(t => (
                        <span key={t} className="badge badge-purple" style={{ fontSize: 8, opacity: 0.8 }}>{t}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, background: 'var(--bg-secondary)', padding: 8, borderRadius: 10 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Cal</div>
                      <div style={{ fontWeight: 800, color: '#f97316', fontSize: 11 }}>🔥 {selectedFood.calories}</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Pro</div>
                      <div style={{ fontWeight: 800, color: '#22c55e', fontSize: 11 }}>💪 {selectedFood.protein}g</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Carbs</div>
                      <div style={{ fontWeight: 800, color: '#3b82f6', fontSize: 11 }}>🌾 {selectedFood.carbs}g</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Fat</div>
                      <div style={{ fontWeight: 800, color: '#eab308', fontSize: 11 }}>🥑 {selectedFood.fat}g</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alternatives Card */}
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 16, border: '1px solid var(--border)', padding: 14 }}>
              <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 13, marginBottom: 12, color: 'var(--text-primary)' }}>
                {activeMacro.icon} Similar {activeMacro.label} Alternatives (±{activeMacro.range}{activeMacro.unit})
              </h4>
              {similarFoods.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No other foods with similar {activeMacro.label.toLowerCase()} levels found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                  {similarFoods.map(f => (
                    <div key={f.id} style={{ display: 'flex', gap: 10, padding: 6, background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)', alignItems: 'center' }}>
                      <img src={f.image} alt={f.name} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 11, color: 'var(--text-primary)' }}>{f.name}</div>
                        <div style={{ display: 'flex', gap: 6, fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                          <span>⏱ {f.prepTime}m</span>
                          <span>⭐ {f.rating}</span>
                        </div>
                      </div>
                      <span className="badge" style={{ fontSize: 9, fontWeight: 800, padding: '3px 6px', background: `${activeMacro.color}15`, color: activeMacro.color, border: `1px solid ${activeMacro.color}30` }}>
                        {activeMacro.icon} {f[activeMacro.id]}{activeMacro.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todayOrders.map(o => (
              <div key={o.id} style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>Order #{o.id}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(o.orderTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {o.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, fontSize: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{item.name}</div>
                        {item.qty > 1 && <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>Qty: {item.qty}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: '#f97316' }}>🔥 {(item.calories || 0) * (item.qty || 1)} kcal</span>
                        <span style={{ fontWeight: 700, color: '#22c55e' }}>💪 {(item.protein || 0) * (item.qty || 1)}g P</span>
                        <span style={{ fontWeight: 700, color: '#3b82f6' }}>🌾 {(item.carbs || 0) * (item.qty || 1)}g C</span>
                        <span style={{ fontWeight: 700, color: '#8b5cf6' }}>🥑 {(item.fat || 0) * (item.qty || 1)}g F</span>
                      </div>
                    </div>
                  ))}
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 8 }}>
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

      {showProteinModal && (
        <div className="modal-overlay" onClick={() => setShowProteinModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 className="modal-title">📊 {activeMacro.label} Details & Recommendations</h3>
              <button className="modal-close" onClick={() => setShowProteinModal(false)}>✕</button>
            </div>
            
            {/* Macro Selector Tabs inside Modal */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {MACROS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMacro(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 12px',
                    borderRadius: 16,
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: `1.5px solid ${selectedMacro === m.id ? m.color : 'var(--border)'}`,
                    background: selectedMacro === m.id ? `${m.color}15` : 'var(--bg-secondary)',
                    color: selectedMacro === m.id ? m.color : 'var(--text-muted)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Select a Food Item</label>
              <select className="form-select" value={selectedFoodId} onChange={e => setSelectedFoodId(e.target.value)} style={{ width: '100%', fontSize: 13 }}>
                {menuItems.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m[activeMacro.id]}{activeMacro.unit.trim()} {activeMacro.label.toLowerCase()})</option>
                ))}
              </select>
            </div>

            {selectedFood && (
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 20 }}>
                <div style={{ position: 'relative', height: 160 }}>
                  <img src={selectedFood.image} alt={selectedFood.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                    <span className="badge badge-blue" style={{ fontSize: 10, fontWeight: 700 }}>⏱ {selectedFood.prepTime} min</span>
                    <span className="badge badge-green" style={{ fontSize: 10, fontWeight: 700 }}>⭐ {selectedFood.rating}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
                    <span className="badge" style={{ fontSize: 11, fontWeight: 900, padding: '4px 10px', background: activeMacro.color, color: '#fff' }}>
                      {activeMacro.icon} {selectedFood[activeMacro.id]}{activeMacro.unit}
                    </span>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <h4 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 16, marginBottom: 8 }}>{selectedFood.name}</h4>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>{selectedFood.description || 'Nutrient-rich, premium meal designed to hit your daily fitness targets.'}</p>
                  
                  {/* Tags */}
                  {selectedFood.tags && selectedFood.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {selectedFood.tags.map(t => (
                        <span key={t} className="badge badge-purple" style={{ fontSize: 9, opacity: 0.8 }}>{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Macro Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, background: 'var(--bg-secondary)', padding: 10, borderRadius: 12 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Calories</div>
                      <div style={{ fontWeight: 800, color: '#f97316', fontSize: 12, marginTop: 2 }}>🔥 {selectedFood.calories}</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Protein</div>
                      <div style={{ fontWeight: 800, color: '#22c55e', fontSize: 12, marginTop: 2 }}>💪 {selectedFood.protein}g</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Carbs</div>
                      <div style={{ fontWeight: 800, color: '#3b82f6', fontSize: 12, marginTop: 2 }}>🌾 {selectedFood.carbs}g</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Fat</div>
                      <div style={{ fontWeight: 800, color: '#eab308', fontSize: 12, marginTop: 2 }}>🥑 {selectedFood.fat}g</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 14, marginBottom: 12, color: 'var(--text-primary)' }}>
                {activeMacro.icon} Similar {activeMacro.label} Alternatives (±{activeMacro.range}{activeMacro.unit})
              </h4>
              {similarFoods.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No other foods with similar {activeMacro.label.toLowerCase()} levels found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                  {similarFoods.map(f => (
                    <div key={f.id} style={{ display: 'flex', gap: 12, padding: 8, background: 'var(--bg-tertiary)', borderRadius: 12, border: '1px solid var(--border)', alignItems: 'center' }}>
                      <img src={f.image} alt={f.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--text-primary)' }}>{f.name}</div>
                        <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                          <span>⏱ {f.prepTime} min</span>
                          <span>⭐ {f.rating}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="badge" style={{ fontSize: 10, fontWeight: 800, padding: '4px 8px', background: `${activeMacro.color}15`, color: activeMacro.color, border: `1px solid ${activeMacro.color}30` }}>
                          {activeMacro.icon} {f[activeMacro.id]}{activeMacro.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
