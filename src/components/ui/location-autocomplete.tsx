"use client"

import { useState, useEffect, useRef } from "react"

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// Simple city suggestions for when Google API isn't available
const POPULAR_CITIES = [
  "Los Angeles, CA",
  "New York, NY",
  "Miami, FL",
  "San Francisco, CA",
  "Austin, TX",
  "Nashville, TN",
  "Denver, CO",
  "Seattle, WA",
  "Chicago, IL",
  "San Diego, CA",
  "Portland, OR",
  "Atlanta, GA",
  "Phoenix, AZ",
  "Las Vegas, NV",
  "Boston, MA",
  "Dallas, TX",
  "Houston, TX",
  "Philadelphia, PA",
  "Minneapolis, MN",
  "New Orleans, LA",
]

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Los Angeles, CA",
  className = "",
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Check if Google Places API is available
  useEffect(() => {
    const checkGoogle = () => {
      if (window.google?.maps?.places?.AutocompleteService) {
        autocompleteRef.current = new window.google.maps.places.AutocompleteService()
        setIsGoogleLoaded(true)
      }
    }

    // Check immediately
    checkGoogle()

    // Also check when the script might load
    const timer = setTimeout(checkGoogle, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch suggestions
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([])
      return
    }

    if (isGoogleLoaded && autocompleteRef.current) {
      // Use Google Places API
      autocompleteRef.current.getPlacePredictions(
        {
          input: value,
          types: ["(cities)"],
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions.map(p => p.description).slice(0, 5))
          } else {
            setSuggestions([])
          }
        }
      )
    } else {
      // Fallback to local filtering
      const filtered = POPULAR_CITIES.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setSuggestions(filtered)
    }
  }, [value, isGoogleLoaded])

  const handleSelect = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => {
          onChange(e.target.value)
          setShowSuggestions(true)
        }}
        onFocus={() => {
          if (value.length >= 2 || suggestions.length > 0) {
            setShowSuggestions(true)
          }
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border-2 border-black bg-white shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-black transition-colors hover:bg-black/5"
            >
              <svg
                className="h-4 w-4 shrink-0 text-black/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Add Google Maps types
declare global {
  interface Window {
    google: typeof google
  }
}
