import React from 'react';

export default function AppShowcaseSection() {
  return (
    <section
      style={{ background: '#d8d0f5' }}
      className="relative w-full overflow-hidden"
    >
      {/* ── Text Block ── */}
      <div className="relative z-10 text-center px-6 pt-24 pb-10 max-w-3xl mx-auto">
        <h2
          className="font-extrabold tracking-tight text-[#1a1033] leading-[1.1] mb-6"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4.2rem)' }}
        >
          The first composable<br />
          AI system, built for rapid<br />
          policy change.
        </h2>
        <p
          className="text-[#1a1033]/60 font-medium"
          style={{ fontSize: 'clamp(0.85rem, 1.3vw, 1rem)' }}
        >
          Purpose-built for Corporate Mobility<br />
          and enterprise organisations.
        </p>
      </div>

      {/* ── Phone Mockup Block ── */}
      <div
        className="relative mx-auto"
        style={{ maxWidth: '900px', width: '100%' }}
      >
        {/* The decorative frame + phone outline image */}
        <img
          src="/assets/639a39df350e88c3dc3de9e4_homepage-appointments-loop-small_00000.webp"
          alt="App showcase frame"
          className="w-full block select-none pointer-events-none"
          style={{ userSelect: 'none' }}
        />

        {/*
          Video overlay — positioned to cover the phone screen inside the webp.
          The phone screen in the webp spans approximately:
            left: 39.5%, right: 61%  → width ≈ 21.5%
            top: 4.5%, bottom: 64%   → height ≈ 59.5%
          Adjust these if the screen alignment is off.
        */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: '4.5%',
            left: '39.5%',
            width: '21.5%',
            height: '59.5%',
            borderRadius: '2.2rem',
          }}
        >
          <video
            src="/assets/appointments-mobile-1.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
      </div>
    </section>
  );
}
