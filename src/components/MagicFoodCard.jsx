import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

// ═══ Color map: food tags → RGB glow colors ═══
const TAG_COLORS = {
  'High Protein': '34, 197, 94', // green
  'Keto': '249, 115, 22', // orange
  'Vegan': '16, 185, 129', // emerald
  'Low Carb': '59, 130, 246', // blue
  'High Fiber': '168, 85, 247', // purple
  'Post-Workout': '239, 68, 68', // red
  'Weight Loss': '236, 72, 153', // pink
  'Muscle Gain': '245, 158, 11', // amber
  'Low Fat': '6, 182, 212', // cyan
  'High Calorie': '251, 146, 60', // warm orange
  'Breakfast': '250, 204, 21', // yellow
};

const DEFAULT_COLOR = '249, 115, 22'; // site orange

export function getGlowColor(tags = []) {
  for (const tag of tags) {
    if (TAG_COLORS[tag]) return TAG_COLORS[tag];
  }
  return DEFAULT_COLOR;
}

// ═══ Particle creator ═══
function createParticle(x, y, color) {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position:absolute; width:4px; height:4px; border-radius:50%;
    background:rgba(${color},1); box-shadow:0 0 6px rgba(${color},0.6);
    pointer-events:none; z-index:5; left:${x}px; top:${y}px;
  `;
  return el;
}

// ═══ MagicFoodCard: wraps a food card with particle + tilt + magnetism + click ripple ═══
export function MagicFoodCard({ children, glowColor = DEFAULT_COLOR, className = '', style = {} }) {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHovered = useRef(false);
  const magnetAnim = useRef(null);

  const clearParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetAnim.current?.kill();
    particlesRef.current.forEach(p => {
      gsap.to(p, { scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)', onComplete: () => p.remove() });
    });
    particlesRef.current = [];
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // Skip heavy animations on touch/mobile devices to prevent shaking
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches || 'ontouchstart' in window;
    if (isTouchDevice) return;

    const onEnter = () => {
      isHovered.current = true;
      // spawn 8 particles
      const { width, height } = el.getBoundingClientRect();
      for (let i = 0; i < 8; i++) {
        const tid = setTimeout(() => {
          if (!isHovered.current || !el) return;
          const p = createParticle(Math.random() * width, Math.random() * height, glowColor);
          el.appendChild(p);
          particlesRef.current.push(p);
          gsap.fromTo(p, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
          gsap.to(p, { x: (Math.random() - 0.5) * 80, y: (Math.random() - 0.5) * 80, rotation: Math.random() * 360, duration: 2 + Math.random() * 2, ease: 'none', repeat: -1, yoyo: true });
          gsap.to(p, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true });
        }, i * 80);
        timeoutsRef.current.push(tid);
      }
      // tilt in
      gsap.to(el, { rotateX: 3, rotateY: 3, duration: 0.3, ease: 'power2.out', transformPerspective: 800 });
    };

    const onLeave = () => {
      isHovered.current = false;
      clearParticles();
      gsap.to(el, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
    };

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const cx = rect.width / 2, cy = rect.height / 2;
      // tilt
      gsap.to(el, { rotateX: ((y - cy) / cy) * -8, rotateY: ((x - cx) / cx) * 8, duration: 0.1, ease: 'power2.out', transformPerspective: 800 });
      // magnetism
      magnetAnim.current = gsap.to(el, { x: (x - cx) * 0.03, y: (y - cy) * 0.03, duration: 0.3, ease: 'power2.out' });
    };

    const onClick = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const maxD = Math.max(Math.hypot(x, y), Math.hypot(x - rect.width, y), Math.hypot(x, y - rect.height), Math.hypot(x - rect.width, y - rect.height));
      const ripple = document.createElement('div');
      ripple.style.cssText = `position:absolute;width:${maxD * 2}px;height:${maxD * 2}px;border-radius:50%;background:radial-gradient(circle,rgba(${glowColor},0.4) 0%,rgba(${glowColor},0.2) 30%,transparent 70%);left:${x - maxD}px;top:${y - maxD}px;pointer-events:none;z-index:1000;`;
      el.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('click', onClick);
    return () => {
      isHovered.current = false;
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('click', onClick);
      clearParticles();
    };
  }, [glowColor, clearParticles]);

  return (
    <div ref={cardRef} className={`${className} magic-glow`} style={{ ...style, position: 'relative', overflow: 'hidden', '--glow-color': glowColor }}>
      {children}
    </div>
  );
}

// ═══ FoodSpotlight: global spotlight that follows cursor across the food grid ═══
export function FoodSpotlight({ gridRef, spotlightRadius = 300, glowColor = DEFAULT_COLOR }) {
  const spotRef = useRef(null);

  useEffect(() => {
    if (!gridRef?.current) return;

    // Skip on touch/mobile devices
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches || 'ontouchstart' in window;
    if (isTouchDevice) return;

    const spot = document.createElement('div');
    spot.className = 'global-food-spotlight';
    spot.style.cssText = `
      position:fixed; width:800px; height:800px; border-radius:50%; pointer-events:none;
      background:radial-gradient(circle, rgba(${glowColor},0.12) 0%, rgba(${glowColor},0.06) 15%, rgba(${glowColor},0.03) 25%, rgba(${glowColor},0.015) 40%, transparent 65%);
      z-index:200; opacity:0; transform:translate(-50%,-50%); mix-blend-mode:screen;
    `;
    document.body.appendChild(spot);
    spotRef.current = spot;

    const proximity = spotlightRadius * 0.5;
    const fadeDistance = spotlightRadius * 0.75;

    const onMove = (e) => {
      if (!gridRef.current || !spotRef.current) return;

      const section = gridRef.current;
      const rect = section.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      if (!inside) {
        gsap.to(spotRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        section.querySelectorAll('.magic-glow').forEach(c => c.style.setProperty('--glow-intensity', '0'));
        return;
      }

      let minDist = Infinity;
      section.querySelectorAll('.magic-glow').forEach(card => {
        const cr = card.getBoundingClientRect();
        const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
        const dist = Math.max(0, Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2);
        minDist = Math.min(minDist, dist);

        let glow = 0;
        if (dist <= proximity) glow = 1;
        else if (dist <= fadeDistance) glow = (fadeDistance - dist) / (fadeDistance - proximity);

        const rx = ((e.clientX - cr.left) / cr.width) * 100;
        const ry = ((e.clientY - cr.top) / cr.height) * 100;
        card.style.setProperty('--glow-x', `${rx}%`);
        card.style.setProperty('--glow-y', `${ry}%`);
        card.style.setProperty('--glow-intensity', glow.toString());
        card.style.setProperty('--glow-radius', `${spotlightRadius}px`);
      });

      gsap.to(spotRef.current, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' });
      const opacity = minDist <= proximity ? 0.8 : minDist <= fadeDistance ? ((fadeDistance - minDist) / (fadeDistance - proximity)) * 0.8 : 0;
      gsap.to(spotRef.current, { opacity, duration: opacity > 0 ? 0.2 : 0.5, ease: 'power2.out' });
    };

    const onLeave = () => {
      gridRef.current?.querySelectorAll('.magic-glow').forEach(c => c.style.setProperty('--glow-intensity', '0'));
      if (spotRef.current) gsap.to(spotRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      spotRef.current?.remove();
    };
  }, [gridRef, spotlightRadius, glowColor]);

  return null;
}

export default { MagicFoodCard, FoodSpotlight, getGlowColor };
