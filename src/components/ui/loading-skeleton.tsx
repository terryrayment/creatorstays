"use client"

import { cn } from "@/lib/utils"

/**
 * Skeleton loading components for dashboard pages
 * Matches the design system with black borders and brand colors
 */

interface SkeletonProps {
  className?: string
}

// Base skeleton with shimmer animation
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "animate-pulse rounded-lg bg-black/10",
        className
      )}
    />
  )
}

// Card skeleton matching the design system
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn(
      "rounded-2xl border-[3px] border-black/20 bg-white/50 p-5",
      className
    )}>
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

// Stats card skeleton
export function SkeletonStat({ className }: SkeletonProps) {
  return (
    <div className={cn(
      "rounded-xl border-[3px] border-black/20 bg-white/50 p-4",
      className
    )}>
      <Skeleton className="h-3 w-16 mb-2" />
      <Skeleton className="h-8 w-24" />
    </div>
  )
}

// Dashboard page skeleton
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="border-b-2 border-black/10 bg-white/50 px-4 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>

      {/* Stats row */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>
      </div>

      {/* Content area */}
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  )
}

// Host dashboard skeleton
export function HostDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] animate-in fade-in duration-300">
      {/* Yellow banner skeleton */}
      <div className="border-b-2 border-black/20 bg-[#FFD84A]/30 px-4 py-3">
        <div className="mx-auto max-w-6xl flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Next steps strip */}
      <div className="border-b-2 border-black/10 bg-white/50 px-4 py-3">
        <div className="mx-auto max-w-6xl flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  )
}

// Creator dashboard skeleton
export function CreatorDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-black animate-in fade-in duration-300">
      <div className="px-3 pt-4 pb-8 lg:px-4">
        <div className="mx-auto max-w-4xl">
          {/* Profile header skeleton */}
          <div className="rounded-2xl border-[3px] border-white/20 bg-white/5 p-6 mb-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-20 w-20 rounded-full bg-white/10" />
              <div className="flex-1">
                <Skeleton className="h-3 w-16 mb-2 bg-white/10" />
                <Skeleton className="h-8 w-48 mb-2 bg-white/10" />
                <Skeleton className="h-4 w-32 bg-white/10" />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border-[3px] border-white/20 bg-white/5 p-4">
                <Skeleton className="h-3 w-12 mb-2 bg-white/10" />
                <Skeleton className="h-6 w-16 bg-white/10" />
              </div>
            ))}
          </div>

          {/* Content cards */}
          <div className="space-y-4">
            <div className="rounded-2xl border-[3px] border-white/20 bg-white/5 p-5">
              <Skeleton className="h-4 w-24 mb-3 bg-white/10" />
              <Skeleton className="h-6 w-full mb-2 bg-white/10" />
              <Skeleton className="h-6 w-3/4 bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Table skeleton for lists
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border-[3px] border-black bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b-2 border-black/10 bg-black/5 px-4 py-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-black/10 px-4 py-4 last:border-0">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Full page loading state
export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto h-12 w-12">
          <div className="absolute inset-0 rounded-full border-[3px] border-black/20" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-black animate-spin" />
        </div>
        <p className="mt-4 text-sm font-medium text-black/60">{message}</p>
      </div>
    </div>
  )
}
