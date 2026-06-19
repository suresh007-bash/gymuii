import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { MENU_ITEMS } from '../../data/mockMenu';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';

export default function DietPlans() {
  const { user, getTrainerClients } = useAuth();
  const { saveDietPlan, getDietPlansByTrainer } = useOrders();
  const { showToast } = useNotifications();
  const clients = getTrainerClients(user?.id);
  const savedPlans = getDietPlansByTrainer(user?.id);
  const [step, setStep] = useState(1);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [planName, setPlanName] = useState('');

  const toggleClient = (id) => setSelectedClients(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleItem = (id) => setSelectedItems(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const send = () => {
    saveDietPlan({ trainerId: user.id, clientIds: selectedClients, items: selectedItems, name: planName || 'Custom Diet Plan' });
    showToast(`Diet plan "${planName || 'Custom'}" sent to ${selectedClients.length} member(s)! 🥗`);
    setStep(1); setSelectedClients([]); setSelectedItems([]); setPlanName('');
  };

  return (
    <DashboardLayout title="Diet Plans">
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title">🥗 Create Diet Plan</h3><span className="badge badge-blue">Step {step} of 3</span></div>
        {step === 1 && (<div>
          <p style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>Select members to assign this plan:</p>
          {clients.length === 0 ? <p style={{ color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>No clients assigned to you yet</p> :
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{clients.map(c => (
            <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: selectedClients.includes(c.id) ? 'rgba(249,115,22,0.08)' : 'var(--bg-tertiary)', borderRadius: 10, border: `1px solid ${selectedClients.includes(c.id) ? 'var(--accent-orange)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
              <input type="checkbox" checked={selectedClients.includes(c.id)} onChange={() => toggleClient(c.id)} />
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>{c.avatar}</div>
              <div><span style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</span><br/><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.goal} • {c.diet}</span></div>
            </label>
          ))}</div>}
          <button className="btn btn-primary" style={{ marginTop: 16 }} disabled={selectedClients.length === 0} onClick={() => setStep(2)}>Next: Select Foods →</button>
        </div>)}
        {step === 2 && (<div>
          <p style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>Select food items for the plan:</p>
          <div className="food-grid">{MENU_ITEMS.filter(m => m.available).map(item => (
            <div key={item.id} onClick={() => toggleItem(item.id)} style={{ padding: 14, background: selectedItems.includes(item.id) ? 'rgba(249,115,22,0.08)' : 'var(--bg-tertiary)', borderRadius: 12, border: `1px solid ${selectedItems.includes(item.id) ? 'var(--accent-orange)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{selectedItems.includes(item.id) ? '✅ ' : ''}{item.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔥 {item.calories} kcal • 💪 {item.protein}g • ₹{item.price}</div>
            </div>
          ))}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}><button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button><button className="btn btn-primary" disabled={selectedItems.length === 0} onClick={() => setStep(3)}>Review →</button></div>
        </div>)}
        {step === 3 && (<div>
          <p style={{ marginBottom: 12, fontWeight: 700 }}>📋 Review & Confirm</p>
          <div style={{ marginBottom: 12 }}><label className="form-label">Plan Name</label><input className="form-input" value={planName} onChange={e => setPlanName(e.target.value)} placeholder="e.g., Weight Loss Week 1" /></div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sending to: <strong>{selectedClients.length}</strong> member(s)</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Items: <strong>{selectedItems.length}</strong> food item(s)</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>{selectedItems.map(id => { const m = MENU_ITEMS.find(x => x.id === id); return m ? <span key={id} className="badge badge-green">{m.name}</span> : null; })}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}><button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button><button className="btn btn-success" onClick={send}>✅ Confirm & Send</button></div>
        </div>)}
      </div>

      {/* Saved Plans */}
      {savedPlans.length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">📁 Saved Diet Plans ({savedPlans.length})</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {savedPlans.map(plan => (
              <div key={plan.id} style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700 }}>📋 {plan.name}</span>
                  <span className="badge badge-green">{plan.status}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  👥 {plan.clientIds?.length || 0} client(s) • 🍽️ {plan.items?.length || 0} items • 📅 {new Date(plan.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
