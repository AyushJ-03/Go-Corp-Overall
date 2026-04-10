import React, { useEffect, useRef, useState } from 'react';

export default function TrustedSection() {
  const sectionRef = useRef(null);
  const [opacity, setOpacity] = useState(0);
  const [transform, setTransform] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const scrollY = window.scrollY;
      const viewportH = window.innerHeight;

      // Section starts when SpeedEfficiencySection ends
      const sectionTop = rect.top + scrollY;
      const relScroll = scrollY - (sectionTop - viewportH);

      // Calculate animation progress
      const triggerDistance = viewportH * 1.5; // Distance over which animation happens
      const progress = Math.min(Math.max(relScroll / triggerDistance, 0), 1);

      setOpacity(progress);
      setTransform(progress * 50); // Transform from 50px below to 0
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initialize

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative w-full"
      style={{ height: '300vh', background: 'white' }}
    >
      {/* ── STICKY DARK OVERLAY CONTAINER ─────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          zIndex: 50,
        }}
      >
        {/* ── BACKGROUND BLUR ELEMENTS ── */}
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <div
            className="absolute w-[50rem] h-[50rem] rounded-full blur-[150px] opacity-[0.08]"
            style={{
              background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
              left: '-15%',
              top: '30%',
            }}
          />
          <div
            className="absolute w-[45rem] h-[45rem] rounded-full blur-[150px] opacity-[0.06]"
            style={{
              background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
              right: '-10%',
              bottom: '10%',
            }}
          />
        </div>

        {/* ── CONTENT ── */}
        <div
          style={{
            opacity: opacity,
            transform: `translateY(${(1 - opacity) * 50}px)`,
            transition: 'none',
            pointerEvents: opacity > 0.1 ? 'auto' : 'none',
          }}
          className="text-center z-20 relative px-4 max-w-5xl"
        >
          <h2
            className="font-black text-white leading-tight mb-12"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
              letterSpacing: '-0.02em',
              lineHeight: '1.15',
            }}
          >
            Trusted by governments nationwide to deliver real outcomes.
          </h2>

          <button
            className="px-12 py-4 rounded-full font-bold text-white text-lg shadow-[0_10px_40px_-10px_rgba(79,70,229,0.6)] transition-all hover:scale-105 active:scale-95"
            style={{ 
              background: '#4f46e5',
              cursor: opacity > 0.1 ? 'pointer' : 'default',
            }}
          >
            Learn More About Our Impact
          </button>
        </div>
      </div>
    </div>
  );
}
