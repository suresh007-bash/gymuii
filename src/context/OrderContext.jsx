import { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_ORDERS, SCHEDULED_ORDERS } from '../data/mockOrders';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('synnoviq_orders');
    return saved ? JSON.parse(saved) : MOCK_ORDERS;
  });

  const [scheduledOrders, setScheduledOrders] = useState(() => {
    const saved = localStorage.getItem('synnoviq_scheduled');
    return saved ? JSON.parse(saved) : SCHEDULED_ORDERS;
  });

  const [dietPlans, setDietPlans] = useState(() => {
    const saved = localStorage.getItem('synnoviq_diet_plans');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('synnoviq_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('synnoviq_scheduled', JSON.stringify(scheduledOrders)); }, [scheduledOrders]);
  useEffect(() => { localStorage.setItem('synnoviq_diet_plans', JSON.stringify(dietPlans)); }, [dietPlans]);

  // ═══ ORDER FUNCTIONS ═══
  const placeOrder = (orderData) => {
    const otp = orderData.otp || String(Math.floor(1000 + Math.random() * 9000));
    const newOrder = {
      ...orderData,
      id: 'ord' + Date.now(),
      status: 'pending',
      stage: 0,
      orderTime: new Date().toISOString(),
      otp,
      scheduledDates: orderData.scheduledDates || [],
      timing: orderData.timing || null,
      driverId: null,
      driverName: null,
      kitchenId: 'k1',
      restaurantName: 'FitBites Central Kitchen',
      restaurantAddress: '12 MG Road, Koramangala, Bangalore',
      eta: '30 min',
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus, extra = {}) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, ...extra } : o));
  };

  const assignDriver = (orderId, driverId, driverName) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, driverId, driverName, status: 'driver_pending', stage: 3 } : o));
  };

  const acceptDelivery = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'in_transit', stage: 3 } : o));
  };

  const rejectDelivery = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, driverId: null, driverName: null, status: 'ready', stage: 2 } : o));
  };

  const completeDelivery = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered', stage: 5, paymentStatus: 'Paid', deliveredAt: new Date().toISOString() } : o));
  };

  const cancelOrder = (orderId, reason) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled', cancelReason: reason } : o));
  };

  // ═══ QUERY FUNCTIONS ═══
  const getOrdersByUser = (userId) => orders.filter(o => o.customerId === userId);
  const getOrdersByStatus = (status) => status === 'all' ? orders : orders.filter(o => o.status === status);
  const getOrdersByDriver = (driverId) => orders.filter(o => o.driverId === driverId);
  const getDriverPendingOrders = (driverId) => orders.filter(o => o.driverId === driverId && o.status === 'driver_pending');
  const getActiveOrders = () => orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const getOrdersByKitchen = (kitchenId) => orders.filter(o => o.kitchenId === kitchenId);
  const getOrderById = (id) => orders.find(o => o.id === id);

  // ═══ NUTRITION ═══
  const getTodayNutrition = (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.customerId === userId && o.orderTime.startsWith(today) && o.status !== 'cancelled');
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    todayOrders.forEach(o => {
      o.items.forEach(item => {
        const qty = item.qty || 1;
        calories += (item.calories || 0) * qty;
        protein += (item.protein || 0) * qty;
        carbs += (item.carbs || 0) * qty;
        fat += (item.fat || 0) * qty;
      });
    });
    return { calories, protein, carbs, fat };
  };

  // ═══ SCHEDULED ═══
  const addScheduledOrder = (schedule) => {
    const newSchedule = { ...schedule, id: Date.now(), status: 'active' };
    setScheduledOrders(prev => [...prev, newSchedule]);
    return newSchedule;
  };
  const cancelScheduledOrder = (id) => setScheduledOrders(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' } : s));
  const getScheduledByUser = (userId) => scheduledOrders.filter(s => s.customerId === userId);

  // ═══ DIET PLANS ═══
  const saveDietPlan = (plan) => {
    const newPlan = { ...plan, id: Date.now() };
    setDietPlans(prev => [...prev, newPlan]);
    return newPlan;
  };
  const deleteDietPlan = (planId) => {
    setDietPlans(prev => prev.filter(p => p.id !== planId));
  };
  const getDietPlansByTrainer = (trainerId) => dietPlans.filter(p => p.trainerId === trainerId);
  const getDietPlansByClient = (clientId) => dietPlans.filter(p => (p.assignedTo || []).includes(clientId));

  // ═══ STATS ═══
  const getStats = () => {
    const total = orders.length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const inTransit = orders.filter(o => ['in_transit', 'driver_pending'].includes(o.status)).length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const revenue = orders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + (o.total || 0), 0);
    const avgOrderValue = total > 0 ? Math.round(revenue / (total - cancelled)) : 0;
    return { total, delivered, pending, preparing, inTransit, cancelled, revenue, avgOrderValue };
  };

  const updateOrderDates = (orderId, newDates, newTiming) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, scheduledDates: newDates, timing: newTiming } : o));
  };

  const removeDateFromOrder = (orderId, dateStr) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const newDates = (o.scheduledDates || []).filter(d => d !== dateStr);
      const newSchedule = { ...o.schedule };
      delete newSchedule[dateStr];
      if (newDates.length === 0) return { ...o, status: 'cancelled', cancelReason: 'All dates cancelled', scheduledDates: [], schedule: {} };
      return { ...o, scheduledDates: newDates, schedule: newSchedule };
    }));
  };

  const updateOrderAddress = (orderId, newAddress) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, customerAddress: newAddress } : o));
  };

  const addOrder = (orderData) => placeOrder(orderData);

  return (
    <OrderContext.Provider value={{
      orders, placeOrder, updateOrderStatus, assignDriver, acceptDelivery, rejectDelivery,
      completeDelivery, cancelOrder,
      getOrdersByUser, getOrdersByStatus, getOrdersByDriver, getDriverPendingOrders,
      getActiveOrders, getOrdersByKitchen, getOrderById,
      getTodayNutrition, addScheduledOrder, cancelScheduledOrder, getScheduledByUser,
      saveDietPlan, deleteDietPlan, getDietPlansByTrainer, getDietPlansByClient,
      getStats, scheduledOrders, dietPlans, updateOrderDates, addOrder,
      removeDateFromOrder, updateOrderAddress,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);
