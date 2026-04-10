import React from 'react';

export default function ProblemSection() {
    return (
        <section
            className="w-full min-h-[90vh] flex flex-col items-center justify-center px-6 py-24 text-center relative z-10"
            style={{ background: '#4d5bf9' }}
        >
            <div className="max-w-4xl mx-auto flex flex-col items-center">
                <h2
                    className="font-extrabold tracking-tight text-white mb-10 leading-[1.05]"
                    style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}
                >
                    <span className="block">Legacy systems are</span>
                    <span className="block">expensive, insecure,</span>
                    <span className="block">and stall innovation.</span>
                </h2>

                <p
                    className="text-white/90 font-medium max-w-lg leading-snug text-center"
                    style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)' }}
                >
                    Older software cannot update at the<br className="hidden sm:block" />
                    speed of government change.
                </p>
            </div>
        </section>
    );
}
