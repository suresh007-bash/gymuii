import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function ClientSupport() {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [tab, setTab] = useState('help');
  const [tickets, setTickets] = useState(() => JSON.parse(localStorage.getItem('synnoviq_tickets_' + user?.id) || '[]'));
  const [form, setForm] = useState({ subject: '', category: 'Order Issue', message: '' });

  const submitTicket = () => {
    if (!form.subject || !form.message) { showToast('Fill all fields', 'error'); return; }
    const ticket = { id: 'TK' + Date.now(), ...form, status: 'open', date: new Date().toISOString() };
    const updated = [ticket, ...tickets];
    setTickets(updated); localStorage.setItem('synnoviq_tickets_' + user?.id, JSON.stringify(updated));
    showToast('Support ticket created! We\'ll respond within 24hrs 📨');
    setForm({ subject: '', category: 'Order Issue', message: '' });
  };

  const FAQs = [
    { q: 'How do I track my order?', a: 'Go to My Orders page. Active orders show real-time progress tracking with stages.' },
    { q: 'Can I cancel my order?', a: 'Yes! You can cancel pending orders from the My Orders page. Once preparation starts, cancellation may not be possible.' },
    { q: 'How do nutrient packs work?', a: 'Nutrient packs are curated meal sets by trainers/kitchen. Browse them in the Menu → Nutrient Packs tab.' },
    { q: 'How to schedule meals?', a: 'Use the Schedule button on the Browse Menu page to select dates, timing (morning/noon/evening), and food items.' },
    { q: 'What payment methods are accepted?', a: 'We accept COD (Cash on Delivery), UPI, and Card payments.' },
    { q: 'How do I set nutrition targets?', a: 'Go to Dashboard → Set Target button, or your trainer/owner can assign targets for you.' },
  ];

  const [openFAQ, setOpenFAQ] = useState(null);

  return (
    <DashboardLayout title="Help & Support">
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === 'help' ? 'active' : ''}`} onClick={() => setTab('help')}>❓ FAQs</button>
        <button className={`tab ${tab === 'ticket' ? 'active' : ''}`} onClick={() => setTab('ticket')}>🎫 New Ticket</button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>📜 My Tickets ({tickets.length})</button>
      </div>

      {tab === 'help' && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">❓ Frequently Asked Questions</h3></div>
          {FAQs.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <button onClick={() => setOpenFAQ(openFAQ === i ? null : i)} style={{ width: '100%', padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'left' }}>
                {faq.q} <span style={{ fontSize: 18, transition: 'transform 0.3s', transform: openFAQ === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {openFAQ === i && <p style={{ padding: '0 0 14px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{faq.a}</p>}
            </div>
          ))}
          <div style={{ marginTop: 16, padding: 16, background: 'rgba(249,115,22,0.06)', borderRadius: 12, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Didn't find your answer?</p>
            <button className="btn btn-primary btn-sm" onClick={() => setTab('ticket')}>🎫 Create Support Ticket</button>
          </div>
        </div>
      )}

      {tab === 'ticket' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <div className="card-header"><h3 className="card-title">🎫 Create Support Ticket</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {['Order Issue', 'Payment', 'Delivery', 'Menu', 'Account', 'Subscription', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="form-label">Subject</label><input className="form-input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Brief description of your issue" /></div>
            <div><label className="form-label">Message</label><textarea className="form-input" style={{ minHeight: 100 }} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Describe your issue in detail..." /></div>
          </div>
          <button className="btn btn-success" style={{ marginTop: 16 }} onClick={submitTicket}>📨 Submit Ticket</button>
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">📜 My Tickets</h3></div>
          {tickets.length === 0 ? <p style={{ color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>No support tickets</p> :
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tickets.map(t => (
              <div key={t.id} style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{t.subject}</span>
                  <span className={`badge ${t.status === 'open' ? 'badge-orange' : 'badge-green'}`}>{t.status.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.category} • {new Date(t.date).toLocaleDateString()}</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{t.message}</p>
              </div>
            ))}
          </div>}
        </div>
      )}

      {/* Quick Contact */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3 className="card-title">📞 Quick Contact</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[{ icon: '📧', label: 'Email', val: 'support@fitbites.com' }, { icon: '📱', label: 'Phone', val: '+91 98765 43210' }, { icon: '💬', label: 'Chat', val: 'Available 9AM-9PM' }].map((c, i) => (
            <div key={i} style={{ textAlign: 'center', padding: 16, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{c.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.val}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
