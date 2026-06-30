import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ClientSettings() {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const { lang, setLang, t, LANGUAGES } = useLanguage();
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('synnoviq_settings_' + user?.id);
    return saved ? JSON.parse(saved) : { orderNotify: true, promoNotify: true, reminderNotify: true, mealReminder: true, morningTime: '08:00', noonTime: '12:30', eveningTime: '19:00', darkMode: false };
  });

  const upd = (k, v) => { const n = { ...settings, [k]: v }; setSettings(n); localStorage.setItem('synnoviq_settings_' + user?.id, JSON.stringify(n)); };
  const save = () => { showToast('Settings saved! '); };

  const Toggle = ({ val, onToggle }) => (
    <button onClick={onToggle} style={{ width: 48, height: 26, borderRadius: 13, background: val ? 'var(--accent-green)' : '#ccc', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: val ? 24 : 2, transition: 'left 0.3s' }} />
    </button>
  );

  const Row = ({ icon, label, desc, children }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 'clamp(18px, 1.0vw, 21px)' }}>{icon}</span>
        <div><div style={{ fontWeight: 700, fontSize: 'clamp(13px, 1.0vw, 15px)' }}>{label}</div>{desc && <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)' }}>{desc}</div>}</div>
      </div>
      {children}
    </div>
  );

  return (
    <DashboardLayout title={t('settings')}>
      {/* Notifications */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title"> {t('notifications')}</h3></div>
        <Row icon="" label="Order Updates" desc="Get notified about order status changes"><Toggle val={settings.orderNotify} onToggle={() => upd('orderNotify', !settings.orderNotify)} /></Row>
        <Row icon="" label="Promotions & Offers" desc="Receive discount codes and special offers"><Toggle val={settings.promoNotify} onToggle={() => upd('promoNotify', !settings.promoNotify)} /></Row>
        <Row icon="" label="Meal Reminders" desc="Daily reminders to order your meals"><Toggle val={settings.reminderNotify} onToggle={() => upd('reminderNotify', !settings.reminderNotify)} /></Row>
      </div>

      {/* Meal Reminders */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title"> Meal Reminder Times</h3></div>
        <Row icon="" label="Morning" desc="Breakfast reminder">
          <input type="time" value={settings.morningTime} onChange={e => upd('morningTime', e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
        </Row>
        <Row icon="" label="Noon" desc="Lunch reminder">
          <input type="time" value={settings.noonTime} onChange={e => upd('noonTime', e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
        </Row>
        <Row icon="" label="Evening" desc="Dinner reminder">
          <input type="time" value={settings.eveningTime} onChange={e => upd('eveningTime', e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
        </Row>
      </div>

      {/* Preferences */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title"> {t('preferences')}</h3></div>
        <Row icon="" label={t('language')} desc={t('appLanguage')}>
          <select value={lang} onChange={e => { setLang(e.target.value); showToast(`Language changed to ${LANGUAGES.find(l => l.code === e.target.value)?.label || e.target.value}`); }} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
          </select>
        </Row>
      </div>

      {/* Data Management */}
      <div className="card">
        <div className="card-header"><h3 className="card-title"> Data Management</h3></div>
        <Row icon="" label="Clear Order History" desc="Remove all past order data">
          <button className="btn btn-outline btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => { localStorage.removeItem('synnoviq_orders'); showToast('Order history cleared', 'warning'); }}>Clear</button>
        </Row>
        <Row icon="" label="Clear Favorites" desc="Remove all saved favorites">
          <button className="btn btn-outline btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => { localStorage.removeItem('synnoviq_favorites_' + user?.id); showToast('Favorites cleared', 'warning'); }}>Clear</button>
        </Row>
        <Row icon="" label="Reset All Data" desc="Factory reset all app data">
          <button className="btn btn-danger btn-sm" onClick={() => { if (window.confirm('This will reset ALL data. Continue?')) { localStorage.clear(); window.location.reload(); } }}>Reset</button>
        </Row>
      </div>

      <button className="btn btn-success btn-lg" style={{ width: '100%', marginTop: 20 }} onClick={save}> Save All Settings</button>
    </DashboardLayout>
  );
}
