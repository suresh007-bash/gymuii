import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useNotifications } from './context/NotificationContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CompleteProfile from './pages/CompleteProfile';
import ChangePassword from './pages/ChangePassword';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import BrowseMenu from './pages/client/BrowseMenu';
import MyCart from './pages/client/MyCart';
import ScheduleFoods from './pages/client/ScheduleFoods';
import MyOrders from './pages/client/MyOrders';
import ClientNutrition from './pages/client/ClientNutrition';
import ClientProfile from './pages/client/ClientProfile';
import ClientMealPlans from './pages/client/ClientMealPlans';
import ClientSubscriptions from './pages/client/ClientSubscriptions';
import ClientSupport from './pages/client/ClientSupport';
import ClientSettings from './pages/client/ClientSettings';
import ClientCommunity from './pages/client/ClientCommunity';
import ClientProgress from './pages/client/ClientProgress';

// Trainer Pages
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import AssignedClients from './pages/trainer/AssignedClients';
import DietPlans from './pages/trainer/DietPlans';
import FoodScheduling from './pages/trainer/FoodScheduling';
import AddMember from './pages/trainer/AddMember'; // kept for backward compat
import TrainerProfile from './pages/trainer/TrainerProfile';
import TrainerMenu from './pages/trainer/TrainerMenu';
import TrainerCart from './pages/trainer/TrainerCart';
import TrainerOrders from './pages/trainer/TrainerOrders';
import TrainerNutrition from './pages/trainer/TrainerNutrition';
import ScheduleForClients from './pages/trainer/ScheduleForClients';
import TrainerSubscriptions from './pages/trainer/TrainerSubscriptions';
import MyOwner from './pages/trainer/MyOwner';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ManageTrainers from './pages/owner/ManageTrainers';
import MemberManagement from './pages/owner/MemberManagement';
import OwnerAnalytics from './pages/owner/OwnerAnalytics';
import OwnerProfile from './pages/owner/OwnerProfile';
import OwnerMenu from './pages/owner/OwnerMenu';
import OwnerCart from './pages/owner/OwnerCart';
import OwnerOrders from './pages/owner/OwnerOrders';

// Kitchen Pages
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import OrderQueue from './pages/kitchen/OrderQueue';
import KitchenMenu from './pages/kitchen/KitchenMenu';
import DispatchPage from './pages/kitchen/DispatchPage';
import KitchenSettings from './pages/kitchen/KitchenSettings';

// Delivery Pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import MyDeliveries from './pages/delivery/MyDeliveries';
import DeliveryHistory from './pages/delivery/DeliveryHistory';
import DeliveryProfile from './pages/delivery/DeliveryProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminDelivery from './pages/admin/AdminDelivery';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

function ClientDashboardRedirect() {
  const { user } = useAuth();
  if (user?.redirectPage) {
    return <Navigate to={user.redirectPage} replace />;
  }
  if (user?.goal === 'Weight Loss') {
    return <Navigate to="/client/nutrition" replace />;
  }
  if (user?.goal === 'Muscle Gain') {
    return <Navigate to="/client/meal-plans" replace />;
  }
  return <Navigate to="/client/progress" replace />;
}

function ToastContainer() {
  const { toasts } = useNotifications();
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && '✅'}{t.type === 'error' && '❌'}{t.type === 'warning' && '⚠️'}{t.type === 'info' && 'ℹ️'} {t.message}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

        {/* Client */}
        <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboardRedirect /></ProtectedRoute>} />
        <Route path="/client/menu" element={<ProtectedRoute allowedRoles={['client']}><BrowseMenu /></ProtectedRoute>} />
        <Route path="/client/cart" element={<ProtectedRoute allowedRoles={['client']}><MyCart /></ProtectedRoute>} />
        <Route path="/client/schedule" element={<ProtectedRoute allowedRoles={['client']}><ScheduleFoods /></ProtectedRoute>} />
        <Route path="/client/orders" element={<ProtectedRoute allowedRoles={['client']}><MyOrders /></ProtectedRoute>} />
        <Route path="/client/nutrition" element={<ProtectedRoute allowedRoles={['client']}><ClientNutrition /></ProtectedRoute>} />
        <Route path="/client/progress" element={<ProtectedRoute allowedRoles={['client']}><ClientProgress /></ProtectedRoute>} />
        <Route path="/client/profile" element={<ProtectedRoute allowedRoles={['client']}><ClientProfile /></ProtectedRoute>} />
        <Route path="/client/meal-plans" element={<ProtectedRoute allowedRoles={['client']}><ClientMealPlans /></ProtectedRoute>} />
        <Route path="/client/subscriptions" element={<ProtectedRoute allowedRoles={['client']}><ClientSubscriptions /></ProtectedRoute>} />
        <Route path="/client/support" element={<ProtectedRoute allowedRoles={['client']}><ClientSupport /></ProtectedRoute>} />
        <Route path="/client/settings" element={<ProtectedRoute allowedRoles={['client']}><ClientSettings /></ProtectedRoute>} />
        <Route path="/client/community" element={<ProtectedRoute allowedRoles={['client']}><ClientCommunity /></ProtectedRoute>} />

        {/* Trainer */}
        <Route path="/trainer/dashboard" element={<ProtectedRoute allowedRoles={['trainer']}><TrainerDashboard /></ProtectedRoute>} />
        <Route path="/trainer/clients" element={<ProtectedRoute allowedRoles={['trainer']}><AssignedClients /></ProtectedRoute>} />
        <Route path="/trainer/diet-plans" element={<ProtectedRoute allowedRoles={['trainer']}><DietPlans /></ProtectedRoute>} />
        <Route path="/trainer/meal-scheduling" element={<ProtectedRoute allowedRoles={['trainer']}><FoodScheduling /></ProtectedRoute>} />
        <Route path="/trainer/menu" element={<Navigate to="/trainer/home" replace />} />
        <Route path="/trainer/home" element={<ProtectedRoute allowedRoles={['trainer']}><BrowseMenu /></ProtectedRoute>} />
        <Route path="/trainer/my-meal-plans" element={<ProtectedRoute allowedRoles={['trainer']}><ClientMealPlans /></ProtectedRoute>} />
        <Route path="/trainer/cart" element={<ProtectedRoute allowedRoles={['trainer']}><MyCart /></ProtectedRoute>} />
        <Route path="/trainer/my-schedule" element={<ProtectedRoute allowedRoles={['trainer']}><ScheduleFoods /></ProtectedRoute>} />
        <Route path="/trainer/orders" element={<ProtectedRoute allowedRoles={['trainer']}><MyOrders /></ProtectedRoute>} />
        <Route path="/trainer/nutrition" element={<ProtectedRoute allowedRoles={['trainer']}><ClientNutrition /></ProtectedRoute>} />
        <Route path="/trainer/subscriptions" element={<ProtectedRoute allowedRoles={['trainer']}><TrainerSubscriptions /></ProtectedRoute>} />
        <Route path="/trainer/add-member" element={<Navigate to="/trainer/clients" replace />} />
        <Route path="/trainer/profile" element={<ProtectedRoute allowedRoles={['trainer']}><TrainerProfile /></ProtectedRoute>} />
        <Route path="/trainer/schedule-for-clients" element={<ProtectedRoute allowedRoles={['trainer']}><ScheduleForClients /></ProtectedRoute>} />
        <Route path="/trainer/my-owner" element={<ProtectedRoute allowedRoles={['trainer']}><MyOwner /></ProtectedRoute>} />

        {/* Owner */}
        <Route path="/owner/dashboard" element={<Navigate to="/owner/menu" replace />} />
        <Route path="/owner/trainers" element={<ProtectedRoute allowedRoles={['owner']}><ManageTrainers /></ProtectedRoute>} />
        <Route path="/owner/members" element={<Navigate to="/owner/clients" replace />} />
        <Route path="/owner/add-member" element={<Navigate to="/owner/clients" replace />} />
        <Route path="/owner/clients" element={<ProtectedRoute allowedRoles={['owner']}><AssignedClients /></ProtectedRoute>} />
        <Route path="/owner/schedule-for-clients" element={<ProtectedRoute allowedRoles={['owner']}><ScheduleForClients /></ProtectedRoute>} />
        <Route path="/owner/analytics" element={<ProtectedRoute allowedRoles={['owner']}><OwnerAnalytics /></ProtectedRoute>} />
        <Route path="/owner/profile" element={<ProtectedRoute allowedRoles={['owner']}><OwnerProfile /></ProtectedRoute>} />
        <Route path="/owner/menu" element={<ProtectedRoute allowedRoles={['owner']}><BrowseMenu /></ProtectedRoute>} />
        <Route path="/owner/cart" element={<ProtectedRoute allowedRoles={['owner']}><MyCart /></ProtectedRoute>} />
        <Route path="/owner/orders" element={<ProtectedRoute allowedRoles={['owner']}><MyOrders /></ProtectedRoute>} />
        <Route path="/owner/schedule" element={<ProtectedRoute allowedRoles={['owner']}><ScheduleFoods /></ProtectedRoute>} />
        <Route path="/owner/nutrition" element={<ProtectedRoute allowedRoles={['owner']}><ClientNutrition /></ProtectedRoute>} />
        <Route path="/owner/meal-plans" element={<ProtectedRoute allowedRoles={['owner']}><ClientMealPlans /></ProtectedRoute>} />
        <Route path="/owner/subscriptions" element={<ProtectedRoute allowedRoles={['owner']}><ClientSubscriptions /></ProtectedRoute>} />
        <Route path="/owner/community" element={<ProtectedRoute allowedRoles={['owner']}><ClientCommunity /></ProtectedRoute>} />
        <Route path="/owner/support" element={<ProtectedRoute allowedRoles={['owner']}><ClientSupport /></ProtectedRoute>} />
        <Route path="/owner/settings" element={<ProtectedRoute allowedRoles={['owner']}><ClientSettings /></ProtectedRoute>} />

        {/* Kitchen */}
        <Route path="/kitchen/dashboard" element={<ProtectedRoute allowedRoles={['kitchen']}><KitchenDashboard /></ProtectedRoute>} />
        <Route path="/kitchen/queue" element={<ProtectedRoute allowedRoles={['kitchen']}><OrderQueue /></ProtectedRoute>} />
        <Route path="/kitchen/menu" element={<ProtectedRoute allowedRoles={['kitchen']}><KitchenMenu /></ProtectedRoute>} />
        <Route path="/kitchen/dispatch" element={<ProtectedRoute allowedRoles={['kitchen']}><DispatchPage /></ProtectedRoute>} />
        <Route path="/kitchen/settings" element={<ProtectedRoute allowedRoles={['kitchen']}><KitchenSettings /></ProtectedRoute>} />

        {/* Delivery */}
        <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryDashboard /></ProtectedRoute>} />
        <Route path="/delivery/my-deliveries" element={<ProtectedRoute allowedRoles={['delivery']}><MyDeliveries /></ProtectedRoute>} />
        <Route path="/delivery/history" element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryHistory /></ProtectedRoute>} />
        <Route path="/delivery/profile" element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryProfile /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/delivery" element={<ProtectedRoute allowedRoles={['admin']}><AdminDelivery /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
