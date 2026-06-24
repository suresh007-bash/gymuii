import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { MENU_ITEMS } from '../../data/mockMenu';
import { useNotifications } from '../../context/NotificationContext';

export default function KitchenMenu() {
  const { showToast } = useNotifications();
  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem('synnoviq_menu');
    let baseItems = saved ? JSON.parse(saved) : MENU_ITEMS;

    // Check if the custom items have already been appended to avoid duplication
    if (!baseItems.some(item => item.id === 'k-custom-7')) {
      baseItems = [
        ...baseItems,
        {
          id: 'k-custom-7',
          name: 'Avocado Toast & Eggs',
          category: 'Protein',
          price: 240,
          originalPrice: null,
          discount: 0,
          calories: 390,
          protein: 18,
          carbs: 32,
          fat: 14,
          prepTime: 10,
          rating: 4.7,
          tags: ['Healthy Fats', 'Breakfast'],
          image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&q=80',
          available: true,
          description: 'Toasted whole wheat sourdough spread with fresh mashed avocado and topped with sunny-side-up eggs.'
        },
        {
          id: 'k-custom-8',
          name: 'High-Protein Chicken Wrap',
          category: 'Protein',
          price: 290,
          originalPrice: null,
          discount: 0,
          calories: 460,
          protein: 38,
          carbs: 40,
          fat: 11,
          prepTime: 12,
          rating: 4.6,
          tags: ['High Protein', 'Post-Workout'],
          // FIXED: Replaced the non-loading image with a valid food photography asset URL for chicken wraps
          image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=500&q=80',
          available: true,
          description: 'Grilled protein-packed chicken breast strips packed inside a whole wheat tortilla with Greek yogurt dressing.'
        },
        {
          id: 'k-custom-9',
          name: 'PB & Banana Recovery Smoothie',
          category: 'Smoothies',
          price: 190,
          originalPrice: null,
          discount: 0,
          calories: 320,
          protein: 26,
          carbs: 42,
          fat: 8,
          prepTime: 5,
          rating: 4.8,
          tags: ['Energy Boost', 'Smoothies'],
          image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&q=80',
          available: true,
          description: 'Creamy high-protein blend of peanut butter, ripe bananas, almond milk, and whey protein isolate.'
        },
        {
          id: 'k-custom-10',
          name: 'Grilled Salmon Bowl',
          category: 'Protein',
          price: 380,
          originalPrice: null,
          discount: 0,
          calories: 520,
          protein: 42,
          carbs: 38,
          fat: 18,
          prepTime: 15,
          rating: 4.9,
          tags: ['Omega-3', 'Lean Protein'],
          image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80',
          available: true,
          description: 'Premium grilled Atlantic salmon fillet served over a bed of wild brown rice with steamed broccoli florets.'
        },
        {
          id: 'k-custom-11',
          name: 'Keto Almond Crust Pizza',
          category: 'Snacks',
          price: 320,
          originalPrice: null,
          discount: 0,
          calories: 410,
          protein: 28,
          carbs: 12,
          fat: 24,
          prepTime: 14,
          rating: 4.7,
          tags: ['Low Carb', 'Keto Friendly'],
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
          available: true,
          description: 'Low-carb personal pizza prepared on an almond flour crust, topped with fresh marinara, shredded mozzarella, and grilled bell peppers.'
        }
      ];
      localStorage.setItem('synnoviq_menu', JSON.stringify(baseItems));
    } else if (!baseItems.some(item => item.id === 'k-custom-11')) {
      baseItems = [
        ...baseItems,
        {
          id: 'k-custom-11',
          name: 'Keto Almond Crust Pizza',
          category: 'Snacks',
          price: 320,
          originalPrice: null,
          discount: 0,
          calories: 410,
          protein: 28,
          carbs: 12,
          fat: 24,
          prepTime: 14,
          rating: 4.7,
          tags: ['Low Carb', 'Keto Friendly'],
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
          available: true,
          description: 'Low-carb personal pizza prepared on an almond flour crust, topped with fresh marinara, shredded mozzarella, and grilled bell peppers.'
        }
      ];
      localStorage.setItem('synnoviq_menu', JSON.stringify(baseItems));
    }
    return baseItems;
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Protein', price: '', calories: '', protein: '', carbs: '', fat: '', description: '', image: '', available: true, discount: 0 });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const saveMenu = (newMenu) => { setMenu(newMenu); localStorage.setItem('synnoviq_menu', JSON.stringify(newMenu)); };

  const handleAdd = () => {
    if (!form.name || !form.price) { showToast('Name and price are required', 'error'); return; }
    const disc = Number(form.discount) || 0;
    const basePrice = Number(form.price);
    const newItem = { ...form, id: 'm' + Date.now(), price: disc > 0 ? Math.round(basePrice * (1 - disc / 100)) : basePrice, originalPrice: disc > 0 ? basePrice : null, discount: disc, calories: Number(form.calories), protein: Number(form.protein), carbs: Number(form.carbs), fat: Number(form.fat), prepTime: 0, rating: 4.5, tags: [], image: form.image || '/images/grilled_chicken_salad_1781339721580.png' };
    saveMenu([...menu, newItem]);
    showToast('Menu item added! 🍽️');
    setShowAdd(false);
    setForm({ name: '', category: 'Protein', price: '', calories: '', protein: '', carbs: '', fat: '', description: '', image: '', available: true, discount: 0 });
  };

  const handleEdit = () => {
    const disc = Number(form.discount) || 0;
    const basePrice = Number(form.price);
    const updated = menu.map(m => m.id === editItem.id ? { ...m, ...form, price: disc > 0 ? Math.round(basePrice * (1 - disc / 100)) : basePrice, originalPrice: disc > 0 ? basePrice : null, discount: disc, calories: Number(form.calories), protein: Number(form.protein), carbs: Number(form.carbs), fat: Number(form.fat), image: form.image || m.image } : m);
    saveMenu(updated);
    showToast('Menu item updated! ✅');
    setEditItem(null);
  };

  const toggleAvailable = (id) => {
    const updated = menu.map(m => m.id === id ? { ...m, available: !m.available } : m);
    saveMenu(updated);
    showToast('Availability updated');
  };

  const deleteItem = (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    saveMenu(menu.filter(m => m.id !== id));
    showToast('Item deleted', 'warning');
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, price: item.originalPrice || item.price, calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat, description: item.description, image: item.image || '', available: item.available, discount: item.discount || 0 });
  };

  const inp = { width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 14 };

  const renderFormBody = (title, onSave, onClose) => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header"><h3 className="modal-title">{title}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><label className="form-label">Name *</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Grilled Chicken Bowl" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 12 }}>
            <div><label className="form-label">Category</label><select style={inp} value={form.category} onChange={e => upd('category', e.target.value)}><option>Protein</option><option>Salads</option><option>Smoothies</option><option>Snacks</option></select></div>
            <div><label className="form-label">Price (₹) *</label><input style={inp} type="number" value={form.price} onChange={e => upd('price', e.target.value)} /></div>
            <div><label className="form-label">Discount (%)</label><input style={inp} type="number" min="0" max="99" value={form.discount} onChange={e => upd('discount', e.target.value)} placeholder="0" /></div>
          </div>
          {Number(form.discount) > 0 && Number(form.price) > 0 && (
            <div style={{ padding: '8px 12px', background: 'rgba(34,197,94,0.08)', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 900, fontSize: 16, color: '#22c55e' }}>₹{Math.round(Number(form.price) * (1 - Number(form.discount) / 100))}</span>
              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 13 }}>₹{form.price}</span>
              <span style={{ color: '#22c55e', fontWeight: 800, fontSize: 12 }}>{form.discount}% off</span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 12 }}>
            <div><label className="form-label">Calories</label><input style={inp} type="number" value={form.calories} onChange={e => upd('calories', e.target.value)} /></div>
            <div><label className="form-label">Protein (g)</label><input style={inp} type="number" value={form.protein} onChange={e => upd('protein', e.target.value)} /></div>
            <div><label className="form-label">Carbs (g)</label><input style={inp} type="number" value={form.carbs} onChange={e => upd('carbs', e.target.value)} /></div>
            <div><label className="form-label">Fat (g)</label><input style={inp} type="number" value={form.fat} onChange={e => upd('fat', e.target.value)} /></div>
          </div>
          <div>
            <label className="form-label">Photo (optional)</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {form.image && (
                <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0 }}>
                  <img src={form.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="menu-photo-upload"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => upd('image', ev.target.result);
                    reader.readAsDataURL(file);
                  }}
                />
                <label htmlFor="menu-photo-upload" className="btn btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  📷 {form.image ? 'Change Photo' : 'Upload Photo'}
                </label>
                {form.image && (
                  <button className="btn btn-outline btn-sm" style={{ marginLeft: 8, color: 'var(--accent-red)', fontSize: 12 }} onClick={() => upd('image', '')}>
                    ✕ Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          <div><label className="form-label">Description</label><textarea style={{ ...inp, minHeight: 60 }} value={form.description} onChange={e => upd('description', e.target.value)} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={onSave}>✅ Save</button>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Menu Management">
      {showAdd && renderFormBody('🍽️ Add Menu Item', handleAdd, () => setShowAdd(false))}
      {editItem && renderFormBody('✏️ Edit Menu Item', handleEdit, () => setEditItem(null))}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16 }}>{menu.length} Items</span> <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>• {menu.filter(m => m.available).length} available</span></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Item</button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Calories</th><th>Protein</th><th>Prep</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {menu.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</td>
                <td><span className="badge badge-purple">{item.category}</span></td>
                <td style={{ fontWeight: 700 }}>
                  ₹{item.price}
                  {item.originalPrice && <>
                    <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 11, marginLeft: 6 }}>₹{item.originalPrice}</span>
                    <span style={{ color: '#22c55e', fontSize: 10, fontWeight: 800, marginLeft: 4 }}>{item.discount}% off</span>
                  </>}
                </td>
                <td style={{ fontSize: 12 }}>🔥 {item.calories}</td>
                <td style={{ fontSize: 12 }}>💪 {item.protein}g</td>
                <td style={{ fontSize: 12 }}>⏱ {item.prepTime}m</td>
                <td>
                  <button onClick={() => toggleAvailable(item.id)} className={`badge ${item.available ? 'badge-green' : 'badge-red'}`} style={{ cursor: 'pointer', border: 'none' }}>
                    {item.available ? '✅ Available' : '❌ Unavailable'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>✏️</button>
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => deleteItem(item.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}