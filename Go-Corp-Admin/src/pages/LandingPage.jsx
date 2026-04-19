import React from 'react';
import { MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import ProblemSection from '../components/ProblemSection';
import AppShowcaseSection from '../components/AppShowcaseSection';
import ValuePropsSection from '../components/ValuePropsSection';


export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0f1115] text-white font-sans selection:bg-blue-500/30">
      {/* Navigation — fixed/sticky at z:100, always above everything */}
      <div style={{ position: 'relative', zIndex: 100 }}>
        <Navbar />
      </div>

      {/*
        Non-sticky sections: Hero, Gradient Bridge, ProblemSection.
        Safe to use overflow-x:hidden here because sticky isn't needed.
      */}
      <div style={{ overflowX: 'hidden', position: 'relative', zIndex: 1 }}>
        <Hero />

        {/* Gradient Bridge — logos on dark→blue gradient */}
        <div style={{ background: 'linear-gradient(to bottom, #0f1115 0%, #1a1a6a 30%, #3a3df5 65%, #4d5bf9 100%)' }}>
          <Footer />
          <div style={{ height: '6rem' }} />
        </div>

        {/* Legacy Systems — solid blue */}
        <ProblemSection />

        {/* App Showcase — lavender bg with phone mockup + video */}
        <AppShowcaseSection />

        {/* Value Props — scroll-driven oval cards */}
        <ValuePropsSection />


      </div>

      {/* Floating Chat Widget */}
      <button
        className="fixed bottom-6 right-6 bg-[#0084ff] hover:bg-[#0073e6] w-14 h-14 rounded-lg flex items-center justify-center shadow-2xl transition-transform hover:scale-105"
        style={{ zIndex: 200 }}
      >
        <div className="bg-black text-white p-2 rounded-full w-8 h-8 flex items-center justify-center">
          <MessageSquare size={18} fill="currentColor" strokeWidth={0} />
        </div>
      </button>

    </div>
  );
}
