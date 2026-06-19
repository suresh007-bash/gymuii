import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Home, ClipboardList, ShoppingCart, CalendarDays, Package, BarChart3,
  TrendingUp, Gem, Users, LifeBuoy, User, Settings, Dumbbell,
  UtensilsCrossed, Rocket, ScrollText, Truck, ShieldCheck, Bell,
  Search, Menu, LogOut, ChefHat, UserPlus, LayoutDashboard, CalendarClock
} from 'lucide-react';

// Icon component wrapper with animation
function NavIcon({ icon: Icon, isActive }) {
  return (
    <span className={`sidebar-link-icon ${isActive ? 'icon-active' : ''}`}>
      <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
    </span>
  );
}

const roleConfig = {
  client: { brand: 'FitBites', sub: 'GYM FOOD DELIVERY', gradient: 'linear-gradient(135deg, #f97316, #fb923c)', links: [
    { icon: Home, label: 'Home', path: '/client/menu' },
    { icon: ClipboardList, label: 'Meal Plans', path: '/client/meal-plans' },
    { icon: ShoppingCart, label: 'My Cart', path: '/client/cart' },
    { icon: CalendarDays, label: 'Schedule Foods', path: '/client/schedule' },
    { icon: Package, label: 'My Orders', path: '/client/orders' },
    { icon: BarChart3, label: 'Nutrition', path: '/client/nutrition' },
    { icon: TrendingUp, label: 'Progress', path: '/client/progress' },
    { icon: Gem, label: 'Subscriptions', path: '/client/subscriptions' },
    { icon: UserPlus, label: 'Request for Trainer', path: '/client/community' },
    { icon: LifeBuoy, label: 'Support', path: '/client/support' },
    { icon: User, label: 'Profile', path: '/client/profile' },
    { icon: Settings, label: 'Settings', path: '/client/settings' },
  ]},
  trainer: { brand: 'FitBites', sub: 'TRAINER PORTAL', gradient: 'linear-gradient(135deg, #f97316, #22c55e)', links: [
    { icon: Home, label: 'Home', path: '/trainer/home' },
    { icon: ShoppingCart, label: 'My Cart', path: '/trainer/cart' },
    { icon: CalendarDays, label: 'Schedule Foods', path: '/trainer/my-schedule' },
    { icon: Package, label: 'My Orders', path: '/trainer/orders' },
    { icon: BarChart3, label: 'Nutrition', path: '/trainer/nutrition' },
    { icon: Gem, label: 'Subscriptions', path: '/trainer/subscriptions' },
    { icon: Users, label: 'My Clients', path: '/trainer/clients' },
    { icon: CalendarClock, label: 'Schedule Foods to Clients', path: '/trainer/schedule-for-clients' },
    { icon: User, label: 'Profile', path: '/trainer/profile' },
  ]},
  owner: { brand: 'FitSwipe', sub: 'OWNER PORTAL', gradient: 'linear-gradient(135deg, #22c55e, #4ade80)', links: [
    { icon: Home, label: 'Home', path: '/owner/menu' },
    { icon: Dumbbell, label: 'Manage Trainers', path: '/owner/trainers' },
    { icon: Users, label: 'My Clients', path: '/owner/clients' },
    { icon: CalendarClock, label: 'Schedule Foods to Clients', path: '/owner/schedule-for-clients' },
    { icon: TrendingUp, label: 'Analytics', path: '/owner/analytics' },
    { icon: ClipboardList, label: 'Meal Plans', path: '/owner/meal-plans' },
    { icon: ShoppingCart, label: 'My Cart', path: '/owner/cart' },
    { icon: CalendarDays, label: 'Schedule Foods', path: '/owner/schedule' },
    { icon: Package, label: 'My Orders', path: '/owner/orders' },
    { icon: BarChart3, label: 'Nutrition', path: '/owner/nutrition' },
    { icon: Gem, label: 'Subscriptions', path: '/owner/subscriptions' },
    { icon: UserPlus, label: 'Request for Trainer', path: '/owner/community' },
    { icon: LifeBuoy, label: 'Support', path: '/owner/support' },
    { icon: User, label: 'Profile', path: '/owner/profile' },
    { icon: Settings, label: 'Settings', path: '/owner/settings' },
  ]},
  kitchen: { brand: 'FitBites', sub: 'KITCHEN PORTAL', gradient: 'linear-gradient(135deg, #14b8a6, #22c55e)', links: [
    { icon: LayoutDashboard, label: 'Home', path: '/kitchen/dashboard' },
    { icon: ClipboardList, label: 'Order Queue', path: '/kitchen/queue' },
    { icon: UtensilsCrossed, label: 'Menu', path: '/kitchen/menu' },
    { icon: Rocket, label: 'Dispatch', path: '/kitchen/dispatch' },
    { icon: Settings, label: 'Settings', path: '/kitchen/settings' },
  ]},
  delivery: { brand: 'FitBites', sub: 'DELIVERY PORTAL', gradient: 'linear-gradient(135deg, #f97316, #14b8a6)', links: [
    { icon: LayoutDashboard, label: 'Home', path: '/delivery/dashboard' },
    { icon: Package, label: 'My Deliveries', path: '/delivery/my-deliveries' },
    { icon: ScrollText, label: 'Delivery History', path: '/delivery/history' },
    { icon: User, label: 'Profile', path: '/delivery/profile' },
  ]},
  admin: { brand: 'GymFuel', sub: 'ADMIN PORTAL', gradient: 'linear-gradient(135deg, #f97316, #22c55e)', links: [
    { icon: LayoutDashboard, label: 'Home', path: '/admin/dashboard' },
    { icon: Package, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Truck, label: 'Delivery', path: '/admin/delivery' },
    { icon: TrendingUp, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
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
          <div className="sidebar-brand-icon"><UtensilsCrossed size={22} /></div>
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
                  <NavIcon icon={link.icon} isActive={location.pathname === link.path} />
                  {link.label}
                </Link>
              )
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link"><span className="sidebar-link-icon"><Home size={20} strokeWidth={1.8} /></span>Back to Home</Link>
          <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', textAlign: 'left' }}><span className="sidebar-link-icon"><LogOut size={20} strokeWidth={1.8} /></span>Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="app-main">
        {/* Topbar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <button className="topbar-burger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={22} />
            </button>
            <h1 className="topbar-title">{title || 'Dashboard'}</h1>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <span className="topbar-search-icon"><Search size={16} /></span>
              <input placeholder="Search..." />
            </div>
            <button className="topbar-btn" style={{ position: 'relative' }}>
              <Bell size={20} />
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
