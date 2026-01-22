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
 * Each child animates from: opacity 0, translateY(18px)
 * to: opacity 1, translateY(0)
 * 
 * Respects prefers-reduced-motion.
 * 
 * Note: Removed blur filter as it causes text rendering issues in Safari.
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
          /* Safari rendering fixes */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
        }

        @keyframes revealUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* After animation completes, remove transform to fix Safari text rendering */
        .reveal-item[style] {
          animation-fill-mode: forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal-item {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </>
  )
}
