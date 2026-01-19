import { NextRequest, NextResponse } from 'next/server'
import {
  collaborations,
  clicks,
  mockCreators,
  mockHosts,
  type CollaborationAnalytics,
} from '@/lib/collaboration-types'

// GET - Get analytics for a collaboration or all collaborations for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const collaborationId = searchParams.get('collaborationId')
  const creatorId = searchParams.get('creatorId')
  const hostId = searchParams.get('hostId')

  // Single collaboration analytics
  if (collaborationId) {
    const collab = collaborations.find(c => c.id === collaborationId)
    if (!collab) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    const analytics = computeAnalytics(collab.id)
    const creator = mockCreators.find(c => c.id === collab.creatorId)
    const host = mockHosts.find(h => h.id === collab.hostId)
    const property = host?.properties.find(p => p.id === collab.propertyId)

    return NextResponse.json({
      collaboration: { ...collab, creator, host, property },
      analytics,
    })
  }

  // All collaborations for a creator
  if (creatorId) {
    const creatorCollabs = collaborations.filter(c => c.creatorId === creatorId)
    const results = creatorCollabs.map(collab => {
      const analytics = computeAnalytics(collab.id)
      const host = mockHosts.find(h => h.id === collab.hostId)
      const property = host?.properties.find(p => p.id === collab.propertyId)
      return { collaboration: { ...collab, host, property }, analytics }
    })

    const totals = {
      totalCollaborations: results.length,
      activeCollaborations: results.filter(r => r.collaboration.status === 'active').length,
      totalClicks: results.reduce((sum, r) => sum + r.analytics.totalClicks, 0),
      totalUniqueClicks: results.reduce((sum, r) => sum + r.analytics.uniqueClicks, 0),
    }

    return NextResponse.json({ collaborations: results, totals })
  }

  // All collaborations for a host
  if (hostId) {
    const hostCollabs = collaborations.filter(c => c.hostId === hostId)
    const results = hostCollabs.map(collab => {
      const analytics = computeAnalytics(collab.id)
      const creator = mockCreators.find(c => c.id === collab.creatorId)
      const host = mockHosts.find(h => h.id === collab.hostId)
      const property = host?.properties.find(p => p.id === collab.propertyId)
      return { collaboration: { ...collab, creator, property }, analytics }
    })

    const totals = {
      totalCollaborations: results.length,
      activeCollaborations: results.filter(r => r.collaboration.status === 'active').length,
      totalClicks: results.reduce((sum, r) => sum + r.analytics.totalClicks, 0),
      totalUniqueClicks: results.reduce((sum, r) => sum + r.analytics.uniqueClicks, 0),
    }

    return NextResponse.json({ collaborations: results, totals })
  }

  return NextResponse.json({ error: 'Provide collaborationId, creatorId, or hostId' }, { status: 400 })
}

function computeAnalytics(collaborationId: string): CollaborationAnalytics {
  const collabClicks = clicks.filter(c => c.collaborationId === collaborationId)
  
  const uniqueClicks = collabClicks.filter(c => c.isUnique).length
  const revisits = collabClicks.filter(c => c.isRevisit).length
  
  // Group by day
  const clicksByDay: { [key: string]: number } = {}
  collabClicks.forEach(click => {
    const day = click.clickedAt.toISOString().split('T')[0]
    clicksByDay[day] = (clicksByDay[day] || 0) + 1
  })
  
  // Group by device
  const clicksByDevice: { [key: string]: number } = {}
  collabClicks.forEach(click => {
    const device = click.device || 'unknown'
    clicksByDevice[device] = (clicksByDevice[device] || 0) + 1
  })

  const lastClick = collabClicks.length > 0 
    ? collabClicks.reduce((latest, c) => c.clickedAt > latest.clickedAt ? c : latest).clickedAt
    : undefined

  return {
    collaborationId,
    totalClicks: collabClicks.length,
    uniqueClicks,
    revisits,
    clicksByDay: Object.entries(clicksByDay).map(([date, clicks]) => ({ date, clicks })),
    clicksByDevice: Object.entries(clicksByDevice).map(([device, count]) => ({ device, count })),
    lastClickAt: lastClick,
  }
}
