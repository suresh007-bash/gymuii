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
  // Duplicate images for seamless infinite loop
  const doubled = useMemo(() => [...FOOD_IMAGES, ...FOOD_IMAGES], []);

  return (
    <div style={{
      overflow: 'hidden',
      borderRadius: 16,
      marginBottom: 24,
      position: 'relative',
    }}>
      <div style={{
        display: 'flex',
        gap: 0,
        animation: 'slideInfinite 25s linear infinite',
        width: 'fit-content',
      }}>
        {doubled.map((img, i) => (
          <img
            key={i}
            src={img}
            alt=""
            style={{
              width: 180,
              height: 120,
              objectFit: 'cover',
              flexShrink: 0,
              display: 'block',
            }}
          />
        ))}
      </div>
    </div>
  );
}
