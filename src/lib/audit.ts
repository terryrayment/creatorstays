/**
 * Audit Logging System
 * 
 * Records all sensitive actions for compliance and debugging.
 * Every action that changes state should be logged here.
 * 
 * Common actions:
 * - offer.created, offer.status_changed, offer.expired
 * - collab.started, collab.completed, collab.cancelled
 * - admin.impersonate, admin.user_suspended
 * - payment.initiated, payment.completed, payment.failed
 */

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type ActorType = 'user' | 'admin' | 'system' | 'cron'

export interface AuditLogEntry {
  action: string
  actorType: ActorType
  actorId: string
  actorEmail?: string
  targetType: string
  targetId: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Log an action to the audit log
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<string> {
  const log = await prisma.auditLog.create({
    data: {
      action: entry.action,
      actorType: entry.actorType,
      actorId: entry.actorId,
      actorEmail: entry.actorEmail,
      targetType: entry.targetType,
      targetId: entry.targetId,
      metadata: (entry.metadata || {}) as Prisma.InputJsonValue,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    },
  })
  
  return log.id
}

/**
 * Helper for logging offer-related events
 */
export async function logOfferEvent(
  action: 'offer.created' | 'offer.status_changed' | 'offer.expired' | 'offer.viewed',
  offerId: string,
  actorType: ActorType,
  actorId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    action,
    actorType,
    actorId,
    targetType: 'Offer',
    targetId: offerId,
    metadata,
  })
}

/**
 * Helper for logging collaboration-related events
 */
export async function logCollabEvent(
  action: 'collab.started' | 'collab.completed' | 'collab.cancelled' | 'collab.status_changed',
  collabId: string,
  actorType: ActorType,
  actorId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    action,
    actorType,
    actorId,
    targetType: 'Collaboration',
    targetId: collabId,
    metadata,
  })
}

/**
 * Helper for logging admin actions
 */
export async function logAdminAction(
  action: string,
  adminId: string,
  adminEmail: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  await logAuditEvent({
    action: `admin.${action}`,
    actorType: 'admin',
    actorId: adminId,
    actorEmail: adminEmail,
    targetType,
    targetId,
    metadata,
    ipAddress,
  })
}

/**
 * Helper for logging system/cron events
 */
export async function logSystemEvent(
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    action: `system.${action}`,
    actorType: 'system',
    actorId: 'system',
    targetType,
    targetId,
    metadata,
  })
}

/**
 * Query audit logs for a specific target
 */
export async function getAuditLogsForTarget(
  targetType: string,
  targetId: string,
  limit = 50
) {
  return prisma.auditLog.findMany({
    where: {
      targetType,
      targetId,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/**
 * Query audit logs for a specific actor
 */
export async function getAuditLogsForActor(
  actorId: string,
  limit = 50
) {
  return prisma.auditLog.findMany({
    where: { actorId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/**
 * Query recent audit logs by action type
 */
export async function getRecentAuditLogs(
  action?: string,
  limit = 100
) {
  return prisma.auditLog.findMany({
    where: action ? { action } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/**
 * Common action constants for type safety
 */
export const AUDIT_ACTIONS = {
  // Offer actions
  OFFER_CREATED: 'offer.created',
  OFFER_STATUS_CHANGED: 'offer.status_changed',
  OFFER_EXPIRED: 'offer.expired',
  OFFER_VIEWED: 'offer.viewed',
  
  // Collaboration actions
  COLLAB_STARTED: 'collab.started',
  COLLAB_COMPLETED: 'collab.completed',
  COLLAB_CANCELLED: 'collab.cancelled',
  COLLAB_STATUS_CHANGED: 'collab.status_changed',
  
  // Payment actions
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  
  // Admin actions
  ADMIN_IMPERSONATE: 'admin.impersonate',
  ADMIN_USER_SUSPENDED: 'admin.user_suspended',
  ADMIN_USER_UNSUSPENDED: 'admin.user_unsuspended',
  ADMIN_OFFER_FLAGGED: 'admin.offer_flagged',
  
  // System actions
  SYSTEM_OFFER_EXPIRED: 'system.offer_expired',
  SYSTEM_TRUST_UPDATED: 'system.trust_updated',
} as const

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS]
