"use client"

import { useEffect, useState } from "react"

export default function GonePage() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden relative">
      {/* Fading particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              left: `${20 + i * 12}%`,
              top: `${30 + (i % 3) * 15}%`,
              animation: mounted ? `fade-drift ${3 + i * 0.5}s ease-in-out infinite` : "none",
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Center element - broken/faded */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Fading ring */}
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            animation: mounted ? "fade-breathe 3s ease-in-out infinite" : "none",
          }}
        >
          {/* Empty center - the dot is gone */}
          <div 
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              animation: mounted ? "flicker 2s ease-in-out infinite" : "none",
            }}
          />
        </div>
        
        {/* Subtle text */}
        <p 
          className="mt-8 text-xs tracking-[0.3em] uppercase"
          style={{
            color: "rgba(255,255,255,0.15)",
            animation: mounted ? "fade-in 1s ease-out 0.5s forwards" : "none",
            opacity: 0,
          }}
        >
          Gone
        </p>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes fade-drift {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.15;
          }
          50% {
            transform: translateY(-20px);
            opacity: 0.03;
          }
        }
        
        @keyframes fade-breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(0.95);
            opacity: 0.2;
          }
        }
        
        @keyframes flicker {
          0%, 100% {
            opacity: 0.08;
          }
          30% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.03;
          }
          70% {
            opacity: 0.1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
