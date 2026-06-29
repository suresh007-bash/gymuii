import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatIcon from '../../components/StatIcon';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { getMenuItems } from '../../data/menuHelper';
import { Settings } from '../../components/Icons';

function Ring({ val, max, color, label, unit, icon }) {
  const [displayed, setDisplayed] = useState(0);
  const prevVal = useRef(0);
  
  useEffect(() => {
    const start = performance.now(), from = prevVal.current, to = val, dur = 1200;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    let raf;
    const step = (now) => { 
      const p = Math.min((now - start) / dur, 1); 
      setDisplayed(Math.round(from + (to - from) * ease(p))); 
      if (p < 1) raf = requestAnimationFrame(step); 
    };
    raf = requestAnimationFrame(step);
    return () => { prevVal.current = displayed; cancelAnimationFrame(raf); };
  }, [val]);

  const pct = Math.min(100, Math.round((displayed / max) * 100));
  const isOver = val > max;
  const strokeColor = isOver ? '#ef4444' : color;
  const remaining = Math.max(0, max - displayed);

  const r = 38; // Slightly smaller to fit stroke inside 100x100
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(pct, 100) / 100) * c;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle cx="50" cy="50" r={r} fill="none" stroke={`${strokeColor}20`} strokeWidth="8" />
          {/* Progress fill */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={`${c}, ${c}`}
            strokeDashoffset={off}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
          {/* Glowing dot at the tip of the progress */}
          {pct > 0 && pct < 100 && (
            <circle 
              cx="50" 
              cy="50" 
              r="4" 
              fill={strokeColor} 
              style={{
                transformOrigin: '50px 50px',
                transform: `rotate(${(pct / 100) * 360}deg) translateY(-${r}px)`,
                filter: `drop-shadow(0px 0px 4px ${strokeColor}80)`
              }}
            />
          )}
        </svg>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.1
        }}>
          
          <span style={{ fontWeight: 900, fontSize: 'calc(30px + 0.5vw)', color: strokeColor, fontFamily: 'Outfit' }}>{displayed}</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 'calc(20px + 0.5vw)', color: '#1e293b', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 'calc(15px + 0.5vw)', color: '#94a3b8', fontWeight: 600 }}>{remaining} {unit} left</div>
      </div>
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
    { id: 'calories', label: 'Calories', color: '#f97316', unit: ' kcal', range: 50 },
    { id: 'protein', label: 'Protein', color: '#22c55e', unit: 'g', range: 5 },
    { id: 'carbs', label: 'Carbs', color: '#3b82f6', unit: 'g', range: 10 },
    { id: 'fat', label: 'Fat', color: '#eab308', unit: 'g', range: 5 }
  ];
  const activeMacro = MACROS.find(m => m.id === selectedMacro) || MACROS[1];

  const [targets, setTargets] = useState(() => JSON.parse(localStorage.getItem('synnoviq_targets') || 'null') || { calories: 2500, protein: 180, carbs: 280, fat: 80 });
  const [showEditTargets, setShowEditTargets] = useState(false);
  const [editTargetsForm, setEditTargetsForm] = useState(targets);

  const handleSaveTargets = () => {
    setTargets(editTargetsForm);
    localStorage.setItem('synnoviq_targets', JSON.stringify(editTargetsForm));
    setShowEditTargets(false);
  };

  useEffect(() => {
    const syncTargets = () => {
      const saved = JSON.parse(localStorage.getItem('synnoviq_targets') || 'null');
      if (saved) {
        setTargets(saved);
        setEditTargetsForm(saved);
      }
    };
    window.addEventListener('storage', syncTargets);
    const interval = setInterval(syncTargets, 2000);
    return () => { window.removeEventListener('storage', syncTargets); clearInterval(interval); };
  }, []);

  const allOrders = getOrdersByUser(user?.id).filter(o => o.status !== 'cancelled');
  const todayOrders = allOrders.filter(o => o.orderTime.startsWith(today));

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

  const historyDates = Object.keys(historyMap).filter(d => d !== today).sort((a, b) => b.localeCompare(a));

  const sortedDates = Object.keys(historyMap).sort((a, b) => b.localeCompare(a));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const check = d.toISOString().split('T')[0];
    if (historyMap[check]) { streak++; d.setDate(d.getDate() - 1); } else break;
  }

  const fmtDate = (ds) => new Date(ds).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

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
      <div className="hero-banner">
        <div className="hero-tag">NUTRITION</div>
        <div className="hero-title">Today's Nutrition</div>
        <div className="hero-subtitle">{todayOrders.length > 0 ? `${todayOrders.length} meal${todayOrders.length > 1 ? 's' : ''} tracked today` : 'No meals tracked today — order from the menu!'}</div>
      </div>

      {/* ═══ PERFECT FLAT STANDALONE HORIZONTAL METRIC CARD ROW STRUCTURE ═══ */}
      {(!user?.preferredDiagram || user?.preferredDiagram === 'ring') && (
        <div 
          style={{ 
            marginBottom: 20, 
            width: '100%',
            background: '#ffffff',
            borderRadius: 20,
            padding: '24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f9731615', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 'calc(16px + 0.5vw)' }}></span>
              </div>
              <h3 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(22px + 0.5vw)', color: '#1e293b' }}>Daily Nutrition</h3>
            </div>
            <button 
              onClick={() => setShowEditTargets(true)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: 6, 
                padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', 
                borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 'calc(17px + 0.5vw)', color: '#475569' 
              }}
            >
              <Settings size={14} /> Edit Targets
            </button>
          </div>
          
          <div className="nutrition-rings-grid">
            <div onClick={() => { setSelectedMacro('calories'); setShowProteinModal(true); }} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }} title="Click for Calories breakdown">
              <Ring val={nutrition.calories} max={targets.calories} color="#f97316" label="Calories" unit="kcal" icon="" />
            </div>
            <div onClick={() => { setSelectedMacro('protein'); setShowProteinModal(true); }} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }} title="Click for Protein breakdown">
              <Ring val={nutrition.protein} max={targets.protein} color="#22c55e" label="Protein" unit="g" icon="" />
            </div>
            <div onClick={() => { setSelectedMacro('carbs'); setShowProteinModal(true); }} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }} title="Click for Carbs breakdown">
              <Ring val={nutrition.carbs} max={targets.carbs} color="#3b82f6" label="Carbs" unit="g" icon="" />
            </div>
            <div onClick={() => { setSelectedMacro('fat'); setShowProteinModal(true); }} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }} title="Click for Fat breakdown">
              <Ring val={nutrition.fat} max={targets.fat} color="#eab308" label="Fat" unit="g" icon="" />
            </div>
          </div>
        </div>
      )}

      {/* ═══ BAR CHART PROGRESS DIAGRAM ═══ */}
      {user?.preferredDiagram === 'bar' && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px' }}>
            {[
              { name: 'Calories', val: nutrition.calories, max: targets.calories, unit: 'kcal', color: '#f97316', icon: <StatIcon name="calories" />, onClick: () => { setSelectedMacro('calories'); setShowProteinModal(true); } },
              { name: 'Protein', val: nutrition.protein, max: targets.protein, unit: 'g', color: '#22c55e', icon: <StatIcon name="protein" />, onClick: () => { setSelectedMacro('protein'); setShowProteinModal(true); } },
              { name: 'Carbs', val: nutrition.carbs, max: targets.carbs, unit: 'g', color: '#3b82f6', icon: <StatIcon name="carbs" />, onClick: () => { setSelectedMacro('carbs'); setShowProteinModal(true); } },
              { name: 'Fat', val: nutrition.fat, max: targets.fat, unit: 'g', color: '#8b5cf6', icon: <StatIcon name="fat" />, onClick: () => { setSelectedMacro('fat'); setShowProteinModal(true); } }
            ].map(m => {
              const pct = Math.min(100, Math.round((m.val / m.max) * 100));
              return (
                <div key={m.name} onClick={m.onClick} style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: 12, cursor: m.onClick ? 'pointer' : 'default' }} title={`Click for ${m.name} breakdown`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontWeight: 800, fontSize: 'calc(17px + 0.5vw)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{m.icon}</span><span>{m.name}</span>
                    </div>
                    <div style={{ fontSize: 'calc(16px + 0.5vw)', fontWeight: 700 }}>
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
        </div>
      )}

      {/* ═══ GOAL PROGRESS CARDS DIAGRAM ═══ */}
      {user?.preferredDiagram === 'cards' && (
        <div className="card" style={{ marginBottom: 20 }}>
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
                }} title={`Click for ${m.name} breakdown`}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${m.color}15`, display: 'flex', alignItems: 'center', justifycenter: 'center', fontSize: 'calc(30px + 0.5vw)' }}>{m.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 'calc(17px + 0.5vw)' }}>{m.name}</div>
                    <div style={{ fontSize: 'calc(14px + 0.5vw)', color: 'var(--text-muted)', marginBottom: 4 }}>{m.desc}</div>
                    <div style={{ fontSize: 'calc(17px + 0.5vw)', fontWeight: 900 }}>{m.val} <span style={{ fontSize: 'calc(14px + 0.5vw)', color: 'var(--text-muted)', fontWeight: 500 }}>/ {m.max}{m.unit}</span></div>
                  </div>
                  <div>
                    {completed ? <span className="badge badge-green" style={{ fontSize: 'calc(13px + 0.5vw)', padding: '4px 8px' }}> HIT</span> : <span className="badge badge-blue" style={{ fontSize: 'calc(13px + 0.5vw)', padding: '4px 8px' }}> ACTIVE</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Targets Overview Bars */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title"> Daily Targets</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 12 }}>
          {[
            ['Calories', nutrition.calories, targets.calories, 'kcal', '#f97316', () => { setSelectedMacro('calories'); setShowProteinModal(true); }],
            ['Protein', nutrition.protein, targets.protein, 'g', '#22c55e', () => { setSelectedMacro('protein'); setShowProteinModal(true); }],
            ['Carbs', nutrition.carbs, targets.carbs, 'g', '#3b82f6', () => { setSelectedMacro('carbs'); setShowProteinModal(true); }],
            ['Fat', nutrition.fat, targets.fat, 'g', '#8b5cf6', () => { setSelectedMacro('fat'); setShowProteinModal(true); }]
          ].map(([name, val, max, unit, color, onClick]) => (
            <div key={name} onClick={onClick} style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: 16, cursor: 'pointer' }} title={`Click for ${name} breakdown`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontWeight: 700, fontSize: 'calc(17px + 0.5vw)' }}>{name}</span><span style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>{val}/{max}{unit}</span></div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (val / max) * 100)}%`, height: '100%', background: val > max ? '#ef4444' : color, borderRadius: 4, transition: 'width 1s ease' }} />
              </div>
              <div style={{ fontSize: 'calc(14px + 0.5vw)', color: val > max ? '#ef4444' : val >= max ? color : 'var(--text-muted)', fontWeight: 700, marginTop: 4 }}>
                {val > max ? `️ Over by ${val - max}${unit}` : val >= max ? ' Target reached!' : `${max - val}${unit} remaining`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Insights Row */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title"> Food Nutrition Insights</h3></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MACROS.map(m => (
              <button key={m.id} onClick={() => setSelectedMacro(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, fontSize: 'calc(16px + 0.5vw)', fontWeight: 800, cursor: 'pointer', border: `1.5px solid ${selectedMacro === m.id ? m.color : 'var(--border)'}`, background: selectedMacro === m.id ? `${m.color}15` : 'var(--bg-secondary)', color: selectedMacro === m.id ? m.color : 'var(--text-muted)' }}>
                <span>{m.icon}</span><span>{m.label}</span>
              </button>
            ))}
          </div>
          <div>
            <label className="form-label" style={{ fontWeight: 800 }}>Select Food Item</label>
            <select className="form-select" value={selectedFoodId} onChange={e => setSelectedFoodId(e.target.value)} style={{ width: '100%', fontSize: 'calc(17px + 0.5vw)' }}>
              {menuItems.map(m => (<option key={m.id} value={m.id}>{m.name} ({m[activeMacro.id]}{activeMacro.unit.trim()} {activeMacro.label.toLowerCase()})</option>))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {selectedFood && (
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ position: 'relative', height: 150 }}>
                  <img src={selectedFood.image} alt={selectedFood.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}><span className="badge badge-blue" style={{ fontSize: 'calc(13px + 0.5vw)' }}>⏱ {selectedFood.prepTime} min</span><span className="badge badge-green" style={{ fontSize: 'calc(13px + 0.5vw)' }}> {selectedFood.rating}</span></div>
                  <div style={{ position: 'absolute', bottom: 10, right: 10 }}><span className="badge" style={{ fontSize: 'calc(14px + 0.5vw)', fontWeight: 900, padding: '4px 8px', background: activeMacro.color, color: '#fff' }}>{activeMacro.icon} {selectedFood[activeMacro.id]}{activeMacro.unit}</span></div>
                </div>
                <div style={{ padding: 14 }}>
                  <h4 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'calc(19px + 0.5vw)', marginBottom: 6 }}>{selectedFood.name}</h4>
                  <p style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)', marginBottom: 10 }}>{selectedFood.description || 'Nutrient-rich premium meal.'}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, background: 'var(--bg-secondary)', padding: 8, borderRadius: 10 }}>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 'calc(13px + 0.5vw)', color: 'var(--text-muted)' }}>Cal</div><div style={{ fontWeight: 800, color: '#f97316', fontSize: 'calc(15px + 0.5vw)' }}> {selectedFood.calories}</div></div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}><div style={{ fontSize: 'calc(13px + 0.5vw)', color: 'var(--text-muted)' }}>Pro</div><div style={{ fontWeight: 800, color: '#22c55e', fontSize: 'calc(15px + 0.5vw)' }}> {selectedFood.protein}g</div></div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}><div style={{ fontSize: 'calc(13px + 0.5vw)', color: 'var(--text-muted)' }}>Carbs</div><div style={{ fontWeight: 800, color: '#3b82f6', fontSize: 'calc(15px + 0.5vw)' }}> {selectedFood.carbs}g</div></div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}><div style={{ fontSize: 'calc(13px + 0.5vw)', color: 'var(--text-muted)' }}>Fat</div><div style={{ fontWeight: 800, color: '#eab308', fontSize: 'calc(15px + 0.5vw)' }}> {selectedFood.fat}g</div></div>
                  </div>
                </div>
              </div>
            )}
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 16, border: '1px solid var(--border)', padding: 14 }}>
              <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'calc(17px + 0.5vw)', marginBottom: 12 }}>{activeMacro.icon} Similar Alternatives</h4>
              {similarFoods.length === 0 ? <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>No macro alternatives found.</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {similarFoods.map(f => (
                    <div key={f.id} style={{ display: 'flex', gap: 10, padding: 6, background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)', alignItems: 'center' }}>
                      <img src={f.image} alt={f.name} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 'calc(15px + 0.5vw)' }}>{f.name}</div></div>
                      <span className="badge" style={{ fontSize: 'calc(13px + 0.5vw)', fontWeight: 800, padding: '3px 6px', background: `${activeMacro.color}15`, color: activeMacro.color }}>{f[activeMacro.id]}{activeMacro.unit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Meals List */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title">️ Today's Meals</h3></div>
        {todayOrders.length === 0 ? <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No meals tracked today.</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todayOrders.map(o => (
              <div key={o.id} style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
                {o.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'calc(16px + 0.5vw)', marginBottom: 4 }}>
                    <div><span style={{ fontWeight: 700 }}>{item.name}</span> (x{item.qty || 1})</div>
                    <div style={{ fontWeight: 700, color: '#f97316' }}> {(item.calories || 0) * (item.qty || 1)} kcal</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History Cards Component */}
      <div className="card">
        <div className="card-header"><h3 className="card-title"> Nutrition History</h3></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {historyDates.slice(0, 14).map(dateStr => {
            const data = historyMap[dateStr];
            return (
              <div key={dateStr} style={{ padding: 14, borderRadius: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 800, fontSize: 'calc(17px + 0.5vw)', marginBottom: 6 }}>{fmtDate(dateStr)}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                  <div> Cal: {data.calories} kcal</div>
                  <div> Pro: {data.protein}g</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL BREAKDOWN HANDLER OVERLAY */}
      {showProteinModal && (
        <div className="modal-overlay" onClick={() => setShowProteinModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 className="modal-title"> {activeMacro.label} Alternatives</h3>
              <button className="modal-close" onClick={() => setShowProteinModal(false)}></button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {MACROS.map(m => (
                <button key={m.id} onClick={() => setSelectedMacro(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 16, fontSize: 'calc(15px + 0.5vw)', fontWeight: 800, border: `1.5px solid ${selectedMacro === m.id ? m.color : 'var(--border)'}`, background: selectedMacro === m.id ? `${m.color}15` : 'var(--bg-secondary)', color: selectedMacro === m.id ? m.color : 'var(--text-muted)' }}>
                  <span>{m.icon}</span><span>{m.label}</span>
                </button>
              ))}
            </div>
            <div>
              <select className="form-select" value={selectedFoodId} onChange={e => setSelectedFoodId(e.target.value)} style={{ width: '100%', fontSize: 'calc(17px + 0.5vw)' }}>
                {menuItems.map(m => (<option key={m.id} value={m.id}>{m.name} ({m[activeMacro.id]}{activeMacro.unit.trim()})</option>))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TARGETS MODAL */}
      {showEditTargets && (
        <div className="modal-overlay" onClick={() => setShowEditTargets(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={18} /> Edit Targets</h3>
              <button className="modal-close" onClick={() => setShowEditTargets(false)}></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              <div>
                <label className="form-label">Calories (kcal)</label>
                <input type="number" className="form-input" value={editTargetsForm.calories} onChange={e => setEditTargetsForm({...editTargetsForm, calories: Number(e.target.value)})} />
              </div>
              <div>
                <label className="form-label">Protein (g)</label>
                <input type="number" className="form-input" value={editTargetsForm.protein} onChange={e => setEditTargetsForm({...editTargetsForm, protein: Number(e.target.value)})} />
              </div>
              <div>
                <label className="form-label">Carbs (g)</label>
                <input type="number" className="form-input" value={editTargetsForm.carbs} onChange={e => setEditTargetsForm({...editTargetsForm, carbs: Number(e.target.value)})} />
              </div>
              <div>
                <label className="form-label">Fat (g)</label>
                <input type="number" className="form-input" value={editTargetsForm.fat} onChange={e => setEditTargetsForm({...editTargetsForm, fat: Number(e.target.value)})} />
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveTargets}>Save Targets</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}