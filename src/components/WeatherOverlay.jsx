import { useState, useEffect, useMemo } from 'react';

const EFFECTS = {
  none: null,
  rain: { emoji: '️', label: 'Rainy', color: '#60a5fa' },
  snow: { emoji: '️', label: 'Snowy', color: '#e2e8f0' },
  leaves: { emoji: '', label: 'Autumn Leaves', color: '#f59e0b' },
  stars: { emoji: '', label: 'Starry Night', color: '#fbbf24' },
  confetti: { emoji: '', label: 'Celebration', color: '#ec4899' },
};

function RainEffect() {
  const [lightning, setLightning] = useState(false);

  // 3 layers of rain for depth — foreground, mid, background
  const frontDrops = useMemo(() => Array.from({ length: 120 }, (_, i) => ({
    id: i, left: Math.random() * 120 - 10, delay: Math.random() * 1.5,
    duration: 0.35 + Math.random() * 0.25, height: 18 + Math.random() * 14,
    opacity: 0.6 + Math.random() * 0.35, width: 1.5 + Math.random() * 1,
  })), []);

  const midDrops = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    id: i, left: Math.random() * 120 - 10, delay: Math.random() * 2,
    duration: 0.5 + Math.random() * 0.3, height: 12 + Math.random() * 8,
    opacity: 0.35 + Math.random() * 0.3, width: 1 + Math.random() * 0.5,
  })), []);

  const backDrops = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i, left: Math.random() * 120 - 10, delay: Math.random() * 3,
    duration: 0.7 + Math.random() * 0.5, height: 8 + Math.random() * 6,
    opacity: 0.1 + Math.random() * 0.15, width: 0.5 + Math.random() * 0.5,
  })), []);

  // Splash particles at bottom
  const splashes = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 2,
    duration: 0.4 + Math.random() * 0.3, size: 2 + Math.random() * 3,
  })), []);

  // Lightning — random strikes every 4-12 seconds
  useEffect(() => {
    const strike = () => {
      setLightning(true);
      setTimeout(() => setLightning(false), 150);
      // Double flash
      setTimeout(() => {
        setLightning(true);
        setTimeout(() => setLightning(false), 80);
      }, 200 + Math.random() * 100);
    };
    const schedule = () => {
      const next = 4000 + Math.random() * 8000;
      return setTimeout(() => { strike(); timerId = schedule(); }, next);
    };
    let timerId = schedule();
    return () => clearTimeout(timerId);
  }, []);

  const windAngle = 12; // degrees — wind direction

  return (
    <>
      <style>{`
        @keyframes stormRainFront {
          0% { transform: translateY(-30px) translateX(0) rotate(${windAngle}deg); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 0.7; }
          100% { transform: translateY(105vh) translateX(-${Math.tan(windAngle * Math.PI / 180) * 100}px) rotate(${windAngle}deg); opacity: 0; }
        }
        @keyframes stormRainMid {
          0% { transform: translateY(-20px) translateX(0) rotate(${windAngle - 2}deg); opacity: 0; }
          8% { opacity: 1; }
          100% { transform: translateY(105vh) translateX(-${Math.tan((windAngle - 2) * Math.PI / 180) * 100}px) rotate(${windAngle - 2}deg); opacity: 0; }
        }
        @keyframes stormRainBack {
          0% { transform: translateY(-10px) translateX(0) rotate(${windAngle - 4}deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(105vh) translateX(-${Math.tan((windAngle - 4) * Math.PI / 180) * 100}px) rotate(${windAngle - 4}deg); opacity: 0; }
        }
        @keyframes splashBurst {
          0% { transform: scale(0) translateY(0); opacity: 0.9; }
          50% { transform: scale(1.2) translateY(-4px); opacity: 0.5; }
          100% { transform: scale(0.5) translateY(-8px); opacity: 0; }
        }
        @keyframes mistDrift {
          0% { transform: translateX(-5%); opacity: 0.03; }
          50% { opacity: 0.06; }
          100% { transform: translateX(5%); opacity: 0.03; }
        }
        @keyframes stormShake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-1px, 0.5px); }
          50% { transform: translate(1px, -0.5px); }
          75% { transform: translate(-0.5px, 1px); }
        }
      `}</style>

      {/* Dark tint overlay — makes rain visible on white backgrounds */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'rgba(15, 23, 42, 0.15)',
        transition: 'background 0.5s ease',
      }} />

      {/* Mist / fog layer */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(30,41,59,0.06) 0%, rgba(15,23,42,0.12) 60%, rgba(30,41,59,0.18) 100%)',
        animation: 'mistDrift 12s ease-in-out infinite alternate',
      }} />

      {/* Lightning flash overlay */}
      {lightning && (
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: 'rgba(255,255,255,0.15)',
          zIndex: 2, animation: 'stormShake 0.15s ease',
        }} />
      )}

      {/* Background rain (furthest, blurry, slow) */}
      {backDrops.map(d => (
        <div key={`b-${d.id}`} style={{
          position: 'fixed', left: `${d.left}%`, top: -20,
          width: d.width, height: d.height,
          background: `linear-gradient(to bottom, transparent, rgba(148,163,184,${d.opacity}))`,
          borderRadius: 1, filter: 'blur(1px)',
          animation: `stormRainBack ${d.duration}s linear ${d.delay}s infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Mid rain */}
      {midDrops.map(d => (
        <div key={`m-${d.id}`} style={{
          position: 'fixed', left: `${d.left}%`, top: -20,
          width: d.width, height: d.height,
          background: `linear-gradient(to bottom, transparent 10%, rgba(148,197,250,${d.opacity}))`,
          borderRadius: 1, filter: 'blur(0.3px)',
          animation: `stormRainMid ${d.duration}s linear ${d.delay}s infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Foreground rain (closest, sharp, fast) */}
      {frontDrops.map(d => (
        <div key={`f-${d.id}`} style={{
          position: 'fixed', left: `${d.left}%`, top: -30,
          width: d.width, height: d.height,
          background: `linear-gradient(to bottom, transparent 5%, rgba(200,225,255,${d.opacity}) 50%, rgba(230,245,255,${d.opacity * 0.8}))`,
          borderRadius: 1,
          animation: `stormRainFront ${d.duration}s linear ${d.delay}s infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Splash particles at bottom */}
      {splashes.map(s => (
        <div key={`s-${s.id}`} style={{
          position: 'fixed', left: `${s.left}%`, bottom: 0,
          width: s.size, height: s.size,
          borderRadius: '50%',
          background: 'rgba(186,220,255,0.3)',
          animation: `splashBurst ${s.duration}s ease-out ${s.delay}s infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Bottom mist accumulation */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 60,
        background: 'linear-gradient(to top, rgba(148,163,184,0.06), transparent)',
        pointerEvents: 'none',
      }} />
    </>
  );
}

function SnowEffect() {
  const flakes = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 4 + Math.random() * 4,
    size: 3 + Math.random() * 6,
    opacity: 0.4 + Math.random() * 0.5,
    drift: -30 + Math.random() * 60,
  })), []);

  return (
    <>
      <style>{`
        @keyframes snowFall {
          0% { transform: translateY(-10px) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(100vh) translateX(var(--drift)) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {flakes.map(f => (
        <div key={f.id} style={{
          position: 'fixed',
          left: `${f.left}%`,
          top: -10,
          width: f.size,
          height: f.size,
          background: `rgba(255,255,255,${f.opacity})`,
          borderRadius: '50%',
          boxShadow: `0 0 ${f.size * 2}px rgba(255,255,255,0.3)`,
          animation: `snowFall ${f.duration}s linear ${f.delay}s infinite`,
          '--drift': `${f.drift}px`,
          pointerEvents: 'none',
        }} />
      ))}
    </>
  );
}

function LeavesEffect() {
  const leaves = useMemo(() => Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 5,
    size: 10 + Math.random() * 10,
    emoji: ['', '', ''][Math.floor(Math.random() * 3)],
  })), []);

  return (
    <>
      <style>{`
        @keyframes leafFall {
          0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          50% { transform: translateY(50vh) translateX(60px) rotate(180deg); }
          100% { transform: translateY(100vh) translateX(-30px) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {leaves.map(l => (
        <div key={l.id} style={{
          position: 'fixed',
          left: `${l.left}%`,
          top: -30,
          fontSize: l.size,
          animation: `leafFall ${l.duration}s ease-in-out ${l.delay}s infinite`,
          pointerEvents: 'none',
        }}>{l.emoji}</div>
      ))}
    </>
  );
}

function StarsEffect() {
  const stars = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 1.5 + Math.random() * 2,
    size: 2 + Math.random() * 3,
  })), []);

  return (
    <>
      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'fixed',
          left: `${s.left}%`,
          top: `${s.top}%`,
          width: s.size,
          height: s.size,
          background: '#fbbf24',
          borderRadius: '50%',
          boxShadow: `0 0 ${s.size * 3}px rgba(251,191,36,0.5)`,
          animation: `starTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          pointerEvents: 'none',
        }} />
      ))}
    </>
  );
}

function ConfettiEffect() {
  const pieces = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 4,
    size: 4 + Math.random() * 6,
    color: ['#f97316', '#22c55e', '#3b82f6', '#ec4899', '#eab308', '#a855f7'][Math.floor(Math.random() * 6)],
    drift: -50 + Math.random() * 100,
    rotation: Math.random() * 720,
  })), []);

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10px) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) translateX(var(--cdrift)) rotate(var(--crot)); opacity: 0; }
        }
      `}</style>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'fixed',
          left: `${p.left}%`,
          top: -10,
          width: p.size,
          height: p.size * 1.5,
          background: p.color,
          borderRadius: 1,
          animation: `confettiFall ${p.duration}s linear ${p.delay}s infinite`,
          '--cdrift': `${p.drift}px`,
          '--crot': `${p.rotation}deg`,
          pointerEvents: 'none',
        }} />
      ))}
    </>
  );
}

export default function WeatherOverlay() {
  const [effect, setEffect] = useState(() => localStorage.getItem('synnoviq_weather_effect') || 'none');

  useEffect(() => {
    const handler = () => setEffect(localStorage.getItem('synnoviq_weather_effect') || 'none');
    window.addEventListener('storage', handler);
    window.addEventListener('synnoviq_weather_change', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('synnoviq_weather_change', handler);
    };
  }, []);

  if (effect === 'none' || !effect) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none', overflow: 'hidden' }}>
      {effect === 'rain' && <RainEffect />}
      {effect === 'snow' && <SnowEffect />}
      {effect === 'leaves' && <LeavesEffect />}
      {effect === 'stars' && <StarsEffect />}
      {effect === 'confetti' && <ConfettiEffect />}
    </div>
  );
}

export { EFFECTS };
