"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LocationAutocomplete from "@/components/ui/location-autocomplete"

interface Property {
  id: string
  airbnbUrl?: string
  title?: string
  cityRegion?: string
  priceNightlyRange?: string
  rating?: number
  reviewCount?: number
  guests?: number
  beds?: number
  baths?: number
  amenities: string[]
  vibeTags: string[]
  houseRules?: Record<string, unknown>
  photos: string[]
  heroImageUrl?: string
  creatorBrief?: string
  isActive: boolean
  isDraft: boolean
  isBoosted?: boolean
  boostExpiresAt?: string
  lastImportedAt?: string
  createdAt: string
  updatedAt: string
}

type EditingProperty = Partial<Property> & { isNew?: boolean }

const COMMON_AMENITIES = ["WiFi", "Pool", "Hot Tub", "Kitchen", "Washer", "Dryer", "AC", "Heating", "Workspace", "TV", "Fireplace", "Gym", "Parking", "EV Charger", "BBQ", "Patio", "Beach Access", "Ski-in/Ski-out", "Pet Friendly", "Kid Friendly"]
const COMMON_VIBE_TAGS = ["Cozy", "Modern", "Rustic", "Luxury", "Minimal", "Bohemian", "Romantic", "Family", "Remote", "Urban", "Beachfront", "Mountain", "Lakeside", "Historic", "Eco-Friendly", "Unique", "Instagrammable", "Quiet", "Social", "Adventure"]

// Location suggestions for autocomplete
const LOCATION_SUGGESTIONS = [
  "Lake Arrowhead, CA",
  "Lake Tahoe, CA",
  "Big Bear Lake, CA",
  "Palm Springs, CA",
  "Joshua Tree, CA",
  "Malibu, CA",
  "Santa Barbara, CA",
  "San Diego, CA",
  "Los Angeles, CA",
  "San Francisco, CA",
  "Napa Valley, CA",
  "Aspen, CO",
  "Denver, CO",
  "Vail, CO",
  "Telluride, CO",
  "Austin, TX",
  "Scottsdale, AZ",
  "Sedona, AZ",
  "Miami Beach, FL",
  "Key West, FL",
  "Nashville, TN",
  "Gatlinburg, TN",
  "Savannah, GA",
  "Charleston, SC",
  "New Orleans, LA",
  "Portland, OR",
  "Seattle, WA",
  "Maui, HI",
  "Oahu, HI",
  "Park City, UT",
  "Moab, UT",
  "Jackson Hole, WY",
  "Bozeman, MT",
  "Bend, OR",
  "Carmel, CA",
  "Monterey, CA",
  "Laguna Beach, CA",
  "Newport Beach, CA",
]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function getChecklist(p: EditingProperty): { label: string; done: boolean }[] {
  return [
    { label: "Airbnb URL", done: !!p.airbnbUrl },
    { label: "Title", done: !!p.title },
    { label: "City/region", done: !!p.cityRegion },
    { label: "3+ photos", done: (p.photos?.length || 0) >= 3 },
    { label: "Price range", done: !!p.priceNightlyRange },
    { label: "Guests/beds/baths", done: !!p.guests && !!p.beds && !!p.baths },
    { label: "5+ amenities", done: (p.amenities?.length || 0) >= 5 },
    { label: "Vibe tags", done: (p.vibeTags?.length || 0) >= 1 },
    { label: "Creator brief", done: !!p.creatorBrief && p.creatorBrief.length > 20 },
  ]
}

function PropertyListItem({ property, isSelected, onSelect }: { property: Property; isSelected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className={`w-full rounded-lg border-2 border-black p-3 text-left transition-all ${isSelected ? 'bg-[#FFD84A]' : 'bg-white hover:bg-gray-50'}`}>
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded border-2 border-black bg-gray-100">
          {property.heroImageUrl ? <img src={property.heroImageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-lg text-black/30"></div>}
          {property.isBoosted && (
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#28D17C] text-[10px]"></div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-black">{property.title || 'Untitled'}</p>
          <p className="text-[11px] text-black/60">{property.cityRegion || 'No location'}</p>
          <div className="mt-1 flex items-center gap-2">
            {property.isBoosted && (
              <span className="rounded-full border border-[#28D17C] bg-[#28D17C]/20 px-1.5 py-0.5 text-[9px] font-bold text-black">Boosted</span>
            )}
            <span className={`rounded-full border border-black px-1.5 py-0.5 text-[9px] font-bold ${property.isDraft ? 'bg-amber-100 text-black' : 'bg-emerald-100 text-black'}`}>{property.isDraft ? 'Draft' : 'Published'}</span>
            <span className="text-[9px] text-black/50">{formatDate(property.updatedAt)}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

function ChipSelector({ options, selected, onChange, label }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; label: string }) {
  const toggle = (opt: string) => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])
  return (
    <div>
      <label className="mb-2 block text-[11px] font-bold text-black">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => toggle(opt)} className={`rounded-full border-2 px-2.5 py-1 text-[11px] font-medium transition-colors ${selected.includes(opt) ? 'border-black bg-[#FFD84A] text-black' : 'border-black bg-white text-black hover:bg-black/[0.02]'}`}>{opt}</button>
        ))}
      </div>
    </div>
  )
}

function PropertyEditor({ property, onSave, onDelete, isSaving, saveSuccess, onStepChange, showBoost, onBoost, isBoosted, onCancelBoost, publishedCount, onUpgrade }: { property: EditingProperty; onSave: (data: EditingProperty) => void; onDelete?: () => void; isSaving: boolean; saveSuccess: boolean; onStepChange?: (step: number) => void; showBoost?: boolean; onBoost?: () => void; isBoosted?: boolean; onCancelBoost?: () => void; publishedCount?: number; onUpgrade?: () => void }) {
  const [form, setForm] = useState<EditingProperty>(property)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => { setForm(property); setStep(1) }, [property])
  useEffect(() => { 
    onStepChange?.(step)
    // Scroll to top when step changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step, onStepChange])

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setIsUploading(true)
    const newPhotos: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // Convert to base64 data URL for demo (in production, upload to cloud storage)
      const reader = new FileReader()
      await new Promise<void>((resolve) => {
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            newPhotos.push(reader.result)
          }
          resolve()
        }
        reader.readAsDataURL(file)
      })
    }
    
    setForm(prev => ({
      ...prev,
      photos: [...(prev.photos || []), ...newPhotos],
      heroImageUrl: prev.heroImageUrl || newPhotos[0]
    }))
    setIsUploading(false)
    e.target.value = '' // Reset input
  }

  // Remove photo
  const removePhoto = (index: number) => {
    setForm(prev => {
      const newPhotos = [...(prev.photos || [])]
      const removed = newPhotos.splice(index, 1)[0]
      return {
        ...prev,
        photos: newPhotos,
        heroImageUrl: prev.heroImageUrl === removed ? newPhotos[0] : prev.heroImageUrl
      }
    })
  }

  // Filter out Airbnb branding images - be conservative
  const isAirbnbBranding = (url: string): boolean => {
    const lowerUrl = url.toLowerCase()
    
    // Only filter definite non-property images
    const definiteExclusions = [
      'airbnb-static',
      'airbnb_logo',
      'airbnb-logo',
      '/logo',
      'belo',
      'brandmark',
      '/platform-assets/',
      '/airbnb-platform-assets/',
      '/original_application/',
      '/users/',
      'im/users',
      '/miso/',
      '/lottie/',
      'mediacdn',
      '/em/',
      '/social/',
      '/category_icon/',
      '/icon/',
      '/icons/',
      '_icon',
      '-icon',
      'amenity',
      'category',
    ]
    
    for (const pattern of definiteExclusions) {
      if (lowerUrl.includes(pattern)) return true
    }
    
    // Check for very small dimensions (icons)
    const dimMatch = url.match(/\/(\d+)x(\d+)/)
    if (dimMatch && (parseInt(dimMatch[1]) < 100 || parseInt(dimMatch[2]) < 100)) {
      return true
    }
    
    // Filter PNG images that are likely icons (property photos are usually jpg/webp)
    if (lowerUrl.includes('.png') && 
        lowerUrl.includes('/pictures/') && 
        !lowerUrl.includes('hosting') && 
        !lowerUrl.includes('prohost')) {
      return true
    }
    
    return false
  }

  // Clean up photos by removing Airbnb branding
  const cleanupPhotos = () => {
    setForm(prev => {
      const cleanPhotos = (prev.photos || []).filter(p => !isAirbnbBranding(p))
      return {
        ...prev,
        photos: cleanPhotos,
        heroImageUrl: cleanPhotos.includes(prev.heroImageUrl || '') ? prev.heroImageUrl : cleanPhotos[0]
      }
    })
    setToast('Removed Airbnb branding images')
    setTimeout(() => setToast(null), 2000)
  }

  const handleImport = async () => {
    if (!form.airbnbUrl) return
    setIsImporting(true)
    setImportError(null)
    try {
      const res = await fetch(`/api/airbnb/prefill?url=${encodeURIComponent(form.airbnbUrl)}`)
      const data = await res.json()
      
      if (data.ok) {
        // Clean up title - remove rating, bedroom count, etc. that Airbnb adds
        let cleanTitle = data.title || ''
        cleanTitle = cleanTitle
          .replace(/\s*·\s*★[\d.]+/g, '')  // Remove rating with separator
          .replace(/★[\d.]+\s*/g, '')  // Remove rating without separator
          .replace(/\s*·?\s*\d+(?:\.\d+)?\s*bedrooms?\s*/gi, '')  // Remove bedroom count
          .replace(/\s*·?\s*\d+(?:\.\d+)?\s*beds?\s*/gi, '')  // Remove bed count
          .replace(/\s*·?\s*\d+(?:\.\d+)?\s*baths?\s*/gi, '')  // Remove bath count
          .replace(/\s*·?\s*\d+(?:\.\d+)?\s*guests?\s*/gi, '')  // Remove guest count
          .replace(/\s*·\s*\d+\s*$/g, '')  // Remove trailing numbers
          .replace(/\s*·\s*$/g, '')  // Remove trailing separator
          .replace(/\s+/g, ' ')  // Clean up extra spaces
          .trim()
        
        // Also clean up the city/region - remove descriptors like "a Lake Tahoe Estate"
        let cleanCity = data.cityRegion || ''
        cleanCity = cleanCity
          .replace(/^a\s+/i, '')  // Remove leading "a "
          .replace(/\s+(estate|retreat|house|home|cabin|villa|lodge|resort|property).*$/i, '')
          .trim()
        
        setForm(prev => ({
          ...prev,
          title: cleanTitle || prev.title,
          heroImageUrl: data.imageUrl || prev.heroImageUrl,
          cityRegion: cleanCity || prev.cityRegion,
          rating: data.rating || prev.rating,
          reviewCount: data.reviewCount || prev.reviewCount,
          priceNightlyRange: data.price || prev.priceNightlyRange,
          guests: data.guests || prev.guests,
          beds: data.beds || prev.beds,
          baths: data.baths || prev.baths,
          photos: data.photos || prev.photos,
          lastImportedAt: new Date().toISOString(),
        }))
        setStep(2)
      } else {
        setImportError(data.error || 'Could not fetch listing. Check URL and try again.')
      }
    } catch { 
      setImportError('Import failed. Enter details manually.') 
    }
    finally { setIsImporting(false) }
  }

  const generateBrief = () => {
    const tags = form.vibeTags?.join(', ') || 'cozy, unique'
    const location = form.cityRegion || 'this beautiful destination'
    setForm(prev => ({ ...prev, creatorBrief: `This ${tags} property in ${location} is perfect for creators looking for authentic, visually stunning content opportunities. Ideal for travel, lifestyle, and photography content. The space offers unique angles and natural lighting throughout the day.` }))
  }

  const handleSave = (asDraft: boolean) => {
    // Check if trying to publish when already have a published property (non-agency)
    if (!asDraft && publishedCount && publishedCount >= 1 && property.isNew) {
      setShowUpgradeModal(true)
      return
    }
    onSave({ ...form, isDraft: asDraft })
    setToast('Property saved!')
    setTimeout(() => setToast(null), 2000)
  }

  const checklist = getChecklist(form)
  const checklistComplete = checklist.filter(c => c.done).length
  const canPublish = checklistComplete >= 7

  return (
    <div className="rounded-xl border border-black/5 bg-white/60 p-5">
      {toast && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">{toast}</div>}

      <div className="mb-5 flex gap-1 rounded-lg bg-black/[0.03] p-1">
        {[1, 2, 3].map(s => {
          const isDisabled = s > 1 && !form.heroImageUrl && !form.title
          return (
            <button 
              key={s} 
              onClick={() => !isDisabled && setStep(s as 1 | 2 | 3)} 
              disabled={isDisabled}
              className={`flex-1 rounded-md py-2 text-xs font-medium transition-all ${step === s ? 'bg-white text-black shadow-sm' : isDisabled ? 'text-black/30 cursor-not-allowed' : 'text-black/60 hover:text-black'}`}
            >
              {s === 1 ? '1. Import' : s === 2 ? '2. Confirm' : '3. Brief'}
            </button>
          )
        })}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-black/60">Airbnb URL</label>
            <div className="flex gap-2">
              <Input value={form.airbnbUrl || ''} onChange={e => setForm({ ...form, airbnbUrl: e.target.value })} placeholder="https://airbnb.com/rooms/123456" className="flex-1" />
              <Button onClick={handleImport} disabled={!form.airbnbUrl || isImporting}>{isImporting ? 'Importing...' : 'Import'}</Button>
            </div>
            {importError && <p className="mt-1.5 text-[11px] text-amber-600">{importError}</p>}
          </div>
          {form.heroImageUrl && (
            <div className="rounded-lg border border-black/5 bg-black/[0.02] p-3">
              <div className="flex gap-4">
                <div className="h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-black/5"><img src={form.heroImageUrl} alt="" className="h-full w-full object-cover" /></div>
                <div>
                  <p className="text-sm font-medium">{form.title || 'Untitled'}</p>
                  <p className="text-[11px] text-black/60">{form.cityRegion || 'No location'}</p>
                  {form.lastImportedAt && <p className="mt-2 text-[10px] text-black/60">Last imported: {formatDate(form.lastImportedAt)}</p>}
                  <Button size="sm" variant="outline" className="mt-2 h-7 text-[10px]" onClick={handleImport} disabled={isImporting}>Refresh from Airbnb</Button>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setStep(2)} disabled={!form.heroImageUrl && !form.title}>Continue →</Button></div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-[11px] text-black/50">Verify details match your Airbnb listing.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1.5 block text-[11px] font-bold text-black">Title *</label><Input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Cozy Mountain Cabin" /></div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-black">City / Region *</label>
              <LocationAutocomplete
                value={form.cityRegion || ''} 
                onChange={val => setForm({ ...form, cityRegion: val })}
                placeholder="Start typing..." 
                className="flex h-10 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
              {form.cityRegion && !form.cityRegion.includes(',') && (
                <p className="mt-1 text-[10px] text-amber-600">Add state/region for better visibility (e.g., "Incline Village, NV")</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-black">Price/night *</label>
              <Input value={form.priceNightlyRange || ''} onChange={e => setForm({ ...form, priceNightlyRange: e.target.value })} placeholder="e.g. $150-$250" />
              {!form.priceNightlyRange && <p className="mt-1 text-[10px] text-red-500">Required</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-black">Guests *</label>
              <Input type="number" value={form.guests || ''} onChange={e => setForm({ ...form, guests: parseInt(e.target.value) || undefined })} placeholder="4" />
              {!form.guests && <p className="mt-1 text-[10px] text-red-500">Required</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-black">Beds *</label>
              <Input type="number" value={form.beds || ''} onChange={e => setForm({ ...form, beds: parseInt(e.target.value) || undefined })} placeholder="2" />
              {!form.beds && <p className="mt-1 text-[10px] text-red-500">Required</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-black">Baths *</label>
              <Input type="number" value={form.baths || ''} onChange={e => setForm({ ...form, baths: parseInt(e.target.value) || undefined })} placeholder="1" />
              {!form.baths && <p className="mt-1 text-[10px] text-red-500">Required</p>}
            </div>
          </div>
          <ChipSelector options={COMMON_AMENITIES} selected={form.amenities || []} onChange={v => setForm({ ...form, amenities: v })} label="Amenities (select 5+)" />
          <ChipSelector options={COMMON_VIBE_TAGS} selected={form.vibeTags || []} onChange={v => setForm({ ...form, vibeTags: v })} label="Vibe Tags" />
          
          {/* Photo Upload Section */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[11px] font-bold text-black">Photos (3+ recommended)</label>
            </div>
            
            {/* Photo Grid */}
            {(form.photos?.length || 0) > 0 && (
              <div className="mb-3 grid grid-cols-4 gap-2">
                {form.photos?.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border-2 border-black">
                    <img src={photo} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-black bg-white text-[10px] font-bold text-black hover:bg-red-100"
                    >
                      ✕
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 rounded-full border border-black bg-[#FFD84A] px-1.5 py-0.5 text-[8px] font-bold text-black">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload Button */}
            <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-black bg-white p-4 transition-colors hover:bg-black/5">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="text-center">
                {isUploading ? (
                  <p className="text-sm font-bold text-black">Uploading...</p>
                ) : (
                  <>
                    <p className="text-sm font-bold text-black">Click to upload photos</p>
                    <p className="mt-1 text-[10px] text-black">PNG, JPG up to 10MB each</p>
                  </>
                )}
              </div>
            </label>
          </div>
          
          <div className="rounded-lg border-2 border-black bg-white p-3">
            <p className="mb-2 text-[11px] font-bold text-black">Checklist ({checklistComplete}/{checklist.length})</p>
            <div className="grid gap-1 sm:grid-cols-3">
              {checklist.map(item => (<div key={item.label} className="flex items-center gap-1.5 text-[11px]"><span className={item.done ? 'text-emerald-600 font-bold' : 'text-black'}>{item.done ? '✓' : '○'}</span><span className="text-black">{item.label}</span></div>))}
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button className="border-2 border-black bg-white text-black hover:bg-black/5" onClick={() => setStep(1)}>← Back</Button>
            <Button 
              className="bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => setStep(3)}
              disabled={!form.priceNightlyRange || !form.guests || !form.beds || !form.baths}
            >
              Next: Creator Brief →
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between"><label className="text-[11px] font-medium text-black/60">Creator Brief</label><Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={generateBrief}>Generate from tags</Button></div>
            <textarea value={form.creatorBrief || ''} onChange={e => setForm({ ...form, creatorBrief: e.target.value })} placeholder="Describe what makes your property special for content creators..." rows={6} className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20" />
            <p className="mt-1 text-[10px] text-black/60">This helps creators understand your property.</p>
          </div>
          <div className="mt-6 rounded-xl border-2 border-black bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button className="border-2 border-black bg-white text-black hover:bg-black/5" onClick={() => setStep(2)}>← Back</Button>
                {onDelete && <Button className="border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100" onClick={onDelete}>Delete</Button>}
              </div>
              <div className="flex gap-2">
                <Button className="border-2 border-black bg-white text-black hover:bg-black/5" onClick={() => handleSave(true)} disabled={isSaving}>Save Draft</Button>
                <Button className={`border-2 border-black bg-black text-white hover:bg-black/90 transition-all duration-300 ${saveSuccess ? 'animate-pulse !bg-emerald-500' : ''}`} onClick={() => handleSave(false)} disabled={isSaving || !canPublish}>{isSaving ? 'Saving...' : saveSuccess ? '✓ Published!' : 'Publish Property'}</Button>
              </div>
            </div>
            {!canPublish && <p className="mt-3 text-right text-[11px] text-amber-600">Complete at least 7 checklist items to publish</p>}
          </div>
        </div>
      )}

      {/* Upgrade to Agency Modal - using Portal */}
      {showUpgradeModal && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Backdrop */}
          <div 
            onClick={() => setShowUpgradeModal(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />
          {/* Modal */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '32rem',
            margin: '1rem',
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            border: '3px solid #000000',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#000000' }}>Upgrade to Agency Plan</h3>
              <button onClick={() => setShowUpgradeModal(false)} style={{ color: '#9ca3af', cursor: 'pointer', background: 'none', border: 'none' }}>
                <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p style={{ fontSize: '0.875rem', color: '#000000', marginBottom: '1.5rem' }}>
              Your current plan allows 1 published property. Upgrade to Agency to manage multiple properties and unlock team features.
            </p>

            <div style={{ borderRadius: '0.75rem', border: '2px solid #000000', backgroundColor: '#ffffff', padding: '1rem', marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 700, color: '#000000', marginBottom: '0.75rem' }}>Agency Plan includes:</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#000000' }}>
                {['Unlimited published properties', 'Team member accounts (up to 5)', 'Property owner read-only access', 'Priority creator matching', 'Advanced analytics dashboard'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ display: 'flex', width: '1.25rem', height: '1.25rem', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#28D17C', fontSize: '10px', color: '#ffffff' }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '1.875rem', fontWeight: 900, color: '#000000', margin: 0 }}>
                  $149<span style={{ fontSize: '1rem', fontWeight: 700, color: '#000000' }}>/month</span>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{ flex: 1, borderRadius: '9999px', border: '2px solid #000000', backgroundColor: '#ffffff', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, color: '#000000', cursor: 'pointer' }}
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false)
                  onUpgrade?.()
                }}
                style={{ flex: 1, borderRadius: '9999px', border: '2px solid #000000', backgroundColor: '#FFD84A', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, color: '#000000', cursor: 'pointer' }}
              >
                Upgrade Now →
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default function HostPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<EditingProperty | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editorStep, setEditorStep] = useState(1)
  
  // Owner invite state
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [ownerEmail, setOwnerEmail] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [invitingOwner, setInvitingOwner] = useState(false)
  const [ownerInviteSuccess, setOwnerInviteSuccess] = useState(false)
  const [propertyOwners, setPropertyOwners] = useState<Array<{ id: string; name: string; email: string; lastAccessedAt: string | null }>>([])
  const [isAgency, setIsAgency] = useState(false)

  useEffect(() => { 
    fetchProperties()
    fetchAgencyStatus()
  }, [])

  // Fetch owners when property is selected
  useEffect(() => {
    if (selectedId && isAgency) {
      fetchPropertyOwners(selectedId)
    }
  }, [selectedId, isAgency])

  const fetchAgencyStatus = async () => {
    try {
      const res = await fetch('/api/host/agency')
      if (res.ok) {
        const data = await res.json()
        setIsAgency(data.isAgency || false)
      }
    } catch (e) { console.error(e) }
  }

  const fetchPropertyOwners = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/properties/${propertyId}/owner`)
      if (res.ok) {
        const data = await res.json()
        setPropertyOwners(data.owners || [])
      }
    } catch (e) { console.error(e) }
  }

  const handleInviteOwner = async () => {
    if (!selectedId || !ownerEmail || !ownerName) return
    setInvitingOwner(true)
    try {
      const res = await fetch(`/api/properties/${selectedId}/owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ownerEmail, name: ownerName }),
      })
      if (res.ok) {
        setOwnerInviteSuccess(true)
        setOwnerEmail("")
        setOwnerName("")
        fetchPropertyOwners(selectedId)
        setTimeout(() => {
          setOwnerInviteSuccess(false)
          setShowOwnerModal(false)
        }, 2000)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to invite owner')
      }
    } catch (e) { console.error(e) }
    finally { setInvitingOwner(false) }
  }

  const handleRemoveOwner = async (ownerId: string) => {
    if (!selectedId) return
    if (!confirm('Remove this owner\'s access?')) return
    try {
      await fetch(`/api/properties/${selectedId}/owner`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId }),
      })
      fetchPropertyOwners(selectedId)
    } catch (e) { console.error(e) }
  }

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties')
      if (res.ok) { const data = await res.json(); setProperties(data.properties || []) }
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  const handleSelect = (p: Property) => { setSelectedId(p.id); setEditing(p); setSaveSuccess(false) }
  const handleAddNew = () => { setSelectedId(null); setEditing({ isNew: true, isDraft: true, isActive: true, amenities: [], vibeTags: [], photos: [] }); setSaveSuccess(false) }

  const handleSave = async (data: EditingProperty) => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const res = await fetch('/api/properties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (res.ok) { 
        const { property } = await res.json()
        await fetchProperties()
        setSelectedId(property.id)
        setEditing(property)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      }
    } catch (e) { console.error(e) }
    finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    if (!selectedId) return
    setDeleting(true)
    try { 
      await fetch('/api/properties', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedId }) })
      setProperties(prev => prev.filter(p => p.id !== selectedId))
      setSelectedId(null)
      setEditing(null)
      setShowDeleteModal(false)
    }
    catch (e) { console.error(e) }
    finally { setDeleting(false) }
  }

  const handleBoost = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/properties/${propertyId}/boost`, { method: 'POST' })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (e) {
      console.error('Failed to start boost:', e)
    }
  }

  const handleCancelBoost = async (propertyId: string) => {
    if (!confirm('Cancel boost subscription? Your property will no longer appear as featured.')) return
    try {
      await fetch(`/api/properties/${propertyId}/boost`, { method: 'DELETE' })
      await fetchProperties()
    } catch (e) {
      console.error('Failed to cancel boost:', e)
    }
  }

  const handleUpgradeToAgency = async () => {
    try {
      const res = await fetch('/api/host/agency/upgrade', { method: 'POST' })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (e) {
      console.error('Failed to start upgrade:', e)
    }
  }

  return (
    <div className="dashboard min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b-2 border-black bg-white">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded border border-black bg-[#FFD84A] px-2 py-0.5 text-[10px] font-bold text-black">BETA</span>
            <span className="text-sm font-bold text-black">Host Dashboard</span>
          </div>
          <Link 
            href="/" 
            className="rounded-full border-2 border-black bg-[#FFD84A] px-4 py-1.5 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            ← Back to site
          </Link>
        </div>
      </div>
      
      {/* Navigation Strip */}
      <div className="border-b-2 border-black bg-[#FFD84A]">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/beta/dashboard/host/properties"
              className="rounded-full border-2 border-black bg-black px-3 py-1 text-[10px] font-bold text-white"
            >
              My Properties
            </Link>
            <Link 
              href="/beta/dashboard/collaborations"
              className="rounded-full border-2 border-black bg-white/60 px-3 py-1 text-[10px] font-bold text-black/60 transition-transform hover:-translate-y-0.5"
            >
              Collaborations
              <span className="ml-1 text-[8px] uppercase opacity-60">(Demo)</span>
            </Link>
            <Link 
              href="/beta/dashboard/host/settings"
              className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              Settings
            </Link>
            <Link 
              href="/beta/dashboard/host/search-creators"
              className="rounded-full border-2 border-black bg-white/60 px-3 py-1 text-[10px] font-bold text-black/60 transition-transform hover:-translate-y-0.5"
            >
              Find Creators
              <span className="ml-1 text-[8px] uppercase opacity-60">(Preview)</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="py-6">
        <Container>
          <div className="mb-4"><Link href="/beta/dashboard/host" className="text-xs font-bold text-black/60 hover:text-black">← Dashboard</Link></div>
          
          {/* Success Toast */}
          {saveSuccess && (
            <div className="mb-4 rounded-lg border-2 border-black bg-[#28D17C] px-4 py-2 text-sm font-bold text-black">
              ✓ Property saved!
            </div>
          )}
          
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Left: Property List */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-black">Your Properties</h2>
                <button onClick={handleAddNew} className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black hover:bg-gray-50">+ Add</button>
              </div>
              {isLoading ? <p className="text-sm text-black/60">Loading...</p> : properties.length === 0 ? (
                <div className="rounded-xl border-2 border-black bg-[#FFD84A] p-5 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-white">
                    <span className="text-xl"></span>
                  </div>
                  <p className="font-bold text-black">No properties yet</p>
                  <p className="mt-1 text-xs text-black/70">Add your first property to start finding creators.</p>
                  <button onClick={handleAddNew} className="mt-4 rounded-full border-2 border-black bg-black px-5 py-2 text-[10px] font-bold text-white transition-transform hover:-translate-y-0.5">+ Add Your First Property</button>
                </div>
              ) : (
                <div className="space-y-2">{properties.map(p => <PropertyListItem key={p.id} property={p} isSelected={selectedId === p.id} onSelect={() => handleSelect(p)} />)}</div>
              )}
            </div>
            
            {/* Right: Editor */}
            <div className="space-y-4">
              {editing ? <PropertyEditor 
                property={editing} 
                onSave={handleSave} 
                onDelete={selectedId ? () => setShowDeleteModal(true) : undefined} 
                isSaving={isSaving} 
                saveSuccess={saveSuccess}
                onStepChange={setEditorStep}
                showBoost={editorStep === 3 && !editing.isNew && !!selectedId}
                onBoost={() => selectedId && handleBoost(selectedId)}
                isBoosted={(editing as Property).isBoosted}
                onCancelBoost={() => selectedId && handleCancelBoost(selectedId)}
                publishedCount={properties.filter(p => !p.isDraft).length}
                onUpgrade={handleUpgradeToAgency}
              /> : (
                <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-black/30 bg-white">
                  <div className="text-center">
                    <p className="text-sm text-black/60">Select a property or add a new one</p>
                    <button onClick={handleAddNew} className="mt-3 rounded-full border-2 border-black bg-black px-5 py-2 text-[10px] font-bold text-white">+ Add Property</button>
                  </div>
                </div>
              )}
              
              {/* Boost Card - Only show on step 3 */}
              {editing && !editing.isNew && selectedId && editorStep === 3 && (
                <div className="rounded-xl border-2 border-black bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl"></span>
                        <h3 className="font-bold text-black">Boost This Property</h3>
                      </div>
                      <p className="mt-1 text-xs text-black/60">
                        Get featured placement in creator search results
                      </p>
                    </div>
                    <span className="rounded-full bg-[#28D17C]/20 px-2 py-0.5 text-xs font-bold text-black">$49/mo</span>
                  </div>
                  
                  {(editing as Property).isBoosted ? (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 rounded-lg bg-[#28D17C]/20 px-3 py-2">
                        <span className="text-sm">✓</span>
                        <span className="text-sm font-bold text-black">Currently Boosted</span>
                      </div>
                      <button
                        onClick={() => handleCancelBoost(selectedId)}
                        className="mt-2 text-xs text-red-500 hover:underline"
                      >
                        Cancel Boost
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBoost(selectedId)}
                      className="mt-4 w-full rounded-full border-2 border-black bg-[#28D17C] py-2 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
                    >
                      Boost Property →
                    </button>
                  )}
                </div>
              )}

              {/* Owner Access Section - Agency Only */}
              {selectedId && isAgency && (
                <div className="mt-6 rounded-xl border-2 border-black bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔑</span>
                      <h3 className="font-bold text-black">Owner Access</h3>
                    </div>
                    <button
                      onClick={() => setShowOwnerModal(true)}
                      className="rounded-full border-2 border-black bg-black px-3 py-1 text-xs font-bold text-white"
                    >
                      + Invite
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-black/60">
                    Give property owners read-only access to view campaigns
                  </p>
                  
                  {propertyOwners.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {propertyOwners.map((owner) => (
                        <div key={owner.id} className="flex items-center justify-between rounded-lg border border-black/20 bg-black/5 px-3 py-2">
                          <div>
                            <p className="text-sm font-bold text-black">{owner.name}</p>
                            <p className="text-xs text-black/60">{owner.email}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveOwner(owner.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-black/40">No owners invited yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border-[3px] border-black bg-white p-6">
            <h3 className="text-xl font-black text-black">Delete Property?</h3>
            <p className="mt-2 text-sm text-black/70">
              This will permanently remove this property and any associated data. This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 rounded-full border-2 border-black bg-white py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-full border-2 border-red-500 bg-red-500 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Owner Modal */}
      {showOwnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border-[3px] border-black bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-black">Invite Property Owner</h3>
              <button
                onClick={() => setShowOwnerModal(false)}
                className="text-black/40 hover:text-black"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-sm text-black/60">
              Send a read-only access link to the property owner so they can view campaign performance.
            </p>
            
            {ownerInviteSuccess ? (
              <div className="mt-6 rounded-lg border-2 border-[#28D17C] bg-[#28D17C]/10 p-4 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#28D17C]">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="font-bold text-black">Invite Sent!</p>
                <p className="text-sm text-black/60">They'll receive an email with their access link.</p>
              </div>
            ) : (
              <>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      placeholder="John Smith"
                      className="w-full rounded-lg border-2 border-black px-4 py-3 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                      Owner Email
                    </label>
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={e => setOwnerEmail(e.target.value)}
                      placeholder="owner@example.com"
                      className="w-full rounded-lg border-2 border-black px-4 py-3 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowOwnerModal(false)}
                    className="flex-1 rounded-full border-2 border-black bg-white py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteOwner}
                    disabled={invitingOwner || !ownerEmail || !ownerName}
                    className="flex-1 rounded-full border-2 border-black bg-black py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {invitingOwner ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="border-t-2 border-black bg-white mt-12">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-[#FFD84A] font-black text-sm">
                CS
              </div>
              <span className="font-bold text-black">CreatorStays</span>
            </div>
            <p className="text-xs text-black/60">© 2026 CreatorStays. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
