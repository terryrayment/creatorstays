"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navigation/navbar"
import { Footer } from "@/components/navigation/footer"

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
  lastImportedAt?: string
  createdAt: string
  updatedAt: string
}

type EditingProperty = Partial<Property> & { isNew?: boolean }

const COMMON_AMENITIES = ["WiFi", "Pool", "Hot Tub", "Kitchen", "Washer", "Dryer", "AC", "Heating", "Workspace", "TV", "Fireplace", "Gym", "Parking", "EV Charger", "BBQ", "Patio", "Beach Access", "Ski-in/Ski-out", "Pet Friendly", "Kid Friendly"]
const COMMON_VIBE_TAGS = ["Cozy", "Modern", "Rustic", "Luxury", "Minimal", "Bohemian", "Romantic", "Family", "Remote", "Urban", "Beachfront", "Mountain", "Lakeside", "Historic", "Eco-Friendly", "Unique", "Instagrammable", "Quiet", "Social", "Adventure"]

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
        <div className="h-12 w-16 shrink-0 overflow-hidden rounded border-2 border-black bg-gray-100">
          {property.heroImageUrl ? <img src={property.heroImageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-lg text-black/30">🏠</div>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-black">{property.title || 'Untitled'}</p>
          <p className="text-[11px] text-black/60">{property.cityRegion || 'No location'}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`rounded-full border border-black px-1.5 py-0.5 text-[9px] font-bold ${property.isDraft ? 'bg-amber-100 text-black' : 'bg-emerald-100 text-black'}`}>{property.isDraft ? 'Draft' : 'Ready'}</span>
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
      <label className="mb-2 block text-[11px] font-medium text-black/60">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => toggle(opt)} className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${selected.includes(opt) ? 'border-black bg-black/10 text-black' : 'border-black/10 bg-white hover:bg-black/[0.02]'}`}>{opt}</button>
        ))}
      </div>
    </div>
  )
}

function PropertyEditor({ property, onSave, onDelete, isSaving }: { property: EditingProperty; onSave: (data: EditingProperty) => void; onDelete?: () => void; isSaving: boolean }) {
  const [form, setForm] = useState<EditingProperty>(property)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => { setForm(property); setStep(1) }, [property])

  const handleImport = async () => {
    if (!form.airbnbUrl) return
    setIsImporting(true)
    setImportError(null)
    try {
      const res = await fetch(`/api/airbnb/prefill?url=${encodeURIComponent(form.airbnbUrl)}`)
      if (res.ok) {
        const data = await res.json()
        setForm(prev => ({ ...prev, title: data.title || prev.title, heroImageUrl: data.imageUrl || prev.heroImageUrl, cityRegion: data.cityRegion || prev.cityRegion, lastImportedAt: new Date().toISOString() }))
        setStep(2)
      } else {
        setImportError('Could not fetch listing. Check URL and try again.')
      }
    } catch { setImportError('Import failed. Enter details manually.') }
    finally { setIsImporting(false) }
  }

  const generateBrief = () => {
    const tags = form.vibeTags?.join(', ') || 'cozy, unique'
    const location = form.cityRegion || 'this beautiful destination'
    setForm(prev => ({ ...prev, creatorBrief: `This ${tags} property in ${location} is perfect for creators looking for authentic, visually stunning content opportunities. Ideal for travel, lifestyle, and photography content. The space offers unique angles and natural lighting throughout the day.` }))
  }

  const handleSave = (asDraft: boolean) => {
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
        {[1, 2, 3].map(s => (
          <button key={s} onClick={() => setStep(s as 1 | 2 | 3)} className={`flex-1 rounded-md py-2 text-xs font-medium transition-all ${step === s ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black'}`}>
            {s === 1 ? '1. Import' : s === 2 ? '2. Confirm' : '3. Brief'}
          </button>
        ))}
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
          <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setStep(2)}>Skip to details →</Button></div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1.5 block text-[11px] font-medium text-black/60">Title *</label><Input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Cozy Mountain Cabin" /></div>
            <div><label className="mb-1.5 block text-[11px] font-medium text-black/60">City / Region *</label><Input value={form.cityRegion || ''} onChange={e => setForm({ ...form, cityRegion: e.target.value })} placeholder="Aspen, Colorado" /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div><label className="mb-1.5 block text-[11px] font-medium text-black/60">Price/night</label><Input value={form.priceNightlyRange || ''} onChange={e => setForm({ ...form, priceNightlyRange: e.target.value })} placeholder="$150-$250" /></div>
            <div><label className="mb-1.5 block text-[11px] font-medium text-black/60">Guests</label><Input type="number" value={form.guests || ''} onChange={e => setForm({ ...form, guests: parseInt(e.target.value) || undefined })} placeholder="4" /></div>
            <div><label className="mb-1.5 block text-[11px] font-medium text-black/60">Beds</label><Input type="number" value={form.beds || ''} onChange={e => setForm({ ...form, beds: parseInt(e.target.value) || undefined })} placeholder="2" /></div>
            <div><label className="mb-1.5 block text-[11px] font-medium text-black/60">Baths</label><Input type="number" value={form.baths || ''} onChange={e => setForm({ ...form, baths: parseInt(e.target.value) || undefined })} placeholder="1" /></div>
          </div>
          <ChipSelector options={COMMON_AMENITIES} selected={form.amenities || []} onChange={v => setForm({ ...form, amenities: v })} label="Amenities (select 5+)" />
          <ChipSelector options={COMMON_VIBE_TAGS} selected={form.vibeTags || []} onChange={v => setForm({ ...form, vibeTags: v })} label="Vibe Tags" />
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-black/60">Photo URLs (one per line, 3+ recommended)</label>
            <textarea value={(form.photos || []).join('\n')} onChange={e => setForm({ ...form, photos: e.target.value.split('\n').filter(Boolean) })} placeholder="https://example.com/photo1.jpg" rows={3} className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20" />
          </div>
          <div className="rounded-lg bg-black/[0.02] p-3">
            <p className="mb-2 text-[11px] font-semibold text-black/60">Checklist ({checklistComplete}/{checklist.length})</p>
            <div className="grid gap-1 sm:grid-cols-3">
              {checklist.map(item => (<div key={item.label} className="flex items-center gap-1.5 text-[11px]"><span className={item.done ? 'text-emerald-500' : 'text-black/60/40'}>{item.done ? '✓' : '○'}</span><span className={item.done ? 'text-black' : 'text-black/60'}>{item.label}</span></div>))}
            </div>
          </div>
          <div className="flex justify-between pt-2"><Button variant="outline" onClick={() => setStep(1)}>← Back</Button><Button onClick={() => setStep(3)}>Next: Creator Brief →</Button></div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between"><label className="text-[11px] font-medium text-black/60">Creator Brief</label><Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={generateBrief}>Generate from tags</Button></div>
            <textarea value={form.creatorBrief || ''} onChange={e => setForm({ ...form, creatorBrief: e.target.value })} placeholder="Describe what makes your property special for content creators..." rows={6} className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20" />
            <p className="mt-1 text-[10px] text-black/60">This helps creators understand your property.</p>
          </div>
          <div className="flex items-center justify-between border-t border-black/5 pt-4">
            <div className="flex gap-2"><Button variant="outline" onClick={() => setStep(2)}>← Back</Button>{onDelete && <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={onDelete}>Delete</Button>}</div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => handleSave(true)} disabled={isSaving}>Save Draft</Button><Button onClick={() => handleSave(false)} disabled={isSaving || !canPublish}>{isSaving ? 'Saving...' : 'Save Property'}</Button></div>
          </div>
          {!canPublish && <p className="text-right text-[10px] text-amber-600">Complete at least 7 checklist items to publish</p>}
        </div>
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

  useEffect(() => { fetchProperties() }, [])

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
    if (!selectedId || !confirm('Delete this property?')) return
    try { await fetch('/api/properties', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedId }) }); setProperties(prev => prev.filter(p => p.id !== selectedId)); setSelectedId(null); setEditing(null) }
    catch (e) { console.error(e) }
  }

  return (
    <div className="dashboard flex min-h-screen flex-col bg-[#FAFAFA]">
      <Navbar />
      <main className="flex-1 py-6">
        <Container>
          <div className="mb-4"><Link href="/dashboard/host" className="text-xs font-bold text-black/60 hover:text-black">← Dashboard</Link></div>
          
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
                <div className="rounded-lg border-2 border-dashed border-black/30 p-4 text-center">
                  <p className="text-xs text-black/60">No properties yet</p>
                  <button onClick={handleAddNew} className="mt-2 rounded-full border-2 border-black bg-[#FFD84A] px-4 py-1.5 text-[10px] font-bold text-black">Add your first</button>
                </div>
              ) : (
                <div className="space-y-2">{properties.map(p => <PropertyListItem key={p.id} property={p} isSelected={selectedId === p.id} onSelect={() => handleSelect(p)} />)}</div>
              )}
            </div>
            
            {/* Right: Editor */}
            <div>
              {editing ? <PropertyEditor property={editing} onSave={handleSave} onDelete={selectedId ? handleDelete : undefined} isSaving={isSaving} /> : (
                <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-black/30 bg-white">
                  <div className="text-center">
                    <p className="text-sm text-black/60">Select a property or add a new one</p>
                    <button onClick={handleAddNew} className="mt-3 rounded-full border-2 border-black bg-black px-5 py-2 text-[10px] font-bold text-white">+ Add Property</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
