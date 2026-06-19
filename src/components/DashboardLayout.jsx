import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const roleConfig = {
  client: { brand: 'FitBites', sub: 'GYM FOOD DELIVERY', gradient: 'linear-gradient(135deg, #f97316, #fb923c)', links: [
    { icon: '🏠', label: 'Home', path: '/client/menu' },
    { icon: '📋', label: 'Meal Plans', path: '/client/meal-plans' }, { icon: '🛒', label: 'My Cart', path: '/client/cart' },
    { icon: '📅', label: 'Schedule Foods', path: '/client/schedule' },
    { icon: '📦', label: 'My Orders', path: '/client/orders' }, { icon: '📊', label: 'Nutrition', path: '/client/nutrition' },
    { icon: '💎', label: 'Subscriptions', path: '/client/subscriptions' }, { icon: '👥', label: 'Community', path: '/client/community' },
    { icon: '🆘', label: 'Support', path: '/client/support' }, { icon: '👤', label: 'Profile', path: '/client/profile' },
    { icon: '⚙️', label: 'Settings', path: '/client/settings' },
  ]},
  trainer: { brand: 'FitBites', sub: 'TRAINER PORTAL', gradient: 'linear-gradient(135deg, #f97316, #22c55e)', links: [
    // Client functionalities
    { icon: '🏠', label: 'Home', path: '/trainer/home' },
    { icon: '🛒', label: 'My Cart', path: '/trainer/cart' },
    { icon: '📅', label: 'Schedule Foods', path: '/trainer/my-schedule' },
    { icon: '📦', label: 'My Orders', path: '/trainer/orders' }, { icon: '📊', label: 'Nutrition', path: '/trainer/nutrition' },
    { icon: '💎', label: 'Subscriptions', path: '/trainer/subscriptions' },
    // Trainer-specific
    { icon: '—', label: '── TRAINER TOOLS ──', path: null },
    { icon: '👥', label: 'My Clients', path: '/trainer/clients' },
    { icon: '📅', label: 'Schedule Foods to Clients', path: '/trainer/schedule-for-clients' },
    { icon: '👤', label: 'Profile', path: '/trainer/profile' },
  ]},
  owner: { brand: 'FitSwipe', sub: 'OWNER PORTAL', gradient: 'linear-gradient(135deg, #22c55e, #4ade80)', links: [
    { icon: '📊', label: 'Dashboard', path: '/owner/dashboard' }, { icon: '💪', label: 'Manage Trainers', path: '/owner/trainers' },
    { icon: '👥', label: 'Members', path: '/owner/members' }, { icon: '➕', label: 'Add Member', path: '/owner/add-member' },
    { icon: '🍽️', label: 'Browse Menu', path: '/owner/menu' },
    { icon: '🛒', label: 'My Cart', path: '/owner/cart' }, { icon: '📦', label: 'My Orders', path: '/owner/orders' },
    { icon: '📈', label: 'Analytics', path: '/owner/analytics' }, { icon: '👤', label: 'Profile', path: '/owner/profile' },
  ]},
  kitchen: { brand: 'FitBites', sub: 'KITCHEN PORTAL', gradient: 'linear-gradient(135deg, #14b8a6, #22c55e)', links: [
    { icon: '📊', label: 'Dashboard', path: '/kitchen/dashboard' }, { icon: '📋', label: 'Order Queue', path: '/kitchen/queue' },
    { icon: '🍽️', label: 'Menu', path: '/kitchen/menu' }, { icon: '🚀', label: 'Dispatch', path: '/kitchen/dispatch' },
    { icon: '⚙️', label: 'Settings', path: '/kitchen/settings' },
  ]},
  delivery: { brand: 'FitBites', sub: 'DELIVERY PORTAL', gradient: 'linear-gradient(135deg, #f97316, #14b8a6)', links: [
    { icon: '📊', label: 'My Dashboard', path: '/delivery/dashboard' }, { icon: '📦', label: 'My Deliveries', path: '/delivery/my-deliveries' },
    { icon: '📜', label: 'Delivery History', path: '/delivery/history' }, { icon: '👤', label: 'Profile', path: '/delivery/profile' },
  ]},
  admin: { brand: 'GymFuel', sub: 'ADMIN PORTAL', gradient: 'linear-gradient(135deg, #f97316, #22c55e)', links: [
    { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' }, { icon: '📦', label: 'Orders', path: '/admin/orders' },
    { icon: '👥', label: 'Users', path: '/admin/users' }, { icon: '🚗', label: 'Delivery', path: '/admin/delivery' },
    { icon: '📈', label: 'Analytics', path: '/admin/analytics' }, { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
  ]},
};

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth();
  const { getUnreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;
  const config = roleConfig[user.role] || roleConfig.client;
  const unread = getUnreadCount(user.id);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="app-layout">
      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🍽️</div>
          <div>
            <div className="sidebar-brand-name">{config.brand}</div>
            <div className="sidebar-brand-sub">{config.sub}</div>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ background: config.gradient }}>{user.avatar}</div>
          <div>
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">{user.role.toUpperCase()}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            {config.links.map((link, i) => (
              link.path === null ? (
                <div key={i} style={{ padding: '10px 16px 4px', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7 }}>{link.label}</div>
              ) : (
                <Link key={link.path} to={link.path} className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                  <span className="sidebar-link-icon">{link.icon}</span>
                  {link.label}
                </Link>
              )
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link"><span className="sidebar-link-icon">🏠</span>Back to Home</Link>
          <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', textAlign: 'left' }}><span className="sidebar-link-icon">🚪</span>Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="app-main">
        {/* Topbar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <button className="topbar-burger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1 className="topbar-title">{title || 'Dashboard'}</h1>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <span className="topbar-search-icon">🔍</span>
              <input placeholder="Search..." />
            </div>
            <button className="topbar-btn" style={{ position: 'relative' }}>
              🔔
              {unread > 0 && <span className="topbar-badge">{unread}</span>}
            </button>
            <div className="topbar-avatar" style={{ background: config.gradient }}>{user.avatar}</div>
          </div>
        </header>

        {/* Page Content */}
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
