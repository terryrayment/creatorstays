/**
 * Analytics Event Logging
 * 
 * Records key funnel events for future analysis.
 * Keep this minimal - we're collecting data, not analyzing yet.
 * 
 * Events to track:
 * - offer_sent: Host sends an offer
 * - offer_responded: Creator responds (accept/decline/counter)
 * - collab_started: Collaboration begins
 * - collab_completed: Collaboration finishes successfully
 * - profile_viewed: A creator profile is viewed by a host
 */

import { prisma } from '@/lib/prisma'

export type AnalyticsActorType = 'creator' | 'host' | 'visitor' | 'system'

export interface AnalyticsEventData {
  actorType: AnalyticsActorType
  actorId: string
  eventType: string
  eventData?: Record<string, unknown>
  sessionId?: string
}

/**
 * Log an analytics event
 */
export async function logAnalyticsEvent(event: AnalyticsEventData): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        actorType: event.actorType,
        actorId: event.actorId,
        eventType: event.eventType,
        eventData: event.eventData || {},
        sessionId: event.sessionId,
      },
    })
  } catch (error) {
    // Don't let analytics failures break the app
    console.error('[Analytics] Failed to log event:', error)
  }
}

// ============================================================================
// Typed event helpers
// ============================================================================

/**
 * Log when a host sends an offer
 */
export async function logOfferSent(
  hostProfileId: string,
  offerId: string,
  creatorProfileId: string,
  totalValueCents: number
): Promise<void> {
  await logAnalyticsEvent({
    actorType: 'host',
    actorId: hostProfileId,
    eventType: 'offer_sent',
    eventData: {
      offerId,
      creatorProfileId,
      totalValueCents,
    },
  })
}

/**
 * Log when a creator responds to an offer
 */
export async function logOfferResponded(
  creatorProfileId: string,
  offerId: string,
  response: 'accepted' | 'declined' | 'countered',
  hostProfileId: string
): Promise<void> {
  await logAnalyticsEvent({
    actorType: 'creator',
    actorId: creatorProfileId,
    eventType: 'offer_responded',
    eventData: {
      offerId,
      response,
      hostProfileId,
    },
  })
}

/**
 * Log when a collaboration starts
 */
export async function logCollabStarted(
  collabId: string,
  creatorProfileId: string,
  hostProfileId: string,
  totalValueCents: number
): Promise<void> {
  // Log for both parties
  await logAnalyticsEvent({
    actorType: 'creator',
    actorId: creatorProfileId,
    eventType: 'collab_started',
    eventData: {
      collabId,
      hostProfileId,
      totalValueCents,
      role: 'creator',
    },
  })
  
  await logAnalyticsEvent({
    actorType: 'host',
    actorId: hostProfileId,
    eventType: 'collab_started',
    eventData: {
      collabId,
      creatorProfileId,
      totalValueCents,
      role: 'host',
    },
  })
}

/**
 * Log when a collaboration completes
 */
export async function logCollabCompleted(
  collabId: string,
  creatorProfileId: string,
  hostProfileId: string,
  totalValueCents: number
): Promise<void> {
  await logAnalyticsEvent({
    actorType: 'system',
    actorId: 'system',
    eventType: 'collab_completed',
    eventData: {
      collabId,
      creatorProfileId,
      hostProfileId,
      totalValueCents,
    },
  })
}

/**
 * Log when a host views a creator's profile
 */
export async function logProfileViewed(
  hostProfileId: string,
  creatorProfileId: string,
  source?: string
): Promise<void> {
  await logAnalyticsEvent({
    actorType: 'host',
    actorId: hostProfileId,
    eventType: 'profile_viewed',
    eventData: {
      creatorProfileId,
      source,
    },
  })
}

// ============================================================================
// Event type constants
// ============================================================================

export const ANALYTICS_EVENTS = {
  OFFER_SENT: 'offer_sent',
  OFFER_RESPONDED: 'offer_responded',
  COLLAB_STARTED: 'collab_started',
  COLLAB_COMPLETED: 'collab_completed',
  PROFILE_VIEWED: 'profile_viewed',
} as const

export type AnalyticsEventType = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS]
