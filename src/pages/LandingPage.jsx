import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NUTRIENT_PACKS, CATEGORIES } from '../data/mockMenu';
import { getMenuItems } from '../data/menuHelper';
import StatIcon from '../components/StatIcon';
import foodGeneral from '../assets/food_general.png';

const STATS = [{ val: '500+', label: 'Meals Delivered' }, { val: '30 min', label: 'Avg Delivery' }, { val: '4.8 ', label: 'User Rating' }, { val: '50+', label: 'Gym Partners' }];

const FEATURES = [
  { icon: <StatIcon name="meal" size={24} />, title: 'Macro-Tracked Meals', desc: 'Every meal comes with precise calorie, protein, carb & fat data' },
  { icon: <StatIcon name="dumbbell" size={24} />, title: 'Gym-Personalized', desc: 'Your trainer sets targets, we deliver matching meal' },
  { icon: <StatIcon name="calendar" size={24} />, title: 'Meal Scheduling', desc: 'Schedule breakfast, lunch & dinner for the entire week' },
  { icon: <StatIcon name="zap" size={24} />, title: '30-Min Delivery', desc: 'Fresh meals delivered to your gym or home in 30 minutes' },
  { icon: <StatIcon name="orders" size={24} />, title: 'Nutrient Packs', desc: 'Curated meal packs by trainers, gym owners & nutritionists' },
  { icon: <StatIcon name="barChart" size={24} />, title: 'Progress Tracking', desc: 'Track your nutrition goals with beautiful analytics' },
];

const TESTIMONIALS = [
  { name: 'Ravi Kumar', role: 'Gym Member', text: 'FitBites changed my diet game. I hit my protein goals daily without cooking!', rating: 5 },
  { name: 'Priya Sharma', role: 'Fitness Enthusiast', text: 'The meal scheduling is a lifesaver. Set it once and healthy food arrives every day.', rating: 5 },
  { name: 'Coach Marcus', role: 'Personal Trainer', text: 'I create diet plans for my clients and they order directly. So seamless!', rating: 5 },
  { name: 'Ananya Iyer', role: 'Yoga Instructor', text: 'The macro tracking helps me stay lean. Delicious, clean, and extremely convenient!', rating: 5 }
];

const PLANS = [
  {
    name: 'Starter', price: 999, period: '/month', features: ['5 meals/week', 'Basic macro tracking', 'Standard delivery', 'Menu access', 'Weekly meal scheduling',
      'Email support'], popular: false
  },
  { name: 'Pro', price: 1999, period: '/month', features: ['15 meals/week', 'Full macro tracking', 'Priority delivery', 'Nutrient packs', 'Trainer diet plans', 'Meal scheduling'], popular: true },
  { name: 'Elite', price: 3499, period: '/month', features: ['Unlimited meals', 'AI meal suggestions', 'Express 15-min delivery', 'Custom packs', 'Personal nutritionist', 'Priority support'], popular: false },
];

export default function LandingPage() {
  const MENU_ITEMS = getMenuItems();
  const { user } = useAuth();
  const roleMap = { client: '/client/menu', trainer: '/trainer/home', owner: '/owner/menu', kitchen: '/kitchen/dashboard', delivery: '/delivery/dashboard', admin: '/admin/dashboard' };

  // Carousel state
  const [carouselIdx, setCarouselIdx] = useState(0);
  const totalSlides = 3;
  const nextSlide = useCallback(() => setCarouselIdx(p => (p + 1) % totalSlides), []);
  const prevSlide = useCallback(() => setCarouselIdx(p => (p - 1 + totalSlides) % totalSlides), []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div style={{ fontFamily: "'Outfit', 'Inter', sans-serif", background: '#fff', color: '#1a1a1a', minHeight: '112vh', height: 'auto', overflow: 'visible', position: 'relative' }}>
      <style>{`
        .landing-menu-grid { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 28px; 
          width: 100%;
        }
        .landing-menu-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #eee;
          width: 100%;
        }
        @media (max-width: 992px) { 
          .landing-menu-grid { 
            grid-template-columns: repeat(2, 1fr); 
          } 
        }
        @media (max-width: 600px) { 
          .landing-menu-grid { 
            grid-template-columns: 1fr;
            gap: 16px; 
          } 
        }
        .landing-carousel {
          position: relative;
          overflow: hidden;
        }
        .landing-carousel-track { 
          display: flex; 
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); 
          width: 100%; 
          align-items: flex-start;
        }
        .landing-carousel-slide { 
          min-width: 100%; 
          max-width: 100%; 
          flex-shrink: 0; 
          box-sizing: border-box; 
          height: 0;
          overflow: hidden;
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .landing-carousel-slide.active-slide {
          height: auto;
          overflow: visible;
          opacity: 1;
        }
        .slide-content {
          height: auto;
        }
        .landing-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          align-items: stretch;
        }
        @media (min-width: 1025px) {
          .landing-cards-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .landing-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          justify-content: center;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }
        @media (max-width: 1024px) {
          .landing-pricing-grid {
            grid-template-columns: 1fr;
            max-width: 600px;
          }
        }
        .carousel-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 10; width: 44px; height: 44px; border-radius: 50%; border: none; background: rgba(255,255,255,0.8); color: #333; font-size: 20px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; backdrop-filter: blur(8px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .carousel-arrow:hover { background: var(--accent-orange, #f97316); color: #fff; transform: translateY(-50%) scale(1.1); }
        .carousel-arrow.left { left: 12px; }
        .carousel-arrow.right { right: 12px; }
        .carousel-dots { display: flex; justify-content: center; gap: 8px; padding: 16px 0; }
        .carousel-dot { width: 10px; height: 10px; border-radius: 50%; border: none; cursor: pointer; transition: all 0.3s; }
        .carousel-dot.active { background: var(--accent-orange, #f97316); transform: scale(1.3); }
        .carousel-dot:not(.active) { background: #ddd; }
        
        @media (max-width: 600px) {
          .carousel-arrow { width: 36px; height: 36px; font-size: 16px; }
          .carousel-arrow.left { left: 4px; }
          .carousel-arrow.right { right: 4px; }
        }
      `}</style>

      {/* ═══ NAVBAR ═══ */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '16px clamp(16px, 1.4vw, 28px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}>
        <div style={{ fontSize: 'clamp(22px, 1.0vw, 26px)', fontWeight: 900, color: '#fff' }}>
          <span style={{ color: '#22c55e' }}>Fit</span>Bites
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 1.0vw, 23px)' }}>
          <Link to="/login" style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', borderRadius: 30, fontWeight: 800, fontSize: 'clamp(13px, 1.0vw, 15px)', textDecoration: 'none' }}>Get Started</Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ minHeight: '112vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'clamp(100px, 5.2vw, 115px) clamp(16px, 1.4vw, 28px) clamp(40px, 2.1vw, 46px)', position: 'relative', overflow: 'hidden', background: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65)), url(${foodGeneral}) center/cover no-repeat` }}>
        <div style={{ fontSize: 'clamp(15px, 1.0vw, 18px)', fontWeight: 800, color: '#22c55e', letterSpacing: 2, marginBottom: 16 }}>
          <span style={{ color: '#22c55e' }}>Fit</span><span style={{ color: '#fff' }}>Bites</span>
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 2.1vw, 51px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 20, maxWidth: 700 }}>
          Gym-Powered<br />Food Delivery
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(16px, 1.0vw, 19px)', maxWidth: 550, marginBottom: 32, lineHeight: 1.6 }}>
          Experience fast & easy online ordering of macro-tracked healthy meals, crafted by nutritionists and delivered in 30 minutes
        </p>

        {/* Search Bar */}
        <div style={{ display: 'flex', background: '#fff', borderRadius: 50, padding: 6, maxWidth: 520, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <input type="text" placeholder="Search for healthy meals..." style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 16px', fontSize: 'clamp(13px, 1.0vw, 15px)', borderRadius: 50, color: '#333', minWidth: 0 }} />
          <Link to="/login" style={{ padding: '12px 24px', background: '#ef4444', color: '#fff', borderRadius: 50, fontWeight: 800, fontSize: 'clamp(13px, 1.0vw, 15px)', textDecoration: 'none', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>Search</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(20px, 1.4vw, 35px)', marginTop: 48, justifyContent: 'center' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(22px, 0.7vw, 26px)', fontWeight: 900, color: '#fff' }}>{s.val}</div>
              <div style={{ fontSize: 'clamp(11px, 0.3vw, 13px)', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(12px, 1.0vw, 14px)', marginTop: 40 }}>Scroll down ▼</div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section style={{ padding: '40px 0', background: '#fff' }}>
        <div
          className="slide-content"
          style={{
            padding: 'clamp(20px, 1.4vw, 28px) clamp(24px, 2.1vw, 28px)',
            maxWidth: 1100,
            margin: '0 auto',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800, color: '#f97316', letterSpacing: 2, marginBottom: 8 }}>
              WHY FITBITES
            </div>
            <h2 style={{ fontSize: 'clamp(27px, 1.0vw, 32px)', fontWeight: 900, marginBottom: 16 }}>
              Built for Fitness Enthusiasts
            </h2>
            <p style={{ color: '#888', lineHeight: 1.7, marginBottom: 24 }}>
              Focus on your workouts while we take care of your nutrition. High protein, balanced meals designed for maximum results.
            </p>
            <Link to="/login" style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#f97316,#fb923c)', color: '#fff', borderRadius: 50, textDecoration: 'none', fontWeight: 800, display: 'inline-block' }}>
              Explore Menu →
            </Link>
          </div>

          <div className="landing-cards-grid">
            {FEATURES.slice(0, 4).map((f, i) => (
              <div
                key={i}
                className="feature-card"
                style={{
                  padding: 24,
                  borderRadius: 20,
                  border: '1px solid #eee',
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <div style={{ marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{
                  fontSize: 'clamp(18px, 0.7vw, 21px)',
                  fontWeight: 700,
                  lineHeight: 1.3,
                  marginBottom: 10,
                  minHeight: '2.6em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>{f.title}</h3>
                <p style={{ color: '#888', fontSize: 'clamp(16px, 0.6vw, 19px)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{ padding: '40px 0', background: '#fafafa' }}>
        <div
          className="slide-content"
          style={{
            padding: 'clamp(20px, 1.4vw, 28px) clamp(24px, 2.1vw, 28px)',
            maxWidth: 1100,
            margin: '0 auto',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800, color: '#f97316', letterSpacing: 2, marginBottom: 8 }}>
              HOW IT WORKS
            </div>
            <h2 style={{ fontSize: 'clamp(27px, 1.0vw, 32px)', fontWeight: 900, marginBottom: 16 }}>
              4 Simple Steps
            </h2>
            <p style={{ color: '#888', lineHeight: 1.7, marginBottom: 24 }}>
              Order healthy meals in just a few clicks. Freshly prepared and delivered on time to your home or gym.
            </p>
            <Link to="/register" style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#f97316,#fb923c)', color: '#fff', borderRadius: 50, textDecoration: 'none', fontWeight: 800, display: 'inline-block' }}>
              Get Started
            </Link>
          </div>

          <div className="landing-cards-grid">
            {[
              {
                step: '01',
                icon: '',
                title: 'Sign Up',
                desc: 'Create your profile with fitness goals and dietary preferences'
              },
              {
                step: '02',
                icon: '',
                title: 'Browse Menu',
                desc: 'Explore healthy meals, nutrient packs and diet plans'
              },
              {
                step: '03',
                icon: '',
                title: 'Place Order',
                desc: 'Add meals to cart and schedule delivery anytime'
              },
              {
                step: '04',
                icon: '',
                title: 'Get Delivered',
                desc: 'Fresh meals delivered to your home or gym in 30 minutes'
              }
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  border: '1px solid #eee',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#f97316,#22c55e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(21px, 1.0vw, 25px)',
                    color: '#fff',
                    marginBottom: 12
                  }}
                >
                  {s.icon}
                </div>

                <div
                  style={{
                    fontSize: 'clamp(12px, 1.0vw, 14px)',
                    fontWeight: 900,
                    color: '#f97316',
                    marginBottom: 8
                  }}
                >
                  STEP {s.step}
                </div>

                <h3 style={{ fontSize: 'clamp(20px, 1.4vw, 23px)', fontWeight: 800, marginBottom: 10 }}>
                  {s.title}
                </h3>

                <p style={{ fontSize: 'clamp(16px, 1.0vw, 19px)', color: '#888', lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOR GYMS ═══ */}
      <section style={{ padding: '40px 0', background: '#fff' }}>
        <div
          className="slide-content"
          style={{
            padding: 'clamp(20px, 1.4vw, 28px) clamp(24px, 2.1vw, 28px)',
            maxWidth: 1100,
            margin: '0 auto',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800, color: '#22c55e', letterSpacing: 2, marginBottom: 8 }}>
              FOR GYM OWNERS
            </div>
            <h2 style={{ fontSize: 'clamp(27px, 1.0vw, 32px)', fontWeight: 900, marginBottom: 16 }}>
              Power Your Gym With FitBites
            </h2>
            <p style={{ color: '#888', lineHeight: 1.7, marginBottom: 24 }}>
              Give your members access to nutritionist-crafted meals.
              Manage trainers, track nutrition goals and grow your gym.
            </p>
            <Link to="/register" style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#22c55e,#4ade80)', color: '#fff', borderRadius: 50, textDecoration: 'none', fontWeight: 800, display: 'inline-block' }}>
              Partner With Us →
            </Link>
          </div>

          <div className="landing-cards-grid">
            {[
              { icon: '', val: '500+', label: 'Gym Members' },
              { icon: '', val: '50+', label: 'Trainers' },
              { icon: '', val: '20+', label: 'Gym Partners' },
              { icon: '', val: '10K+', label: 'Orders / Month' }
            ].map((s, i) => (
              <div
                key={i}
                className="stat-card"
                style={{
                  background: '#fafafa',
                  borderRadius: 20,
                  padding: 24,
                  border: '1px solid #eee',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{ fontSize: 'clamp(24px, 1.0vw, 28px)', marginBottom: 8 }}>{s.icon}</div>

                <div
                  style={{
                    fontSize: 'clamp(24px, 1.0vw, 28px)',
                    fontWeight: 900,
                    color: '#22c55e',
                    marginBottom: 4
                  }}
                >
                  {s.val}
                </div>

                <div style={{ color: '#888', fontSize: 'clamp(13px, 1.0vw, 15px)', fontWeight: 600 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MENU PREVIEW ═══ */}
      <section id="menu" style={{ padding: 'clamp(20px, 1.4vw, 28px) 0', background: '#fafafa' }}>
        <div style={{ width: '100%', padding: '0 clamp(16px, 1.4vw, 28px)', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800, color: '#22c55e', letterSpacing: 2, marginBottom: 8 }}>OUR MENU</div>
            <h2 style={{ fontSize: 'clamp(27px, 1.0vw, 32px)', fontWeight: 900, marginBottom: 12 }}>Fresh, Healthy & Delicious</h2>
          </div>
          <div className="landing-menu-grid">
            {MENU_ITEMS.map(item => (
              <div key={item.id} className="landing-menu-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: 160, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 'clamp(18px, 1.0vw, 21px)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="text-truncate">{item.name}</div>
                  <div style={{ fontSize: 'clamp(14px, 0.7vw, 17px)', color: '#888', marginBottom: 10 }}> {item.calories} kcal • {item.protein}g Protein</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontWeight: 900, color: '#22c55e', fontSize: 'clamp(20px, 1.4vw, 23px)' }}>₹{item.price}</span>
                    <span style={{ fontSize: 'clamp(16px, 1.0vw, 19px)', color: '#f97316', fontWeight: 700 }}> {item.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/login" style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', borderRadius: 50, fontWeight: 800, fontSize: 'clamp(14px, 1.0vw, 17px)', textDecoration: 'none', display: 'inline-block' }}>View Full Menu →</Link>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section
        id="pricing"
        style={{
          padding: 'clamp(20px, 1.4vw, 28px) clamp(16px, 1.4vw, 28px)',
          background: '#fff',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div
              style={{
                fontSize: 'clamp(12px, 1.0vw, 14px)',
                fontWeight: 800,
                color: '#22c55e',
                letterSpacing: 2,
                marginBottom: 8
              }}
            >
              PRICING
            </div>

            <h2 style={{ fontSize: 'clamp(27px, 1.0vw, 32px)', fontWeight: 900 }}>
              Subscription Plans
            </h2>
          </div>

          <div
            className="landing-pricing-grid"
          >
            {PLANS.map((p, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  padding: '36px 28px',
                  border: p.popular
                    ? '2px solid #f97316'
                    : '1px solid #eee',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 520,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                }}
              >
                {p.popular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background:
                        'linear-gradient(135deg, #f97316, #fb923c)',
                      color: '#fff',
                      padding: '4px 20px',
                      borderRadius: 20,
                      fontSize: 'clamp(12px, 1.0vw, 14px)',
                      fontWeight: 800,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}

                <h3
                  style={{
                    fontSize: 'clamp(19px, 1.0vw, 22px)',
                    fontWeight: 900,
                    marginBottom: 4
                  }}
                 className="text-truncate">
                  {p.name}
                </h3>

                <div style={{ marginBottom: 20 }}>
                  <span
                    style={{
                      fontSize: 'clamp(30px, 1.0vw, 35px)',
                      fontWeight: 900,
                      color: '#f97316'
                    }}
                  >
                    ₹{p.price}
                  </span>

                  <span
                    style={{
                      color: '#888',
                      fontSize: 'clamp(13px, 1.0vw, 15px)'
                    }}
                  >
                    {p.period}
                  </span>
                </div>

                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    marginBottom: 24,
                    flex: 1
                  }}
                >
                  {p.features.map((f, j) => (
                    <li
                      key={j}
                      style={{
                        fontSize: 'clamp(13px, 1.0vw, 15px)',
                        padding: '8px 0',
                        color: '#555',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/login"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '12px 0',
                    background: p.popular
                      ? 'linear-gradient(135deg, #f97316, #fb923c)'
                      : '#fff',
                    color: p.popular ? '#fff' : '#f97316',
                    border: p.popular
                      ? 'none'
                      : '2px solid #f97316',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 'clamp(13px, 1.0vw, 15px)',
                    textDecoration: 'none',
                    marginTop: 'auto'
                  }}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: 'clamp(20px, 1.4vw, 28px) clamp(16px, 1.4vw, 28px)', background: '#fafafa', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', fontWeight: 800, color: '#f97316', letterSpacing: 2, marginBottom: 8 }}>TESTIMONIALS</div>
            <h2 style={{ fontSize: 'clamp(27px, 1.0vw, 32px)', fontWeight: 900 }}>Loved by Fitness Community</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #eee' }}>
                <div style={{ fontSize: 'clamp(15px, 1.0vw, 18px)', color: '#555', lineHeight: 1.7, marginBottom: 16, fontWeight: 500 }}>"{t.text}"</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #22c55e)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#fff', fontWeight: 900, fontSize: 'clamp(13px, 1.0vw, 15px)' }}>{t.name.split(' ').map(w => w[0]).join('')}</div>
                  <div><div style={{ fontWeight: 800, fontSize: 'clamp(13px, 1.0vw, 15px)' }} className="text-truncate">{t.name}</div><div style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: '#888' }}>{t.role}</div></div>
                  <div style={{ marginLeft: 'auto', color: '#f97316' }}>{''.repeat(t.rating)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ padding: 'clamp(20px, 1.4vw, 28px) clamp(16px, 1.4vw, 28px)', background: 'linear-gradient(135deg, #f97316, #22c55e)', textAlign: 'center', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: 'clamp(27px, 1.0vw, 32px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>Ready to Eat Healthy?</h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(15px, 1.0vw, 18px)', marginBottom: 28 }}>Join thousands of gym members who fuel their fitness with FitBites</p>
        <Link to="/login" style={{ padding: '16px 40px', background: '#fff', color: '#f97316', borderRadius: 50, fontWeight: 900, fontSize: 'clamp(15px, 1.0vw, 18px)', textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>Get Started — It's Free</Link>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: '40px 16px', background: '#111', color: 'rgba(255,255,255,0.6)', textAlign: 'center', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 'clamp(19px, 1.0vw, 22px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}><span style={{ color: '#22c55e' }}>Fit</span>Bites</div>
        <p style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', marginBottom: 16 }}>Gym-Powered Food Delivery • Macro-Tracked • Nutritionist-Crafted</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
          {['About', 'Contact', 'Privacy'].map(l => (<a key={l} href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 'clamp(12px, 1.0vw, 14px)' }}>{l}</a>))}
        </div>
        <p style={{ fontSize: 'clamp(12px, 1.0vw, 14px)', color: 'rgba(255,255,255,0.3)' }}> 2026 FitBites. All rights reserved.</p>
      </footer>
    </div>
  );
}