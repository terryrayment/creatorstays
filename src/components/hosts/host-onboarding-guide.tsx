"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Step {
  id: string
  title: string
  content: React.ReactNode
}

export function HostOnboardingGuide({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const steps: Step[] = [
    {
      id: "welcome",
      title: "Welcome to CreatorStays",
      content: (
        <div className="space-y-4">
          <p className="text-lg text-black/80">
            You're about to tap into the most powerful marketing channel for vacation rentals: 
            <strong> real people sharing real experiences.</strong>
          </p>
          <p className="text-black/70">
            This quick guide will help you understand how to work with creators and what kind 
            of content actually drives bookings.
          </p>
          <div className="rounded-xl border-2 border-black bg-[#FFD84A] p-4 mt-6">
            <p className="font-bold text-black">⏱️ Takes about 3 minutes</p>
            <p className="text-sm text-black/70">No right or wrong answers — just figuring out what works for you.</p>
          </div>
        </div>
      ),
    },
    {
      id: "content-types",
      title: "What kind of content works?",
      content: (
        <div className="space-y-4">
          <p className="text-black/80">
            Not all creator content is the same. Here are the three main approaches:
          </p>
          
          <div className="space-y-3 mt-4">
            <div className="rounded-xl border-2 border-black bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏠</span>
                <div>
                  <p className="font-bold text-black">Property Tour / Review</p>
                  <p className="text-sm text-black/70">
                    Creator visits your property and creates authentic content showing what it's 
                    actually like to stay there. The "room tour" style.
                  </p>
                  <p className="mt-2 text-xs text-[#28D17C] font-bold">Best for: Unique properties, experiences worth showing</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border-2 border-black bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✂️</span>
                <div>
                  <p className="font-bold text-black">Remote Edit / Story</p>
                  <p className="text-sm text-black/70">
                    You send photos and videos, creator edits them into engaging content with 
                    their storytelling style, music, and voiceover.
                  </p>
                  <p className="mt-2 text-xs text-[#4AA3FF] font-bold">Best for: Great existing footage, distant properties</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border-2 border-black bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="font-bold text-black">Destination Content</p>
                  <p className="text-sm text-black/70">
                    Creator makes content about your area (things to do, hidden gems, local tips) 
                    and mentions your property as where they stayed.
                  </p>
                  <p className="mt-2 text-xs text-[#D7B6FF] font-bold">Best for: Properties in popular destinations</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border-2 border-black bg-black/5 p-4 mt-4">
            <p className="text-sm text-black/70">
              <strong>💡 Pro tip:</strong> The best performing content usually combines authentic 
              experience with good production value. A creator staying at your property and 
              creating content there typically outperforms remote edits.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "your-situation",
      title: "What's your situation?",
      content: (
        <div className="space-y-4">
          <p className="text-black/80">
            Let's figure out what approach makes sense for your property.
          </p>
          
          <div className="space-y-3 mt-4">
            <button
              onClick={() => setAnswers({ ...answers, situation: "can-host" })}
              className={`w-full rounded-xl border-2 border-black p-4 text-left transition-all ${
                answers.situation === "can-host" 
                  ? "bg-[#28D17C] border-black" 
                  : "bg-white hover:bg-black/5"
              }`}
            >
              <p className="font-bold text-black">I can host creators at my property</p>
              <p className="text-sm text-black/70">
                I have availability and I'm open to offering free or discounted stays in exchange for content.
              </p>
            </button>
            
            <button
              onClick={() => setAnswers({ ...answers, situation: "remote-only" })}
              className={`w-full rounded-xl border-2 border-black p-4 text-left transition-all ${
                answers.situation === "remote-only" 
                  ? "bg-[#28D17C] border-black" 
                  : "bg-white hover:bg-black/5"
              }`}
            >
              <p className="font-bold text-black">I'd prefer remote content creation</p>
              <p className="text-sm text-black/70">
                I have great photos/videos already and want a creator to turn them into engaging content.
              </p>
            </button>
            
            <button
              onClick={() => setAnswers({ ...answers, situation: "paid-collab" })}
              className={`w-full rounded-xl border-2 border-black p-4 text-left transition-all ${
                answers.situation === "paid-collab" 
                  ? "bg-[#28D17C] border-black" 
                  : "bg-white hover:bg-black/5"
              }`}
            >
              <p className="font-bold text-black">I want to pay for content (no free stays)</p>
              <p className="text-sm text-black/70">
                I'd rather pay creators directly than offer accommodations.
              </p>
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "talking-to-creators",
      title: "How to talk to creators",
      content: (
        <div className="space-y-4">
          <p className="text-black/80">
            Creators get a lot of generic pitches. Here's how to stand out:
          </p>
          
          <div className="space-y-4 mt-4">
            <div className="rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4">
              <p className="font-bold text-black flex items-center gap-2">
                <span className="text-[#28D17C]">✓</span> Do this
              </p>
              <ul className="mt-2 space-y-2 text-sm text-black/80">
                <li>• <strong>Be specific</strong> about what you're offering (dates, value, expectations)</li>
                <li>• <strong>Explain why them</strong> — mention something specific about their content you liked</li>
                <li>• <strong>Be clear on deliverables</strong> — "2 Instagram Reels" is better than "some posts"</li>
                <li>• <strong>Share what makes your property special</strong> — the story, not just amenities</li>
              </ul>
            </div>
            
            <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
              <p className="font-bold text-black flex items-center gap-2">
                <span className="text-red-500">✗</span> Avoid this
              </p>
              <ul className="mt-2 space-y-2 text-sm text-black/80">
                <li>• Generic "collab?" messages with no details</li>
                <li>• Asking for content without offering fair value</li>
                <li>• Demanding specific scripts or heavy editing control</li>
                <li>• Expecting viral results — focus on authentic content</li>
              </ul>
            </div>
          </div>
          
          <div className="rounded-xl border-2 border-black bg-[#4AA3FF] p-4 mt-4">
            <p className="font-bold text-black">Example of a good first message:</p>
            <p className="mt-2 text-sm text-black/80 italic">
              "Hi [Name]! I loved your recent video about [specific thing]. I have a cabin in 
              Big Bear that I think would be perfect for your travel content — it has a 
              private hot tub with mountain views. Would you be interested in a 3-night stay 
              in exchange for 2 Reels? Happy to work around your schedule."
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "what-to-expect",
      title: "Setting expectations",
      content: (
        <div className="space-y-4">
          <p className="text-black/80">
            Let's be real about what creator content can and can't do:
          </p>
          
          <div className="grid gap-4 mt-4">
            <div className="rounded-xl border-2 border-black bg-white p-4">
              <p className="font-bold text-black">📊 Typical results</p>
              <ul className="mt-2 space-y-1 text-sm text-black/70">
                <li>• A Reel might get 5,000 - 50,000 views</li>
                <li>• Click-through rates are usually 1-3%</li>
                <li>• Not every click becomes a booking</li>
                <li>• Content has a long tail — it keeps working for months</li>
              </ul>
            </div>
            
            <div className="rounded-xl border-2 border-black bg-white p-4">
              <p className="font-bold text-black">🎯 What actually matters</p>
              <ul className="mt-2 space-y-1 text-sm text-black/70">
                <li>• <strong>Authenticity</strong> beats production value</li>
                <li>• <strong>The right audience</strong> matters more than size</li>
                <li>• <strong>Multiple pieces</strong> compound over time</li>
                <li>• <strong>Repurposing</strong> — you can use the content too</li>
              </ul>
            </div>
          </div>
          
          <div className="rounded-xl border-2 border-black bg-[#FFD84A] p-4 mt-4">
            <p className="font-bold text-black">💡 The real value</p>
            <p className="text-sm text-black/80 mt-1">
              Beyond direct bookings, creator content gives you professional marketing 
              assets you can use on your own listing, social media, and ads. A good 
              creator video is often better than what agencies charge $5,000+ for.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "deliverables",
      title: "Choosing deliverables",
      content: (
        <div className="space-y-4">
          <p className="text-black/80">
            What should you ask for? Here's a quick guide:
          </p>
          
          <div className="space-y-3 mt-4">
            <div className="rounded-xl border-2 border-black bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-black">Instagram Reels</p>
                  <p className="text-xs text-black/60">15-60 second vertical video</p>
                </div>
                <span className="rounded-full bg-[#28D17C] px-3 py-1 text-xs font-bold text-black">Most Popular</span>
              </div>
              <p className="mt-2 text-sm text-black/70">
                Best reach and engagement. Can go viral. Works for tours, vibes, tips.
              </p>
            </div>
            
            <div className="rounded-xl border-2 border-black bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-black">TikTok Videos</p>
                  <p className="text-xs text-black/60">15-60 second vertical video</p>
                </div>
                <span className="rounded-full bg-[#4AA3FF] px-3 py-1 text-xs font-bold text-black">High Reach</span>
              </div>
              <p className="mt-2 text-sm text-black/70">
                Younger audience, higher chance of going viral, great for unique properties.
              </p>
            </div>
            
            <div className="rounded-xl border-2 border-black bg-white p-4">
              <div>
                <p className="font-bold text-black">Instagram Stories</p>
                <p className="text-xs text-black/60">Disappear after 24 hours</p>
              </div>
              <p className="mt-2 text-sm text-black/70">
                Lower effort, good as add-ons. Best for "day in the life" content.
              </p>
            </div>
            
            <div className="rounded-xl border-2 border-black bg-white p-4">
              <div>
                <p className="font-bold text-black">YouTube Video</p>
                <p className="text-xs text-black/60">Long-form, 5-15 minutes</p>
              </div>
              <p className="mt-2 text-sm text-black/70">
                Best for SEO and long-term discovery. Higher production, bigger ask.
              </p>
            </div>
          </div>
          
          <div className="rounded-xl border-2 border-black bg-black/5 p-4 mt-4">
            <p className="text-sm text-black/70">
              <strong>Suggested starting point:</strong> 2 Instagram Reels + Stories coverage. 
              This gives you the best balance of reach, effort, and content you can repurpose.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "next-steps",
      title: "You're ready!",
      content: (
        <div className="space-y-4">
          <p className="text-lg text-black/80">
            You now know enough to start working with creators effectively.
          </p>
          
          <div className="rounded-xl border-2 border-black bg-[#28D17C] p-5 mt-4">
            <p className="font-bold text-black text-lg">Your next steps:</p>
            <ol className="mt-3 space-y-2 text-black/80">
              <li className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black bg-white text-xs font-bold">1</span>
                <span><strong>Add your property</strong> — upload photos and write a compelling description</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black bg-white text-xs font-bold">2</span>
                <span><strong>Browse creators</strong> — find ones whose audience matches your ideal guest</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black bg-white text-xs font-bold">3</span>
                <span><strong>Send an offer</strong> — be specific, be fair, be personal</span>
              </li>
            </ol>
          </div>
          
          <div className="rounded-xl border-2 border-black bg-white p-4 mt-4">
            <p className="font-bold text-black">📚 Resources</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link href="/how-to/hosts" className="text-[#4AA3FF] hover:underline">
                  Full Host Guide →
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-[#4AA3FF] hover:underline">
                  FAQs & Support →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ]

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-black/60">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-xs text-black/40">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
          </span>
        </div>
        <div className="h-2 bg-black/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#28D17C] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content card */}
      <div className="rounded-2xl border-[3px] border-black bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-black text-black mb-4">
          {currentStepData.title}
        </h2>
        
        <div className="min-h-[300px]">
          {currentStepData.content}
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-black/10">
          <button
            onClick={handleBack}
            disabled={isFirstStep}
            className={`rounded-full border-2 border-black px-5 py-2 text-sm font-bold transition-all ${
              isFirstStep 
                ? "opacity-30 cursor-not-allowed" 
                : "hover:bg-black hover:text-white"
            }`}
          >
            ← Back
          </button>
          
          <Button
            onClick={handleNext}
            className="rounded-full border-[3px] border-black bg-black px-6 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            {isLastStep ? "Get Started →" : "Next →"}
          </Button>
        </div>
      </div>

      {/* Skip link */}
      <div className="text-center mt-4">
        <button 
          onClick={onComplete}
          className="text-xs text-black/40 hover:text-black/60 underline"
        >
          Skip intro and go to dashboard
        </button>
      </div>
    </div>
  )
}
