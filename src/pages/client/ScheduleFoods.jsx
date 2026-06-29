import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import { CATEGORIES } from '../../data/mockMenu';
import { getMenuItems } from '../../data/menuHelper';
import { gsap } from 'gsap';

let slotIdCounter = 1;

// SVG Circular Ring
const Ring = ({ value, target, color, size = 72, stroke = 7, icon, label, unit }) => {
  const [displayed, setDisplayed] = React.useState(0);
  React.useEffect(() => {
    const start = performance.now(), from = 0, to = value, dur = 1200;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    let raf;
    const step = (now) => { const p = Math.min((now - start) / dur, 1); setDisplayed(Math.round(from + (to - from) * ease(p))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const pct = Math.min((displayed / target) * 100, 100);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const isOver = value > target;
  const gradId = `sr-${label}-${color.replace('#', '')}`;
  const dotAngle = (pct / 100) * 2 * Math.PI;
  return (
    <div className="ring-container" style={{ textAlign: 'center', position: 'relative', width: size, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size, marginBottom: 6 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isOver ? '#ef4444' : color} />
              <stop offset="100%" stopColor={`${isOver ? '#ef4444' : color}88`} />
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}18`} strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${gradId})`} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
          {pct > 3 && <circle cx={size/2 + r * Math.cos(dotAngle)} cy={size/2 + r * Math.sin(dotAngle)} r={stroke/2 + 1} fill={isOver ? '#ef4444' : color} style={{ filter: `drop-shadow(0 0 3px ${isOver ? '#ef4444' : color})`, opacity: 0.8 }} />}
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(12px, 3vw, 15px)', color: isOver ? '#ef4444' : color, lineHeight: 1 }}>{displayed}</div>
        </div>
      </div>
      <div style={{ fontSize: 'clamp(12px, 3vw, 13px)', fontWeight: 700, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 'clamp(12px, 3vw, 12px)', color: isOver ? '#ef4444' : 'var(--text-muted)' }}>
        {isOver ? `+${value - target} over` : `${target - value} ${unit} left`}
      </div>
    </div>
  );
};

export default function ScheduleFoods() {
  const MENU_ITEMS = getMenuItems();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const rolePrefix = user?.role === 'owner' ? '/owner' : user?.role === 'trainer' ? '/trainer' : '/client';

  const [step, setStep] = useState(location.state?.selectedDates?.length > 0 ? 2 : 1);
  const [selectedDates, setSelectedDates] = useState(location.state?.selectedDates || []);
  const [tip, setTip] = useState(0);
  const [payment, setPayment] = useState('COD');
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [search, setSearch] = useState('');

  // schedule: { "2026-06-20": [ { id, time, label, items: [...] }, ... ] }
  const [schedule, setSchedule] = useState(location.state?.schedule || {});
  const [activeDate, setActiveDate] = useState(null);
  const [activeSlotId, setActiveSlotId] = useState(null);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [slotSnapshot, setSlotSnapshot] = useState(null);
  const [showCopyPicker, setShowCopyPicker] = useState(false);
  const [copyTargetDates, setCopyTargetDates] = useState([]);
  const [targets] = useState(() => JSON.parse(localStorage.getItem('synnoviq_targets') || 'null') || { calories: 2500, protein: 180, carbs: 280, fat: 80 });
  const notifiedDates = useRef(new Set());
  const calGridRef = useRef(null);
  const [foodCat, setFoodCat] = useState('All');
  const [nutriSort, setNutriSort] = useState(null); // 'highProtein','lowCal','lowFat','lowCarb'
  const [showSchedAlternatives, setShowSchedAlternatives] = useState(false);

  // ═══ MagicBento effect for calendar grid ═══
  useEffect(() => {
    const grid = calGridRef.current;
    if (!grid || step !== 1) return;

    const GLOW_COLOR = '249, 115, 22'; // orange
    const SPOTLIGHT_RADIUS = 200;
    const proximity = SPOTLIGHT_RADIUS * 0.5;
    const fadeDistance = SPOTLIGHT_RADIUS * 0.75;

    // Create spotlight element
    const spotlight = document.createElement('div');
    spotlight.style.cssText = `position:fixed;width:600px;height:600px;border-radius:50%;pointer-events:none;
      background:radial-gradient(circle,rgba(${GLOW_COLOR},0.12) 0%,rgba(${GLOW_COLOR},0.05) 20%,transparent 60%);
      z-index:200;opacity:0;transform:translate(-50%,-50%);mix-blend-mode:screen;`;
    document.body.appendChild(spotlight);

    const onMove = (e) => {
      const rect = grid.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      if (!inside) {
        gsap.to(spotlight, { opacity: 0, duration: 0.3 });
        grid.querySelectorAll('.cal-magic-cell').forEach(c => c.style.setProperty('--glow-intensity', '0'));
        return;
      }

      let minDist = Infinity;
      grid.querySelectorAll('.cal-magic-cell').forEach(cell => {
        const cr = cell.getBoundingClientRect();
        const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
        const dist = Math.max(0, Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2);
        minDist = Math.min(minDist, dist);

        let glow = 0;
        if (dist <= proximity) glow = 1;
        else if (dist <= fadeDistance) glow = (fadeDistance - dist) / (fadeDistance - proximity);

        const rx = ((e.clientX - cr.left) / cr.width) * 100;
        const ry = ((e.clientY - cr.top) / cr.height) * 100;
        cell.style.setProperty('--glow-x', `${rx}%`);
        cell.style.setProperty('--glow-y', `${ry}%`);
        cell.style.setProperty('--glow-intensity', glow.toString());
        cell.style.setProperty('--glow-radius', `${SPOTLIGHT_RADIUS}px`);
      });

      gsap.to(spotlight, { left: e.clientX, top: e.clientY, duration: 0.08, ease: 'power2.out' });
      const opacity = minDist <= proximity ? 0.7 : minDist <= fadeDistance ? ((fadeDistance - minDist) / (fadeDistance - proximity)) * 0.7 : 0;
      gsap.to(spotlight, { opacity, duration: 0.15 });
    };

    // Per-cell hover effects (tilt + magnetism)
    const cells = grid.querySelectorAll('.cal-magic-cell');
    const cellHandlers = [];
    cells.forEach(cell => {
      const enter = () => gsap.to(cell, { scale: 1.12, rotateX: 4, rotateY: 4, duration: 0.25, ease: 'power2.out', transformPerspective: 600 });
      const leave = () => gsap.to(cell, { scale: 1, rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.25, ease: 'power2.out' });
      const move = (e) => {
        const r = cell.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const cx = r.width / 2, cy = r.height / 2;
        gsap.to(cell, { rotateX: ((y - cy) / cy) * -8, rotateY: ((x - cx) / cx) * 8, x: (x - cx) * 0.04, y: (y - cy) * 0.04, duration: 0.08, ease: 'power2.out', transformPerspective: 600 });
      };
      const click = (e) => {
        const r = cell.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const maxD = Math.max(Math.hypot(x, y), Math.hypot(x - r.width, y), Math.hypot(x, y - r.height), Math.hypot(x - r.width, y - r.height));
        const ripple = document.createElement('div');
        ripple.style.cssText = `position:absolute;width:${maxD * 2}px;height:${maxD * 2}px;border-radius:50%;background:radial-gradient(circle,rgba(${GLOW_COLOR},0.5) 0%,rgba(${GLOW_COLOR},0.2) 40%,transparent 70%);left:${x - maxD}px;top:${y - maxD}px;pointer-events:none;z-index:50;`;
        cell.appendChild(ripple);
        gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => ripple.remove() });
      };
      cell.addEventListener('mouseenter', enter);
      cell.addEventListener('mouseleave', leave);
      cell.addEventListener('mousemove', move);
      cell.addEventListener('click', click);
      cellHandlers.push({ cell, enter, leave, move, click });
    });

    document.addEventListener('mousemove', onMove);
    return () => {
      document.removeEventListener('mousemove', onMove);
      spotlight.remove();
      cellHandlers.forEach(({ cell, enter, leave, move, click }) => {
        cell.removeEventListener('mouseenter', enter);
        cell.removeEventListener('mouseleave', leave);
        cell.removeEventListener('mousemove', move);
        cell.removeEventListener('click', click);
      });
    };
  }, [step]);

  // Default 3 slots for new dates
  const defaultSlots = () => [
    { id: slotIdCounter++, time: '08:00', label: 'Meal 1', items: [] },
    { id: slotIdCounter++, time: '12:30', label: 'Meal 2', items: [] },
    { id: slotIdCounter++, time: '19:00', label: 'Meal 3', items: [] },
  ];

  // Easy time picker helper: convert "HH:MM" to { hour, minute, period }
  const parseTime = (t) => {
    const [h, m] = (t || '12:00').split(':').map(Number);
    return { hour: h % 12 || 12, minute: m, period: h >= 12 ? 'PM' : 'AM' };
  };
  // Convert { hour, minute, period } back to "HH:MM"
  const buildTime = (hour, minute, period) => {
    let h = hour % 12;
    if (period === 'PM') h += 12;
    if (h === 24) h = 12;
    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  const toggleDate = (dateStr) => {
    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        setSchedule(p => { const n = { ...p }; delete n[dateStr]; return n; });
        return prev.filter(d => d !== dateStr);
      }
      setSchedule(p => ({ ...p, [dateStr]: p[dateStr] || defaultSlots() }));
      return [...prev, dateStr];
    });
  };

  // Add new time slot — auto-number, appends at bottom
  const addSlot = (date) => {
    const nextNum = (schedule[date] || []).length + 1;
    const newSlot = { id: slotIdCounter++, time: '10:00', label: `Meal ${nextNum}`, items: [] };
    setSchedule(prev => ({ ...prev, [date]: [...(prev[date] || []), newSlot] }));
    showToast(' New meal slot added at bottom!');
  };

  // Remove a slot
  const removeSlot = (date, slotId) => {
    setSchedule(prev => ({ ...prev, [date]: (prev[date] || []).filter(s => s.id !== slotId) }));
  };

  // Update slot time
  const setSlotTime = (date, slotId, time) => {
    setSchedule(prev => {
      const slots = (prev[date] || []).map(s => s.id === slotId ? { ...s, time } : s).sort((a, b) => a.time.localeCompare(b.time));
      return { ...prev, [date]: slots };
    });
  };

  // Update slot label
  const setSlotLabel = (date, slotId, label) => {
    setSchedule(prev => ({
      ...prev, [date]: (prev[date] || []).map(s => s.id === slotId ? { ...s, label } : s)
    }));
  };

  // Food management
  const addItem = (date, slotId, item) => {
    setSchedule(prev => ({
      ...prev,
      [date]: (prev[date] || []).map(s => {
        if (s.id !== slotId) return s;
        const existing = s.items.find(i => i.id === item.id);
        const items = existing
          ? s.items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
          : [...s.items, { ...item, qty: 1 }];
        return { ...s, items };
      })
    }));
  };

  const updateQty = (date, slotId, itemId, delta) => {
    setSchedule(prev => ({
      ...prev,
      [date]: (prev[date] || []).map(s => {
        if (s.id !== slotId) return s;
        return { ...s, items: s.items.map(i => i.id === itemId ? { ...i, qty: Math.max(1, i.qty + delta) } : i) };
      })
    }));
  };

  const removeItem = (date, slotId, itemId) => {
    setSchedule(prev => ({
      ...prev,
      [date]: (prev[date] || []).map(s => s.id !== slotId ? s : { ...s, items: s.items.filter(i => i.id !== itemId) })
    }));
  };

  // Copy entire day to ALL dates
  const copyDayToAll = (srcDate) => {
    const srcSlots = schedule[srcDate];
    if (!srcSlots?.length) return;
    const updated = { ...schedule };
    selectedDates.forEach(d => {
      if (d !== srcDate) {
        updated[d] = srcSlots.map(s => ({ ...s, id: slotIdCounter++, items: s.items.map(i => ({ ...i })) }));
      }
    });
    setSchedule(updated);
    showToast(` Copied to all ${selectedDates.length} dates!`);
  };

  // Copy day to SPECIFIC selected dates
  const copyDayToSpecific = (srcDate) => {
    const srcSlots = schedule[srcDate];
    if (!srcSlots?.length || copyTargetDates.length === 0) return;
    const updated = { ...schedule };
    copyTargetDates.forEach(d => {
      updated[d] = srcSlots.map(s => ({ ...s, id: slotIdCounter++, items: s.items.map(i => ({ ...i })) }));
    });
    setSchedule(updated);
    showToast(` Copied to ${copyTargetDates.length} date${copyTargetDates.length > 1 ? 's' : ''}!`);
    setShowCopyPicker(false);
    setCopyTargetDates([]);
  };

  const toggleCopyTarget = (dateStr) => {
    setCopyTargetDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]);
  };

  // Calculations
  const getAllItems = () => {
    const items = [];
    Object.values(schedule).forEach(slots => slots.forEach(s => s.items.forEach(i => items.push(i))));
    return items;
  };
  const allItems = getAllItems();
  const subtotal = allItems.reduce((a, c) => a + c.price * c.qty, 0);
  const filledDates = selectedDates.filter(d => (schedule[d] || []).some(s => s.items.length > 0));
  const deliveryFee = filledDates.length > 0 ? 40 * filledDates.length : 0;
  const total = subtotal + deliveryFee + tip;

  const activeSlotItems = (() => {
    const slots = schedule[activeDate] || [];
    const slot = slots.find(s => s.id === activeSlotId);
    return slot?.items || [];
  })();

  const today = new Date();
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const formatTime12 = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const filteredMenu = (() => {
    let items = MENU_ITEMS.filter(m => m.available && m.name.toLowerCase().includes(search.toLowerCase()));
    if (foodCat !== 'All') items = items.filter(m => m.category === foodCat);
    if (nutriSort === 'highProtein') items = [...items].sort((a, b) => b.protein - a.protein);
    else if (nutriSort === 'lowCal') items = [...items].sort((a, b) => a.calories - b.calories);
    else if (nutriSort === 'lowFat') items = [...items].sort((a, b) => a.fat - b.fat);
    else if (nutriSort === 'lowCarb') items = [...items].sort((a, b) => a.carbs - b.carbs);
    return items;
  })();
  const getDateTotalItems = (date) => (schedule[date] || []).reduce((a, s) => a + s.items.length, 0);

  const handlePlaceOrder = () => {
    if (filledDates.length === 0) { showToast('Add food to at least one time slot', 'error'); return; }
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const itemMap = {};
    allItems.forEach(item => { if (itemMap[item.id]) itemMap[item.id].qty += item.qty; else itemMap[item.id] = { ...item }; });
    const enrichedItems = Object.values(itemMap).map(item => {
      const mi = MENU_ITEMS.find(m => m.id === item.id);
      return { menuId: item.id, name: item.name, qty: item.qty, price: item.price * item.qty, calories: mi?.calories || 0, protein: mi?.protein || 0, carbs: mi?.carbs || 0, fat: mi?.fat || 0 };
    });
    const newOrder = placeOrder({
      customerId: user.id, customerName: user.name,
      customerAddress: user.address || '45 JP Nagar, 6th Phase, Bangalore',
      items: enrichedItems, subtotal, deliveryFee, tip, total,
      paymentMethod: payment, paymentStatus: payment === 'COD' ? 'Pending' : 'Paid',
      scheduledDates: filledDates, schedule, otp,
    });
    setOrderPlaced({ ...newOrder, otp });
    setSchedule({}); setSelectedDates([]); setStep(1);
    showToast(`Order placed! OTP: ${otp} `);
  };

  // ═══ ORDER SUCCESS ═══
  if (orderPlaced) return (
    <DashboardLayout title="Schedule Foods">
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 'clamp(57px, 3vw, 76px)', marginBottom: 16 }}></div>
        <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, marginBottom: 8 }}>Order Placed!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Order #{orderPlaced.id}</p>
        <div style={{ background: 'rgba(249,115,22,0.08)', borderRadius: 16, padding: '16px 32px', display: 'inline-block', marginBottom: 16 }}>
          <div style={{ fontSize: 'clamp(12px, 3vw, 16px)', color: 'var(--text-muted)', fontWeight: 700 }}>YOUR OTP</div>
          <div style={{ fontFamily: 'Outfit', fontSize: 'clamp(30px, 3vw, 40px)', fontWeight: 900, color: 'var(--accent-orange)', letterSpacing: 6 }}>{orderPlaced.otp}</div>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 'clamp(12px, 3vw, 17px)' }}> {(orderPlaced.scheduledDates || []).map(d => fmtDate(d)).join(' • ')}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate(`${rolePrefix}/orders`)}> Track Order</button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate(`${rolePrefix}/menu`)}> Order More</button>
        </div>
      </div>
    </DashboardLayout>
  );

  // ═══ STEP BAR ═══
  const StepBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 20 }}>
      {[{ num: 1, label: 'Select Dates', icon: '' }, { num: 2, label: 'Time Slots & Food', icon: '' }, { num: 3, label: 'Review & Order', icon: '' }].map((s, i) => (
        <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
          <div onClick={() => {
            if (s.num === 1) setStep(1);
            if (s.num === 2 && selectedDates.length > 0) { setStep(2); if (!activeDate) setActiveDate(selectedDates.sort()[0]); }
            if (s.num === 3 && filledDates.length > 0) setStep(3);
          }} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
            background: step === s.num ? 'var(--accent-orange)' : step > s.num ? 'rgba(34,197,94,0.1)' : 'var(--bg-tertiary)',
            color: step === s.num ? '#fff' : step > s.num ? 'var(--accent-green)' : 'var(--text-muted)',
            fontWeight: 700, fontSize: 'clamp(12px, 3vw, 17px)', transition: 'all 0.3s',
          }}>
            <span style={{ fontSize: 'clamp(15px, 3vw, 20px)' }}>{step > s.num ? '' : s.icon}</span><span>{s.label}</span>
          </div>
          {i < 2 && <div style={{ width: 32, height: 2, background: step > s.num ? 'var(--accent-green)' : 'var(--border)' }} />}
        </div>
      ))}
    </div>
  );

  // Slot color based on index
  const slotColors = ['#f97316', '#22c55e', '#3b82f6', '#8b5cf6', '#ef4444', '#eab308', '#14b8a6', '#ec4899'];

  // Goal-based suggestion logic for Smart Meal Optimization
  const userGoal = user?.goal || 'Maintenance';
  const goalConfig = {
    'Weight Loss': { label: 'Low-Cal Picks for Weight Loss', filter: (m) => m.calories <= 400 && m.protein >= 15, color: '#ef4444' },
    'Muscle Gain': { label: 'High-Protein for Muscle Gain', filter: (m) => m.protein >= 35, color: '#22c55e' },
    'Maintenance': { label: 'Balanced Meals for Maintenance', filter: (m) => m.calories >= 300 && m.calories <= 500, color: '#3b82f6' },
  };
  const cfg = goalConfig[userGoal] || goalConfig['Maintenance'];
  const suggested = MENU_ITEMS.filter(m => m.available && cfg.filter(m)).slice(0, 4);

  return (
    <DashboardLayout title="Schedule Foods">
      <StepBar />

      {/* ═══ STEP 1 ═══ */}
      {step === 1 && (
        /* Increased maxWidth from 640 to 800 and padded the card for a larger layout */
        <div className="card" style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: 16 }}>
            <h3 className="card-title" style={{ fontSize: '1.4rem' }}> Step 1: Select Delivery Dates</h3>
          </div>
          <p style={{ fontSize: 'clamp(13px, 3vw, 18px)', color: 'var(--text-muted)', marginBottom: 20 }}>
            Pick dates. For each date you can add as many time slots as you need and select food for each.
          </p>
          
          <div className="cal-grid-magic" ref={calGridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: 24, position: 'relative', width: '100%' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 800, color: 'var(--text-muted)', padding: '8px 0' }}>{d}</div>
            ))}
            {Array.from({ length: new Date(calendarDays[0]).getDay() }, (_, i) => <div key={'e' + i} />)}
            {calendarDays.map(dateStr => {
              const isSelected = selectedDates.includes(dateStr);
              const isToday = dateStr === today.toISOString().split('T')[0];
              return (
                <button 
                  key={dateStr} 
                  onClick={() => toggleDate(dateStr)} 
                  className="cal-magic-cell" 
                  style={{
                    /* Increased vertical padding from 8px to 18px to scale button heights */
                    padding: '18px 0', 
                    minWidth: 0, 
                    borderRadius: 12, 
                    border: isSelected ? '2px solid var(--accent-orange)' : '2px solid transparent',
                    cursor: 'pointer', 
                    /* Increased font size from 14 to 16 for better visibility */
                    fontSize: 'clamp(15px, 3vw, 20px)', 
                    fontWeight: 700, 
                    transition: 'all 0.2s',
                    background: isSelected ? 'var(--accent-orange)' : isToday ? 'rgba(249,115,22,0.08)' : 'var(--bg-tertiary)',
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                    position: 'relative', 
                    overflow: 'hidden',
                    '--glow-x': '50%', '--glow-y': '50%', '--glow-intensity': '0', '--glow-radius': '150px',
                  }}
                >
                  {new Date(dateStr).getDate()}
                </button>
              );
            })}
          </div>

          {selectedDates.length > 0 && (
            <div style={{ padding: 16, background: 'rgba(34,197,94,0.06)', borderRadius: 12, marginBottom: 20, fontSize: 'clamp(13px, 3vw, 18px)' }}>
              <strong> {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''}:</strong> {selectedDates.sort().map(d => fmtDate(d)).join(' • ')}
            </div>
          )}

          <button className="btn btn-primary btn-lg" style={{ width: '100%', padding: '16px 0', fontSize: 'clamp(15px, 3vw, 20px)' }}
            onClick={() => { if (selectedDates.length === 0) { showToast('Select at least one date', 'error'); return; } selectedDates.forEach(d => { if (!schedule[d]) setSchedule(p => ({ ...p, [d]: defaultSlots() })); }); setActiveDate(selectedDates.sort()[0]); setStep(2); }}
            disabled={selectedDates.length === 0}>
            {selectedDates.length > 0 ? `Next → Set Time Slots (${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''})` : 'Select dates first'}
          </button>
        </div>
      )}

      {/* ═══ STEP 2: UNLIMITED TIME SLOTS PER DATE ═══ */}
      {step === 2 && (
        <div>
          {/* Food Picker Modal — FULL WIDTH */}
          {showFoodPicker && (
            <div className="modal-overlay" onClick={() => { setSchedule(prev => { const s = { ...prev }; s[activeDate] = s[activeDate].map(sl => sl.id === activeSlotId ? { ...sl, items: slotSnapshot || [] } : sl); return s; }); setShowFoodPicker(false); setSlotSnapshot(null); setSearch(''); setFoodCat('All'); setNutriSort(null); }}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 800, width: '95vw', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                <div className="modal-header">
                  <h3 className="modal-title"> Add Food — {(() => { const s = (schedule[activeDate] || []).find(s => s.id === activeSlotId); return s ? `${s.label} (${formatTime12(s.time)})` : ''; })()}, {fmtDate(activeDate)}</h3>
                  <button className="modal-close" onClick={() => { setSchedule(prev => { const s = { ...prev }; s[activeDate] = s[activeDate].map(sl => sl.id === activeSlotId ? { ...sl, items: slotSnapshot || [] } : sl); return s; }); setShowFoodPicker(false); setSlotSnapshot(null); setSearch(''); setFoodCat('All'); setNutriSort(null); }}></button>
                </div>

                {/* Smart Meal Optimization Section */}
                {suggested.length > 0 && (
                  <div style={{ marginBottom: 12, padding: '16px 20px', background: 'rgba(249,115,22,0.03)', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 'clamp(13px, 3vw, 18px)', color: cfg.color }}>Smart Meal Optimization</span>
                    </div>
                    <div style={{ fontSize: 'clamp(12px, 3vw, 17px)', color: 'var(--text-muted)', marginBottom: 12 }}>
                      Based on your <strong>[{userGoal}]</strong> goal and body profile, here are options rated for balanced macros.
                    </div>

                    {/* Recommended Add-on item */}
                    {suggested[1] && (
                      <div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, background: 'var(--bg-secondary)', marginBottom: showSchedAlternatives ? 12 : 0 }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <img src={suggested[1].image} alt={suggested[1].name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, fontSize: 'clamp(14px, 3vw, 20px)' }}>{suggested[1].name}</div>
                              <div style={{ fontSize: 'clamp(14px, 3vw, 17px)', color: 'var(--text-muted)', margin: '2px 0' }}>Built for {userGoal.toLowerCase()}, fueled for results.</div>
                              <div style={{ display: 'flex', gap: 8, fontSize: 'clamp(14px, 3vw, 18px)', color: 'var(--text-muted)' }}>
                                <span>{suggested[1].calories} kcal</span>
                                <span>{suggested[1].protein}g prot.</span>
                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Score 9.5</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <button className="btn btn-primary btn-sm" style={{ fontSize: 'clamp(12px, 3vw, 16px)' }} onClick={() => addItem(activeDate, activeSlotId, suggested[1])}>Order</button>
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: 'clamp(12px, 3vw, 15px)', background: showSchedAlternatives ? 'rgba(249,115,22,0.08)' : 'transparent', borderColor: showSchedAlternatives ? 'var(--accent-orange)' : undefined, color: showSchedAlternatives ? 'var(--accent-orange)' : undefined }}
                                onClick={() => setShowSchedAlternatives(v => !v)}
                              >
                                {showSchedAlternatives ? '' : 'Not right?\nAlternatives'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Alternatives panel */}
                        {showSchedAlternatives && (
                          <div style={{ animation: 'fadeInUp 0.2s ease' }}>
                            <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}> Alternatives for <strong>{userGoal}</strong></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {suggested.filter((_, i) => i !== 1).map(alt => (
                                <div key={alt.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', transition: 'all 0.2s' }}
                                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-orange)'}
                                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                  <img src={alt.image} alt={alt.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: 'clamp(12px, 3vw, 16px)' }}>{alt.name}</div>
                                    <div style={{ display: 'flex', gap: 6, fontSize: 'clamp(12px, 3vw, 14px)', color: 'var(--text-muted)', marginTop: 2 }}>
                                      <span> {alt.calories} kcal</span>
                                      <span> {alt.protein}g</span>
                                      <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>₹{alt.price}</span>
                                    </div>
                                  </div>
                                  <button className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: 'clamp(12px, 3vw, 15px)' }} onClick={() => { addItem(activeDate, activeSlotId, alt); setShowSchedAlternatives(false); }}>+ Add</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Live Nutrition Rings */}
                {(() => {
                  const dateSlots = schedule[activeDate] || [];
                  const dCal = dateSlots.reduce((a, s) => a + s.items.reduce((b, i) => b + (i.calories || 0) * i.qty, 0), 0);
                  const dPro = dateSlots.reduce((a, s) => a + s.items.reduce((b, i) => b + (i.protein || 0) * i.qty, 0), 0);
                  const dCarb = dateSlots.reduce((a, s) => a + s.items.reduce((b, i) => b + (i.carbs || 0) * i.qty, 0), 0);
                  const dFat = dateSlots.reduce((a, s) => a + s.items.reduce((b, i) => b + (i.fat || 0) * i.qty, 0), 0);
                  return (
                    <div style={{ padding: '10px 0 12px', borderBottom: '1px solid var(--border)', marginBottom: 10 }}>
                      <div className="nutrition-rings-grid">
                        <Ring value={dCal} target={targets.calories} color="#f97316" icon="" label="Cal" unit="kcal" size={64} stroke={6} />
                        <Ring value={dPro} target={targets.protein} color="#22c55e" icon="" label="Pro" unit="g" size={64} stroke={6} />
                        <Ring value={dCarb} target={targets.carbs} color="#3b82f6" icon="" label="Carb" unit="g" size={64} stroke={6} />
                        <Ring value={dFat} target={targets.fat} color="#eab308" icon="" label="Fat" unit="g" size={64} stroke={6} />
                      </div>
                    </div>
                  );
                })()}

                {/* Search + Filters */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}></span>
                    <input className="form-input" placeholder="Search food..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, fontSize: 'clamp(13px, 3vw, 18px)' }} />
                  </div>
                </div>

                {/* Category Pills */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 8, overflowX: 'auto', paddingBottom: 2 }}>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setFoodCat(c)} style={{
                      padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 'clamp(12px, 3vw, 15px)', fontWeight: 700, whiteSpace: 'nowrap',
                      background: foodCat === c ? 'var(--accent-orange)' : 'var(--bg-tertiary)',
                      color: foodCat === c ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s',
                    }}>{c}</button>
                  ))}
                </div>

                {/* Nutrient Sort Filters */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {[
                    { key: 'highProtein', label: ' High Protein', color: '#22c55e' },
                    { key: 'lowCal', label: ' Low Calorie', color: '#f97316' },
                    { key: 'lowFat', label: ' Low Fat', color: '#eab308' },
                    { key: 'lowCarb', label: ' Low Carb', color: '#3b82f6' },
                  ].map(f => (
                    <button key={f.key} onClick={() => setNutriSort(nutriSort === f.key ? null : f.key)} style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 700, cursor: 'pointer',
                      border: `1.5px solid ${nutriSort === f.key ? f.color : 'var(--border)'}`,
                      background: nutriSort === f.key ? `${f.color}15` : 'transparent',
                      color: nutriSort === f.key ? f.color : 'var(--text-muted)', transition: 'all 0.2s',
                    }}>{f.label}{nutriSort === f.key ? ' ↓' : ''}</button>
                  ))}
                </div>

                {/* Food List — Bigger cards */}
                <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                  {filteredMenu.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 'clamp(12px, 3vw, 17px)' }}>No food items found</div>
                  )}
                  {filteredMenu.map(item => {
                    const inSlot = activeSlotItems.find(i => i.id === item.id);
                    return (
                      <div key={item.id} style={{
                        display: 'flex', gap: 12, padding: 10, marginBottom: 6, borderRadius: 12, alignItems: 'center',
                        background: inSlot ? 'rgba(249,115,22,0.06)' : 'transparent',
                        border: `1.5px solid ${inSlot ? 'var(--accent-orange)' : 'var(--border)'}`,
                      }}>
                        <img src={item.image} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 'clamp(13px, 3vw, 18px)' }}>{item.name}</div>
                          <div style={{ display: 'flex', gap: 10, fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)', marginTop: 2 }}>
                            <span style={{ color: '#f97316' }}> {item.calories}</span>
                            <span style={{ color: '#22c55e' }}> {item.protein}g</span>
                            <span style={{ color: '#3b82f6' }}> {item.carbs}g</span>
                            <span style={{ color: '#eab308' }}> {item.fat}g</span>
                          </div>
                          <div style={{ fontSize: 'clamp(12px, 3vw, 17px)', fontWeight: 800, color: 'var(--accent-green)', marginTop: 2 }}>₹{item.price}</div>
                        </div>
                        {inSlot ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button className="btn btn-outline" style={{ width: 30, height: 30, padding: 0, fontSize: 'clamp(14px, 3vw, 19px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { if (inSlot.qty <= 1) removeItem(activeDate, activeSlotId, item.id); else updateQty(activeDate, activeSlotId, item.id, -1); }}>−</button>
                            <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(15px, 3vw, 20px)', minWidth: 22, textAlign: 'center' }}>{inSlot.qty}</span>
                            <button className="btn btn-outline" style={{ width: 30, height: 30, padding: 0, fontSize: 'clamp(14px, 3vw, 19px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => updateQty(activeDate, activeSlotId, item.id, 1)}>+</button>
                          </div>
                        ) : (
                          <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 'clamp(12px, 3vw, 17px)', fontWeight: 800 }} onClick={() => addItem(activeDate, activeSlotId, item)}>+ Add</button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="modal-footer" style={{ position: 'sticky', bottom: 0, marginTop: 0, padding: '10px 16px', background: 'var(--bg-primary)', borderTop: '1.5px solid var(--border)', zIndex: 5, flexShrink: 0 }}>
                  <span style={{ fontSize: 'clamp(12px, 3vw, 16px)', color: 'var(--text-muted)' }}>{activeSlotItems.length} items in this meal</span>
                  <button className="btn btn-primary" style={{ fontSize: 'clamp(13px, 3vw, 18px)', padding: '10px 28px' }} onClick={() => { setShowFoodPicker(false); setSlotSnapshot(null); setSearch(''); setFoodCat('All'); setNutriSort(null); }}> Done</button>
                </div>
              </div>
            </div>
          )}

          {/* Copy to specific dates modal */}
          {showCopyPicker && (
            <div className="modal-overlay" onClick={() => { setShowCopyPicker(false); setCopyTargetDates([]); }}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                <div className="modal-header">
                  <h3 className="modal-title"> Copy to Specific Dates</h3>
                  <button className="modal-close" onClick={() => { setShowCopyPicker(false); setCopyTargetDates([]); }}></button>
                </div>
                <p style={{ fontSize: 'clamp(12px, 3vw, 16px)', color: 'var(--text-muted)', marginBottom: 12 }}>Select which dates to paste this meal plan to:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {selectedDates.sort().filter(d => d !== activeDate).map(dateStr => {
                    const isChecked = copyTargetDates.includes(dateStr);
                    const existingCount = getDateTotalItems(dateStr);
                    return (
                      <div key={dateStr} onClick={() => toggleCopyTarget(dateStr)} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                        background: isChecked ? 'rgba(249,115,22,0.08)' : 'var(--bg-tertiary)',
                        border: `1.5px solid ${isChecked ? 'var(--accent-orange)' : 'var(--border)'}`,
                      }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${isChecked ? 'var(--accent-orange)' : 'var(--border)'}`, background: isChecked ? 'var(--accent-orange)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 900 }}>
                          {isChecked && ''}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 'clamp(12px, 3vw, 17px)' }}>{fmtDate(dateStr)}</div>
                          {existingCount > 0 && <div style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: 'var(--accent-orange)' }}> Has {existingCount} items (will be replaced)</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => { setShowCopyPicker(false); setCopyTargetDates([]); }}>Cancel</button>
                  <button className="btn btn-primary" onClick={() => copyDayToSpecific(activeDate)} disabled={copyTargetDates.length === 0}>
                     Paste to {copyTargetDates.length} date{copyTargetDates.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button className="btn btn-outline btn-sm" onClick={() => setStep(1)}>← Back to Dates</button>
          </div>

          {/* Date tabs */}
         {/* Date tabs */}
          <div className="scrolling-tabs-container" style={{ flexWrap: 'nowrap' }}>
            {selectedDates.sort().map(dateStr => {
              const count = getDateTotalItems(dateStr);
              const slotCount = (schedule[dateStr] || []).length;
              const isActive = activeDate === dateStr;
              return (
                <div key={dateStr} style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', flexShrink: 0 }}>
                  <button onClick={() => setActiveDate(dateStr)} style={{
                    padding: '10px 34px 10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                    background: isActive ? 'var(--accent-orange)' : count > 0 ? 'rgba(34,197,94,0.1)' : 'var(--bg-tertiary)',
                    color: isActive ? '#fff' : count > 0 ? 'var(--accent-green)' : 'var(--text-muted)',
                    fontWeight: 800, fontSize: 'clamp(12px, 3vw, 16px)', transition: 'all 0.2s',
                  }}>
                    {fmtDate(dateStr)} {count > 0 ? `(${count})` : ''} • {slotCount} slots
                  </button>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    const remaining = selectedDates.filter(d => d !== dateStr);
                    setSelectedDates(remaining);
                    setSchedule(p => { const n = { ...p }; delete n[dateStr]; return n; });
                    if (remaining.length === 0) { setStep(1); setActiveDate(null); }
                    else if (activeDate === dateStr) setActiveDate(remaining.sort()[0]);
                    showToast(` ${fmtDate(dateStr)} removed`);
                  }} style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    width: 20, height: 20, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 'clamp(12px, 3vw, 14px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900,
                    background: isActive ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.08)',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                  }} title="Remove date"></button>
                </div>
              );
            })}
          </div>

          {/* Per-Date Nutrition Rings */}
          {activeDate && (() => {
            const dateSlots = schedule[activeDate] || [];
            const dateCal = dateSlots.reduce((a, s) => a + s.items.reduce((b, i) => b + (i.calories || 0) * i.qty, 0), 0);
            const datePro = dateSlots.reduce((a, s) => a + s.items.reduce((b, i) => b + (i.protein || 0) * i.qty, 0), 0);
            const dateCarb = dateSlots.reduce((a, s) => a + s.items.reduce((b, i) => b + (i.carbs || 0) * i.qty, 0), 0);
            const dateFat = dateSlots.reduce((a, s) => a + s.items.reduce((b, i) => b + (i.fat || 0) * i.qty, 0), 0);
            const calPct = Math.round((dateCal / targets.calories) * 100);
            // Notify when target reached
            if (calPct >= 100 && !notifiedDates.current.has(activeDate)) {
              notifiedDates.current.add(activeDate);
              setTimeout(() => showToast(` Target reached for ${fmtDate(activeDate)}! ${dateCal} / ${targets.calories} kcal`), 100);
            }
            if (calPct < 100) notifiedDates.current.delete(activeDate);
            return (
              <div className="card" style={{ padding: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(12px, 3vw, 17px)' }}> {fmtDate(activeDate)} — Nutrition</span>
                  <span style={{ fontSize: 'clamp(12px, 3vw, 15px)', fontWeight: 700, color: calPct >= 100 ? '#22c55e' : calPct > 80 ? '#f97316' : 'var(--text-muted)' }}>
                    {calPct >= 100 ? ' Target reached!' : calPct > 80 ? ` ${calPct}% almost there` : `${calPct}%`}
                  </span>
                </div>
                <div className="nutrition-rings-grid">
                  <Ring value={dateCal} target={targets.calories} color="#f97316" icon="" label="Calories" unit="kcal" />
                  <Ring value={datePro} target={targets.protein} color="#22c55e" icon="" label="Protein" unit="g" />
                  <Ring value={dateCarb} target={targets.carbs} color="#3b82f6" icon="" label="Carbs" unit="g" />
                  <Ring value={dateFat} target={targets.fat} color="#eab308" icon="" label="Fat" unit="g" />
                </div>
              </div>
            );
          })()}

          {/* Time Slots for active date */}
          {activeDate && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(schedule[activeDate] || []).map((slot, idx) => {
                const color = slotColors[idx % slotColors.length];
                const slotTotal = slot.items.reduce((a, c) => a + c.price * c.qty, 0);
                const slotCal = slot.items.reduce((a, c) => a + (c.calories || 0) * c.qty, 0);

                return (
                  <div key={slot.id} className="card" style={{ borderLeft: `4px solid ${color}`, padding: 0, overflow: 'hidden' }}>
                    {/* Slot Header */}
                    <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${color}08` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 'clamp(12px, 3vw, 16px)' }}>{idx + 1}</div>
                        <input value={slot.label} onChange={e => setSlotLabel(activeDate, slot.id, e.target.value)}
                          style={{ border: 'none', background: 'transparent', fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(14px, 3vw, 19px)', color: color, width: 140, outline: 'none' }}
                          placeholder="Meal name" />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {(() => {
                          const parsed = parseTime(slot.time);
                          const selectStyle = {
                            padding: '5px 6px', borderRadius: 8, border: `1.5px solid ${color}40`,
                            background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 'clamp(12px, 3vw, 17px)',
                            fontFamily: 'Outfit', fontWeight: 700, cursor: 'pointer', appearance: 'auto',
                          };
                          return (
                            <>
                              <select value={parsed.hour} style={selectStyle} onChange={e => setSlotTime(activeDate, slot.id, buildTime(Number(e.target.value), parsed.minute, parsed.period))}>
                                {[12,1,2,3,4,5,6,7,8,9,10,11].map(h => <option key={h} value={h}>{h}</option>)}
                              </select>
                              <span style={{ fontWeight: 900, color }}>:</span>
                              <select value={parsed.minute} style={selectStyle} onChange={e => setSlotTime(activeDate, slot.id, buildTime(parsed.hour, Number(e.target.value), parsed.period))}>
                                {[0,5,10,15,20,25,30,35,40,45,50,55].map(m => <option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
                              </select>
                              <select value={parsed.period} style={{ ...selectStyle, fontWeight: 900, color }} onChange={e => setSlotTime(activeDate, slot.id, buildTime(parsed.hour, parsed.minute, e.target.value))}>
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </>
                          );
                        })()}
                        <button onClick={() => removeSlot(activeDate, slot.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'clamp(13px, 3vw, 18px)', color: 'var(--accent-red)', marginLeft: 4 }} title="Remove slot"></button>
                      </div>
                    </div>

                    {/* Items — Horizontal Grid Pack Layout */}
                    <div style={{ padding: '12px 14px' }}>
                      {/* Pack Title */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 'clamp(12px, 3vw, 15px)', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                          {slot.items.length > 0 ? `${slot.items.reduce((a, i) => a + i.qty, 0)} Pack` : 'Empty Pack'}
                        </span>
                        {slot.items.length > 0 && (
                          <span style={{ fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 700, color }}>
                             {slotCal} kcal • ₹{slotTotal}
                          </span>
                        )}
                      </div>

                      {/* Horizontal scroll of food items */}
                      <div style={{
                        display: 'flex',
                        gap: 6,
                        overflowX: 'auto',
                        paddingBottom: 4,
                        marginBottom: 8,
                      }}>
                        {slot.items.map((item, itemIdx) => (
                          <div key={item.id} style={{
                            position: 'relative',
                            width: 80, minWidth: 80, height: 100,
                            borderRadius: 8,
                            overflow: 'hidden',
                            border: `1.5px solid ${color}30`,
                            background: 'var(--bg-tertiary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'scale(1.04)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.transform = 'scale(1)'; }}
                          >
                            <div style={{
                              position: 'absolute', top: 2, left: 2, zIndex: 2,
                              width: 14, height: 14, borderRadius: '50%',
                              background: color, color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 'clamp(12px, 3vw, 11px)', fontWeight: 900,
                              boxShadow: `0 1px 4px ${color}60`,
                            }}>{itemIdx + 1}</div>

                            <button onClick={() => removeItem(activeDate, slot.id, item.id)} style={{
                              position: 'absolute', top: 2, right: 2, zIndex: 2,
                              width: 12, height: 12, borderRadius: '50%',
                              background: 'rgba(239,68,68,0.85)', color: '#fff',
                              border: 'none', cursor: 'pointer', fontSize: 'clamp(12px, 3vw, 10px)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 900,
                            }}></button>

                            <img src={item.image} alt={item.name} style={{
                              width: '100%', height: 48, objectFit: 'cover',
                            }} />

                            <div style={{ padding: '2px 3px', textAlign: 'center' }}>
                              <div style={{
                                fontSize: 'clamp(12px, 3vw, 11px)', fontWeight: 800, color: 'var(--text-primary)',
                                lineHeight: 1.1, whiteSpace: 'nowrap',
                                overflow: 'hidden', textOverflow: 'ellipsis',
                              }}>{item.name}</div>
                              <div style={{ fontSize: 'clamp(12px, 3vw, 10px)', color: 'var(--text-muted)' }}>
                                {item.calories * item.qty} • ₹{item.price * item.qty}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, marginTop: 1 }}>
                                <button onClick={() => { if (item.qty <= 1) removeItem(activeDate, slot.id, item.id); else updateQty(activeDate, slot.id, item.id, -1); }}
                                  style={{
                                    width: 13, height: 13, borderRadius: 3, border: `1px solid ${color}50`,
                                    background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 'clamp(12px, 3vw, 12px)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-primary)', fontWeight: 900, padding: 0,
                                  }}>−</button>
                                <span style={{ fontSize: 'clamp(12px, 3vw, 12px)', fontWeight: 900, minWidth: 8, textAlign: 'center', color }}>{item.qty}</span>
                                <button onClick={() => updateQty(activeDate, slot.id, item.id, 1)}
                                  style={{
                                    width: 13, height: 13, borderRadius: 3, border: `1px solid ${color}50`,
                                    background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 'clamp(12px, 3vw, 12px)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-primary)', fontWeight: 900, padding: 0,
                                  }}>+</button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Empty placeholder slots */}
                        {Array.from({ length: 1 }, (_, i) => (
                          <div key={`empty-${i}`}
                            onClick={() => { setActiveSlotId(slot.id); setSlotSnapshot(JSON.parse(JSON.stringify(slot.items))); setShowFoodPicker(true); setSearch(''); }}
                            style={{
                              width: 80, minWidth: 80, height: 100,
                              borderRadius: 8,
                              border: `1.5px dashed ${color}25`,
                              background: `${color}04`,
                              display: 'flex', flexDirection: 'column',
                              alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 0.2s',
                              flexShrink: 0,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}60`; e.currentTarget.style.background = `${color}10`; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}25`; e.currentTarget.style.background = `${color}04`; }}
                          >
                            <div style={{
                              width: 14, height: 14, borderRadius: '50%',
                              background: `${color}15`, color: `${color}50`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 'clamp(12px, 3vw, 11px)', fontWeight: 900, marginBottom: 2,
                            }}>{slot.items.length + i + 1}</div>
                            <div style={{ fontSize: 'clamp(12px, 3vw, 16px)', color: `${color}35` }}>+</div>
                          </div>
                        ))}
                      </div>

                      {/* Add Food Button */}
                      <button className="btn btn-outline btn-sm" style={{ width: '100%', borderColor: `${color}40`, color }}
                        onClick={() => { setActiveSlotId(slot.id); setSlotSnapshot(JSON.parse(JSON.stringify(slot.items))); setShowFoodPicker(true); setSearch(''); }}>
                        + Add Food to {slot.label}
                      </button>

                      {/* Meal Total Footer with Full Nutrition */}
                      {slot.items.length > 0 && (() => {
                        const mealPro = slot.items.reduce((a, i) => a + (i.protein || 0) * i.qty, 0);
                        const mealCarb = slot.items.reduce((a, i) => a + (i.carbs || 0) * i.qty, 0);
                        const mealFat = slot.items.reduce((a, i) => a + (i.fat || 0) * i.qty, 0);
                        return (
                          <div style={{
                            marginTop: 8, padding: '8px 10px', borderRadius: 8,
                            background: `${color}08`, border: `1px solid ${color}15`,
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontSize: 'clamp(12px, 3vw, 15px)', fontWeight: 700, color: 'var(--text-muted)' }}>
                                {slot.label} Total ({slot.items.reduce((a, i) => a + i.qty, 0)} items)
                              </span>
                              <span style={{ fontSize: 'clamp(12px, 3vw, 17px)', fontWeight: 900, color }}>
                                ₹{slotTotal}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 10, fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 700 }}>
                              <span style={{ color: '#f97316' }}> {slotCal} kcal</span>
                              <span style={{ color: '#22c55e' }}> {mealPro}g protein</span>
                              <span style={{ color: '#3b82f6' }}> {mealCarb}g carbs</span>
                              <span style={{ color: '#eab308' }}> {mealFat}g fat</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}

              {/* ═══ DAY TOTAL SUMMARY ═══ */}
              {activeDate && (() => {
                const dateSlots = schedule[activeDate] || [];
                const dayItems = dateSlots.reduce((a, s) => a + s.items.reduce((b, i) => b + i.qty, 0), 0);
                const dayTotal = dateSlots.reduce((a, s) => a + s.items.reduce((b, i) => b + i.price * i.qty, 0), 0);
                const dayCal = dateSlots.reduce((a, s) => a + s.items.reduce((b, i) => b + (i.calories || 0) * i.qty, 0), 0);
                const dayPro = dateSlots.reduce((a, s) => a + s.items.reduce((b, i) => b + (i.protein || 0) * i.qty, 0), 0);
                const dayCarb = dateSlots.reduce((a, s) => a + s.items.reduce((b, i) => b + (i.carbs || 0) * i.qty, 0), 0);
                const dayFat = dateSlots.reduce((a, s) => a + s.items.reduce((b, i) => b + (i.fat || 0) * i.qty, 0), 0);
                if (dayItems === 0) return null;
                return (
                  <div className="card" style={{
                    padding: 0, overflow: 'hidden',
                    border: '2px solid var(--accent-orange)',
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.03), rgba(34,197,94,0.03))',
                  }}>
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(249,115,22,0.06)',
                      borderBottom: '1px solid rgba(249,115,22,0.12)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(12px, 3vw, 17px)', color: 'var(--text-primary)' }}>
                         {fmtDate(activeDate)} — Cost & Nutrition Summary
                      </span>
                      <span style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {dayItems} items total
                      </span>
                    </div>
                    <div style={{ padding: '8px 14px' }}>
                      {dateSlots.map((slot, idx) => {
                        const mealTotal = slot.items.reduce((a, i) => a + i.price * i.qty, 0);
                        const mealItems = slot.items.reduce((a, i) => a + i.qty, 0);
                        const mCal = slot.items.reduce((a, i) => a + (i.calories || 0) * i.qty, 0);
                        const mPro = slot.items.reduce((a, i) => a + (i.protein || 0) * i.qty, 0);
                        const mCarb = slot.items.reduce((a, i) => a + (i.carbs || 0) * i.qty, 0);
                        const mFat = slot.items.reduce((a, i) => a + (i.fat || 0) * i.qty, 0);
                        if (mealItems === 0) return null;
                        return (
                          <div key={slot.id} style={{
                            padding: '6px 0',
                            borderBottom: idx < dateSlots.length - 1 ? '1px solid var(--border)' : 'none',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                  width: 20, height: 20, borderRadius: '50%',
                                  background: slotColors[idx % slotColors.length],
                                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 'clamp(12px, 3vw, 13px)', fontWeight: 900,
                                }}>{idx + 1}</div>
                                <span style={{ fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {slot.label}
                                </span>
                                <span style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: 'var(--text-muted)' }}>
                                  ({mealItems} items)
                                </span>
                              </div>
                              <span style={{ fontSize: 'clamp(12px, 3vw, 17px)', fontWeight: 800, color: slotColors[idx % slotColors.length] }}>
                                ₹{mealTotal}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, fontSize: 'clamp(12px, 3vw, 13px)', fontWeight: 600, marginTop: 2, marginLeft: 26, color: 'var(--text-muted)' }}>
                              <span style={{ color: '#f97316' }}>{mCal}</span>
                              <span style={{ color: '#22c55e' }}>{mPro}g</span>
                              <span style={{ color: '#3b82f6' }}>{mCarb}g</span>
                              <span style={{ color: '#eab308' }}>{mFat}g</span>
                            </div>
                          </div>
                        );
                      })}
                      {/* Grand Total */}
                      <div style={{
                        padding: '10px 0 4px 0',
                        marginTop: 4, borderTop: '2px solid var(--accent-orange)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 'clamp(13px, 3vw, 18px)', fontWeight: 900, color: 'var(--text-primary)' }}>
                             Day Total
                          </span>
                          <span style={{
                            fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: 900, color: 'var(--accent-orange)',
                            fontFamily: 'Outfit',
                          }}>
                            ₹{dayTotal}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 'clamp(12px, 3vw, 15px)', fontWeight: 800, marginTop: 4 }}>
                          <span style={{ color: '#f97316' }}> {dayCal} kcal</span>
                          <span style={{ color: '#22c55e' }}> {dayPro}g protein</span>
                          <span style={{ color: '#3b82f6' }}> {dayCarb}g carbs</span>
                          <span style={{ color: '#eab308' }}> {dayFat}g fat</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Add new time slot */}
              <button className="btn btn-outline" onClick={() => addSlot(activeDate)}
                style={{ width: '100%', padding: 14, borderStyle: 'dashed', fontSize: 'clamp(13px, 3vw, 18px)', fontWeight: 700 }}>
                 Add Another Meal Slot
              </button>

              {/* Copy buttons — at bottom */}
              {selectedDates.length > 1 && getDateTotalItems(activeDate) > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-outline" style={{ flex: 1, fontSize: 'clamp(12px, 3vw, 16px)' }} onClick={() => copyDayToAll(activeDate)}>
                     Copy to ALL dates ({selectedDates.length - 1})
                  </button>
                  <button className="btn btn-outline" style={{ flex: 1, fontSize: 'clamp(12px, 3vw, 16px)' }} onClick={() => { setCopyTargetDates([]); setShowCopyPicker(true); }}>
                     Copy to specific dates
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button className="btn btn-primary btn-lg" style={{ minWidth: 300 }}
              onClick={() => { if (filledDates.length === 0) { showToast('Add food to at least one slot', 'error'); return; } setStep(3); }}
              disabled={filledDates.length === 0}>
              {filledDates.length > 0 ? `Next → Review & Order (${filledDates.length} date${filledDates.length > 1 ? 's' : ''})` : 'Add food to continue'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: REVIEW & ORDER ═══ */}
      {step === 3 && (
        <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="card-header"><h3 className="card-title"> Step 3: Review & Place Order</h3></div>
          <button className="btn btn-outline btn-sm" onClick={() => setStep(2)} style={{ marginBottom: 14 }}>← Back to Slots</button>

          {filledDates.sort().map(dateStr => {
            const slots = (schedule[dateStr] || []).filter(s => s.items.length > 0);
            return (
              <div key={dateStr} style={{ marginBottom: 14, padding: 12, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(13px, 3vw, 18px)', marginBottom: 8 }}> {fmtDate(dateStr)}</div>
                {slots.map((slot, idx) => {
                  const color = slotColors[idx % slotColors.length];
                  const slotTotal = slot.items.reduce((a, c) => a + c.price * c.qty, 0);
                  return (
                    <div key={slot.id} style={{ marginBottom: 6, paddingLeft: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(12px, 3vw, 16px)' }}>
                        <span style={{ fontWeight: 700, color }}> {slot.label} — {formatTime12(slot.time)}</span>
                        <span style={{ fontWeight: 800 }}>₹{slotTotal}</span>
                      </div>
                      <div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)', paddingLeft: 4 }}>
                        {slot.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Payment */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>PAYMENT METHOD</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['COD', 'UPI', 'Card'].map(p => (
                <button key={p} onClick={() => setPayment(p)} className={`btn btn-sm ${payment === p ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }}>
                  {p === 'COD' ? '' : p === 'UPI' ? '' : ''} {p}
                </button>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>TIP</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 20, 30, 50].map(t => (<button key={t} onClick={() => setTip(t)} className={`btn btn-sm ${tip === t ? 'btn-primary' : 'btn-outline'}`}>₹{t}</button>))}
            </div>
          </div>

          {/* Price */}
          <div style={{ padding: 14, background: 'rgba(249,115,22,0.04)', borderRadius: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(12px, 3vw, 17px)', marginBottom: 6 }}><span style={{ color: 'var(--text-muted)' }}>Subtotal ({allItems.reduce((a, c) => a + c.qty, 0)} items)</span><span>₹{subtotal}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(12px, 3vw, 17px)', marginBottom: 6 }}><span style={{ color: 'var(--text-muted)' }}>Delivery (×{filledDates.length} days)</span><span>₹{deliveryFee}</span></div>
            {tip > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(12px, 3vw, 17px)', marginBottom: 6 }}><span style={{ color: 'var(--text-muted)' }}>Tip</span><span>₹{tip}</span></div>}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 900, fontFamily: 'Outfit' }}>
              <span>Total</span><span style={{ color: 'var(--accent-green)' }}>₹{total}</span>
            </div>
          </div>

          <button className="btn btn-success btn-lg" style={{ width: '100%', fontSize: 'clamp(15px, 3vw, 20px)' }} onClick={handlePlaceOrder}>
             Place Order • ₹{total}
          </button>
          <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>OTP will be generated for delivery verification</p>
        </div>
      )}
    </DashboardLayout>
  );
}
