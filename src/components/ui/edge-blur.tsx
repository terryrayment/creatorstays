/**
 * Shared atmospheric blur background
 * Use on pages/sections that need the subtle gradient glow effect
 */
export function EdgeBlur() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-40 -right-40 h-[700px] w-[700px] rounded-full bg-[hsl(199,89%,48%)]/6 blur-[200px]" />
      <div className="absolute -bottom-60 -left-40 h-[600px] w-[600px] rounded-full bg-[hsl(213,94%,45%)]/5 blur-[180px]" />
    </div>
  )
}

/**
 * Inline/relative version for sections (not fixed positioned)
 */
export function SectionBlur() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-[hsl(199,89%,48%)]/6 blur-[150px]" />
      <div className="absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-[hsl(213,94%,45%)]/5 blur-[120px]" />
    </div>
  )
}
