"use client"

import { useState, useEffect, useRef } from "react"

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// Expanded city suggestions for when Google API isn't available
const POPULAR_CITIES = [
  // Major metros
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Austin, TX",
  "Jacksonville, FL",
  "Fort Worth, TX",
  "Columbus, OH",
  "Charlotte, NC",
  "San Francisco, CA",
  "Indianapolis, IN",
  "Seattle, WA",
  "Denver, CO",
  "Boston, MA",
  "El Paso, TX",
  "Detroit, MI",
  "Nashville, TN",
  "Portland, OR",
  "Memphis, TN",
  "Oklahoma City, OK",
  "Las Vegas, NV",
  "Louisville, KY",
  "Baltimore, MD",
  "Milwaukee, WI",
  "Albuquerque, NM",
  "Tucson, AZ",
  "Fresno, CA",
  "Mesa, AZ",
  "Sacramento, CA",
  "Atlanta, GA",
  "Kansas City, MO",
  "Colorado Springs, CO",
  "Miami, FL",
  "Raleigh, NC",
  "Omaha, NE",
  "Long Beach, CA",
  "Virginia Beach, VA",
  "Oakland, CA",
  "Minneapolis, MN",
  "Tulsa, OK",
  "Tampa, FL",
  "Arlington, TX",
  "New Orleans, LA",
  "Wichita, KS",
  "Cleveland, OH",
  "Bakersfield, CA",
  "Aurora, CO",
  "Anaheim, CA",
  "Honolulu, HI",
  "Santa Ana, CA",
  "Riverside, CA",
  "Corpus Christi, TX",
  "Lexington, KY",
  "Henderson, NV",
  "Stockton, CA",
  "Saint Paul, MN",
  "Cincinnati, OH",
  "St. Louis, MO",
  "Pittsburgh, PA",
  "Greensboro, NC",
  "Lincoln, NE",
  "Anchorage, AK",
  "Plano, TX",
  "Orlando, FL",
  "Irvine, CA",
  "Newark, NJ",
  "Durham, NC",
  "Chula Vista, CA",
  "Toledo, OH",
  "Fort Wayne, IN",
  "St. Petersburg, FL",
  "Laredo, TX",
  "Jersey City, NJ",
  "Chandler, AZ",
  "Madison, WI",
  "Lubbock, TX",
  "Scottsdale, AZ",
  "Reno, NV",
  "Buffalo, NY",
  "Gilbert, AZ",
  "Glendale, AZ",
  "North Las Vegas, NV",
  "Winston-Salem, NC",
  "Chesapeake, VA",
  "Norfolk, VA",
  "Fremont, CA",
  "Garland, TX",
  "Irving, TX",
  "Hialeah, FL",
  "Richmond, VA",
  "Boise, ID",
  "Spokane, WA",
  "Baton Rouge, LA",
  // Popular vacation destinations
  "Lake Tahoe, CA",
  "Big Bear, CA",
  "Lake Arrowhead, CA",
  "Palm Springs, CA",
  "Malibu, CA",
  "Napa Valley, CA",
  "Sedona, AZ",
  "Park City, UT",
  "Aspen, CO",
  "Vail, CO",
  "Telluride, CO",
  "Jackson Hole, WY",
  "Key West, FL",
  "Savannah, GA",
  "Charleston, SC",
  "Asheville, NC",
  "Cape Cod, MA",
  "Martha's Vineyard, MA",
  "The Hamptons, NY",
  "Lake George, NY",
  "Poconos, PA",
  "Outer Banks, NC",
  "Hilton Head, SC",
  "Myrtle Beach, SC",
  "Gulf Shores, AL",
  "Destin, FL",
  "Panama City Beach, FL",
  "Clearwater, FL",
  "Naples, FL",
  "Sarasota, FL",
  "Fort Lauderdale, FL",
  "West Palm Beach, FL",
  "Maui, HI",
  "Kauai, HI",
  "Big Island, HI",
  "Oahu, HI",
]

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "City, State",
  className = "",
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Check if Google Places API is available
  useEffect(() => {
    const checkGoogle = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any
      if (win.google?.maps?.places?.AutocompleteService) {
        autocompleteRef.current = new win.google.maps.places.AutocompleteService()
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (predictions: any[] | null, status: string) => {
          if (status === "OK" && predictions) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSuggestions(predictions.map((p: any) => p.description).slice(0, 5))
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

  const showDropdown = showSuggestions && value.length >= 2

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
          if (value.length >= 2) {
            setShowSuggestions(true)
          }
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border-2 border-black bg-white shadow-lg">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
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
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-black/50">
              Type your location (e.g., "{value}, MI")
            </div>
          )}
        </div>
      )}
    </div>
  )
}
