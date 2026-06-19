import DashboardLayout from '../../components/DashboardLayout';

const PLANS = [
  { id: 1, name: 'Basic Monthly', price: 2999, duration: '30 days', meals: '2 meals/day', desc: 'Breakfast + Lunch • Standard nutrition plan' },
  { id: 2, name: 'Premium Monthly', price: 4999, duration: '30 days', meals: '3 meals/day', desc: 'Breakfast + Lunch + Dinner • High protein plan' },
  { id: 3, name: 'Athlete Weekly', price: 1999, duration: '7 days', meals: '3 meals/day', desc: 'Custom macro-based meals for intense training' },
];

export default function TrainerSubscriptions() {
  return (
    <DashboardLayout title="Subscriptions">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {PLANS.map(plan => (
          <div key={plan.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ background: 'var(--gradient-primary)', padding: '20px 16px', color: '#fff' }}>
              <div style={{ fontWeight: 900, fontSize: 18, fontFamily: 'Outfit' }}>{plan.name}</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>{plan.duration} • {plan.meals}</div>
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>{plan.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 22, color: 'var(--accent-green)' }}>₹{plan.price}</span>
                <button className="btn btn-primary">Subscribe</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
