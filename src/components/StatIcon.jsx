import {
  Flame, Beef, Wheat, Droplets, Clock, Star, TrendingUp, TrendingDown,
  ShoppingCart, Package, CalendarCheck, Truck, Users, DollarSign, IndianRupee,
  Target, Award, Heart, ThumbsUp, Zap, Scale, Activity, Dumbbell,
  Utensils, ChefHat, MapPin, Timer, CheckCircle2, XCircle, AlertCircle,
  BarChart3, PieChart, LineChart, Salad, Apple, Carrot, Fish, Egg,
  CircleDollarSign, Wallet, CreditCard, Receipt, BadgeCheck, ShieldCheck,
  Bike, Car, Navigation, Route, ArrowUpRight, ArrowDownRight,
  Percent, Hash, Calendar, ListChecks, ClipboardCheck, FileText
} from 'lucide-react';

/**
 * Professional stat icon component — replaces emoji icons
 * Usage: <StatIcon name="calories" size={28} />
 */
export default function StatIcon({ name, size = 28, color, className = '' }) {
  const iconMap = {
    // Nutrition
    calories: { icon: Flame, color: '#f97316' },
    protein: { icon: Beef, color: '#22c55e' },
    carbs: { icon: Wheat, color: '#3b82f6' },
    fat: { icon: Droplets, color: '#eab308' },
    fiber: { icon: Salad, color: '#14b8a6' },
    
    // Food
    meal: { icon: Utensils, color: '#f97316' },
    food: { icon: Utensils, color: '#f97316' },
    chef: { icon: ChefHat, color: '#14b8a6' },
    apple: { icon: Apple, color: '#ef4444' },
    carrot: { icon: Carrot, color: '#f97316' },
    fish: { icon: Fish, color: '#3b82f6' },
    egg: { icon: Egg, color: '#eab308' },
    
    // Time
    clock: { icon: Clock, color: '#8b5cf6' },
    timer: { icon: Timer, color: '#f97316' },
    calendar: { icon: Calendar, color: '#3b82f6' },
    calendarCheck: { icon: CalendarCheck, color: '#22c55e' },
    
    // Status
    check: { icon: CheckCircle2, color: '#22c55e' },
    error: { icon: XCircle, color: '#ef4444' },
    warning: { icon: AlertCircle, color: '#eab308' },
    verified: { icon: BadgeCheck, color: '#22c55e' },
    shield: { icon: ShieldCheck, color: '#22c55e' },
    
    // Commerce
    cart: { icon: ShoppingCart, color: '#f97316' },
    order: { icon: Package, color: '#8b5cf6' },
    orders: { icon: Package, color: '#8b5cf6' },
    dollar: { icon: CircleDollarSign, color: '#22c55e' },
    wallet: { icon: Wallet, color: '#14b8a6' },
    payment: { icon: CreditCard, color: '#3b82f6' },
    receipt: { icon: Receipt, color: '#f97316' },
    revenue: { icon: IndianRupee, color: '#22c55e' },
    
    // Delivery
    truck: { icon: Truck, color: '#14b8a6' },
    bike: { icon: Bike, color: '#f97316' },
    car: { icon: Car, color: '#3b82f6' },
    navigation: { icon: Navigation, color: '#22c55e' },
    route: { icon: Route, color: '#8b5cf6' },
    location: { icon: MapPin, color: '#ef4444' },
    
    // People
    users: { icon: Users, color: '#3b82f6' },
    clients: { icon: Users, color: '#8b5cf6' },
    
    // Progress & Stats
    trending: { icon: TrendingUp, color: '#22c55e' },
    trendingUp: { icon: TrendingUp, color: '#22c55e' },
    trendingDown: { icon: TrendingDown, color: '#ef4444' },
    up: { icon: ArrowUpRight, color: '#22c55e' },
    down: { icon: ArrowDownRight, color: '#ef4444' },
    target: { icon: Target, color: '#f97316' },
    award: { icon: Award, color: '#eab308' },
    star: { icon: Star, color: '#eab308' },
    heart: { icon: Heart, color: '#ef4444' },
    like: { icon: ThumbsUp, color: '#3b82f6' },
    zap: { icon: Zap, color: '#f97316' },
    activity: { icon: Activity, color: '#22c55e' },
    scale: { icon: Scale, color: '#8b5cf6' },
    dumbbell: { icon: Dumbbell, color: '#f97316' },
    percent: { icon: Percent, color: '#14b8a6' },
    
    // Charts
    barChart: { icon: BarChart3, color: '#3b82f6' },
    pieChart: { icon: PieChart, color: '#8b5cf6' },
    lineChart: { icon: LineChart, color: '#22c55e' },
    
    // Lists & Tasks
    tasks: { icon: ListChecks, color: '#f97316' },
    clipboard: { icon: ClipboardCheck, color: '#22c55e' },
    file: { icon: FileText, color: '#3b82f6' },
    hash: { icon: Hash, color: '#8b5cf6' },
  };

  const config = iconMap[name] || iconMap.zap;
  const IconComp = config.icon;
  const iconColor = color || config.color;

  return (
    <div className={`stat-icon-pro ${className}`} style={{
      width: size + 12, height: size + 12, borderRadius: 12,
      background: `${iconColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <IconComp size={size} color={iconColor} strokeWidth={1.8} />
    </div>
  );
}
