import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getMenuItems } from '../../data/menuHelper';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function ClientFavorites() {
  const MENU_ITEMS = getMenuItems();
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('synnoviq_favorites_' + user?.id);
    return saved ? JSON.parse(saved) : ['m1', 'm3', 'm5'];
  });
  const [tab, setTab] = useState('favorites');

  const saveFavs = (f) => { setFavorites(f); localStorage.setItem('synnoviq_favorites_' + user?.id, JSON.stringify(f)); };
  const toggle = (id) => { const n = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id]; saveFavs(n); showToast(favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites! '); };
  const addToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('synnoviq_cart') || '[]');
    const exists = cart.find(c => c.id === item.id);
    const newCart = exists ? cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c) : [...cart, { ...item, qty: 1 }];
    localStorage.setItem('synnoviq_cart', JSON.stringify(newCart));
    showToast(`${item.name} added to cart! `);
  };

  const favItems = MENU_ITEMS.filter(m => favorites.includes(m.id));
  const recentlyViewed = MENU_ITEMS.slice(0, 4);

  return (
    <DashboardLayout title="Favorites & Wishlist">
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === 'favorites' ? 'active' : ''}`} onClick={() => setTab('favorites')}> Favorites ({favItems.length})</button>
        <button className={`tab ${tab === 'recent' ? 'active' : ''}`} onClick={() => setTab('recent')}> Recently Viewed</button>
      </div>

      {tab === 'favorites' && (
        <>
          {favItems.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 50, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 'clamp(39px, 1.0vw, 45px)', marginBottom: 12 }}></div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No favorites yet</h3>
              <p>Browse the menu and tap to save your favorite meals</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {favItems.map(item => (
                <div key={item.id} className="card" style={{ overflow: 'hidden', animation: 'fadeInUp 0.3s ease' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                    <button onClick={() => toggle(item.id)} style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: 'none', fontSize: 'clamp(15px, 1.0vw, 18px)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}></button>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: 'clamp(13px, 1.0vw, 15px)', marginBottom: 4 }} className="text-truncate">{item.name}</div>
                    <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)', marginBottom: 8 }}> {item.calories} kcal • {item.protein}g • {item.rating}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 900, color: 'var(--accent-green)', fontSize: 'clamp(15px, 1.0vw, 18px)' }}>₹{item.price}</span>
                      <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)}>+ Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'recent' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {recentlyViewed.map(item => (
            <div key={item.id} className="card" style={{ display: 'flex', gap: 12, padding: 14, alignItems: 'center' }}>
              <img src={item.image} alt={item.name} style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 'clamp(12px, 1.0vw, 14px)' }} className="text-truncate">{item.name}</div>
                <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)' }}>₹{item.price} • {item.calories}</div>
              </div>
              <button onClick={() => toggle(item.id)} style={{ background: 'none', border: 'none', fontSize: 'clamp(16px, 1.0vw, 19px)', cursor: 'pointer' }}>{favorites.includes(item.id) ? '' : ''}</button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
