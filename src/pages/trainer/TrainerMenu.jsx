// Trainer's Browse Menu — reuses client BrowseMenu logic
import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { CATEGORIES } from '../../data/mockMenu';
import { getMenuItems } from '../../data/menuHelper';
import { useNotifications } from '../../context/NotificationContext';
import { Icon, Flame, Beef, ShoppingCart, Search } from '../../components/Icons';

export default function TrainerMenu() {
  const MENU_ITEMS = getMenuItems();
  const { showToast } = useNotifications();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('name');

  const filtered = MENU_ITEMS.filter(m => m.available)
    .filter(m => cat === 'All' || m.category === cat)
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'calories' ? a.calories - b.calories : a.name.localeCompare(b.name));

  const addToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('synnoviq_trainer_cart') || '[]');
    const existing = cart.find(c => c.id === item.id);
    if (existing) { existing.qty += 1; } else { cart.push({ ...item, qty: 1 }); }
    localStorage.setItem('synnoviq_trainer_cart', JSON.stringify(cart));
    showToast(`${item.name} added to cart! `);
  };

  return (
    <DashboardLayout title="Browse Menu">
      {/* Dynamic style block patch to cleanly adjust cards size behavior */}
      <style>{`
        .trainer-menu-grid {
          display: grid;
          /* auto-fit and 1fr work together to automatically upscale card widths to completely swallow gaps */
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)) !important;
          gap: 24px !important;
          width: 100% !important;
        }

        .trainer-card-wrapper {
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
          width: 100% !important;
          margin: 0 !important;
        }
      `}</style>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="form-input" placeholder="Search food..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="name">Sort: Name</option><option value="price">Sort: Price</option><option value="calories">Sort: Calories</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {['All', ...CATEGORIES].map(c => (
          <button key={c} className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCat(c)} style={{ flexShrink: 0 }}>{c}</button>
        ))}
      </div>

      {/* Grid container with self-adjusting auto-fit dimensions */}
      <div className="trainer-menu-grid">
        {filtered.map(item => (
          <div key={item.id} 
            className="card trainer-card-wrapper" 
            style={{ overflow: 'hidden', padding: 0, transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <img src={item.image} alt={item.name} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* Name — single line, truncated */}
              <div style={{ fontWeight: 700, fontSize: 'clamp(13px, 1.1vw, 15px)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 6 }}>{item.name}</div>
              {/* Macros — compact single row */}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', gap: 8, flexWrap: 'nowrap', overflow: 'hidden' }}>
                <span><Icon icon={Flame} size={10} style={{marginRight:2}} />{item.calories} kcal</span>
                <span>·</span>
                <span>{item.protein}g Prot</span>
                <span>·</span>
                <span>{item.carbs}g Carb</span>
                <span>·</span>
                <span>{item.fat}g Fat</span>
              </div>
              {/* Price + Button — always at bottom */}
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 900, color: 'var(--accent-green)', fontSize: 15 }}>₹{item.price}</span>
                <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)}>
                  <Icon icon={ShoppingCart} size={13} style={{marginRight:4}} /> Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}