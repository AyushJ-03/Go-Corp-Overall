import React, { useEffect, useRef, useState, useCallback } from 'react';

const TOTAL_FRAMES = 147;
const LOCK_AT_FRAME = 22; // Page scroll locks when this frame becomes visible

function getFrameSrc(index) {
  const num = String(index).padStart(3, '0');
  const delay = index % 3 === 0 ? '0.041s' : '0.042s';
  return `/assets/ezgif-split/frame_${num}_delay-${delay}.webp`;
}

const PROGRAM_NAMES = [
  'WIC & FMNP',
  'SNAP',
  'SUN Bucks',
  'Medicaid IE&E',
  'TANF',
  'CHIP',
  'Medicaid',
];

export default function SpeedEfficiencySection() {
  const sectionRef = useRef(null);

  const [frameIndex, setFrameIndex] = useState(0);
  const [phase, setPhase] = useState('intro');
  const [laptopY, setLaptopY] = useState(0);
  const [contentProgress, setContentProgress] = useState(0);
  const [tickerOffset, setTickerOffset] = useState(0);

  // ── Scroll-lock state (all in refs to avoid stale closures) ──────────────
  const isLockedRef = useRef(false);       // are we currently locking page scroll?
  const lockScrollYRef = useRef(0);        // window.scrollY at the moment we locked
  const frameProgressRef = useRef(0);      // 0–1 progress through the locked frame range
  const wheelAccumRef = useRef(0);         // accumulated wheel delta while locked
  const touchStartYRef = useRef(null);     // touch start Y for mobile

  // How many "virtual" px of wheel delta drives all frames from LOCK_AT_FRAME → TOTAL_FRAMES
  const WHEEL_TOTAL = 2400;

  // Preload frames
  useEffect(() => {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);
    }
  }, []);

  // ── Derived helpers ───────────────────────────────────────────────────────
  const applyState = useCallback((currentFrameIndex, currentPhase, currentLaptopY, currentContentProgress) => {
    setFrameIndex(currentFrameIndex);
    setPhase(currentPhase);
    setLaptopY(currentLaptopY);
    setContentProgress(currentContentProgress);
  }, []);

  // ── Lock / unlock helpers ─────────────────────────────────────────────────
  const lockScroll = useCallback(() => {
    if (isLockedRef.current) return;
    isLockedRef.current = true;
    lockScrollYRef.current = window.scrollY;
    wheelAccumRef.current = 0;
    document.body.style.overflow = 'hidden'; // belt-and-suspenders
  }, []);

  const unlockScroll = useCallback((direction = 'forward') => {
    if (!isLockedRef.current) return;
    isLockedRef.current = false;
    document.body.style.overflow = '';

    // Teleport the window scroll to keep visual continuity
    if (direction === 'forward') {
      // Jump to just past the lock point so normal scroll continues forward
      window.scrollTo({ top: lockScrollYRef.current + 1, behavior: 'instant' });
    } else {
      // Scrolling back – jump to just before lock point
      window.scrollTo({ top: lockScrollYRef.current - 1, behavior: 'instant' });
    }
  }, []);

  // ── Main effect ───────────────────────────────────────────────────────────
  useEffect(() => {
    let raf;

    // ── Normal scroll handler (only active when NOT locked) ──────────────
    const onScroll = () => {
      if (isLockedRef.current || !sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const scrollY = window.scrollY;
      const viewportH = window.innerHeight;

      const sectionTop = rect.top + scrollY;
      const relScroll = scrollY - (sectionTop - viewportH * 0.2);

      const openingTravel = viewportH * 1.5;
      const revealTravel = viewportH * 2.5;

      // Calculate what frame we're at naturally
      const naturalT = Math.max(relScroll / openingTravel, 0);
      const naturalFrame = Math.min(Math.floor(naturalT * TOTAL_FRAMES), TOTAL_FRAMES - 1);

      // ── Hit the lock threshold ────────────────────────────────────────
      if (naturalFrame >= LOCK_AT_FRAME && naturalFrame < TOTAL_FRAMES && relScroll >= 0 && relScroll < openingTravel) {
        lockScroll();
        frameProgressRef.current = 0;
        applyState(LOCK_AT_FRAME, 'opening', -((LOCK_AT_FRAME / TOTAL_FRAMES) * 100), 0);
        return;
      }

      // ── Normal phase logic (before lock or after all frames done) ─────
      if (relScroll < 0) {
        applyState(0, 'intro', 0, 0);
      } else if (relScroll < openingTravel) {
        const t = relScroll / openingTravel;
        applyState(
          Math.min(Math.floor(t * TOTAL_FRAMES), TOTAL_FRAMES - 1),
          'opening',
          -t * 100,
          0
        );
      } else if (relScroll < revealTravel) {
        const t = (relScroll - openingTravel) / (revealTravel - openingTravel);
        applyState(TOTAL_FRAMES - 1, 'sticky', -100, Math.min(Math.max(t, 0), 1));
      } else {
        applyState(TOTAL_FRAMES - 1, 'done', -100, 1);
      }
    };

    // ── Wheel handler (active when locked) ───────────────────────────────
    const onWheel = (e) => {
      if (!isLockedRef.current) return;
      e.preventDefault();

      const delta = e.deltaY;
      wheelAccumRef.current += delta;

      if (delta > 0) {
        // Scrolling DOWN → advance frames
        const progress = Math.min(Math.max(wheelAccumRef.current / WHEEL_TOTAL, 0), 1);
        frameProgressRef.current = progress;

        const lockedRange = TOTAL_FRAMES - LOCK_AT_FRAME;
        const currentFrame = Math.min(
          LOCK_AT_FRAME + Math.floor(progress * lockedRange),
          TOTAL_FRAMES - 1
        );
        const laptopT = (LOCK_AT_FRAME / TOTAL_FRAMES) + progress * (lockedRange / TOTAL_FRAMES);

        applyState(currentFrame, 'opening', -laptopT * 100, 0);

        if (wheelAccumRef.current >= WHEEL_TOTAL) {
          // All frames done → release scroll forward
          applyState(TOTAL_FRAMES - 1, 'opening', -100, 0);
          unlockScroll('forward');
        }
      } else {
        // Scrolling UP → reverse; if we've gone past the start of locked range, release backward
        const progress = Math.min(Math.max(wheelAccumRef.current / WHEEL_TOTAL, 0), 1);
        frameProgressRef.current = progress;

        const lockedRange = TOTAL_FRAMES - LOCK_AT_FRAME;
        const currentFrame = Math.min(
          LOCK_AT_FRAME + Math.floor(progress * lockedRange),
          TOTAL_FRAMES - 1
        );

        applyState(currentFrame, 'opening', -((LOCK_AT_FRAME / TOTAL_FRAMES) * 100), 0);

        if (wheelAccumRef.current <= 0) {
          applyState(LOCK_AT_FRAME, 'opening', -((LOCK_AT_FRAME / TOTAL_FRAMES) * 100), 0);
          unlockScroll('backward');
        }
      }
    };

    // ── Touch handlers (mobile) ──────────────────────────────────────────
    const onTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (!isLockedRef.current) return;
      e.preventDefault();

      const delta = (touchStartYRef.current - e.touches[0].clientY) * 2; // scale touch
      touchStartYRef.current = e.touches[0].clientY;
      wheelAccumRef.current += delta;

      const progress = Math.min(Math.max(wheelAccumRef.current / WHEEL_TOTAL, 0), 1);
      const lockedRange = TOTAL_FRAMES - LOCK_AT_FRAME;
      const currentFrame = Math.min(
        LOCK_AT_FRAME + Math.floor(progress * lockedRange),
        TOTAL_FRAMES - 1
      );
      const laptopT = (LOCK_AT_FRAME / TOTAL_FRAMES) + progress * (lockedRange / TOTAL_FRAMES);

      applyState(currentFrame, 'opening', -laptopT * 100, 0);

      if (wheelAccumRef.current >= WHEEL_TOTAL) {
        applyState(TOTAL_FRAMES - 1, 'opening', -100, 0);
        unlockScroll('forward');
      } else if (wheelAccumRef.current <= 0) {
        unlockScroll('backward');
      }
    };

    // ── Ticker (runs always) ─────────────────────────────────────────────
    let tickerStart = null;
    const animTicker = (ts) => {
      if (!tickerStart) tickerStart = ts;
      setTickerOffset(((ts - tickerStart) * 0.04) % 100);
      raf = requestAnimationFrame(animTicker);
    };
    raf = requestAnimationFrame(animTicker);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    onScroll(); // init

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      cancelAnimationFrame(raf);
      // Always clean up body overflow on unmount
      document.body.style.overflow = '';
    };
  }, [applyState, lockScroll, unlockScroll]);

  const solutionsTranslateY = `${(1 - contentProgress) * 50}vh`;
  const solutionsOpacity = Math.min(contentProgress * 2, 1);
  const isSticky = phase === 'sticky' || phase === 'done';

  return (
    <div
      ref={sectionRef}
      className="relative w-full"
      style={{ height: '500vh', background: 'white' }}
    >
      {/* ── STICKY CONTAINER ───────────────────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* ── HEADING BLOCK ── */}
        <div
          className="text-center z-20 relative px-4"
          style={{
            paddingTop: 'clamp(3rem, 10vh, 7rem)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
            opacity: phase === 'intro' || phase === 'opening' ? 1 : 0,
            transform: phase === 'intro' || phase === 'opening' ? 'translateY(0)' : 'translateY(-50px)',
          }}
        >
          <h2
            className="font-extrabold tracking-tight leading-[1.1] mb-8"
            style={{ fontSize: 'clamp(3rem, 7.5vw, 6rem)' }}
          >
            <span
              style={{
                background: 'linear-gradient(90deg, #ec4899 0%, #a855f7 40%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Speed &amp; Efficiency
            </span>
            <br />
            <span style={{ color: '#111827' }}>are our priority.</span>
          </h2>

          <button
            className="px-10 py-4 rounded-full font-bold text-white text-[17px] shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] transition-all hover:scale-105 active:scale-95"
            style={{ background: '#4f46e5' }}
          >
            Learn More About Our Vision
          </button>
        </div>

        {/* ── LAPTOP FRAME ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: `translateX(-50%) translateY(${laptopY}px)`,
            width: 'min(980px, 95vw)',
            zIndex: 30,
            marginTop: 'auto',
          }}
        >
          <img
            src={getFrameSrc(frameIndex)}
            alt="Product Experience"
            className="w-full h-auto block select-none"
            style={{
              filter: 'brightness(1.08) contrast(1.08)',
              mixBlendMode: 'multiply',
            }}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>

        {/* ── STICKY SOLUTIONS CONTENT ── */}
        {isSticky && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-start z-10 pointer-events-none"
            style={{
              transform: `translateY(${solutionsTranslateY})`,
              opacity: solutionsOpacity,
            }}
          >
            <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
              <div
                className="absolute w-[40rem] h-[40rem] rounded-full blur-[120px] opacity-[0.15]"
                style={{
                  background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
                  left: '-10%',
                  top: '20%',
                }}
              />
              <div
                className="absolute w-[35rem] h-[35rem] rounded-full blur-[120px] opacity-[0.1]"
                style={{
                  background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
                  right: '-5%',
                  top: '10%',
                }}
              />
            </div>

            <p className="font-bold tracking-[0.3em] uppercase text-[#ec4899] text-xs md:text-sm mb-6 mt-[clamp(4rem, 15vh, 10rem)]">
              Our Vision
            </p>

            <h3
              className="font-black text-[#111827] leading-tight text-center mb-8"
              style={{ fontSize: 'clamp(3.5rem, 8vw, 6.5rem)', letterSpacing: '-0.04em' }}
            >
              Solutions for
            </h3>

            <div
              className="w-full overflow-hidden mb-12"
              style={{ position: 'relative', height: 'clamp(5rem, 12vw, 10rem)' }}
            >
              <div
                className="flex gap-20 absolute whitespace-nowrap items-center"
                style={{ transform: `translateX(-${tickerOffset}%)` }}
              >
                {[...PROGRAM_NAMES, ...PROGRAM_NAMES, ...PROGRAM_NAMES].map((name, i) => {
                  const isHighlighted = i % 3 === 1;
                  return (
                    <span
                      key={i}
                      className="font-black transition-all duration-500"
                      style={{
                        fontSize: 'clamp(4rem, 10vw, 8.5rem)',
                        color: isHighlighted ? '#111827' : '#11182708',
                        letterSpacing: '-0.05em',
                        padding: '0 10px',
                      }}
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>

            <p className="text-center max-w-2xl px-6 font-medium text-[#4b5563] text-lg md:text-xl leading-relaxed">
              Providing a seamless experience for both staff and residents, ensuring smoother
              operations, improved engagement, and better outcomes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}