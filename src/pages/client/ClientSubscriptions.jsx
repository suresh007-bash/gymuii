import { useState } from 'react';
import { Icon, CreditCard, Smartphone, Building2, CheckCircle2, Sparkles, Rocket, Banknote, Package, Target } from '../../components/Icons';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const PLANS = [
  {
    id: 'sub1',
    name: 'Starter',
    price: 999,
    period: 'month',
    meals: 5,
    desc: 'Begin your fitness journey',
    features: [
      'Calories Tracking',
      'Protein Tracking',
      'Healthy Meal Plans',
      'Daily Nutrition Goals',
      'Basic Support',
      'Diet Recommendations'
    ]
  },
  {
    id: 'sub2',
    name: 'Pro',
    price: 1999,
    period: 'month',
    meals: 15,
    desc: 'Most popular fitness plan',
    popular: true,
    features: [
      'Advanced Calories Tracking',
      'Advanced Protein Tracking',
      'Personalized Meal Plans',
      'Trainer Diet Plans',
      'Meal Scheduling',
      'Priority Support'
    ]
  },
  {
    id: 'sub3',
    name: 'Elite',
    price: 3499,
    period: 'month',
    meals: 'Unlimited',
    desc: 'Premium nutrition experience',
    features: [
      'Unlimited Nutrition Tracking',
      'AI Meal Suggestions',
      'Custom Diet Plans',
      'Personal Nutritionist',
      'Premium Meal Scheduling',
      '24/7 Priority Support'
    ]
  }
];

export default function ClientSubscriptions() {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const [activePlan, setActivePlan] = useState(() => user?.subscription || null);
  const [showPayment, setShowPayment] = useState(null);
  const [payMethod, setPayMethod] = useState('UPI');

  const subscribe = (plan) => {
    updateUser(user.id, { 
      subscription: plan.id, 
      subscriptionName: plan.name, 
      subscriptionDate: new Date().toISOString(), 
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
    });
    setActivePlan(plan.id);
    setShowPayment(null);
    showToast(`Subscribed to ${plan.name} plan!`);
  };

  const cancel = () => {
    updateUser(user.id, { subscription: null, subscriptionName: null });
    setActivePlan(null);
    showToast('Subscription cancelled', 'warning');
  };

  const currentPlan = PLANS.find(p => p.id === activePlan);

  return (
    <DashboardLayout title="Subscriptions">
      {/* Payment Modal */}
      {showPayment && (
        <div className="modal-overlay" onClick={() => setShowPayment(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Icon icon={CreditCard} size={16} style={{marginRight:6}} /> Subscribe to {showPayment.name}
              </h3>
              <button className="modal-close" onClick={() => setShowPayment(null)}></button>
            </div>
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <div style={{ fontSize: 'var(--fs-heading)', fontWeight: 900, color: 'var(--accent-orange)' }}>
                ₹{showPayment.price}<span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>/{showPayment.period}</span>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>PAYMENT METHOD</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['UPI', 'Card', 'Net Banking'].map(p => (
                  <button 
                    key={p} 
                    className={`btn btn-sm ${payMethod === p ? 'btn-primary' : 'btn-outline'}`} 
                    onClick={() => setPayMethod(p)}
                  >
                    {p === 'UPI' ? <Smartphone size={12} style={{marginRight:4}} /> : p === 'Card' ? <CreditCard size={12} style={{marginRight:4}} /> : <Building2 size={12} style={{marginRight:4}} />} {p}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-success btn-lg" style={{ width: '100%' }} onClick={() => subscribe(showPayment)}>
              <Icon icon={CheckCircle2} size={16} style={{marginRight:6}} /> Pay ₹{showPayment.price} & Subscribe
            </button>
          </div>
        </div>
      )}

      {/* Active Subscription */}
      {currentPlan && (
        <div className="card" style={{ marginBottom: 20, border: '2px solid var(--accent-green)', background: 'rgba(34,197,94,0.04)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{display:'flex',alignItems:'center',gap:6}}>
              <CheckCircle2 size={16} color="#22c55e" /> Active Subscription
            </h3>
            <span className="badge badge-green">ACTIVE</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 'var(--fs-body)', fontWeight: 900 }}>{currentPlan.name} Plan</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{currentPlan.desc}</div>
              
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                {currentPlan.meals === 'Unlimited' ? 'Unlimited Meals' : `${currentPlan.meals} meals/week`}
              </div>
              
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                Renews: {new Date(user?.subscriptionExpiry || Date.now()).toLocaleDateString()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--fs-subheading)', fontWeight: 900, color: 'var(--accent-green)' }}>
                ₹{currentPlan.price}<span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>/mo</span>
              </div>
              <button className="btn btn-outline btn-sm" style={{ color: 'var(--accent-red)', marginTop: 8 }} onClick={cancel}>Cancel Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 20 }}>
        {PLANS.map(plan => (
          <div key={plan.id} className="card" style={{ position: 'relative', border: plan.popular ? '2px solid var(--accent-orange)' : undefined }}>
            {plan.popular && (
              <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--gradient-primary)', color: '#fff', padding: '3px 16px', borderRadius: 20, fontSize: 'var(--fs-xs)', fontWeight: 800 }}>
                MOST POPULAR
              </div>
            )}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 'var(--fs-body)', fontWeight: 900, marginBottom: 4 }} className="text-truncate">{plan.name}</h3>
              <div>
                <span style={{ fontSize: 'var(--fs-heading)', fontWeight: 900, color: 'var(--accent-orange)' }}>₹{plan.price}</span>
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>/{plan.period}</span>
              </div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                {plan.meals === 'Unlimited' ? 'Unlimited Meals' : `${plan.meals} meals/week`}
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
              {plan.features.map((f, i) => (
                <li key={i} style={{ fontSize: 'var(--fs-xs)', padding: '5px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={13} color="#22c55e" /> {f}
                </li>
              ))}
            </ul>
            {activePlan === plan.id ? (
              <button className="btn btn-success btn-lg" style={{ width: '100%', opacity: 0.7 }} disabled>Current Plan</button>
            ) : (
              <button className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} btn-lg`} style={{ width: '100%' }} onClick={() => setShowPayment(plan)}>Subscribe</button>
            )}
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h3 className="card-title" style={{display:'flex',alignItems:'center',gap:6}}>
            <Sparkles size={16} color="#f97316" /> Membership Benefits
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 12 }}>
          {[
            { IconComp: Rocket, label: 'Priority Delivery', desc: 'Get your meals first' }, 
            { IconComp: Banknote, label: '10% Discount', desc: 'On all orders' }, 
            { IconComp: Package, label: 'Free Packs', desc: 'Monthly nutrient pack' }, 
            { IconComp: Target, label: 'AI Suggestions', desc: 'Personalized meals' }
          ].map((b, i) => (
            <div key={i} style={{ textAlign: 'center', padding: 16, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
              <div style={{ fontSize: 'var(--fs-subheading)', marginBottom: 6 }}>
                <Icon icon={b.IconComp} size={28} color="#f97316" />
              </div>
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-xs)' }}>{b.label}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}