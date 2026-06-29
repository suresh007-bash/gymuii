import DashboardLayout from '../../components/DashboardLayout';
import { Target, Dumbbell } from '../../components/Icons';
import StatIcon from '../../components/StatIcon';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';

export default function OwnerAnalytics() {
  const { user, getOwnerClients, getOwnerTrainers } = useAuth();
  const { orders, getStats } = useOrders();
  const stats = getStats();
  const members = getOwnerClients(user?.id);
  const trainers = getOwnerTrainers(user?.id);
  const memberOrders = orders.filter(o => members.some(m => m.id === o.customerId));
  const memberRevenue = memberOrders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + (o.total || 0), 0);

  return (
    <DashboardLayout title="Analytics">
      <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #22c55e, #4ade80)' }}><div className="hero-tag">ANALYTICS</div><div className="hero-title">Business Insights</div><div className="hero-subtitle">{user?.gymName}</div></div>
      <div className="stats-grid">
        {[{ icon: <StatIcon name="users" />, val: members.length, label: 'Members', color: '#3b82f6' }, { icon: <StatIcon name="protein" />, val: trainers.length, label: 'Trainers', color: '#22c55e' }, { icon: <StatIcon name="orders" />, val: memberOrders.length, label: 'Member Orders', color: '#f97316' }, { icon: <StatIcon name="revenue" />, val: `₹${memberRevenue.toLocaleString()}`, label: 'Gym Revenue', color: '#8b5cf6' }].map((s, i) => (
          <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-value" style={{ color: s.color }}>{s.val}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 20 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title"><Target size={16} style={{marginRight:4}} /> Goal Distribution</h3></div>
          {['Weight Loss', 'Muscle Gain', 'Maintenance'].map(goal => {
            const count = members.filter(m => m.goal === goal).length;
            return (<div key={goal} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 'clamp(12px, 3vw, 16px)', minWidth: 100 }}>{goal}</span>
              <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${members.length ? (count / members.length) * 100 : 0}%`, height: '100%', background: goal === 'Weight Loss' ? '#f97316' : goal === 'Muscle Gain' ? '#22c55e' : '#3b82f6', borderRadius: 4 }} /></div>
              <span style={{ fontWeight: 800, fontSize: 'clamp(13px, 3vw, 18px)' }}>{count}</span>
            </div>);
          })}
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title"><Dumbbell size={16} style={{marginRight:4}} /> Trainer Performance</h3></div>
          {trainers.length === 0 ? <p style={{ color: 'var(--text-muted)', padding: 12 }}>No trainers</p> :
          trainers.map(t => {
            const tClients = members.filter(m => m.trainerId === t.id).length;
            return (<div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(12px, 3vw, 15px)', fontWeight: 800, color: '#fff' }}>{t.avatar}</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 'clamp(12px, 3vw, 17px)' }}>{t.name}</div><div style={{ fontSize: 'clamp(12px, 3vw, 15px)', color: 'var(--text-muted)' }}>{t.specialization}</div></div>
              <span className="badge badge-green">{tClients} clients</span>
            </div>);
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
