import Image from "next/image"

// Available CGI images in the repo
export const MARKETING_IMAGES = [
  "/images/house-wifi-1.png",
  "/images/house-wifi-2.png", 
  "/images/house-wifi-3.png",
  "/images/luggage-1.png",
  "/images/luggage-2.png",
] as const

// Full-frame image block matching card styling
export function ImageBlock({ 
  src, 
  className = "",
  aspectRatio = "aspect-[4/3]"
}: { 
  src: string
  className?: string
  aspectRatio?: string
}) {
  return (
    <div 
      className={`block-hover relative overflow-hidden rounded-2xl border-[3px] border-black bg-[#F5F5F0] ${aspectRatio} ${className}`}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover transition-transform duration-200 hover:scale-[1.03]"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  )
}

// Get randomized non-repeating images for a page
export function getRandomImages(count: number, seed?: number): string[] {
  const shuffled = [...MARKETING_IMAGES]
  const s = seed ?? Math.floor(Math.random() * 1000)
  
  // Simple seeded shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(((s * (i + 1)) % 100) / 100 * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
