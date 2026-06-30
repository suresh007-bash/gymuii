import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { EFFECTS } from '../../components/WeatherOverlay';
import { GYMS } from '../../data/mockUsers';

export default function AdminSettings() {
  const { allUsers, promoteUser, addUser } = useAuth();
  const { showToast } = useNotifications();
  const { themeConfig, applyTheme, resetTheme, THEME_PRESETS } = useTheme();
  const [tab, setTab] = useState('promote');
  const [promoUserId, setPromoUserId] = useState('');
  const [promoRole, setPromoRole] = useState('trainer');
  const [promoGym, setPromoGym] = useState('');
  const [kitchenForm, setKitchenForm] = useState({ name: '', email: '', phone: '', kitchenName: '', kitchenLocation: '' });

  const [confirm, setConfirm] = useState(null);

  // Theme state
  const [themePrimary, setThemePrimary] = useState(themeConfig?.primary || '#f97316');
  const [themeSecondary, setThemeSecondary] = useState(themeConfig?.secondary || '#22c55e');
  const [activePreset, setActivePreset] = useState(() => {
    if (!themeConfig) return 'orange';
    return Object.entries(THEME_PRESETS).find(([, v]) => v.primary === themeConfig.primary && v.secondary === themeConfig.secondary)?.[0] || 'custom';
  });

  // Banner state
  const [bannerCfg, setBannerCfg] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('synnoviq_banner_config')) || {};
    } catch { return {}; }
  });

  // Weather effect state
  const [weatherEffect, setWeatherEffect] = useState(() => localStorage.getItem('synnoviq_weather_effect') || 'none');

  const askConfirm = (title, msg, color, action) => setConfirm({ title, msg, color, action: () => { action(); setConfirm(null); } });

  const handlePromote = () => {
    if (!promoUserId || !promoRole) { showToast('Select user and role', 'error'); return; }
    const user = allUsers.find(u => u.id === promoUserId);
    askConfirm(
      ' Promote User',
      `Are you sure you want to promote "${user?.name}" to ${promoRole.toUpperCase()}?`,
      '#3b82f6',
      () => {
        const extra = {};
        if (promoRole === 'trainer' && promoGym) extra.gymId = promoGym;
        if (promoRole === 'owner' && promoGym) extra.gymId = promoGym;
        promoteUser(promoUserId, promoRole, extra);
        showToast(` ${user?.name} promoted to ${promoRole.toUpperCase()}!`);
        setPromoUserId(''); setPromoRole('trainer');
      }
    );
  };

  const handleAddKitchen = () => {
    if (!kitchenForm.name || !kitchenForm.email || !kitchenForm.kitchenName) { showToast('Fill all required fields', 'error'); return; }
    askConfirm(
      '‍ Add Kitchen Team',
      `Add "${kitchenForm.name}" as kitchen staff for "${kitchenForm.kitchenName}"?`,
      '#22c55e',
      () => {
        addUser({ ...kitchenForm, role: 'kitchen', avatar: kitchenForm.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) });
        showToast(`‍ Kitchen team "${kitchenForm.kitchenName}" added!`);
        setKitchenForm({ name: '', email: '', phone: '', kitchenName: '', kitchenLocation: '' });
      }
    );
  };

  const handlePresetSelect = (key) => {
    const preset = THEME_PRESETS[key];
    setActivePreset(key);
    setThemePrimary(preset.primary);
    setThemeSecondary(preset.secondary);
    applyTheme({ primary: preset.primary, secondary: preset.secondary });
    showToast(` Theme changed to ${preset.label}!`);
  };

  const handleCustomApply = () => {
    setActivePreset('custom');
    applyTheme({ primary: themePrimary, secondary: themeSecondary });
    showToast(' Custom theme applied!');
  };

  const handleResetTheme = () => {
    resetTheme();
    setThemePrimary('#f97316');
    setThemeSecondary('#22c55e');
    setActivePreset('orange');
    showToast(' Theme reset to default!');
  };

  const handleSaveBanner = () => {
    localStorage.setItem('synnoviq_banner_config', JSON.stringify(bannerCfg));
    showToast(' Banner settings saved! Refresh the client page to see changes.');
  };

  const handleResetBanner = () => {
    localStorage.removeItem('synnoviq_banner_config');
    setBannerCfg({});
    showToast(' Banner reset to default!');
  };

  const clients = allUsers.filter(u => u.role === 'client');
  const trainers = allUsers.filter(u => u.role === 'trainer');

  const colorPickerStyle = {
    width: 44, height: 44, borderRadius: 10, border: '2px solid var(--border)',
    cursor: 'pointer', outline: 'none', padding: 0, background: 'none',
  };

  // Reusable Grid Structure wrapper to prevent layout stretching issues across large monitors
  const LayoutGrid = ({ children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: 20, alignItems: 'start' }}>
      {children}
    </div>
  );

  return (
    <DashboardLayout title="Admin Settings">
      {/* Confirmation Modal */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, textAlign: 'center' }}>
            <h3 style={{ fontSize: 'clamp(18px, 1.0vw, 21px)', fontWeight: 800, marginBottom: 12 }}>{confirm.title}</h3>
            <p style={{ fontSize: 'clamp(14px, 1.0vw, 17px)', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>{confirm.msg}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn" style={{ background: confirm.color, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }} onClick={confirm.action}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="tabs" style={{ marginBottom: 20, overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <button className={`tab ${tab === 'promote' ? 'active' : ''}`} onClick={() => setTab('promote')}> Promote User</button>
        <button className={`tab ${tab === 'kitchen' ? 'active' : ''}`} onClick={() => setTab('kitchen')}>‍ Add Kitchen Team</button>
        <button className={`tab ${tab === 'roles' ? 'active' : ''}`} onClick={() => setTab('roles')}> Role Overview</button>
        <button className={`tab ${tab === 'theme' ? 'active' : ''}`} onClick={() => setTab('theme')}> Theme & Branding</button>
      </div>

      {/* Promote User Layout */}
      {tab === 'promote' && (
        <LayoutGrid>
          <div className="card" style={{ width: '100%' }}>
            <div className="card-header"><h3 className="card-title"> Promote User</h3></div>
            <p style={{ fontSize: 'clamp(14px, 1.0vw, 17px)', color: 'var(--text-muted)', marginBottom: 16 }}>Promote a client to trainer, or a user to gym owner role.</p>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Select User to Promote</label>
              <select className="form-select" value={promoUserId} onChange={e => setPromoUserId(e.target.value)}>
                <option value="">Choose user...</option>
                {allUsers.filter(u => ['client', 'trainer'].includes(u.role)).map(u => (
                  <option key={u.id} value={u.id}>{u.name} — {u.role.toUpperCase()} ({u.email})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Promote To</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['trainer', ' Trainer'], ['owner', ' Owner'], ['admin', ' Admin']].map(([role, label]) => (
                  <button key={role} className={`btn btn-sm ${promoRole === role ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPromoRole(role)}>{label}</button>
                ))}
              </div>
            </div>
            {(promoRole === 'trainer' || promoRole === 'owner') && (
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Assign to Gym</label>
                <select className="form-select" value={promoGym} onChange={e => setPromoGym(e.target.value)}>
                  <option value="">Select gym...</option>
                  {GYMS.map(g => <option key={g.id} value={g.id}>{g.name} — {g.location}</option>)}
                </select>
              </div>
            )}
            <button className="btn btn-success" style={{ width: '100%', padding: '12px 0', marginTop: 10 }} onClick={handlePromote} disabled={!promoUserId}> Promote User</button>
          </div>

          {/* Context Summary Counterbalanced Side Info Panel */}
          <div className="card" style={{ width: '100%', height: '100%' }}>
            <div className="card-header"><h3 className="card-title">ℹ System Guidelines</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 'clamp(14px, 1.0vw, 17px)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}> Trainer Access:</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>Grants administrative rights over custom meal allocations, client scheduling plans, and specific assigned gym infrastructure logs.</p>
              </div>
              <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}> Owner Access:</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>Provides absolute visual telemetry over branch finances, subscription structures, and macro inventory charts.</p>
              </div>
            </div>
          </div>
        </LayoutGrid>
      )}

      {/* Add Kitchen Team Layout */}
      {tab === 'kitchen' && (
        <LayoutGrid>
          <div className="card" style={{ width: '100%' }}>
            <div className="card-header"><h3 className="card-title">‍ Add Food Providing Team</h3></div>
            <p style={{ fontSize: 'clamp(14px, 1.0vw, 17px)', color: 'var(--text-muted)', marginBottom: 16 }}>Register a new kitchen/food provider team to the system.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label className="form-label">Person Name *</label><input className="form-input" value={kitchenForm.name} onChange={e => setKitchenForm(p => ({ ...p, name: e.target.value }))} placeholder="Chef Name" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14 }}>
                <div><label className="form-label">Email *</label><input className="form-input" value={kitchenForm.email} onChange={e => setKitchenForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div><label className="form-label">Phone</label><input className="form-input" value={kitchenForm.phone} onChange={e => setKitchenForm(p => ({ ...p, phone: e.target.value }))} /></div>
              </div>
              <div><label className="form-label">Kitchen Name *</label><input className="form-input" value={kitchenForm.kitchenName} onChange={e => setKitchenForm(p => ({ ...p, kitchenName: e.target.value }))} placeholder="FitBites Kitchen" /></div>
              <div><label className="form-label">Kitchen Location</label><input className="form-input" value={kitchenForm.kitchenLocation} onChange={e => setKitchenForm(p => ({ ...p, kitchenLocation: e.target.value }))} placeholder="City, Area" /></div>
            </div>
            <button className="btn btn-success" style={{ marginTop: 20, width: '100%', padding: '12px 0' }} onClick={handleAddKitchen}> Add Kitchen Team</button>
          </div>

          <div className="card" style={{ width: '100%', height: '100%' }}>
            <div className="card-header"><h3 className="card-title"> Operational Notes</h3></div>
            <p style={{ fontSize: 'clamp(14px, 1.0vw, 17px)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Adding a kitchen service agent initiates automated dynamic routing configuration. Fresh logs are appended to fulfillment lists, and corresponding platform personnel profiles will be automatically provisioned with default login tokens dispatched directly to the listed organizational mail inbox.
            </p>
          </div>
        </LayoutGrid>
      )}

      {/* Role Overview */}
      {tab === 'roles' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', // Increased min-width from 260px to 340px to neatly split 6 items into an elegant 3x2 matrix on desktop
          gridAutoRows: '1fr', 
          gap: 20,
          alignItems: 'stretch'
        }}>
          {[
            ['client', '', '#f97316', 'Clients'], 
            ['trainer', '', '#22c55e', 'Trainers'], 
            ['owner', '', '#3b82f6', 'Owners'], 
            ['kitchen', '‍', '#14b8a6', 'Kitchens'], 
            ['delivery', '', '#8b5cf6', 'Deliveries'], 
            ['admin', '', '#64748b', 'Admins']
          ].map(([role, icon, color, labelText]) => {
            const users = allUsers.filter(u => u.role === role);
            return (
              <div key={role} className="card" style={{ 
                height: '100%',             
                display: 'flex', 
                flexDirection: 'column',
                margin: 0,
                boxSizing: 'border-box',
                minHeight: '280px'          
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 'clamp(21px, 1.0vw, 25px)' }}>{icon}</span>
                  <div>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(16px, 1.0vw, 19px)' }}>
                      {labelText}
                    </span>
                    <span style={{ marginLeft: 8, fontWeight: 900, color, fontSize: 'clamp(16px, 1.0vw, 19px)' }}>
                      {users.length}
                    </span>
                  </div>
                </div>
                
                {/* User List Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                  {users.slice(0, 5).map(u => (
                    <div key={u.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 0', 
                      borderBottom: '1px solid var(--border)', 
                      fontSize: 'clamp(13px, 1.0vw, 15px)' 
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="text-truncate">{u.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{u.email}</span>
                    </div>
                  ))}
                </div>

                {users.length > 5 && (
                  <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)', marginTop: 'auto', paddingTop: 10, fontWeight: 600 }}>
                    +{users.length - 5} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Theme & Branding */}
      {tab === 'theme' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Theme Presets */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 16 }}>
              <h3 className="card-title"> Theme Presets</h3>
            </div>
            <p style={{ fontSize: 'clamp(14px, 1.0vw, 17px)', color: 'var(--text-muted)', marginBottom: 16 }}>
              Choose a preset theme to instantly change the look and feel of the entire application.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                <div
                  key={key}
                  onClick={() => handlePresetSelect(key)}
                  style={{
                    padding: 14, borderRadius: 14, cursor: 'pointer',
                    border: `2.5px solid ${activePreset === key ? preset.primary : 'var(--border)'}`,
                    background: activePreset === key ? `${preset.primary}08` : 'var(--bg-secondary)',
                    transition: 'all 0.25s ease',
                    transform: activePreset === key ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: preset.primary, boxShadow: `0 4px 12px ${preset.primary}40` }} />
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: preset.secondary, boxShadow: `0 4px 12px ${preset.secondary}40` }} />
                  </div>
                  <div style={{ fontSize: 'clamp(14px, 1.0vw, 17px)', fontWeight: 700, color: 'var(--text-primary)' }}>{preset.label}</div>
                  {activePreset === key && (
                    <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800, color: preset.primary, marginTop: 4 }}> ACTIVE</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 16 }}>
              <h3 className="card-title"> Custom Colors</h3>
            </div>
            <p style={{ fontSize: 'clamp(14px, 1.0vw, 17px)', color: 'var(--text-muted)', marginBottom: 16 }}>
              Pick your own primary and secondary colors for a fully custom theme.
            </p>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 }}>
              <div>
                <label className="form-label" style={{ marginBottom: 6 }}>Primary Accent</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" value={themePrimary} onChange={e => setThemePrimary(e.target.value)} style={colorPickerStyle} />
                  <input className="form-input" value={themePrimary} onChange={e => setThemePrimary(e.target.value)}
                    style={{ width: 100, fontFamily: 'monospace', fontSize: 'clamp(14px, 1.0vw, 17px)', fontWeight: 700 }} />
                </div>
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: 6 }}>Secondary Accent</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" value={themeSecondary} onChange={e => setThemeSecondary(e.target.value)} style={colorPickerStyle} />
                  <input className="form-input" value={themeSecondary} onChange={e => setThemeSecondary(e.target.value)}
                    style={{ width: 100, fontFamily: 'monospace', fontSize: 'clamp(14px, 1.0vw, 17px)', fontWeight: 700 }} />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div style={{
              padding: 16, borderRadius: 12, marginBottom: 16,
              background: `linear-gradient(135deg, ${themePrimary}08, ${themeSecondary}08)`,
              border: `1.5px solid ${themePrimary}20`,
            }}>
              <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>LIVE PREVIEW</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  padding: '8px 20px', borderRadius: 10, fontWeight: 700, fontSize: 'clamp(14px, 1.0vw, 17px)', color: '#fff',
                  background: `linear-gradient(135deg, ${themePrimary}, ${themeSecondary})`,
                }}>Primary Button</div>
                <div style={{
                  padding: '8px 20px', borderRadius: 10, fontWeight: 700, fontSize: 'clamp(14px, 1.0vw, 17px)',
                  color: themePrimary, border: `2px solid ${themePrimary}`,
                }}>Outline Button</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 8,
                  background: `${themePrimary}12`, color: themePrimary,
                  fontSize: 'clamp(13px, 1.0vw, 15px)', fontWeight: 700,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: themePrimary }} />
                  Active Sidebar Item
                </div>
                <div style={{
                  padding: '4px 14px', borderRadius: 20, fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800, letterSpacing: 1,
                  background: `linear-gradient(135deg, ${themePrimary}, ${themeSecondary})`, color: '#fff',
                }}>BADGE</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={handleCustomApply}> Apply Custom Theme</button>
              <button className="btn btn-outline" onClick={handleResetTheme}> Reset to Default</button>
            </div>
          </div>

          {/* Banner Editor */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 16 }}>
              <h3 className="card-title"> Client Home Banner</h3>
            </div>
            <p style={{ fontSize: 'clamp(14px, 1.0vw, 17px)', color: 'var(--text-muted)', marginBottom: 16 }}>
              Customize the hero banner on the client home/browse page. Leave fields empty to use defaults.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 14 }}>
                <div>
                  <label className="form-label">Badge Text</label>
                  <input className="form-input" placeholder="NUTRIENT POWERED" value={bannerCfg.badge || ''}
                    onChange={e => setBannerCfg(p => ({ ...p, badge: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Banner Image URL</label>
                  <input className="form-input" placeholder="/src/assets/hero.png" value={bannerCfg.imageUrl || ''}
                    onChange={e => setBannerCfg(p => ({ ...p, imageUrl: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 14 }}>
                <div>
                  <label className="form-label">Headline Start</label>
                  <input className="form-input" placeholder="Make a" value={bannerCfg.headlineStart || ''}
                    onChange={e => setBannerCfg(p => ({ ...p, headlineStart: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Headline Highlight</label>
                  <input className="form-input" placeholder="Better Life" value={bannerCfg.headlineHighlight || ''}
                    onChange={e => setBannerCfg(p => ({ ...p, headlineHighlight: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="form-label">Subtitle</label>
                <textarea className="form-input" rows={2} placeholder="Fuel your body with chef-crafted, nutrient-rich meals..."
                  value={bannerCfg.subtitle || ''} onChange={e => setBannerCfg(p => ({ ...p, subtitle: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>

              <div>
                <label className="form-label">Banner Gradient</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)', fontWeight: 600 }}>Color 1</span>
                    <input type="color" value={bannerCfg.gradientStart || '#0f172a'} onChange={e => setBannerCfg(p => ({ ...p, gradientStart: e.target.value }))} style={colorPickerStyle} />
                  </div>
                  <span style={{ fontSize: 'clamp(18px, 1.0vw, 21px)', color: 'var(--text-muted)' }}>→</span>
                  <div>
                    <span style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'var(--text-muted)', fontWeight: 600 }}>Color 2</span>
                    <input type="color" value={bannerCfg.gradientEnd || '#1e293b'} onChange={e => setBannerCfg(p => ({ ...p, gradientEnd: e.target.value }))} style={colorPickerStyle} />
                  </div>
                  <div style={{
                    flex: 1, height: 36, borderRadius: 8, marginLeft: 8,
                    background: `linear-gradient(135deg, ${bannerCfg.gradientStart || '#0f172a'} 0%, ${bannerCfg.gradientEnd || '#1e293b'} 100%)`,
                    border: '1px solid var(--border)',
                  }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                <div>
                  <label className="form-label">Tag 1</label>
                  <input className="form-input" placeholder="High Protein" value={bannerCfg.tag1 || ''}
                    onChange={e => setBannerCfg(p => ({ ...p, tag1: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Tag 2</label>
                  <input className="form-input" placeholder="Low Calorie" value={bannerCfg.tag2 || ''}
                    onChange={e => setBannerCfg(p => ({ ...p, tag2: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Tag 3</label>
                  <input className="form-input" placeholder="Macro Balanced" value={bannerCfg.tag3 || ''}
                    onChange={e => setBannerCfg(p => ({ ...p, tag3: e.target.value }))} />
                </div>
              </div>

              {/* Banner Preview */}
              <div style={{
                borderRadius: 16, overflow: 'hidden', position: 'relative',
                background: `linear-gradient(135deg, ${bannerCfg.gradientStart || '#0f172a'} 0%, ${bannerCfg.gradientEnd || '#1e293b'} 40%, ${bannerCfg.gradientStart || '#0f172a'} 100%)`,
                color: '#fff', padding: '24px 28px', minHeight: 140,
              }}>
                <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.5)' }}>BANNER PREVIEW</div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800,
                  background: `linear-gradient(135deg, ${themePrimary}, ${themeSecondary})`,
                  padding: '4px 12px', borderRadius: 20, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase',
                }}>{bannerCfg.badge || 'NUTRIENT POWERED'}</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(21px, 1.0vw, 25px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>
                  {bannerCfg.headlineStart || 'Make a'}{' '}
                  <span style={{ background: `linear-gradient(135deg, ${themePrimary}, ${themeSecondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {bannerCfg.headlineHighlight || 'Better Life'}
                  </span>
                </h3>
                <p style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', opacity: 0.65, maxWidth: 350, lineHeight: 1.6 }}>
                  {bannerCfg.subtitle || 'Fuel your body with chef-crafted, nutrient-rich meals — designed for your fitness goals and delivered fresh to your door.'}
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {[bannerCfg.tag1 || 'High Protein', bannerCfg.tag2 || 'Low Calorie', bannerCfg.tag3 || 'Macro Balanced'].map((tag, i) => (
                    <span key={i} style={{
                      padding: '4px 10px', borderRadius: 12, fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 700,
                      background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-primary" onClick={handleSaveBanner}> Save Banner</button>
              <button className="btn btn-outline" onClick={handleResetBanner}> Reset Banner</button>
            </div>
          </div>

          {/* Weather / Atmosphere Effects */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 16 }}>
              <h3 className="card-title"> Atmosphere Effects</h3>
            </div>
            <p style={{ fontSize: 'clamp(14px, 1.0vw, 17px)', color: 'var(--text-muted)', marginBottom: 16 }}>
              Add a live weather or atmosphere animation overlay across all pages. These effects are purely visual and don't affect functionality.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {[['none', '', 'No Effect', '#64748b'],
                ['rain', '', 'Rainy Storm', '#60a5fa'],
              ].map(([key, emoji, label, color]) => (
                <div
                  key={key}
                  onClick={() => {
                    setWeatherEffect(key);
                    localStorage.setItem('synnoviq_weather_effect', key);
                    window.dispatchEvent(new Event('synnoviq_weather_change'));
                    showToast(`${emoji} Atmosphere set to: ${label}`);
                  }}
                  style={{
                    padding: 16, borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                    border: `2.5px solid ${weatherEffect === key ? color : 'var(--border)'}`,
                    background: weatherEffect === key ? `${color}10` : 'var(--bg-secondary)',
                    transition: 'all 0.25s ease',
                    transform: weatherEffect === key ? 'scale(1.03)' : 'scale(1)',
                  }}
                >
                  <div style={{ fontSize: 'clamp(27px, 1.0vw, 32px)', marginBottom: 6, filter: weatherEffect === key ? 'none' : 'grayscale(0.5)' }}>{emoji}</div>
                  <div style={{ fontSize: 'clamp(13px, 1.0vw, 15px)', fontWeight: 700, color: weatherEffect === key ? color : 'var(--text-secondary)' }}>{label}</div>
                  {weatherEffect === key && (
                    <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800, color, marginTop: 4 }}> ACTIVE</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}