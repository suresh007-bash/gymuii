import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Home, ClipboardList, ShoppingCart, CalendarDays, Package, BarChart3,
  TrendingUp, Gem, Users, LifeBuoy, User, Settings, Dumbbell,
  UtensilsCrossed, Rocket, ScrollText, Truck, ShieldCheck, Bell,
  Search, Menu, LogOut, ChefHat, UserPlus, LayoutDashboard, CalendarClock, Building2
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
    { icon: TrendingUp, label: 'Progress', path: '/client/progress' },
    { icon: Gem, tKey: 'subscriptions', path: '/client/subscriptions' },
    { icon: UserPlus, label: 'Request for Trainer', path: '/client/community' },
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
    { icon: Users, tKey: 'myClients', path: '/trainer/clients' },
    { icon: CalendarClock, tKey: 'scheduleForClients', path: '/trainer/schedule-for-clients' },
    { icon: Building2, tKey: 'myGymOwner', path: '/trainer/my-owner' },
    { icon: User, tKey: 'profile', path: '/trainer/profile' },
  ]},
  owner: { brand: 'FitSwipe', sub: 'OWNER PORTAL', gradient: 'linear-gradient(135deg, #22c55e, #4ade80)', links: [
    { icon: Home, tKey: 'home', path: '/owner/menu' },
    { icon: Dumbbell, tKey: 'manageTrainers', path: '/owner/trainers' },
    { icon: Users, tKey: 'myClients', path: '/owner/clients' },
    { icon: CalendarClock, tKey: 'scheduleForClients', path: '/owner/schedule-for-clients' },
    { icon: TrendingUp, tKey: 'analytics', path: '/owner/analytics' },
    { icon: ClipboardList, label: 'Meal Plans', path: '/owner/meal-plans' },
    { icon: ShoppingCart, tKey: 'myCart', path: '/owner/cart' },
    { icon: CalendarDays, tKey: 'scheduleFoods', path: '/owner/schedule' },
    { icon: Package, tKey: 'myOrders', path: '/owner/orders' },
    { icon: BarChart3, tKey: 'nutrition', path: '/owner/nutrition' },
    { icon: Gem, tKey: 'subscriptions', path: '/owner/subscriptions' },
    { icon: UserPlus, label: 'Request for Trainer', path: '/owner/community' },
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
    { icon: Truck, tKey: 'deliveryMgmt', path: '/admin/delivery' },
    { icon: TrendingUp, tKey: 'analytics', path: '/admin/analytics' },
    { icon: Settings, tKey: 'settings', path: '/admin/settings' },
  ]},
};

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth();
  const { getUnreadCount } = useNotifications();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;
  const role = user.role;
  const config = NAV[role] || NAV.client;
  const links = config.links;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`} style={{ width: 240, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 999, transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', transform: sidebarOpen ? 'translateX(0)' : undefined }}>
        {/* Brand */}
        <div style={{ padding: '20px 18px 8px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <UtensilsCrossed size={22} style={{ color: '#f97316' }} />
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 18, background: config.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{config.brand}</div>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1.5 }}>{config.sub}</div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: config.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff' }}>{user.avatar || '?'}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13 }}>{user.name}</div>
            <div style={{ fontSize: 10, color: '#f97316', fontWeight: 700, textTransform: 'uppercase' }}>{role}</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
          {links.map(link => {
            const isActive = location.pathname === link.path;
            const label = link.tKey ? t(link.tKey) : link.label;
            return (
              <Link key={link.path} to={link.path} onClick={() => setSidebarOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 2, borderRadius: 10,
                background: isActive ? 'rgba(249,115,22,0.08)' : 'transparent',
                color: isActive ? '#f97316' : 'var(--text-secondary)',
                fontWeight: isActive ? 800 : 600, fontSize: 13, textDecoration: 'none',
                transition: 'all 0.2s',
              }}>
                <SideIcon Icon={link.icon} isActive={isActive} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            <LogOut size={16} /> {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '0 clamp(16px, 3vw, 28px)', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'none' }}><Menu size={22} /></button>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => navigate(links[0]?.path)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Search size={18} /></button>
            <button onClick={() => navigate(`/${role}/orders`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', position: 'relative' }}>
              <Bell size={18} />
              {getUnreadCount() > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: '#ef4444', borderRadius: '50%', fontSize: 9, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getUnreadCount()}</span>}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: 'clamp(16px, 3vw, 28px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
