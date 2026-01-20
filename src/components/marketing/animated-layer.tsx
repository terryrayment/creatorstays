// Animated background layer for marketing pages
// Slush-style: slow float, fade/blur, geometric shapes

interface AnimatedLayerProps {
  variant?: 'hero' | 'section' | 'dark'
  className?: string
}

export function AnimatedLayer({ variant = 'hero', className = '' }: AnimatedLayerProps) {
  if (variant === 'hero') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
        {/* Large floating shapes */}
        <div className="anim-float absolute left-[5%] top-[10%] h-40 w-40 border-2 border-white/20" style={{ animationDelay: '0s' }} />
        <div className="anim-float absolute left-[20%] bottom-[15%] h-28 w-28 rounded-full border-2 border-white/15" style={{ animationDelay: '2s' }} />
        <div className="anim-float-reverse absolute left-[35%] top-[25%] h-20 w-48 bg-white/5" style={{ animationDelay: '1s' }} />
        
        {/* SVG line graphics */}
        <svg className="anim-fade absolute left-[8%] top-[40%] h-32 w-32 text-white/10" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ animationDelay: '0.5s' }}>
          <path d="M10 50 L50 10 L90 50 L50 90 Z" />
        </svg>
        
        <svg className="anim-fade absolute left-[28%] bottom-[25%] h-24 w-24 text-white/8" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ animationDelay: '3s' }}>
          <circle cx="50" cy="50" r="35" />
          <circle cx="50" cy="50" r="20" />
        </svg>
        
        {/* Blur blocks */}
        <div className="anim-blur absolute left-[15%] top-[60%] h-16 w-32 bg-white/10 blur-sm" style={{ animationDelay: '1.5s' }} />
        <div className="anim-blur absolute left-[30%] top-[15%] h-12 w-12 rounded-full bg-white/8 blur-sm" style={{ animationDelay: '2.5s' }} />
      </div>
    )
  }

  if (variant === 'dark') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
        {/* Floating shapes on dark bg */}
        <div className="anim-float absolute right-[10%] top-[15%] h-32 w-32 rounded-full border border-white/10" style={{ animationDelay: '0s' }} />
        <div className="anim-float-reverse absolute left-[8%] bottom-[20%] h-24 w-24 border border-white/8" style={{ animationDelay: '1.5s' }} />
        
        <svg className="anim-fade absolute right-[25%] bottom-[30%] h-20 w-20 text-white/5" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ animationDelay: '2s' }}>
          <path d="M20 80 L50 20 L80 80 Z" />
        </svg>
        
        <div className="anim-blur absolute left-[20%] top-[40%] h-40 w-40 rounded-full bg-white/[0.02] blur-xl" style={{ animationDelay: '0.5s' }} />
      </div>
    )
  }

  // section variant - lighter, subtler
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="anim-float absolute right-[5%] top-[10%] h-24 w-24 rounded-full border border-primary/10" style={{ animationDelay: '0s' }} />
      <div className="anim-float-reverse absolute left-[10%] bottom-[15%] h-16 w-16 border border-accent/10" style={{ animationDelay: '1s' }} />
      
      <div className="anim-blur absolute right-[20%] bottom-[25%] h-32 w-32 rounded-full bg-primary/[0.03] blur-xl" style={{ animationDelay: '2s' }} />
      <div className="anim-blur absolute left-[25%] top-[20%] h-24 w-24 rounded-full bg-accent/[0.02] blur-xl" style={{ animationDelay: '0.5s' }} />
    </div>
  )
}

// Graphic blocks for between sections
export function AnimatedDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-32 overflow-hidden ${className}`} aria-hidden="true">
      <div className="anim-slide absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      <div className="anim-float absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-8 w-8 rotate-45 border border-foreground/10" />
      </div>
    </div>
  )
}
