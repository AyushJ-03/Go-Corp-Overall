import React, { useEffect, useRef } from 'react';

export default function ValuePropsSection() {
  const sectionRef = useRef(null);
  const whiteOvalRef = useRef(null);
  const blackOvalRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const sectionH = section.offsetHeight;
      const winH = window.innerHeight;

      // scrolled amount within the section (negative scrollTop from top)
      const scrolled = -rect.top;
      const scrollable = sectionH - winH;
      const progress = Math.max(0, Math.min(1, scrolled / scrollable));

      // White oval: rises slowly
      if (whiteOvalRef.current) {
        whiteOvalRef.current.style.transform = `translateY(${-progress * 160}px)`;
      }
      // Black oval: rises faster (bigger parallax)
      if (blackOvalRef.current) {
        blackOvalRef.current.style.transform = `translateY(${-progress * 220}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    /*
      Section is 190vh tall so the user "scrolls through" 90vh of animation space.
      The visible content is sticky (100vh tall), so it remains in view while
      scroll progress drives the oval animations.
    */
    <section ref={sectionRef} style={{ minHeight: '190vh', position: 'relative' }}>

      {/* ─── STICKY VIEWPORT ─── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Two-tone split background */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Lavender top (matches AppShowcaseSection) */}
          <div style={{ flex: '0 0 42%', background: '#d8d0f5' }} />
          {/* Blue bottom */}
          <div style={{ flex: '1', background: '#4d5bf9' }} />
        </div>

        {/* ─── OVAL CARDS ─── */}
        <div
          style={{
            position: 'absolute',
            top: '22%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '2rem',
            zIndex: 10,
          }}
        >
          {/* White oval — Privacy at the core */}
          <div
            ref={whiteOvalRef}
            style={{
              background: '#f4efff',
              borderRadius: '50% / 50%',
              width: '240px',
              height: '360px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              willChange: 'transform',
              boxShadow: '0 12px 50px rgba(0,0,0,0.12)',
              flexShrink: 0,
            }}
          >
            {/* Shield icon */}
            <div style={{ marginBottom: '1.1rem' }}>
              <svg viewBox="0 0 24 24" width="38" height="38" fill="#4d5bf9">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5L12 1zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>
            <h3
              style={{
                fontSize: '1.65rem',
                fontWeight: '800',
                color: '#1a1033',
                lineHeight: '1.2',
                marginBottom: '1rem',
              }}
            >
              Privacy at<br />the core.
            </h3>
            <p
              style={{
                fontSize: '0.82rem',
                color: '#444',
                lineHeight: '1.6',
              }}
            >
              Built on a foundation of uncompromising standards and protocols, ensuring robust protection for corporate mobility data.
            </p>
          </div>

          {/* Black oval — Success at scale */}
          <div
            ref={blackOvalRef}
            style={{
              background: '#18181b',
              borderRadius: '50% / 50%',
              width: '240px',
              height: '360px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              willChange: 'transform',
              boxShadow: '0 12px 50px rgba(0,0,0,0.35)',
              flexShrink: 0,
            }}
          >
            {/* Trending-up icon */}
            <div style={{ marginBottom: '1.1rem' }}>
              <svg viewBox="0 0 24 24" width="38" height="38" fill="#ff3d7f">
                <circle cx="6" cy="18" r="2" />
                <circle cx="10" cy="14" r="2" />
                <circle cx="14" cy="16" r="2" />
                <circle cx="18" cy="10" r="2" />
                <circle cx="10" cy="10" r="1.2" opacity="0.4" />
                <circle cx="14" cy="10" r="1.2" opacity="0.4" />
                <circle cx="18" cy="14" r="1.2" opacity="0.4" />
                <circle cx="6" cy="14" r="1.2" opacity="0.4" />
              </svg>
            </div>
            <h3
              style={{
                fontSize: '1.65rem',
                fontWeight: '800',
                color: '#ffffff',
                lineHeight: '1.2',
                marginBottom: '1rem',
              }}
            >
              Success<br />at scale.
            </h3>
            <p
              style={{
                fontSize: '0.82rem',
                color: 'rgba(255,255,255,0.65)',
                lineHeight: '1.6',
              }}
            >
              Our enterprise platform ensures compliance and effortless fleet management, so you can focus on delivering results.
            </p>
          </div>
        </div>

        {/* ─── BOTTOM TEXT (revealed as ovals scroll away) ─── */}
        <div
          style={{
            position: 'absolute',
            bottom: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            textAlign: 'center',
            padding: '0 1.5rem',
            zIndex: 1,
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4.5vw, 3.5rem)',
              fontWeight: '800',
              color: '#ffffff',
              lineHeight: '1.15',
              marginBottom: '1.25rem',
            }}
          >
            Upgrade to a cost-effective<br />
            system that delivers<br />
            measurable ROI.
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '480px',
              margin: '0 auto',
              fontSize: '0.95rem',
              lineHeight: '1.65',
            }}
          >
            Reduce administrative burden, streamline workflows, and enhance employee mobility — all while cutting costs.
          </p>
        </div>
      </div>
    </section>
  );
}
