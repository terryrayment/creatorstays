"use client"

import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Navbar } from "@/components/navigation/navbar"
import { Footer } from "@/components/navigation/footer"

export default function HostCollaborationsPage() {
  return (
    <div className="dashboard flex min-h-screen flex-col bg-[#FAFAFA]">
      <Navbar />
      <main className="flex-1 py-6">
        <Container>
          <div className="mb-4">
            <Link href="/dashboard/host" className="text-xs font-bold text-black/60 hover:text-black">
              ← Dashboard
            </Link>
          </div>

          <div className="rounded-xl border-2 border-black bg-white p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#4AA3FF] px-3 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-black">Coming Soon</span>
            </div>
            
            <h1 className="text-2xl font-bold text-black">Collaborations</h1>
            <p className="mt-2 text-sm text-black/60">
              Track all your creator collaborations, tracked links, and payment status in one place.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border-2 border-black bg-[#FFD84A] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black">Active</p>
                <p className="mt-1 text-3xl font-bold text-black">0</p>
                <p className="mt-1 text-xs text-black/60">Ongoing collaborations</p>
              </div>
              <div className="rounded-lg border-2 border-black bg-[#28D17C] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black">Completed</p>
                <p className="mt-1 text-3xl font-bold text-black">0</p>
                <p className="mt-1 text-xs text-black/60">Finished & paid</p>
              </div>
              <div className="rounded-lg border-2 border-black bg-[#4AA3FF] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black">Total Clicks</p>
                <p className="mt-1 text-3xl font-bold text-black">0</p>
                <p className="mt-1 text-xs text-black/60">From tracked links</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border-2 border-dashed border-black/30 p-8 text-center">
              <p className="text-sm font-bold text-black">No collaborations yet</p>
              <p className="mt-1 text-xs text-black/60">
                Find creators and send your first offer to get started.
              </p>
              <Link
                href="/creators"
                className="mt-4 inline-flex h-9 items-center rounded-full border-2 border-black bg-black px-4 text-[10px] font-bold uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5"
              >
                Find Creators
              </Link>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
