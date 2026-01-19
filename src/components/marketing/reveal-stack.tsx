"use client"

import { Children, cloneElement, isValidElement, ReactNode } from "react"

interface RevealStackProps {
  children: ReactNode
  /** Base delay before first item starts (ms) */
  baseDelay?: number
  /** Delay between each item (ms) */
  stagger?: number
  /** Animation duration (ms) */
  duration?: number
}

/**
 * RevealStack - Animates children sequentially on load (top to bottom)
 * 
 * Each child animates from: opacity 0, translateY(18px), blur(10px)
 * to: opacity 1, translateY(0), blur(0)
 * 
 * Respects prefers-reduced-motion.
 * 
 * Usage:
 * <RevealStack>
 *   <Section1 />
 *   <Section2 />
 *   <Section3 />
 * </RevealStack>
 * 
 * TODO: Apply to other marketing pages:
 * - /waitlist/page.tsx
 * - /hosts/page.tsx
 * - /creators/page.tsx
 * - /how-to/hosts/page.tsx
 * - /how-to/creators/page.tsx
 * - /pricing/page.tsx
 * - /privacy/page.tsx
 * - /trust-safety/page.tsx
 */
export function RevealStack({
  children,
  baseDelay = 50,
  stagger = 90,
  duration = 500,
}: RevealStackProps) {
  const childArray = Children.toArray(children)

  return (
    <>
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return child

        const delay = baseDelay + index * stagger

        return (
          <div
            key={index}
            className="reveal-item"
            style={{
              "--reveal-delay": `${delay}ms`,
              "--reveal-duration": `${duration}ms`,
            } as React.CSSProperties}
          >
            {child}
          </div>
        )
      })}

      {/* Inline styles for animation - scoped and respects reduced motion */}
      <style jsx global>{`
        .reveal-item {
          animation: revealUp var(--reveal-duration, 500ms) ease-out forwards;
          animation-delay: var(--reveal-delay, 0ms);
          opacity: 0;
          transform: translateY(18px);
          filter: blur(10px);
        }

        @keyframes revealUp {
          from {
            opacity: 0;
            transform: translateY(18px);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal-item {
            animation: none;
            opacity: 1;
            transform: none;
            filter: none;
          }
        }
      `}</style>
    </>
  )
}
