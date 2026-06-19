import { useState, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getMenuItems } from '../../data/menuHelper';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import StatIcon from '../../components/StatIcon';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = [
  { key: 'morning', label: 'Breakfast', icon: '🌅', time: '8:00 AM', color: '#f97316' },
  { key: 'noon', label: 'Lunch', icon: '☀️', time: '12:30 PM', color: '#22c55e' },
  { key: 'evening', label: 'Dinner', icon: '🌙', time: '7:00 PM', color: '#3b82f6' },
];

function getWeekDates(offset = 0) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export default function FoodScheduling() {
  const MENU_ITEMS = getMenuItems();
  const { user, getTrainerClients } = useAuth();
  const { addScheduledOrder, cancelScheduledOrder, scheduledOrders } = useOrders();
  const { showToast } = useNotifications();
  const clients = getTrainerClients(user?.id);

  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [weekOffset, setWeekOffset] = useState(0);
  const [editCell, setEditCell] = useState(null); // { day, date, meal }
  const [selectedItems, setSelectedItems] = useState([]);
  const [search, setSearch] = useState('');
  const [customTime, setCustomTime] = useState('');

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const myClientIds = clients.map(c => c.id);
  const allSchedules = scheduledOrders.filter(s => myClientIds.includes(s.customerId) && s.status === 'active');

  // Build the weekly grid: { "2026-06-20_morning": schedule }
  const grid = useMemo(() => {
    const g = {};
    const relevantSchedules = clientId
      ? allSchedules.filter(s => s.customerId === clientId)
      : allSchedules;
    relevantSchedules.forEach(s => {
      (s.dates || []).forEach(date => {
        const key = `${date}_${s.timing}`;
        g[key] = s;
      });
    });
    return g;
  }, [allSchedules, clientId]);

  const toggleItem = (id) => setSelectedItems(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // Convert 24h "HH:MM" to 12h display like "8:00 AM"
  const formatTime12 = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const handleSave = () => {
    if (!clientId || selectedItems.length === 0 || !editCell) return;
    addScheduledOrder({
      customerId: clientId,
      dates: [editCell.date],
      timing: editCell.meal,
      timeSlot: customTime ? formatTime12(customTime) : MEALS.find(m => m.key === editCell.meal)?.time || '',
      items: selectedItems,
    });
    showToast(`✅ ${MEALS.find(m => m.key === editCell.meal)?.label} set for ${DAYS[editCell.dayIdx]}!`);
    setEditCell(null);
    setSelectedItems([]);
    setSearch('');
    setCustomTime('');
  };

  const handleRemove = (key) => {
    const sched = grid[key];
    if (sched) { cancelScheduledOrder(sched.id); showToast('Meal removed', 'warning'); }
  };

  // Stats
  const totalSlots = weekDates.length * MEALS.length;
  const filledSlots = weekDates.reduce((acc, date) => acc + MEALS.filter(m => grid[`${date}_${m.key}`]).length, 0);
  const totalCal = weekDates.reduce((acc, date) => {
    return acc + MEALS.reduce((a, m) => {
      const sched = grid[`${date}_${m.key}`];
      if (!sched) return a;
      return a + (sched.items || []).reduce((s, id) => { const item = MENU_ITEMS.find(x => x.id === id); return s + (item?.calories || 0); }, 0);
    }, 0);
  }, 0);

  const weekLabel = weekDates.length > 0
    ? `${new Date(weekDates[0]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${new Date(weekDates[6]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : '';

  const filteredMenu = MENU_ITEMS.filter(m => m.available && m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="Weekly Meal Schedule">
      {/* Cell Editor Modal */}
      {editCell && (
        <div className="modal-overlay" onClick={() => { setEditCell(null); setSelectedItems([]); setSearch(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title">{MEALS.find(m => m.key === editCell.meal)?.icon} Set {MEALS.find(m => m.key === editCell.meal)?.label} — {DAYS[editCell.dayIdx]}</h3>
              <button className="modal-close" onClick={() => { setEditCell(null); setSelectedItems([]); setSearch(''); setCustomTime(''); }}>✕</button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span>📅 {editCell.date}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                ⏰
                <input
                  type="time"
                  value={customTime}
                  onChange={e => setCustomTime(e.target.value)}
                  style={{
                    padding: '4px 8px', borderRadius: 8, border: '1.5px solid var(--border)',
                    background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 12,
                    fontFamily: 'Outfit', fontWeight: 600, cursor: 'pointer',
                  }}
                />
              </span>
            </div>

            <div style={{ marginBottom: 12 }}>
              <input className="form-input" placeholder="🔍 Search foods..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, maxHeight: 240, overflowY: 'auto', marginBottom: 16 }}>
              {filteredMenu.map(item => (
                <div key={item.id} onClick={() => toggleItem(item.id)} style={{
                  padding: 10, borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                  background: selectedItems.includes(item.id) ? 'rgba(249,115,22,0.08)' : 'var(--bg-tertiary)',
                  border: `1.5px solid ${selectedItems.includes(item.id) ? 'var(--accent-orange)' : 'var(--border)'}`,
                }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <img src={item.image} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{selectedItems.includes(item.id) ? '✅ ' : ''}{item.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>🔥{item.calories} 💪{item.protein}g • ₹{item.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedItems.length > 0 && (
              <div style={{ padding: 10, background: 'rgba(34,197,94,0.06)', borderRadius: 10, marginBottom: 12, fontSize: 12 }}>
                <strong>Selected ({selectedItems.length}):</strong>{' '}
                {selectedItems.map(id => MENU_ITEMS.find(m => m.id === id)?.name).join(', ')}
                <span style={{ float: 'right', fontWeight: 800 }}>
                  🔥 {selectedItems.reduce((a, id) => a + (MENU_ITEMS.find(m => m.id === id)?.calories || 0), 0)} kcal •
                  💪 {selectedItems.reduce((a, id) => a + (MENU_ITEMS.find(m => m.id === id)?.protein || 0), 0)}g
                </span>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => { setEditCell(null); setSelectedItems([]); setSearch(''); setCustomTime(''); }}>Cancel</button>
              <button className="btn btn-success" onClick={handleSave} disabled={selectedItems.length === 0}>✅ Set Meal</button>
            </div>
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label className="form-label" style={{ margin: 0, fontSize: 13 }}>Client:</label>
          <select className="form-select" style={{ minWidth: 180 }} value={clientId} onChange={e => setClientId(e.target.value)}>
            <option value="">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.goal}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => setWeekOffset(w => w - 1)}>← Prev</button>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, minWidth: 200, textAlign: 'center' }}>📅 {weekLabel}</span>
          <button className="btn btn-outline btn-sm" onClick={() => setWeekOffset(w => w + 1)}>Next →</button>
          {weekOffset !== 0 && <button className="btn btn-primary btn-sm" onClick={() => setWeekOffset(0)}>Today</button>}
          <input type="date" style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 12 }}
            onChange={e => {
              const picked = new Date(e.target.value);
              const now = new Date();
              const diffDays = Math.floor((picked - now) / (1000*60*60*24));
              const diffWeeks = Math.floor((diffDays + now.getDay() - 1) / 7);
              setWeekOffset(diffWeeks);
            }}
            title="Jump to any date"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        {[
          { icon: <StatIcon name="clipboard" />, val: `${filledSlots}/${totalSlots}`, label: 'Meals Planned', color: '#22c55e' },
          { icon: <StatIcon name="calories" />, val: totalCal.toLocaleString(), label: 'Week Calories', color: '#f97316' },
          { icon: <StatIcon name="users" />, val: clients.length, label: 'Clients', color: '#3b82f6' },
          { icon: <StatIcon name="calendar" />, val: allSchedules.length, label: 'Active Schedules', color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-value" style={{ color: s.color }}>{s.val}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>

      {/* ═══ WEEKLY CALENDAR GRID ═══ */}
      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4 }}>
          <thead>
            <tr>
              <th style={{ width: 80, padding: 10, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}></th>
              {DAYS.map((day, i) => {
                const date = weekDates[i];
                const isToday = date === new Date().toISOString().split('T')[0];
                return (
                  <th key={day} style={{
                    padding: '10px 6px', textAlign: 'center', fontSize: 12,
                    background: isToday ? 'rgba(249,115,22,0.08)' : 'transparent',
                    borderRadius: 10,
                  }}>
                    <div style={{ fontWeight: 900, fontSize: 13, color: isToday ? 'var(--accent-orange)' : 'var(--text-primary)' }}>{day.slice(0, 3)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {MEALS.map(meal => (
              <tr key={meal.key}>
                {/* Meal label */}
                <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 18 }}>{meal.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 12, color: meal.color }}>{meal.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{meal.time}</div>
                    </div>
                  </div>
                </td>

                {/* Day cells */}
                {DAYS.map((day, dayIdx) => {
                  const date = weekDates[dayIdx];
                  const key = `${date}_${meal.key}`;
                  const sched = grid[key];
                  const isToday = date === new Date().toISOString().split('T')[0];
                  const items = sched ? (sched.items || []).map(id => MENU_ITEMS.find(m => m.id === id)).filter(Boolean) : [];
                  const totalMealCal = items.reduce((a, i) => a + (i?.calories || 0), 0);

                  return (
                    <td key={key} style={{
                      padding: 0, verticalAlign: 'top', width: `${100 / 7}%`,
                    }}>
                      <div style={{
                        minHeight: 90, padding: 8, borderRadius: 12, transition: 'all 0.2s', cursor: 'pointer',
                        background: sched ? `${meal.color}08` : isToday ? 'rgba(249,115,22,0.03)' : 'var(--bg-tertiary)',
                        border: `1.5px ${sched ? 'solid' : 'dashed'} ${sched ? meal.color + '40' : 'var(--border)'}`,
                      }}
                        onClick={() => {
                          if (!clientId) { showToast('Select a client first', 'error'); return; }
                          setEditCell({ dayIdx, date, meal: meal.key });
                          if (sched) setSelectedItems([...(sched.items || [])]);
                          else setSelectedItems([]);
                          // Initialize customTime from the meal's default (convert 12h to 24h for the input)
                          const defaultTimeMap = { morning: '08:00', noon: '12:30', evening: '19:00' };
                          setCustomTime(defaultTimeMap[meal.key] || '12:00');
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = meal.color; e.currentTarget.style.transform = 'scale(1.02)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = sched ? meal.color + '40' : 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                      >
                        {sched ? (
                          <>
                            {items.slice(0, 2).map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                                <img src={item.image} alt="" style={{ width: 22, height: 22, borderRadius: 5, objectFit: 'cover' }} />
                                <span style={{ fontSize: 10, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                              </div>
                            ))}
                            {items.length > 2 && <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>+{items.length - 2} more</div>}
                            <div style={{ fontSize: 9, color: meal.color, fontWeight: 800, marginTop: 4 }}>🔥 {totalMealCal} kcal</div>
                            <button onClick={e => { e.stopPropagation(); handleRemove(key); }} style={{ position: 'absolute', display: 'none' }}>×</button>
                          </>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 70 }}>
                            <span style={{ fontSize: 20, opacity: 0.2 }}>+</span>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 12, justifyContent: 'center' }}>
        {MEALS.map(m => (
          <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: m.color }} />
            <span style={{ fontWeight: 600 }}>{m.icon} {m.label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, border: '1.5px dashed #ccc' }} />
          <span style={{ color: 'var(--text-muted)' }}>Empty — click to add</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
