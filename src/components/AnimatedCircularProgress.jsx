import { useState, useEffect } from 'react';

/**
 * AnimatedCircularProgress — Animated SVG circular gauge
 * Usage: <AnimatedCircularProgress value={75} label="Calories" color="#f97316" />
 */
export default function AnimatedCircularProgress({
  max = 100,
  min = 0,
  value = 0,
  size = 120,
  strokeWidth = 10,
  color = '#f97316',
  trackColor,
  label = '',
  suffix = '%',
  showValue = true,
  fontSize = 22,
  labelSize = 10,
  className = '',
  style = {},
  animate = true,
}) {
  const [displayed, setDisplayed] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) { setDisplayed(value); return; }
    const start = performance.now();
    const from = 0;
    const to = value;
    const duration = 1200;
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic

    let raf;
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayed(Math.round(from + (to - from) * ease(progress)));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, animate]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.max(0, Math.min(100, ((displayed - min) / (max - min)) * 100));
  const dashOffset = circumference - (percent / 100) * circumference;

  // Auto track color: faded version of primary
  const autoTrack = trackColor || `${color}18`;

  // Gradient ID unique per instance
  const gradId = `cpg-${label.replace(/\s/g, '')}-${color.replace('#', '')}`;

  return (
    <div className={`circ-progress ${className}`} style={{ width: size, height: size, position: 'relative', ...style }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={`${color}99`} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={autoTrack} strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={`url(#${gradId})`} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: animate ? 'none' : 'stroke-dashoffset 0.8s ease' }}
        />
        {/* Glow dot at the end */}
        {percent > 2 && (
          <circle
            cx={size / 2 + radius * Math.cos((percent / 100) * 2 * Math.PI)}
            cy={size / 2 + radius * Math.sin((percent / 100) * 2 * Math.PI)}
            r={strokeWidth / 2 + 2}
            fill={color}
            style={{ filter: `drop-shadow(0 0 4px ${color})`, opacity: 0.8 }}
          />
        )}
      </svg>
      {showValue && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
        }}>
          <span style={{ fontSize, fontWeight: 800, lineHeight: 1, color: 'var(--text-primary, #1a1a1a)' }}>
            {displayed}{suffix}
          </span>
          {label && (
            <span style={{ fontSize: labelSize, fontWeight: 700, color: 'var(--text-muted, #888)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
