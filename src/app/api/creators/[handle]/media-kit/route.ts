import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// Mock creator data (same as profile page)
interface CreatorProfile {
  handle: string
  displayName: string
  bio: string
  location: string
  niches: string[]
  platforms: { instagram?: string; tiktok?: string; youtube?: string }
  stats: { followers: number | null; engagementRate: number | null; avgViews: number | null }
  dealPreferences: {
    types: string[]
    minimumFlatFee?: number
    minimumPercent?: number
    openToGiftedStays: boolean
  }
}

const mockCreators: Record<string, CreatorProfile> = {
  "sample-travel": {
    handle: "sample-travel",
    displayName: "Sample Travel Creator",
    bio: "Travel content creator helping vacation rentals tell their story through cinematic video and authentic storytelling.",
    location: "Los Angeles, CA",
    niches: ["Travel", "Lifestyle", "Adventure"],
    platforms: { instagram: "example", tiktok: "example", youtube: "example" },
    stats: { followers: 12400, engagementRate: 4.2, avgViews: 8500 },
    dealPreferences: { types: ["percent", "flat", "post-for-stay"], minimumFlatFee: 500, minimumPercent: 10, openToGiftedStays: true },
  },
  "sample-photo": {
    handle: "sample-photo",
    displayName: "Sample Photography Creator",
    bio: "Photography creator specializing in interiors and hospitality, creating scroll-stopping content that makes people want to book.",
    location: "Austin, TX",
    niches: ["Photography", "Interior Design", "Hospitality"],
    platforms: { instagram: "example", tiktok: "example" },
    stats: { followers: 8700, engagementRate: 5.1, avgViews: null },
    dealPreferences: { types: ["flat", "post-for-stay"], minimumFlatFee: 750, openToGiftedStays: true },
  },
  "sample-vlog": {
    handle: "sample-vlog",
    displayName: "Sample Vlog Creator",
    bio: "Vlog creator documenting unique accommodations and experiences, creating engaging day-in-the-life content that drives bookings.",
    location: "Miami, FL",
    niches: ["Travel", "Vlog", "Food & Hospitality"],
    platforms: { instagram: "example", youtube: "example", tiktok: "example" },
    stats: { followers: 15200, engagementRate: 3.8, avgViews: 12000 },
    dealPreferences: { types: ["percent", "post-for-stay"], minimumPercent: 15, openToGiftedStays: false },
  },
}

// Colors (Blue Horizon palette)
const PRIMARY = rgb(0.11, 0.47, 0.87) // #1C78DE
const ACCENT = rgb(0.0, 0.71, 0.89) // #00B5E2
const DARK = rgb(0.1, 0.1, 0.12)
const MUTED = rgb(0.45, 0.45, 0.5)
const LIGHT_BG = rgb(0.97, 0.98, 0.99)

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  const creator = mockCreators[params.handle.toLowerCase()]
  
  if (!creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
  }

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792]) // Letter size
  const { width, height } = page.getSize()
  
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  let y = height - 50
  
  // Header background
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: LIGHT_BG })
  
  // CreatorStays wordmark
  page.drawText('CreatorStays', { x: 50, y: height - 45, size: 20, font: helveticaBold, color: PRIMARY })
  page.drawText('Media Kit', { x: 50, y: height - 65, size: 12, font: helvetica, color: MUTED })
  
  // Date
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  page.drawText(today, { x: width - 150, y: height - 55, size: 10, font: helvetica, color: MUTED })
  
  y = height - 110
  
  // Creator name and handle
  page.drawText(creator.displayName, { x: 50, y, size: 22, font: helveticaBold, color: DARK })
  y -= 20
  page.drawText(`@${creator.handle}`, { x: 50, y, size: 12, font: helvetica, color: PRIMARY })
  y -= 16
  page.drawText(creator.location, { x: 50, y, size: 11, font: helvetica, color: MUTED })
  
  y -= 30
  
  // Bio
  page.drawText('About', { x: 50, y, size: 11, font: helveticaBold, color: MUTED })
  y -= 16
  // Word wrap bio
  const bioWords = creator.bio.split(' ')
  let line = ''
  const maxWidth = 320
  for (const word of bioWords) {
    const testLine = line + (line ? ' ' : '') + word
    const textWidth = helvetica.widthOfTextAtSize(testLine, 10)
    if (textWidth > maxWidth && line) {
      page.drawText(line, { x: 50, y, size: 10, font: helvetica, color: DARK })
      y -= 14
      line = word
    } else {
      line = testLine
    }
  }
  if (line) {
    page.drawText(line, { x: 50, y, size: 10, font: helvetica, color: DARK })
    y -= 14
  }
  
  y -= 20
  
  // Divider
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) })
  y -= 25
  
  // Stats section - right side box
  const statsX = 380
  const statsY = height - 140
  page.drawRectangle({ x: statsX - 10, y: statsY - 130, width: 190, height: 145, color: LIGHT_BG, borderColor: rgb(0.92, 0.92, 0.94), borderWidth: 1 })
  
  page.drawText('Audience Stats', { x: statsX, y: statsY - 5, size: 10, font: helveticaBold, color: MUTED })
  
  const formatNumber = (n: number | null) => {
    if (n === null) return '—'
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
  }
  
  let statY = statsY - 28
  const statItems = [
    { label: 'Instagram', value: creator.platforms.instagram ? formatNumber(creator.stats.followers) : '—' },
    { label: 'TikTok', value: creator.platforms.tiktok ? formatNumber(creator.stats.followers ? Math.floor(creator.stats.followers * 0.7) : null) : '—' },
    { label: 'YouTube', value: creator.platforms.youtube ? formatNumber(creator.stats.followers ? Math.floor(creator.stats.followers * 0.25) : null) : '—' },
    { label: 'Avg Views', value: formatNumber(creator.stats.avgViews) },
    { label: 'Engagement', value: creator.stats.engagementRate ? `${creator.stats.engagementRate}%` : '—' },
  ]
  
  for (const stat of statItems) {
    page.drawText(stat.label, { x: statsX, y: statY, size: 9, font: helvetica, color: MUTED })
    page.drawText(stat.value, { x: statsX + 120, y: statY, size: 9, font: helveticaBold, color: DARK })
    statY -= 18
  }
  
  page.drawText('Last synced: Just now', { x: statsX, y: statY - 5, size: 8, font: helvetica, color: rgb(0.6, 0.6, 0.65) })
  
  // Niches
  page.drawText('Niches', { x: 50, y, size: 11, font: helveticaBold, color: MUTED })
  y -= 18
  page.drawText(creator.niches.join('  •  '), { x: 50, y, size: 10, font: helvetica, color: DARK })
  
  y -= 35
  
  // Deliverables
  page.drawText('Typical Deliverables', { x: 50, y, size: 11, font: helveticaBold, color: MUTED })
  y -= 18
  const deliverables = ['Feed Posts', 'Reels / Short Video', 'Story Coverage']
  for (const d of deliverables) {
    page.drawText(`• ${d}`, { x: 55, y, size: 10, font: helvetica, color: DARK })
    y -= 16
  }
  
  y -= 20
  
  // Deal preferences
  page.drawText('Deal Preferences', { x: 50, y, size: 11, font: helveticaBold, color: MUTED })
  y -= 18
  
  const dealTypeLabels: Record<string, string> = {
    percent: 'Commission-based',
    flat: 'Flat fee',
    'post-for-stay': 'Post-for-stay'
  }
  
  page.drawText(`Deal types: ${creator.dealPreferences.types.map(t => dealTypeLabels[t] || t).join(', ')}`, { x: 50, y, size: 10, font: helvetica, color: DARK })
  y -= 16
  
  if (creator.dealPreferences.minimumFlatFee) {
    page.drawText(`Min flat fee: $${creator.dealPreferences.minimumFlatFee}`, { x: 50, y, size: 10, font: helvetica, color: DARK })
    y -= 16
  }
  if (creator.dealPreferences.minimumPercent) {
    page.drawText(`Min commission: ${creator.dealPreferences.minimumPercent}%`, { x: 50, y, size: 10, font: helvetica, color: DARK })
    y -= 16
  }
  page.drawText(`Open to gifted stays: ${creator.dealPreferences.openToGiftedStays ? 'Yes' : 'No'}`, { x: 50, y, size: 10, font: helvetica, color: DARK })
  
  y -= 35
  
  // Platforms / Contact
  page.drawText('Platform Links', { x: 50, y, size: 11, font: helveticaBold, color: MUTED })
  y -= 18
  
  if (creator.platforms.instagram) {
    page.drawText(`Instagram: instagram.com/${creator.platforms.instagram}`, { x: 50, y, size: 10, font: helvetica, color: PRIMARY })
    y -= 16
  }
  if (creator.platforms.tiktok) {
    page.drawText(`TikTok: tiktok.com/@${creator.platforms.tiktok}`, { x: 50, y, size: 10, font: helvetica, color: PRIMARY })
    y -= 16
  }
  if (creator.platforms.youtube) {
    page.drawText(`YouTube: youtube.com/@${creator.platforms.youtube}`, { x: 50, y, size: 10, font: helvetica, color: PRIMARY })
    y -= 16
  }
  
  // Footer
  page.drawLine({ start: { x: 50, y: 50 }, end: { x: width - 50, y: 50 }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) })
  page.drawText(`Generated by CreatorStays • ${today}`, { x: 50, y: 35, size: 8, font: helvetica, color: MUTED })
  page.drawText('creatorstays.com', { x: width - 120, y: 35, size: 8, font: helvetica, color: PRIMARY })
  
  const pdfBytes = await pdfDoc.save()
  
  return new Response(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="CreatorStays-MediaKit-@${creator.handle}.pdf"`,
    },
  })
}
