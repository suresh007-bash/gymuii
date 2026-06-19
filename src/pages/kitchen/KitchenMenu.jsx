import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { MENU_ITEMS } from '../../data/mockMenu';
import { useNotifications } from '../../context/NotificationContext';

export default function KitchenMenu() {
  const { showToast } = useNotifications();
  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem('synnoviq_menu');
    return saved ? JSON.parse(saved) : MENU_ITEMS;
  });
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Protein', price: '', calories: '', protein: '', carbs: '', fat: '', prepTime: '', description: '', available: true });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const saveMenu = (newMenu) => { setMenu(newMenu); localStorage.setItem('synnoviq_menu', JSON.stringify(newMenu)); };

  const handleAdd = () => {
    if (!form.name || !form.price) { showToast('Name and price are required', 'error'); return; }
    const newItem = { ...form, id: 'm' + Date.now(), price: Number(form.price), calories: Number(form.calories), protein: Number(form.protein), carbs: Number(form.carbs), fat: Number(form.fat), prepTime: Number(form.prepTime), rating: 4.5, tags: [], image: '/images/grilled_chicken_salad_1781339721580.png' };
    saveMenu([...menu, newItem]);
    showToast('Menu item added! 🍽️');
    setShowAdd(false);
    setForm({ name: '', category: 'Protein', price: '', calories: '', protein: '', carbs: '', fat: '', prepTime: '', description: '', available: true });
  };

  const handleEdit = () => {
    const updated = menu.map(m => m.id === editItem.id ? { ...m, ...form, price: Number(form.price), calories: Number(form.calories), protein: Number(form.protein), carbs: Number(form.carbs), fat: Number(form.fat), prepTime: Number(form.prepTime) } : m);
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
    setForm({ name: item.name, category: item.category, price: item.price, calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat, prepTime: item.prepTime, description: item.description, available: item.available });
  };

  const inp = { width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 14 };

  const FormModal = ({ title, onSave, onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header"><h3 className="modal-title">{title}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><label className="form-label">Name *</label><input style={inp} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Grilled Chicken Bowl" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label className="form-label">Category</label><select style={inp} value={form.category} onChange={e => upd('category', e.target.value)}><option>Protein</option><option>Salads</option><option>Smoothies</option><option>Snacks</option></select></div>
            <div><label className="form-label">Price (₹) *</label><input style={inp} type="number" value={form.price} onChange={e => upd('price', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            <div><label className="form-label">Calories</label><input style={inp} type="number" value={form.calories} onChange={e => upd('calories', e.target.value)} /></div>
            <div><label className="form-label">Protein (g)</label><input style={inp} type="number" value={form.protein} onChange={e => upd('protein', e.target.value)} /></div>
            <div><label className="form-label">Carbs (g)</label><input style={inp} type="number" value={form.carbs} onChange={e => upd('carbs', e.target.value)} /></div>
            <div><label className="form-label">Fat (g)</label><input style={inp} type="number" value={form.fat} onChange={e => upd('fat', e.target.value)} /></div>
          </div>
          <div><label className="form-label">Prep Time (min)</label><input style={inp} type="number" value={form.prepTime} onChange={e => upd('prepTime', e.target.value)} /></div>
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
      {showAdd && <FormModal title="🍽️ Add Menu Item" onSave={handleAdd} onClose={() => setShowAdd(false)} />}
      {editItem && <FormModal title="✏️ Edit Menu Item" onSave={handleEdit} onClose={() => setEditItem(null)} />}

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
                <td style={{ fontWeight: 700 }}>₹{item.price}</td>
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
