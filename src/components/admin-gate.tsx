'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * AdminGate - Developer Access passcode gate
 * 
 * IMPORTANT REGRESSION GUARD:
 * This component should ONLY be used for dev-only/prototype routes.
 * 
 * DO NOT use AdminGate on these routes (they need real auth, not dev passcode):
 * - /dashboard/*
 * - /beta/dashboard/*
 * - /onboarding/*
 * - /admin/login
 * - /hosts (signup flow)
 * - /waitlist
 * 
 * Authenticated users must access dashboards without passcode.
 * Use useSession() or getServerSession() for real authentication.
 */

const ADMIN_PASSCODE = '0606';
const STORAGE_KEY = 'cs_admin_access';

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    // Check if already authorized
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError(false);

    // Auto-advance to next input
    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Check if complete
    if (digit && index === 3) {
      const code = newDigits.join('');
      if (code === ADMIN_PASSCODE) {
        sessionStorage.setItem(STORAGE_KEY, 'true');
        setIsAuthorized(true);
      } else {
        setError(true);
        setDigits(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      
      if (pasted === ADMIN_PASSCODE) {
        sessionStorage.setItem(STORAGE_KEY, 'true');
        setIsAuthorized(true);
      } else {
        setError(true);
        setTimeout(() => {
          setDigits(['', '', '', '']);
          inputRefs[0].current?.focus();
        }, 500);
      }
    }
  };

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Authorized - show content
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Show passcode gate
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Creator<span className="text-amber-400">Stays</span>
          </h1>
          <p className="text-stone-500 text-sm mt-2">Developer Access</p>
        </div>

        {/* Passcode Entry */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8">
          <p className="text-stone-400 text-center text-sm mb-6">
            Enter passcode to access LIVE prototype
          </p>

          <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-14 h-16 text-center text-2xl font-mono rounded-xl border-2 bg-stone-800 text-white outline-none transition-all ${
                  error 
                    ? 'border-red-500 animate-shake' 
                    : digit 
                      ? 'border-amber-400' 
                      : 'border-stone-700 focus:border-amber-400'
                }`}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-center text-sm">
              Incorrect passcode
            </p>
          )}
        </div>

        {/* Info */}
        <p className="text-stone-600 text-xs text-center mt-6">
          This area is restricted to developers only.
          <br />
          Public users are directed to the beta version.
        </p>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
