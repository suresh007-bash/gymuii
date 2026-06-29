import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';

export default function ClientReviews() {
  const { user } = useAuth();
  const { getOrdersByUser } = useOrders();
  const { showToast } = useNotifications();
  const delivered = getOrdersByUser(user?.id).filter(o => o.status === 'delivered');
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('synnoviq_reviews_' + user?.id);
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const saveReview = (orderId) => {
    const newReview = { id: 'rev' + Date.now(), orderId, rating, comment, date: new Date().toISOString() };
    const updated = [...reviews, newReview];
    setReviews(updated);
    localStorage.setItem('synnoviq_reviews_' + user?.id, JSON.stringify(updated));
    showToast('Review submitted! ');
    setShowForm(null); setRating(5); setComment('');
  };

  const reviewedOrderIds = reviews.map(r => r.orderId);
  const unreviewed = delivered.filter(o => !reviewedOrderIds.includes(o.id));

  return (
    <DashboardLayout title="Reviews & Ratings">
      {/* Review Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header"><h3 className="modal-title"> Rate Order #{showForm.id}</h3><button className="modal-close" onClick={() => setShowForm(null)}></button></div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 'calc(16px + 0.5vw)', color: 'var(--text-muted)', marginBottom: 8 }}>{showForm.items.map(i => i.name).join(', ')}</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRating(s)} style={{ fontSize: 'calc(36px + 0.5vw)', background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', transform: s <= rating ? 'scale(1.2)' : 'scale(1)', filter: s <= rating ? 'none' : 'grayscale(1) opacity(0.3)' }}></button>
                ))}
              </div>
              <div style={{ fontSize: 'calc(18px + 0.5vw)', fontWeight: 700, marginTop: 4, color: rating >= 4 ? 'var(--accent-green)' : rating >= 3 ? 'var(--accent-orange)' : 'var(--accent-red)' }}>{['', 'Poor', 'Below Average', 'Good', 'Very Good', 'Excellent'][rating]}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Your Review</label>
              <textarea className="form-input" style={{ minHeight: 80 }} value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." />
            </div>
            <button className="btn btn-success btn-lg" style={{ width: '100%' }} onClick={() => saveReview(showForm.id)}>Submit Review</button>
          </div>
        </div>
      )}

      {/* Pending Reviews */}
      {unreviewed.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h3 className="card-title"> Rate Your Orders ({unreviewed.length})</h3></div>
          {unreviewed.map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'calc(17px + 0.5vw)' }}>#{o.id} — {o.items.map(i => i.name).join(', ')}</div>
                <div style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)' }}>{new Date(o.orderTime).toLocaleDateString()} • ₹{o.total}</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowForm(o)}> Rate</button>
            </div>
          ))}
        </div>
      )}

      {/* Past Reviews */}
      <div className="card">
        <div className="card-header"><h3 className="card-title"> My Reviews ({reviews.length})</h3></div>
        {reviews.length === 0 ? <p style={{ color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>No reviews yet</p> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.sort((a, b) => new Date(b.date) - new Date(a.date)).map(r => (
            <div key={r.id} style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 'calc(17px + 0.5vw)' }}>Order #{r.orderId}</span>
                <span style={{ color: '#f97316' }}>{''.repeat(r.rating)}</span>
              </div>
              <p style={{ fontSize: 'calc(17px + 0.5vw)', color: 'var(--text-secondary)', marginBottom: 4 }}>{r.comment}</p>
              <span style={{ fontSize: 'calc(15px + 0.5vw)', color: 'var(--text-muted)' }}>{new Date(r.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>}
      </div>
    </DashboardLayout>
  );
}
