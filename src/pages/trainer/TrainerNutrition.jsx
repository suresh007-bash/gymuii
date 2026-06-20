import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { Icon, Flame, Beef, Wheat, Droplets } from '../../components/Icons';

export default function TrainerNutrition() {
  const { user } = useAuth();
  const { getTodayNutrition } = useOrders();
  const nutrition = getTodayNutrition(user?.id);
  const targets = { calories: user?.targetCalories || 2500, protein: user?.targetProtein || 180, carbs: user?.targetCarbs || 280, fat: user?.targetFat || 80 };

  const NutrientBar = ({ label, current, target, color, icon }) => {
    const pct = Math.min((current / target) * 100, 100);
    return (
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>{icon} {label}</span>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800 }}>{current} / {target}{label === 'Calories' ? ' kcal' : 'g'}</span>
        </div>
        <div style={{ height: 10, background: 'var(--bg-tertiary)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 10, transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{Math.round(pct)}% of daily target</div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Nutrition Tracker">
      <NutrientBar label="Calories" current={nutrition.calories} target={targets.calories} color="#f97316" icon={<Icon icon={Flame} size={16} color="#f97316" />} />
      <NutrientBar label="Protein" current={nutrition.protein} target={targets.protein} color="#22c55e" icon={<Icon icon={Beef} size={16} color="#22c55e" />} />
      <NutrientBar label="Carbs" current={nutrition.carbs} target={targets.carbs} color="#3b82f6" icon={<Icon icon={Wheat} size={16} color="#3b82f6" />} />
      <NutrientBar label="Fat" current={nutrition.fat} target={targets.fat} color="#eab308" icon={<Icon icon={Droplets} size={16} color="#eab308" />} />
    </DashboardLayout>
  );
}
