import Link from "next/link"

export default function CreatorNotFound() {
  return (
    <div className="min-h-screen bg-black px-4 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border-[3px] border-black bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black bg-[#FF6B6B]">
            <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-black text-black">Creator Not Found</h1>
          <p className="mt-2 text-sm text-black/60">
            This creator profile doesn't exist or hasn't been set up yet.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/creators"
              className="rounded-full border-[3px] border-black bg-black px-6 py-3 text-sm font-black text-white transition-transform hover:-translate-y-1"
            >
              Browse Creators
            </Link>
            <Link
              href="/waitlist"
              className="rounded-full border-[3px] border-black bg-white px-6 py-3 text-sm font-black text-black transition-transform hover:-translate-y-1"
            >
              Join as Creator
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
