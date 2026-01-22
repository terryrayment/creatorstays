"use client"

import { useEffect, useState } from "react"

export default function ShortLinkHome() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden relative">
      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large slow orbit */}
        <div 
          className="absolute top-1/2 left-1/2"
          style={{
            transform: "translate(-50%, -50%)",
            animation: mounted ? "orbit 20s linear infinite" : "none",
          }}
        >
          <div 
            className="w-3 h-3 rounded-full bg-white/20"
            style={{ transform: "translateX(120px)" }}
          />
        </div>
        
        {/* Medium orbit */}
        <div 
          className="absolute top-1/2 left-1/2"
          style={{
            transform: "translate(-50%, -50%)",
            animation: mounted ? "orbit 12s linear infinite reverse" : "none",
          }}
        >
          <div 
            className="w-2 h-2 rounded-full bg-white/30"
            style={{ transform: "translateX(80px)" }}
          />
        </div>
        
        {/* Small fast orbit */}
        <div 
          className="absolute top-1/2 left-1/2"
          style={{
            transform: "translate(-50%, -50%)",
            animation: mounted ? "orbit 8s linear infinite" : "none",
          }}
        >
          <div 
            className="w-1.5 h-1.5 rounded-full bg-white/40"
            style={{ transform: "translateX(45px)" }}
          />
        </div>
      </div>

      {/* Center pulsing element */}
      <div className="relative z-10">
        {/* Outer glow ring */}
        <div 
          className="absolute -inset-8 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
            animation: mounted ? "pulse-ring 3s ease-in-out infinite" : "none",
          }}
        />
        
        {/* Inner glow */}
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 0 60px rgba(255,255,255,0.08), inset 0 0 30px rgba(255,255,255,0.03)",
            animation: mounted ? "breathe 4s ease-in-out infinite" : "none",
          }}
        >
          <div 
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.5)",
              animation: mounted ? "pulse-dot 2s ease-in-out infinite" : "none",
            }}
          />
        </div>
      </div>

      {/* Ambient gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.015) 0%, transparent 50%)",
        }}
      />

      {/* Styles */}
      <style jsx>{`
        @keyframes orbit {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
        
        @keyframes pulse-dot {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.9;
          }
        }
        
        @keyframes pulse-ring {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
