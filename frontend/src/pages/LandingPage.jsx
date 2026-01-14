import React, { useEffect, useState } from 'react';
import { Download, Play, ArrowRight } from 'lucide-react';

const DashFlow = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#E6F0FF] font-sans overflow-hidden">
      {/* Background Split - Matching the image's blue section */}
      <div className="absolute right-0 top-0 h-full w-[45%] bg-[#4A8DFF] rounded-l-[100px] lg:rounded-l-[200px] z-0" />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-16 py-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#4A8DFF] rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-200">
            <span className="text-2xl font-black">D</span>
          </div>
          <span className="text-[#2D3E50] font-bold text-2xl">DashFlow</span>
        </div>

        <div className="hidden lg:flex gap-10 text-[#5F7D95] font-semibold text-sm tracking-wide">
          {['Top', 'For Everyone', 'Features', 'Preview', 'License'].map((item) => (
            <a key={item} href="#" className="hover:text-[#4A8DFF] transition-all">{item}</a>
          ))}
        </div>

        <button className="bg-white text-[#4A8DFF] px-10 py-3 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all">
          Download
        </button>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-16 flex flex-col lg:flex-row items-center pt-12">
        
        {/* Left Side: Content */}
        <div className="lg:w-1/2 space-y-8">
          <div className={`transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-[84px] font-bold text-[#2D3E50] leading-[1] mb-4">
              Premium Flow <br /> 
              For <span className="relative inline-block border-b-8 border-[#2D3E50] pb-2">Digital Teams</span>
            </h1>
            
            <p className="text-xl text-[#5F7D95] max-w-lg leading-relaxed pt-4">
              DashFlow social media content templates for branding, 
              marketing, insights, and more. Free for personal and commercial use!
            </p>
          </div>

          <div className={`flex gap-5 pt-6 transition-all duration-1000 delay-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
            <button className="flex items-center gap-3 bg-[#4A8DFF] text-white px-10 py-5 rounded-xl font-bold shadow-2xl shadow-blue-400 hover:scale-105 transition-all">
              <Download size={22} strokeWidth={3} />
              Explore Now
            </button>
            <button className="flex items-center gap-3 bg-[#D9E8FF] text-[#4A8DFF] px-10 py-5 rounded-xl font-bold hover:bg-white transition-all">
              <Play size={22} fill="currentColor" />
              See in Action
            </button>
          </div>
        </div>

        {/* Right Side: Sliding Cards Container */}
        <div className="lg:w-1/2 relative h-[700px] w-full mt-20 lg:mt-0 flex justify-center">
          
          {/* Vertical Sliding Columns */}
          <div className="flex gap-6 relative">
            
            {/* Column 1 - Sliding Down */}
            <div className="flex flex-col gap-6 animate-slide-v-slow">
              <Card color="bg-[#009292]" label="Analytics" delay="0s" />
              <Card color="bg-[#4E22B2]" label="Marketing" delay="0s" isLarge />
              <Card color="bg-[#009292]" label="Insights" delay="0s" />
            </div>

            {/* Column 2 - Sliding Up */}
            <div className="flex flex-col gap-6 pt-20 animate-slide-v-fast">
              <Card color="bg-[#1E1B4B]" label="Growth" delay="0.5s" isLarge />
              <Card color="bg-[#FFFFFF]" label="Preview" delay="0.5s" isWhite />
              <Card color="bg-[#1E1B4B]" label="Data" delay="0.5s" isLarge />
            </div>

          </div>
        </div>
      </main>

      {/* Global CSS for the Floating Effect */}
      <style jsx>{`
        @keyframes slide-vertical {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-40px); }
          100% { transform: translateY(0px); }
        }
        .animate-slide-v-slow {
          animation: slide-vertical 8s ease-in-out infinite;
        }
        .animate-slide-v-fast {
          animation: slide-vertical 10s ease-in-out infinite reverse;
        }
      `}</style>
    </div>
  );
};

// Sub-component for the UI cards
const Card = ({ color, label, isLarge, isWhite }) => (
  <div className={`
    ${isLarge ? 'w-64 h-80' : 'w-64 h-64'} 
    ${color} 
    rounded-[40px] shadow-2xl p-8 flex flex-col justify-between
    transform hover:scale-110 transition-transform duration-700
    ${isWhite ? 'border-4 border-dashed border-blue-100' : ''}
  `}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isWhite ? 'bg-blue-50' : 'bg-white/20'}`}>
      <div className={`w-4 h-4 rounded-full ${isWhite ? 'bg-blue-200' : 'bg-white'}`} />
    </div>
    <div className={`font-bold text-xl ${isWhite ? 'text-blue-200' : 'text-white'}`}>
      {label}
    </div>
  </div>
);

export default DashFlow;