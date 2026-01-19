"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SelectProps {
  options: { value: string; label: string }[]
  placeholder?: string
  value?: string
  onChange?: (e: { target: { value: string } }) => void
  required?: boolean
  className?: string
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ className, options, placeholder, value, onChange, required }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState(value || "")
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Sync with external value
    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value)
      }
    }, [value])

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue)
      setIsOpen(false)
      if (onChange) {
        onChange({ target: { value: optionValue } })
      }
    }

    const selectedLabel = options.find(o => o.value === selectedValue)?.label || placeholder || "Select..."

    return (
      <div ref={dropdownRef} className={cn("relative", className)}>
        {/* Hidden input for form validation */}
        {required && (
          <input
            type="text"
            value={selectedValue}
            required={required}
            className="absolute opacity-0 h-0 w-0"
            tabIndex={-1}
            onChange={() => {}}
          />
        )}
        
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-left text-[13px] font-medium",
            "transition-all duration-200",
            "hover:bg-gray-50",
            "focus:outline-none focus:ring-2 focus:ring-black/20",
            !selectedValue && "text-black/40"
          )}
        >
          <span className="block truncate text-black">{selectedValue ? selectedLabel : placeholder}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg 
              className={cn("h-4 w-4 text-black transition-transform duration-200", isOpen && "rotate-180")}
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2.5} 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border-2 border-black bg-white py-1 shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full px-3 py-2 text-left text-[13px] font-medium text-black",
                  "transition-colors duration-100",
                  "hover:bg-[#FFD84A]",
                  selectedValue === option.value && "bg-[#FFD84A]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
