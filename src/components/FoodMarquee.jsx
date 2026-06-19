import { useMemo } from 'react';

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=300&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&q=80',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300&q=80',
];

export default function FoodMarquee() {
  const doubled = useMemo(() => [...FOOD_IMAGES, ...FOOD_IMAGES], []);

  return (
    <div style={{
      overflow: 'hidden',
      borderRadius: 16,
      marginBottom: 24,
      position: 'relative',
    }}>
      {/* Left fade edge */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(90deg, var(--bg-primary), transparent)', zIndex: 2, pointerEvents: 'none' }} />
      {/* Right fade edge */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(270deg, var(--bg-primary), transparent)', zIndex: 2, pointerEvents: 'none' }} />

      <div style={{
        display: 'flex',
        gap: 12,
        animation: 'marqueeLeftToRight 30s linear infinite',
        width: 'fit-content',
      }}>
        {doubled.map((img, i) => (
          <div key={i} style={{
            width: 180, height: 120, borderRadius: 14, overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(249,115,22,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
          >
            <img
              src={img}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
