import { useState, useRef, useCallback } from 'react';

export default function GlareHover({
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.25,
  glareAngle = -30,
  glareSize = 250,
  transitionDuration = 600,
  playOnce = false,
  style = {},
  className = '',
}) {
  const containerRef = useRef(null);
  const [glarePos, setGlarePos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback((e) => {
    if (playOnce && hasPlayed) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setGlarePos({ x, y });

    // Subtle 3D tilt effect
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 6;
    const rotateX = ((centerY - y) / centerY) * 6;
    setTilt({ rotateX, rotateY });
  }, [playOnce, hasPlayed]);

  const handleMouseEnter = useCallback(() => {
    if (playOnce && hasPlayed) return;
    setIsHovered(true);
  }, [playOnce, hasPlayed]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setGlarePos({ x: -100, y: -100 });
    setTilt({ rotateX: 0, rotateY: 0 });
    if (playOnce) setHasPlayed(true);
  }, [playOnce]);

  const glareBackground = `radial-gradient(circle ${glareSize}px at ${glarePos.x}px ${glarePos.y}px, ${glareColor} 0%, transparent 70%)`;

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        overflow: 'hidden',
        transform: isHovered
          ? `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(1.02)`
          : 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: `transform ${transitionDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`,
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
      {/* Glare overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: glareBackground,
          opacity: isHovered ? glareOpacity : 0,
          transition: `opacity ${transitionDuration}ms ease`,
          pointerEvents: 'none',
          zIndex: 10,
          borderRadius: 'inherit',
          mixBlendMode: 'soft-light',
        }}
      />
      {/* Shimmer edge highlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          border: isHovered ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
          transition: `border ${transitionDuration}ms ease`,
          pointerEvents: 'none',
          zIndex: 11,
        }}
      />
    </div>
  );
}
