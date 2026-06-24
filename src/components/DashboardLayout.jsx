import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Home, ClipboardList, ShoppingCart, CalendarDays, Package, BarChart3,
  TrendingUp, Gem, Users, LifeBuoy, User, Settings, Dumbbell,
  UtensilsCrossed, Rocket, ScrollText, Truck, ShieldCheck, Bell,
  Search, Menu, LogOut, ChefHat, UserPlus, LayoutDashboard, CalendarClock, Building2, X, ArrowLeft
} from 'lucide-react';

// Icon component wrapper with animation
function SideIcon({ Icon, isActive }) {
  return <Icon size={18} style={{ transition: 'transform 0.2s', transform: isActive ? 'scale(1.15)' : 'scale(1)' }} />;
}

const NAV = {
  client: { brand: 'FitBites', sub: 'CLIENT PORTAL', gradient: 'linear-gradient(135deg, #f97316, #fb923c)', links: [
    { icon: Home, tKey: 'home', path: '/client/menu' },
    { icon: ShoppingCart, tKey: 'myCart', path: '/client/cart' },
    { icon: CalendarDays, tKey: 'scheduleFoods', path: '/client/schedule' },
    { icon: Package, tKey: 'myOrders', path: '/client/orders' },
    { icon: BarChart3, tKey: 'nutrition', path: '/client/nutrition' },
    { icon: ClipboardList, label: 'Trainer Recommendation', path: '/client/meal-plans' },
    { icon: TrendingUp, label: 'Progress', path: '/client/progress' },
    { icon: Gem, tKey: 'subscriptions', path: '/client/subscriptions' },
    { icon: Building2, label: 'Join Gym', path: '/client/community' },
    { icon: LifeBuoy, label: 'Support', path: '/client/support' },
    { icon: User, tKey: 'profile', path: '/client/profile' },
    { icon: Settings, tKey: 'settings', path: '/client/settings' },
  ]},
  trainer: { brand: 'FitBites', sub: 'TRAINER PORTAL', gradient: 'linear-gradient(135deg, #f97316, #22c55e)', links: [
    { icon: Home, tKey: 'home', path: '/trainer/home' },
    { icon: ShoppingCart, tKey: 'myCart', path: '/trainer/cart' },
    { icon: CalendarDays, tKey: 'scheduleFoods', path: '/trainer/my-schedule' },
    { icon: Package, tKey: 'myOrders', path: '/trainer/orders' },
    { icon: BarChart3, tKey: 'nutrition', path: '/trainer/nutrition' },
    { icon: Gem, tKey: 'subscriptions', path: '/trainer/subscriptions' },
    { section: '🏋️ Trainer Tools' },
    { icon: Users, tKey: 'myClients', path: '/trainer/clients' },
    { icon: CalendarClock, tKey: 'scheduleForClients', path: '/trainer/schedule-for-clients' },
    { icon: Building2, tKey: 'myGymOwner', path: '/trainer/my-owner' },
    { icon: User, tKey: 'profile', path: '/trainer/profile' },
  ]},
  owner: { brand: 'FitSwipe', sub: 'OWNER PORTAL', gradient: 'linear-gradient(135deg, #22c55e, #4ade80)', links: [
    { icon: Home, tKey: 'home', path: '/owner/menu' },
    { section: '👑 Owner Tools' },
    { icon: Dumbbell, tKey: 'manageTrainers', path: '/owner/trainers' },
    { icon: Users, tKey: 'myClients', path: '/owner/clients' },
    { icon: CalendarClock, tKey: 'scheduleForClients', path: '/owner/schedule-for-clients' },
    { icon: TrendingUp, tKey: 'analytics', path: '/owner/analytics' },
    { section: '🍽️ Food & Orders' },
    { icon: ShoppingCart, tKey: 'myCart', path: '/owner/cart' },
    { icon: CalendarDays, tKey: 'scheduleFoods', path: '/owner/schedule' },
    { icon: Package, tKey: 'myOrders', path: '/owner/orders' },
    { icon: BarChart3, tKey: 'nutrition', path: '/owner/nutrition' },
    { icon: Gem, tKey: 'subscriptions', path: '/owner/subscriptions' },
    { section: '⚙️ Account' },
    { icon: LifeBuoy, label: 'Support', path: '/owner/support' },
    { icon: User, tKey: 'profile', path: '/owner/profile' },
    { icon: Settings, tKey: 'settings', path: '/owner/settings' },
  ]},
  kitchen: { brand: 'FitBites', sub: 'KITCHEN PORTAL', gradient: 'linear-gradient(135deg, #14b8a6, #22c55e)', links: [
    { icon: LayoutDashboard, tKey: 'home', path: '/kitchen/dashboard' },
    { icon: ClipboardList, tKey: 'orderQueue', path: '/kitchen/queue' },
    { icon: UtensilsCrossed, tKey: 'menu', path: '/kitchen/menu' },
    { icon: Rocket, tKey: 'dispatch', path: '/kitchen/dispatch' },
    { icon: Settings, tKey: 'settings', path: '/kitchen/settings' },
  ]},
  delivery: { brand: 'FitBites', sub: 'DELIVERY PORTAL', gradient: 'linear-gradient(135deg, #f97316, #14b8a6)', links: [
    { icon: LayoutDashboard, tKey: 'home', path: '/delivery/dashboard' },
    { icon: Package, tKey: 'deliveries', path: '/delivery/my-deliveries' },
    { icon: ScrollText, label: 'Delivery History', path: '/delivery/history' },
    { icon: User, tKey: 'profile', path: '/delivery/profile' },
  ]},
  admin: { brand: 'GymFuel', sub: 'ADMIN PORTAL', gradient: 'linear-gradient(135deg, #f97316, #22c55e)', links: [
    { icon: LayoutDashboard, tKey: 'home', path: '/admin/dashboard' },
    { icon: Package, tKey: 'allOrders', path: '/admin/orders' },
    { icon: Users, tKey: 'userManagement', path: '/admin/users' },
    { icon: Building2, label: 'Manage Gyms', path: '/admin/gyms' },
    { icon: Truck, tKey: 'deliveryMgmt', path: '/admin/delivery' },
    { icon: TrendingUp, tKey: 'analytics', path: '/admin/analytics' },
    { icon: Settings, tKey: 'settings', path: '/admin/settings' },
  ]},
};

export default function DashboardLayout({ children, title, flush }) {
  const { user, logout } = useAuth();
  const { getUnreadCount } = useNotifications();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!user) return null;
  const role = user.role;
  const config = NAV[role] || NAV.client;
  const links = config.links;

  return (
    <div className="dashboard-root">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Close button (mobile) */}
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
          <X size={20} />
        </button>

        {/* Brand */}
        <div className="sidebar-brand-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UtensilsCrossed size={22} style={{ color: 'var(--accent-orange)' }} />
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 18, background: config.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{config.brand}</div>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1.5 }}>{config.sub}</div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="sidebar-user-info">
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: config.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff', flexShrink: 0 }}>{user.avatar || '?'}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div style={{ fontSize: 10, color: 'var(--accent-orange)', fontWeight: 700, textTransform: 'uppercase' }}>{role}</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="sidebar-nav">
          {links.map((link, idx) => {
            if (link.section) {
              return (
                <div key={'section-' + idx} style={{
                  padding: '12px 16px 6px', fontSize: 10, fontWeight: 800,
                  color: 'var(--text-muted)', textTransform: 'uppercase',
                  letterSpacing: 1.2, marginTop: idx > 0 ? 6 : 0,
                  borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                  paddingTop: idx > 0 ? 14 : 12,
                }}>
                  {link.section}
                </div>
              );
            }
            const isActive = location.pathname === link.path;
            const label = link.tKey ? t(link.tKey) : link.label;
            const isLargeFontRole = role === 'client' || role === 'delivery';
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={() => setSidebarOpen(false)} 
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                style={isLargeFontRole ? { fontSize: '16px', fontWeight: 700, padding: '14px 16px' } : {}}
              >
                <SideIcon Icon={link.icon} isActive={isActive} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="sidebar-logout">
          <button onClick={() => { setSidebarOpen(false); setShowLogoutConfirm(true); }} className="sidebar-logout-btn">
            <LogOut size={16} /> {t('logout')}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)} style={{ zIndex: 2000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, textAlign: 'center', padding: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👋</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Logout Confirmation</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>Are you sure you want to sign out? You'll need to log in again to access your account.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn" style={{ flex: 1, background: '#ef4444', color: '#fff' }} onClick={() => { setShowLogoutConfirm(false); logout(); navigate('/login'); }}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {location.pathname === links[0]?.path ? (
              <button className="topbar-hamburger" onClick={() => setSidebarOpen(true)}>
                <Menu size={22} />
              </button>
            ) : (
              <button className="topbar-back-btn" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4 }}>
                <ArrowLeft size={22} />
              </button>
            )}
            <h2 className="topbar-title">{title}</h2>
          </div>
        </header>

        {/* Page Content */}
        <main className={`dashboard-content${flush ? ' flush-top' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
