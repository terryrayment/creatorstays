"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
  const [code, setCode] = useState(["", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  // Focus first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus()
  }, [])

  const handleInput = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError("")

    // Auto-advance to next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus()
    }

    // Auto-submit when all 4 digits entered
    if (value && index === 3) {
      const fullCode = newCode.join("")
      if (fullCode.length === 4) {
        handleSubmit(fullCode)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4)
    if (pastedData.length === 4) {
      const newCode = pastedData.split("")
      setCode(newCode)
      handleSubmit(pastedData)
    }
  }

  const handleSubmit = async (fullCode: string) => {
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: fullCode }),
      })

      const data = await res.json()
      
      if (res.ok && data.success) {
        router.push("/admin/dashboard")
      } else {
        setError("Invalid code")
        setCode(["", "", "", ""])
        inputRefs[0].current?.focus()
      }
    } catch (err) {
      setError("Network error")
      setCode(["", "", "", ""])
      inputRefs[0].current?.focus()
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-xs">
        <div className="rounded-2xl border-[3px] border-black bg-white p-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black bg-[#FFD84A]">
              <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl font-black text-black">ADMIN</h1>
            <p className="mt-1 text-sm text-black/60">Enter 4-digit code</p>
          </div>

          {/* Code Input */}
          <div className="mt-6">
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInput(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="h-14 w-14 rounded-xl border-[3px] border-black text-center text-2xl font-bold text-black focus:border-[#4AA3FF] focus:outline-none focus:ring-0"
                  disabled={loading}
                />
              ))}
            </div>

            {error && (
              <div className="mt-4 rounded-lg border-2 border-red-500 bg-red-50 px-4 py-2 text-center text-sm text-red-600">
                {error}
              </div>
            )}

            {loading && (
              <p className="mt-4 text-center text-sm text-black/60">Checking...</p>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/40">
          CreatorStays Admin
        </p>
      </div>
    </div>
  )
}
