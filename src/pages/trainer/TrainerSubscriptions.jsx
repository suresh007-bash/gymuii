import DashboardLayout from '../../components/DashboardLayout';

const PLANS = [
  { id: 1, name: 'Basic Monthly', price: 2999, duration: '30 days', meals: '2 meals/day', desc: 'Breakfast + Lunch • Standard nutrition plan' },
  { id: 2, name: 'Premium Monthly', price: 4999, duration: '30 days', meals: '3 meals/day', desc: 'Breakfast + Lunch + Dinner • High protein plan' },
  { id: 3, name: 'Athlete Weekly', price: 1999, duration: '7 days', meals: '3 meals/day', desc: 'Custom macro-based meals for intense training' },
  { id: 4, name: 'Athlete Monthly', price: 7999, duration: '30 days', meals: '3 meals/day', desc: 'Custom macro-based meals for intense training on a monthly basis' },
  { id: 5, name: 'Keto Weekly', price: 1899, duration: '7 days', meals: '3 meals/day', desc: 'Strict ketogenic macro planning and daily delivery' },
  { id: 6, name: 'Weight Loss Monthly', price: 4499, duration: '30 days', meals: '2 meals/day', desc: 'Caloric deficit nutrition plan with high satiety foods' },
];

export default function TrainerSubscriptions() {
  return (
    <DashboardLayout title="Subscriptions">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 20 }}>
        {PLANS.map(plan => (
          <div key={plan.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ background: 'var(--gradient-primary)', padding: '20px 16px', color: '#fff' }}>
              <div style={{ fontWeight: 900, fontSize: 'calc(22px + 0.5vw)', fontFamily: 'Outfit' }}>{plan.name}</div>
              <div style={{ fontSize: 'calc(16px + 0.5vw)', opacity: 0.85 }}>{plan.duration} • {plan.meals}</div>
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>{plan.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'calc(26px + 0.5vw)', color: 'var(--accent-green)' }}>₹{plan.price}</span>
                <button className="btn btn-primary">Subscribe</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
