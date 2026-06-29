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
    showToast('Support ticket created! We\'ll respond within 24hrs ');
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
        <button className={`tab ${tab === 'help' ? 'active' : ''}`} onClick={() => setTab('help')}> FAQs</button>
      </div>

      {tab === 'help' && (
        <div className="card">
          <div className="card-header"><h3 className="card-title"> Frequently Asked Questions</h3></div>
          {FAQs.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <button onClick={() => setOpenFAQ(openFAQ === i ? null : i)} style={{ width: '100%', padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'calc(18px + 0.5vw)', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'left' }}>
                {faq.q} <span style={{ fontSize: 'calc(22px + 0.5vw)', transition: 'transform 0.3s', transform: openFAQ === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {openFAQ === i && <p style={{ padding: '0 0 14px', fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{faq.a}</p>}
            </div>
          ))}
          <div style={{ marginTop: 16, padding: 16, background: 'rgba(249,115,22,0.06)', borderRadius: 12, textAlign: 'center' }}>
            <p style={{ fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-secondary)', marginBottom: 8 }}>Didn't find your answer?</p>
            <button className="btn btn-primary btn-sm" onClick={() => setTab('ticket')}> Create Support Ticket</button>
          </div>
        </div>
      )}


      {/* Quick Contact */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3 className="card-title"> Quick Contact</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 12 }}>
          {[{ icon: '', label: 'Email', val: 'support@fitbites.com' }, { icon: '', label: 'Phone', val: '+91 98765 43210' }, { icon: '', label: 'Chat', val: 'Available 9AM-9PM' }].map((c, i) => (
            <div key={i} style={{ textAlign: 'center', padding: 16, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
              <div style={{ fontSize: 'calc(28px + 0.5vw)', marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 'calc(17px + 0.5vw)' }}>{c.label}</div>
              <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)' }}>{c.val}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
