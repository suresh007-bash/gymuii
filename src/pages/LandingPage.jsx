import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MENU_ITEMS, NUTRIENT_PACKS, CATEGORIES } from '../data/mockMenu';

const NAV_LINKS = [{ label: 'Menu', href: '#menu' }, { label: 'Pricing', href: '#pricing' }, { label: 'For Gyms', href: '#gyms' }];

const STATS = [{ val: '500+', label: 'Meals Delivered' }, { val: '30 min', label: 'Avg Delivery' }, { val: '4.8 ⭐', label: 'User Rating' }, { val: '50+', label: 'Gym Partners' }];

const FEATURES = [
  { icon: '🥗', title: 'Macro-Tracked Meals', desc: 'Every meal comes with precise calorie, protein, carb & fat data' },
  { icon: '🏋️', title: 'Gym-Personalized', desc: 'Your trainer sets nutrition targets, we deliver the matching meals' },
  { icon: '📅', title: 'Meal Scheduling', desc: 'Schedule breakfast, lunch & dinner for the entire week' },
  { icon: '🚀', title: '30-Min Delivery', desc: 'Fresh meals delivered to your gym or home in 30 minutes' },
  { icon: '📦', title: 'Nutrient Packs', desc: 'Curated meal packs by trainers, gym owners & nutritionists' },
  { icon: '📊', title: 'Progress Tracking', desc: 'Track your nutrition goals with beautiful analytics' },
];

const TESTIMONIALS = [
  { name: 'Ravi Kumar', role: 'Gym Member', text: 'FitBites changed my diet game. I hit my protein goals daily without cooking!', rating: 5 },
  { name: 'Priya Sharma', role: 'Fitness Enthusiast', text: 'The meal scheduling is a lifesaver. Set it once and healthy food arrives every day.', rating: 5 },
  { name: 'Coach Marcus', role: 'Personal Trainer', text: 'I create diet plans for my clients and they order directly. So seamless!', rating: 5 },
];

const PLANS = [
  { name: 'Starter', price: 999, period: '/month', features: ['5 meals/week', 'Basic macro tracking', 'Standard delivery', 'Menu access'], popular: false },
  { name: 'Pro', price: 1999, period: '/month', features: ['15 meals/week', 'Full macro tracking', 'Priority delivery', 'Nutrient packs', 'Trainer diet plans', 'Meal scheduling'], popular: true },
  { name: 'Elite', price: 3499, period: '/month', features: ['Unlimited meals', 'AI meal suggestions', 'Express 15-min delivery', 'Custom packs', 'Personal nutritionist', 'Priority support'], popular: false },
];

export default function LandingPage() {
  const { user } = useAuth();
  const roleMap = { client: '/client/dashboard', trainer: '/trainer/dashboard', owner: '/owner/menu', kitchen: '/kitchen/dashboard', delivery: '/delivery/dashboard', admin: '/admin/dashboard' };

  return (
    <div style={{ fontFamily: "'Outfit', 'Inter', sans-serif", background: '#fff', color: '#1a1a1a' }}>

      {/* ═══ NAVBAR ═══ */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>
          <span style={{ color: '#22c55e' }}>Fit</span>Bites
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {NAV_LINKS.map(l => (<a key={l.label} href={l.href} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>{l.label}</a>))}
          {user ? (
            <Link to={user.requirePasswordChange ? '/change-password' : roleMap[user.role]} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', borderRadius: 30, fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>Dashboard →</Link>
          ) : (
            <Link to="/login" style={{ padding: '10px 24px', border: '2px solid #fff', color: '#fff', borderRadius: 30, fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>Login / Sign Up</Link>
          )}
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 40px 60px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80") center/cover no-repeat' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#22c55e', letterSpacing: 2, marginBottom: 16 }}>
          <span style={{ color: '#22c55e' }}>Fit</span><span style={{ color: '#fff' }}>Bites</span>
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 20, maxWidth: 700 }}>
          Gym-Powered<br />Food Delivery
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, maxWidth: 550, marginBottom: 32, lineHeight: 1.6 }}>
          Experience fast & easy online ordering of macro-tracked healthy meals, crafted by nutritionists and delivered in 30 minutes
        </p>

        {/* Search Bar */}
        <div style={{ display: 'flex', background: '#fff', borderRadius: 50, padding: 6, maxWidth: 520, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <input type="text" placeholder="Search for healthy meals, restaurants..." style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 24px', fontSize: 14, borderRadius: 50, color: '#333' }} />
          <Link to="/login" style={{ padding: '12px 28px', background: '#ef4444', color: '#fff', borderRadius: 50, fontWeight: 800, fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>Search</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 48, marginTop: 48 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{s.val}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 40, animation: 'fadeInUp 2s ease infinite' }}>Scroll down ▼</div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#f97316', letterSpacing: 2, marginBottom: 8 }}>WHY FITBITES</div>
          <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Built for Fitness Enthusiasts</h2>
          <p style={{ color: '#888', maxWidth: 500, margin: '0 auto' }}>Every feature designed to help you achieve your nutrition goals faster</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ padding: 28, borderRadius: 20, border: '1px solid #eee', transition: 'all 0.3s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(249,115,22,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ MENU PREVIEW ═══ */}
      <section id="menu" style={{ padding: '80px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#22c55e', letterSpacing: 2, marginBottom: 8 }}>OUR MENU</div>
            <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Fresh, Healthy & Delicious</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {MENU_ITEMS.slice(0, 8).map(item => (
              <div key={item.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #eee', transition: 'transform 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>🔥 {item.calories} kcal • 💪 {item.protein}g • ⏱ {item.prepTime}m</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 900, color: '#22c55e', fontSize: 16 }}>₹{item.price}</span>
                    <span style={{ fontSize: 12, color: '#f97316' }}>⭐ {item.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/login" style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', borderRadius: 50, fontWeight: 800, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>View Full Menu →</Link>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#f97316', letterSpacing: 2, marginBottom: 8 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 36, fontWeight: 900 }}>4 Simple Steps</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28 }}>
          {[{ step: '01', icon: '👤', title: 'Sign Up', desc: 'Create your profile with fitness goals & dietary preferences' }, { step: '02', icon: '🍽️', title: 'Browse Menu', desc: 'Explore macro-tracked meals, nutrient packs & diet plans' }, { step: '03', icon: '📦', title: 'Place Order', desc: 'Add to cart, schedule meals, choose payment method' }, { step: '04', icon: '🚀', title: 'Get Delivered', desc: 'Fresh meals delivered in 30 min with live tracking' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px', color: '#fff' }}>{s.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#f97316', marginBottom: 4 }}>STEP {s.step}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" style={{ padding: '80px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#22c55e', letterSpacing: 2, marginBottom: 8 }}>PRICING</div>
            <h2 style={{ fontSize: 36, fontWeight: 900 }}>Subscription Plans</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {PLANS.map((p, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 20, padding: 32, border: p.popular ? '2px solid #f97316' : '1px solid #eee', position: 'relative', transition: 'transform 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                {p.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', padding: '4px 20px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>MOST POPULAR</div>}
                <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{p.name}</h3>
                <div style={{ marginBottom: 20 }}><span style={{ fontSize: 36, fontWeight: 900, color: '#f97316' }}>₹{p.price}</span><span style={{ color: '#888', fontSize: 14 }}>{p.period}</span></div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                  {p.features.map((f, j) => (<li key={j} style={{ fontSize: 14, padding: '6px 0', color: '#555', display: 'flex', alignItems: 'center', gap: 8 }}>✅ {f}</li>))}
                </ul>
                <Link to="/register" style={{ display: 'block', textAlign: 'center', padding: '12px 0', background: p.popular ? 'linear-gradient(135deg, #f97316, #fb923c)' : '#fff', color: p.popular ? '#fff' : '#f97316', border: p.popular ? 'none' : '2px solid #f97316', borderRadius: 12, fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>Get Started</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOR GYMS ═══ */}
      <section id="gyms" style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#22c55e', letterSpacing: 2, marginBottom: 8 }}>FOR GYM OWNERS</div>
            <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16 }}>Power Your Gym With FitBites</h2>
            <p style={{ color: '#888', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>Give your members access to nutritionist-crafted meals. Manage trainers, track client nutrition, create diet plans — all from one dashboard.</p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
              {['Trainer & client management portal', 'Create & assign nutrient packs', 'Track member nutrition goals', 'Revenue analytics & insights', 'Custom branding options'].map((f, i) => (
                <li key={i} style={{ fontSize: 14, padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8, color: '#555' }}>✅ {f}</li>
              ))}
            </ul>
            <Link to="/register" style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #22c55e, #4ade80)', color: '#fff', borderRadius: 50, fontWeight: 800, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>Partner With Us →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[{ icon: '👥', val: '500+', label: 'Gym Members' }, { icon: '💪', val: '50+', label: 'Trainers' }, { icon: '🏢', val: '20+', label: 'Gym Partners' }, { icon: '📦', val: '10K+', label: 'Orders/Month' }].map((s, i) => (
              <div key={i} style={{ background: '#fafafa', borderRadius: 16, padding: 24, textAlign: 'center', border: '1px solid #eee' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#22c55e' }}>{s.val}</div>
                <div style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: '80px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f97316', letterSpacing: 2, marginBottom: 8 }}>TESTIMONIALS</div>
            <h2 style={{ fontSize: 36, fontWeight: 900 }}>Loved by Fitness Community</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #eee' }}>
                <div style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>"{t.text}"</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14 }}>{t.name.split(' ').map(w => w[0]).join('')}</div>
                  <div><div style={{ fontWeight: 800, fontSize: 14 }}>{t.name}</div><div style={{ fontSize: 12, color: '#888' }}>{t.role}</div></div>
                  <div style={{ marginLeft: 'auto', color: '#f97316' }}>{'⭐'.repeat(t.rating)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ padding: '80px 40px', background: 'linear-gradient(135deg, #f97316, #22c55e)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Ready to Eat Healthy?</h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 28 }}>Join thousands of gym members who fuel their fitness with FitBites</p>
        <Link to="/register" style={{ padding: '16px 40px', background: '#fff', color: '#f97316', borderRadius: 50, fontWeight: 900, fontSize: 16, textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>Get Started — It's Free →</Link>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: '40px', background: '#111', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 12 }}><span style={{ color: '#22c55e' }}>Fit</span>Bites</div>
        <p style={{ fontSize: 13, marginBottom: 16 }}>Gym-Powered Food Delivery • Macro-Tracked • Nutritionist-Crafted</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
          {['About', 'Menu', 'For Gyms', 'Pricing', 'Contact', 'Privacy'].map(l => (<a key={l} href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13 }}>{l}</a>))}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>© 2026 FitBites. All rights reserved.</p>
      </footer>
    </div>
  );
}
