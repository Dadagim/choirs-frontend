import React from "react";

const BrandPulseLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-4">
        {/* Pulsing Ring */}
        <div className="absolute h-20 w-20 animate-ping rounded-full border-4 border-indigo-200 opacity-75"></div>
        
        {/* Logo / Brand Icon - Replace with your own logo or SVG */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white shadow-lg">
          E
        </div>
        
        {/* Text */}
        <h2 className="text-xl font-semibold text-indigo-950">
          Loading <span className="animate-pulse">...</span>
        </h2>
      </div>
    </div>
  );
};

export default BrandPulseLoader;