import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/properties/[id]/manual-blocks/[blockId]
 * Delete a manual block
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; blockId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the block and verify ownership through property
    const block = await prisma.propertyManualBlock.findUnique({
      where: { id: params.blockId },
      include: {
        property: {
          include: { hostProfile: { select: { userId: true } } },
        },
      },
    })

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    if (block.property.id !== params.id) {
      return NextResponse.json({ error: 'Block does not belong to this property' }, { status: 400 })
    }

    if (block.property.hostProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Delete the block
    await prisma.propertyManualBlock.delete({
      where: { id: params.blockId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete manual block' }, { status: 500 })
  }
}
