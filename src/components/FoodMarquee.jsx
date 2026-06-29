import salad from '../assets/salad.png';
import food_general from '../assets/food_general.png';
import healthy_bowl from '../assets/healthy_bowl.png';
import salad_prep from '../assets/salad_prep.png';
import roasted_chicken from '../assets/roasted_chicken.png';
import sweet_dessert from '../assets/sweet_dessert.png';

const FOOD_IMAGES = [
  salad,
  food_general,
  healthy_bowl,
  salad_prep,
  roasted_chicken,
  sweet_dessert,
          ];

export default function FoodMarquee() {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {FOOD_IMAGES.map((img, i) => (
          <div
            key={i}
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              height: 220,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <img
              src={img}
              alt={`Food ${i + 1}`}
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

      <style>{`
        @media (max-width: 820px) {
          div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 520px) {
          div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}