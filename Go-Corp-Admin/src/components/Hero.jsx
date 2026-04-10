import React from 'react';

export default function Hero() {
    return (
        <div className="relative min-h-[90vh] flex flex-col pt-12">
            {/* Background Video Layer */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <video
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover lg:object-contain scale-[1.3] lg:scale-100 opacity-90 mix-blend-screen"
                >
                    <source src="/assets/hero-waveform_VP9.webm" type="video/webm" />
                </video>
            </div>

            {/* Hero Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 pointer-events-none mt-16 pb-16">
                <h1 className="max-w-5xl mx-auto text-center font-extrabold tracking-tight text-white mb-10 leading-[1.05]" style={{ fontSize: 'clamp(3.5rem, 8vw, 6.5rem)' }}>
                    <span className="block drop-shadow-2xl">Rides that arrive</span>
                    <span className="block drop-shadow-2xl">Smarter.</span>
                </h1>
                <button className="pointer-events-auto bg-white hover:bg-gray-100 text-[#0f1115] px-8 py-3.5 rounded-full text-[16px] font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all">
                    Schedule a Demo
                </button>
            </main>
        </div>
    );
}
