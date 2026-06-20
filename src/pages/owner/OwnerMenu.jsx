// Owner's Browse Menu — reuses client BrowseMenu logic
import { useState } from 'react';
import { Flame, Beef, ShoppingCart } from '../../components/Icons';
import DashboardLayout from '../../components/DashboardLayout';
import { CATEGORIES } from '../../data/mockMenu';
import { getMenuItems } from '../../data/menuHelper';
import { useNotifications } from '../../context/NotificationContext';

export default function OwnerMenu() {
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
    const cart = JSON.parse(localStorage.getItem('synnoviq_owner_cart') || '[]');
    const existing = cart.find(c => c.id === item.id);
    if (existing) { existing.qty += 1; } else { cart.push({ ...item, qty: 1 }); }
    localStorage.setItem('synnoviq_owner_cart', JSON.stringify(cart));
    showToast(`${item.name} added to cart! 🛒`);
  };

  return (
    <DashboardLayout title="Browse Menu">
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="form-input" placeholder="🔍 Search food..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="name">Sort: Name</option><option value="price">Sort: Price</option><option value="calories">Sort: Calories</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {['All', ...CATEGORIES].map(c => (
          <button key={c} className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCat(c)} style={{ flexShrink: 0 }}>{c}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {filtered.map(item => (
          <div key={item.id} className="card" style={{ overflow: 'hidden', padding: 0, transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <img src={item.image} alt={item.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
            <div style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 4 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{item.name}</div>
                <span style={{ fontFamily: 'Outfit', fontWeight: 900, color: 'var(--accent-green)' }}>₹{item.price}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                <Flame size={12} style={{marginRight:2}} /> {item.calories} kcal • <Beef size={12} style={{marginRight:2}} /> {item.protein}g • {item.category}
              </div>
              <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => addToCart(item)}><ShoppingCart size={14} style={{marginRight:4}} /> Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
