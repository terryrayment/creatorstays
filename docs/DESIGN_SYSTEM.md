# Design System

## Brand Identity

**CreatorStays** connects content creators with vacation rental hosts for paid collaborations.

### Voice & Tone
- Confident, not salesy
- Direct and clear
- Professional but approachable
- Creator-first mindset

---

## Colors

### Primary Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Black** | `#000000` | Text, borders, buttons |
| **White** | `#FFFFFF` | Backgrounds, text on dark |
| **Cream** | `#FFFDF7` | Page backgrounds |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Orange** | `#FF7A00` | Primary accent, progress bars, CTAs |
| **Green** | `#28D17C` | Success states, verified badges, toggles |
| **Blue** | `#4AA3FF` | Secondary accent, links |
| **Red** | `#FF6B6B` | Errors, warnings |
| **Yellow** | `#FFD84A` | Highlights, beta badges |

### Platform Colors

| Platform | Colors |
|----------|--------|
| **Instagram** | `from-purple-500 via-pink-500 to-orange-400` (gradient) |
| **TikTok** | `#000000` (black) |
| **YouTube** | `#FF0000` (red) |

---

## Typography

### Font Stack
```css
font-family: system-ui, -apple-system, sans-serif;
```

### Hierarchy

| Element | Classes |
|---------|---------|
| **Page Title** | `font-heading text-3xl tracking-tight text-black` |
| **Section Title** | `text-lg font-bold text-black` |
| **Label** | `text-xs font-bold uppercase tracking-wider text-black` |
| **Body** | `text-sm text-black` |
| **Small** | `text-xs text-black/60` |

### Text Styling
- Labels: UPPERCASE, bold, tracking-wider
- Headings: Bold, tight tracking
- Body: Regular weight, normal tracking

---

## Components

### Buttons

**Primary Button (Black)**
```jsx
<button className="rounded-full border-2 border-black bg-black px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5">
  Continue
</button>
```

**Secondary Button (White)**
```jsx
<button className="rounded-full border-2 border-black bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5">
  Back
</button>
```

**Success Button (Green)**
```jsx
<button className="rounded-full border-2 border-black bg-[#28D17C] px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5">
  Complete Setup
</button>
```

### Inputs

**Standard Input**
```jsx
<input className="w-full rounded-lg border-2 border-black px-4 py-3 text-sm text-black placeholder:text-black focus:outline-none focus:ring-2 focus:ring-black" />
```

**With Prefix**
```jsx
<div className="relative">
  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-black">@</span>
  <input className="w-full rounded-lg border-2 border-black pl-8 pr-4 py-3 text-sm" />
</div>
```

### Cards

**Standard Card**
```jsx
<div className="rounded-xl border-2 border-black bg-white p-6">
  {/* content */}
</div>
```

**Colored Card**
```jsx
<div className="rounded-2xl border-[3px] border-black bg-[#28D17C] p-6">
  {/* content */}
</div>
```

### Badges / Pills

**Tag/Niche Selection**
```jsx
<button className={`rounded-full border-2 border-black px-4 py-2 text-xs font-bold transition-all ${
  selected ? "bg-[#FF7A00]" : "bg-white hover:bg-gray-50"
}`}>
  Travel
</button>
```

**Verified Badge**
```jsx
<span className="flex items-center gap-1 rounded-full bg-[#28D17C] px-2 py-0.5 text-[10px] font-bold text-black">
  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
  Verified
</span>
```

### Progress Bar

```jsx
<div className="h-1.5 overflow-hidden rounded-full bg-white border border-black">
  <div 
    className="h-full rounded-full bg-[#FF7A00] transition-all duration-500" 
    style={{ width: `${progress}%` }} 
  />
</div>
```

### Toggle Switch

```jsx
<div className={`relative h-6 w-11 rounded-full transition-colors ${
  enabled ? 'bg-[#28D17C]' : 'bg-black'
}`}>
  <div className={`absolute top-0.5 h-5 w-5 rounded-full border-2 border-black bg-white transition-all ${
    enabled ? 'left-5' : 'left-0.5'
  }`} />
</div>
```

---

## Layout Patterns

### Page Container
```jsx
<div className="min-h-screen bg-[#FFFDF7]">
  <header className="border-b-2 border-black bg-white">
    {/* header content */}
  </header>
  <main className="mx-auto max-w-2xl px-4 py-8">
    {/* page content */}
  </main>
</div>
```

### Step Header (Onboarding)
```jsx
<div className="mb-8 text-center">
  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-[#FF7A00]">
    <Icon className="h-7 w-7 text-black" />
  </div>
  <h1 className="font-heading text-3xl tracking-tight text-black">Page Title</h1>
  <p className="mt-2 text-sm text-black">Subtitle description</p>
</div>
```

### Form Section
```jsx
<div className="space-y-6">
  <div>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
      Field Label <span className="text-red-500">*</span>
    </label>
    <input className={inputClass} />
  </div>
</div>
```

---

## Icons

Using Heroicons (outline style, strokeWidth={2}):
```jsx
import { UserIcon, ShareIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
```

Or inline SVG:
```jsx
<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" d="..." />
</svg>
```

---

## Animation

### Hover Lift
```css
transition-transform hover:-translate-y-0.5
```

### Smooth Transitions
```css
transition-all duration-200
transition-all duration-500
```

### Loading Spinner
```jsx
<div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
```

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |

Common patterns:
```jsx
className="px-4 sm:px-6 lg:px-8"
className="grid sm:grid-cols-2 lg:grid-cols-3"
className="hidden sm:block"
```
