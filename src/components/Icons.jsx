import {
  Flame, Beef, Wheat, Droplets, Target, Settings, Trophy, Star,
  Users, Dumbbell, Building2, Crown, ChefHat, Truck, MapPin,
  Clock, Calendar, Package, ShoppingCart, Heart, TrendingUp,
  BarChart3, CheckCircle2, XCircle, AlertTriangle, Info,
  Mail, Phone, CreditCard, Wallet, Search, Filter, Plus,
  Minus, Edit, Trash2, Eye, EyeOff, Lock, Unlock, Shield,
  Bell, BellRing, MessageSquare, Send, Download, Upload,
  ArrowRight, ArrowLeft, ChevronDown, ChevronUp, ChevronRight,
  RefreshCw, Zap, Award, Medal, Gem, Sparkles, Rocket,
  LifeBuoy, HelpCircle, FileText, ClipboardList, BookOpen,
  Utensils, Apple, Salad, Coffee, Pizza, Leaf, Bike,
  Car, Home, LogOut, User, UserPlus, UserMinus, UserCheck,
  AlertCircle, CheckCheck, Timer, Activity, Gauge, Scale,
  Ruler, Footprints, Brain, HeartPulse, Pill, Syringe,
  CircleDot, CircleCheck, CircleX, CircleAlert, CirclePlus,
  SquareCheck, Square, Inbox, MailOpen, Archive,
  CalendarDays, CalendarClock, LayoutDashboard, List,
  HandCoins, Banknote, Receipt, Percent, Tag, Tags,
  Image, Camera, Video, Mic, Volume2, Play, Pause,
  MoreHorizontal, MoreVertical, Grip, Move, Copy, Clipboard,
  Link2, Share2, Bookmark, BookmarkCheck, Flag,
  Sun, Moon, Monitor, Laptop, Smartphone,
  Wifi, WifiOff, Globe, Navigation, Compass, Route,
  Layers, Grid3x3, LayoutGrid, Columns, Rows,
  Box, Boxes, Database, Server, Cloud,
  Wrench, Hammer, PenTool, Paintbrush,
  CircleDashed, Loader2, Save, Handshake
} from 'lucide-react';

// Professional icon component - renders a Lucide icon inline with text
export const Icon = ({ icon: IconComponent, size = 16, color, className = '', style = {}, ...props }) => {
  if (!IconComponent) return null;
  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      {...props}
    />
  );
};

// Section header icon - slightly larger with proper spacing
export const SectionIcon = ({ icon: IconComponent, size = 18, color = 'var(--accent-orange)', ...props }) => (
  <Icon icon={IconComponent} size={size} color={color} style={{ marginRight: 6 }} {...props} />
);

// Stat card icon wrapper - circular background
export const StatIcon = ({ icon: IconComponent, size = 20, color = '#f97316', bg, ...props }) => (
  <div style={{
    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
    background: bg || `${color}15`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <Icon icon={IconComponent} size={size} color={color} {...props} />
  </div>
);

// Badge icon - small inline
export const BadgeIcon = ({ icon: IconComponent, size = 12, color, ...props }) => (
  <Icon icon={IconComponent} size={size} color={color} style={{ marginRight: 4 }} {...props} />
);

// Export commonly used icon groups for easy mapping
export const NutritionIcons = {
  calories: { icon: Flame, color: '#f97316', label: 'Calories', unit: 'kcal' },
  protein: { icon: Beef, color: '#22c55e', label: 'Protein', unit: 'g' },
  carbs: { icon: Wheat, color: '#3b82f6', label: 'Carbs', unit: 'g' },
  fat: { icon: Droplets, color: '#eab308', label: 'Fat', unit: 'g' },
};

export const StatusIcons = {
  success: { icon: CheckCircle2, color: '#22c55e' },
  error: { icon: XCircle, color: '#ef4444' },
  warning: { icon: AlertTriangle, color: '#f59e0b' },
  info: { icon: Info, color: '#3b82f6' },
  pending: { icon: Clock, color: '#f97316' },
};

export const RoleIcons = {
  client: { icon: Dumbbell, color: '#f97316' },
  trainer: { icon: Users, color: '#8b5cf6' },
  owner: { icon: Crown, color: '#22c55e' },
  kitchen: { icon: ChefHat, color: '#14b8a6' },
  delivery: { icon: Truck, color: '#3b82f6' },
  admin: { icon: Shield, color: '#64748b' },
};

// Re-export all icons for convenience
export {
  Flame, Beef, Wheat, Droplets, Target, Settings, Trophy, Star,
  Users, Dumbbell, Building2, Crown, ChefHat, Truck, MapPin,
  Clock, Calendar, Package, ShoppingCart, Heart, TrendingUp,
  BarChart3, CheckCircle2, XCircle, AlertTriangle, Info,
  Mail, Phone, CreditCard, Wallet, Search, Filter, Plus,
  Minus, Edit, Trash2, Eye, EyeOff, Lock, Unlock, Shield,
  Bell, BellRing, MessageSquare, Send, Download, Upload,
  ArrowRight, ArrowLeft, ChevronDown, ChevronUp, ChevronRight,
  RefreshCw, Zap, Award, Medal, Gem, Sparkles, Rocket,
  LifeBuoy, HelpCircle, FileText, ClipboardList, BookOpen,
  Utensils, Apple, Salad, Coffee, Pizza, Leaf, Bike,
  Car, Home, LogOut, User, UserPlus, UserMinus, UserCheck,
  AlertCircle, CheckCheck, Timer, Activity, Gauge, Scale,
  Ruler, Footprints, Brain, HeartPulse, Pill, Syringe,
  CircleDot, CircleCheck, CircleX, CircleAlert, CirclePlus,
  SquareCheck, Square, Inbox, MailOpen, Archive,
  CalendarDays, CalendarClock, LayoutDashboard, List,
  HandCoins, Banknote, Receipt, Percent, Tag, Tags,
  Image, Camera, Video, Mic, Volume2, Play, Pause,
  MoreHorizontal, MoreVertical, Grip, Move, Copy, Clipboard,
  Link2, Share2, Bookmark, BookmarkCheck, Flag,
  Sun, Moon, Monitor, Laptop, Smartphone,
  Wifi, WifiOff, Globe, Navigation, Compass, Route,
  Layers, Grid3x3, LayoutGrid, Columns, Rows,
  Box, Boxes, Database, Server, Cloud,
  Wrench, Hammer, PenTool, Paintbrush,
  CircleDashed, Loader2, Save, Handshake
};
