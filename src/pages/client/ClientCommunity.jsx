import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const COMMUNITY_POSTS = [
  { id: 1, author: 'Coach Marcus', avatar: 'CM', role: 'Trainer', time: '2 hours ago', content: '💡 Tip: Having protein within 30 mins of your workout boosts muscle recovery by 40%. Try our Grilled Chicken Bowl post-workout!', likes: 24, comments: 8 },
  { id: 2, author: 'FitBites Team', avatar: 'FB', role: 'Official', time: '5 hours ago', content: '🎉 New menu item alert! Introducing the Avocado Protein Toast — 380 kcal, 28g protein. Available now!', likes: 42, comments: 15 },
  { id: 3, author: 'Priya Sharma', avatar: 'PS', role: 'Member', time: '1 day ago', content: 'Just completed my 30-day nutrition challenge! Lost 3kg while hitting my protein targets daily. FitBites meal scheduling made it so easy 🔥', likes: 56, comments: 21 },
  { id: 4, author: 'Coach Deepa', avatar: 'CD', role: 'Trainer', time: '2 days ago', content: '🥗 Weekly meal prep tip: Order your nutrient packs for the entire week on Sunday. Schedule morning, noon, and evening — automation is key!', likes: 31, comments: 12 },
  { id: 5, author: 'Ravi Kumar', avatar: 'RK', role: 'Member', time: '3 days ago', content: 'The Quinoa Power Bowl is seriously underrated. 450 kcal, 35g protein, and it tastes amazing! Highly recommend for the muscle gain crew 💪', likes: 18, comments: 6 },
];

const TIPS = [
  '🥗 Eat protein with every meal for sustained energy',
  '💧 Drink 3L water daily for optimal metabolism',
  '🌙 Avoid heavy carbs after 8 PM',
  '🔥 Track calories daily — what gets measured gets managed',
  '💪 1g protein per kg body weight for muscle maintenance',
  '🥑 Healthy fats are essential — don\'t skip them!',
];

export default function ClientCommunity() {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [tab, setTab] = useState('feed');
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState(COMMUNITY_POSTS);
  const [likedPosts, setLikedPosts] = useState([]);

  const addPost = () => {
    if (!newPost.trim()) return;
    setPosts([{ id: Date.now(), author: user?.name, avatar: user?.avatar, role: 'Member', time: 'Just now', content: newPost, likes: 0, comments: 0 }, ...posts]);
    setNewPost('');
    showToast('Post published! 📝');
  };

  const toggleLike = (id) => {
    if (likedPosts.includes(id)) {
      setLikedPosts(l => l.filter(x => x !== id));
      setPosts(p => p.map(x => x.id === id ? { ...x, likes: x.likes - 1 } : x));
    } else {
      setLikedPosts(l => [...l, id]);
      setPosts(p => p.map(x => x.id === id ? { ...x, likes: x.likes + 1 } : x));
    }
  };

  return (
    <DashboardLayout title="Community">
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === 'feed' ? 'active' : ''}`} onClick={() => setTab('feed')}>📱 Feed</button>
        <button className={`tab ${tab === 'tips' ? 'active' : ''}`} onClick={() => setTab('tips')}>💡 Nutrition Tips</button>
        <button className={`tab ${tab === 'trainers' ? 'active' : ''}`} onClick={() => setTab('trainers')}>💪 Trainer Picks</button>
      </div>

      {tab === 'feed' && (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {/* New Post */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{user?.avatar}</div>
              <div style={{ flex: 1 }}>
                <textarea className="form-input" style={{ minHeight: 60, resize: 'none' }} value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Share a tip, achievement, or meal recommendation..." />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={addPost} disabled={!newPost.trim()}>📝 Post</button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed */}
          {posts.map(post => (
            <div key={post.id} className="card" style={{ marginBottom: 12, animation: 'fadeInUp 0.3s ease' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: post.role === 'Official' ? 'linear-gradient(135deg, #f97316, #22c55e)' : post.role === 'Trainer' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{post.avatar}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{post.author} <span className={`badge ${post.role === 'Official' ? 'badge-orange' : post.role === 'Trainer' ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: 9 }}>{post.role}</span></div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{post.time}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{post.content}</p>
              <div style={{ display: 'flex', gap: 16, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <button onClick={() => toggleLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: likedPosts.includes(post.id) ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                  {likedPosts.includes(post.id) ? '❤️' : '🤍'} {post.likes}
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>💬 {post.comments}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'tips' && (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {TIPS.map((tip, i) => (
            <div key={i} className="card" style={{ marginBottom: 10, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💡</div>
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>{tip}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'trainers' && (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="card" style={{ padding: 20, textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💪</div>
            <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Trainer Recommendations</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Your trainer's top meal picks will appear here. Check your Diet Plans for personalized recommendations!</p>
            <a href="/client/menu" className="btn btn-primary" style={{ marginTop: 12 }}>View Diet Plans →</a>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
