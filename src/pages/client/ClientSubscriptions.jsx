import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';

const PLANS = [
  { id: 'sub1', name: 'Starter', price: 999, period: 'month', meals: 5, desc: '5 meals/week, basic macro tracking', features: ['5 meals per week', 'Standard delivery', 'Basic nutrition tracking'] },
  { id: 'sub2', name: 'Pro', price: 1999, period: 'month', meals: 15, desc: '15 meals/week, full tracking + packs', features: ['15 meals per week', 'Priority delivery', 'Full macro tracking', 'Nutrient packs access', 'Meal scheduling'], popular: true },
  { id: 'sub3', name: 'Elite', price: 3499, period: 'month', meals: 30, desc: 'Unlimited meals, AI suggestions, personal nutritionist', features: ['Unlimited meals', 'Express 15-min delivery', 'AI meal suggestions', 'Personal nutritionist', 'Custom packs', 'Priority support'] },
];

export default function ClientSubscriptions() {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const [activePlan, setActivePlan] = useState(() => user?.subscription || null);
  const [showPayment, setShowPayment] = useState(null);
  const [payMethod, setPayMethod] = useState('UPI');

  const subscribe = (plan) => {
    updateUser(user.id, { subscription: plan.id, subscriptionName: plan.name, subscriptionDate: new Date().toISOString(), subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() });
    setActivePlan(plan.id);
    setShowPayment(null);
    showToast(`🎉 Subscribed to ${plan.name} plan!`);
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
            <div className="modal-header"><h3 className="modal-title">💳 Subscribe to {showPayment.name}</h3><button className="modal-close" onClick={() => setShowPayment(null)}>✕</button></div>
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--accent-orange)' }}>₹{showPayment.price}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/{showPayment.period}</span></div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>PAYMENT METHOD</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['UPI', 'Card', 'Net Banking'].map(p => (<button key={p} className={`btn btn-sm ${payMethod === p ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPayMethod(p)}>{p === 'UPI' ? '📱' : p === 'Card' ? '💳' : '🏦'} {p}</button>))}
              </div>
            </div>
            <button className="btn btn-success btn-lg" style={{ width: '100%' }} onClick={() => subscribe(showPayment)}>✅ Pay ₹{showPayment.price} & Subscribe</button>
          </div>
        </div>
      )}

      {/* Active Subscription */}
      {currentPlan && (
        <div className="card" style={{ marginBottom: 20, border: '2px solid var(--accent-green)', background: 'rgba(34,197,94,0.04)' }}>
          <div className="card-header"><h3 className="card-title">✅ Active Subscription</h3><span className="badge badge-green">ACTIVE</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 900 }}>{currentPlan.name} Plan</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{currentPlan.desc}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Renews: {new Date(user?.subscriptionExpiry || Date.now()).toLocaleDateString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 900, color: 'var(--accent-green)' }}>₹{currentPlan.price}<span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/mo</span></div>
              <button className="btn btn-outline btn-sm" style={{ color: 'var(--accent-red)', marginTop: 8 }} onClick={cancel}>Cancel Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 20 }}>
        {PLANS.map(plan => (
          <div key={plan.id} className="card" style={{ position: 'relative', border: plan.popular ? '2px solid var(--accent-orange)' : undefined }}>
            {plan.popular && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--gradient-primary)', color: '#fff', padding: '3px 16px', borderRadius: 20, fontSize: 10, fontWeight: 800 }}>MOST POPULAR</div>}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{plan.name}</h3>
              <div><span style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent-orange)' }}>₹{plan.price}</span><span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/{plan.period}</span></div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{plan.meals} meals/week</div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
              {plan.features.map((f, i) => (<li key={i} style={{ fontSize: 13, padding: '5px 0', display: 'flex', alignItems: 'center', gap: 8 }}>✅ {f}</li>))}
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
        <div className="card-header"><h3 className="card-title">🎁 Membership Benefits</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 12 }}>
          {[{ icon: '🚀', label: 'Priority Delivery', desc: 'Get your meals first' }, { icon: '💰', label: '10% Discount', desc: 'On all orders' }, { icon: '📦', label: 'Free Packs', desc: 'Monthly nutrient pack' }, { icon: '🎯', label: 'AI Suggestions', desc: 'Personalized meals' }].map((b, i) => (
            <div key={i} style={{ textAlign: 'center', padding: 16, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{b.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{b.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
