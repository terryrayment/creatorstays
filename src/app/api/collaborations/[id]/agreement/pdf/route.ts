import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export const dynamic = 'force-dynamic'

/**
 * GET /api/collaborations/[id]/agreement/pdf
 * Generate and download PDF of the collaboration agreement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get collaboration with agreement
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: params.id },
      include: {
        agreement: true,
        host: true,
        creator: true,
        property: true,
        offer: true,
      },
    })

    if (!collaboration || !collaboration.agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    // Verify user is party to this collaboration
    const [hostProfile, creatorProfile] = await Promise.all([
      prisma.hostProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.creatorProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    const isHost = hostProfile?.id === collaboration.hostId
    const isCreator = creatorProfile?.id === collaboration.creatorId

    if (!isHost && !isCreator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const agreement = collaboration.agreement

    // Generate PDF
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    const page = pdfDoc.addPage([612, 792]) // US Letter
    const { width, height } = page.getSize()
    
    const margin = 50
    let y = height - margin

    // Helper function to draw text
    const drawText = (text: string, options: { 
      size?: number
      bold?: boolean 
      color?: [number, number, number]
      indent?: number
    } = {}) => {
      const { size = 10, bold = false, color = [0, 0, 0], indent = 0 } = options
      const selectedFont = bold ? boldFont : font
      
      // Handle long text by wrapping
      const maxWidth = width - margin * 2 - indent
      const words = text.split(' ')
      let line = ''
      
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word
        const testWidth = selectedFont.widthOfTextAtSize(testLine, size)
        
        if (testWidth > maxWidth && line) {
          page.drawText(line, {
            x: margin + indent,
            y,
            size,
            font: selectedFont,
            color: rgb(color[0], color[1], color[2]),
          })
          y -= size + 4
          line = word
        } else {
          line = testLine
        }
      }
      
      if (line) {
        page.drawText(line, {
          x: margin + indent,
          y,
          size,
          font: selectedFont,
          color: rgb(color[0], color[1], color[2]),
        })
        y -= size + 4
      }
    }

    const addSpace = (space: number = 10) => {
      y -= space
    }

    // Title
    drawText('CREATORSTAYS COLLABORATION AGREEMENT', { size: 16, bold: true })
    addSpace(20)

    // Agreement ID and Date
    const agreementId = `CS-${collaboration.id.slice(-8).toUpperCase()}`
    drawText(`Agreement ID: ${agreementId}`, { size: 9, color: [0.4, 0.4, 0.4] })
    drawText(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, { size: 9, color: [0.4, 0.4, 0.4] })
    addSpace(15)

    // Parties Section
    drawText('PARTIES', { size: 12, bold: true })
    addSpace(5)
    drawText(`Host: ${agreement.hostName}`, { indent: 10 })
    drawText(`Email: ${agreement.hostEmail}`, { indent: 10 })
    addSpace(5)
    drawText(`Creator: ${agreement.creatorName} (@${agreement.creatorHandle})`, { indent: 10 })
    drawText(`Email: ${agreement.creatorEmail}`, { indent: 10 })
    addSpace(15)

    // Property Section
    drawText('PROPERTY', { size: 12, bold: true })
    addSpace(5)
    drawText(`${agreement.propertyTitle}`, { indent: 10 })
    if (agreement.propertyLocation) {
      drawText(`Location: ${agreement.propertyLocation}`, { indent: 10 })
    }
    addSpace(15)

    // Deal Terms
    drawText('DEAL TERMS', { size: 12, bold: true })
    addSpace(5)
    const dealTypeLabel = agreement.dealType === 'post-for-stay' 
      ? 'Post-for-Stay' 
      : agreement.dealType === 'flat-with-bonus' 
        ? 'Flat Fee + Performance Bonus' 
        : 'Flat Fee'
    drawText(`Deal Type: ${dealTypeLabel}`, { indent: 10 })
    
    if (agreement.cashAmount > 0) {
      drawText(`Cash Payment: $${(agreement.cashAmount / 100).toFixed(2)}`, { indent: 10 })
    }
    if (agreement.stayIncluded && agreement.stayNights) {
      drawText(`Complimentary Stay: ${agreement.stayNights} nights`, { indent: 10 })
    }
    if (agreement.bonusEnabled && agreement.bonusAmount) {
      drawText(`Performance Bonus: $${(agreement.bonusAmount / 100).toFixed(2)} at ${agreement.bonusThreshold?.toLocaleString()} clicks`, { indent: 10 })
    }
    addSpace(15)

    // Deliverables
    drawText('DELIVERABLES', { size: 12, bold: true })
    addSpace(5)
    agreement.deliverables.forEach((d, i) => {
      drawText(`${i + 1}. ${d}`, { indent: 10 })
    })
    if (agreement.contentDeadline) {
      addSpace(5)
      drawText(`Deadline: ${new Date(agreement.contentDeadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, { indent: 10 })
    }
    addSpace(15)

    // Platform Fees
    drawText('PLATFORM FEES', { size: 12, bold: true })
    addSpace(5)
    if (agreement.dealType === 'post-for-stay') {
      drawText('Host Platform Fee: $99 (one-time)', { indent: 10 })
    } else {
      drawText(`Host Fee: ${agreement.hostFeePercent}% of payment amount`, { indent: 10 })
      drawText(`Creator Fee: ${agreement.creatorFeePercent}% of payment received`, { indent: 10 })
    }
    addSpace(15)

    // Signatures
    drawText('SIGNATURES', { size: 12, bold: true })
    addSpace(10)
    
    // Host Signature
    drawText('Host:', { bold: true, indent: 10 })
    if (agreement.hostAcceptedAt) {
      drawText(`✓ Signed by ${agreement.hostName}`, { indent: 20 })
      drawText(`Date: ${new Date(agreement.hostAcceptedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, { indent: 20, size: 9 })
      if (agreement.hostIpAddress) {
        drawText(`IP: ${agreement.hostIpAddress}`, { indent: 20, size: 8, color: [0.5, 0.5, 0.5] })
      }
    } else {
      drawText('[ Not yet signed ]', { indent: 20, color: [0.6, 0.6, 0.6] })
    }
    addSpace(10)

    // Creator Signature
    drawText('Creator:', { bold: true, indent: 10 })
    if (agreement.creatorAcceptedAt) {
      drawText(`✓ Signed by ${agreement.creatorName}`, { indent: 20 })
      drawText(`Date: ${new Date(agreement.creatorAcceptedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, { indent: 20, size: 9 })
      if (agreement.creatorIpAddress) {
        drawText(`IP: ${agreement.creatorIpAddress}`, { indent: 20, size: 8, color: [0.5, 0.5, 0.5] })
      }
    } else {
      drawText('[ Not yet signed ]', { indent: 20, color: [0.6, 0.6, 0.6] })
    }
    addSpace(20)

    // Execution Status
    if (agreement.isFullyExecuted && agreement.executedAt) {
      drawText('AGREEMENT STATUS: FULLY EXECUTED', { size: 11, bold: true, color: [0, 0.5, 0.3] })
      drawText(`Executed on: ${new Date(agreement.executedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, { size: 9 })
    } else {
      drawText('AGREEMENT STATUS: PENDING SIGNATURES', { size: 11, bold: true, color: [0.8, 0.5, 0] })
    }
    addSpace(20)

    // Footer
    const footerY = 40
    page.drawText('Generated by CreatorStays • www.creatorstays.com', {
      x: margin,
      y: footerY,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
    page.drawText(`Agreement ID: ${agreementId}`, {
      x: width - margin - 100,
      y: footerY,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()

    // Return PDF as download
    const filename = `CreatorStays_Agreement_${agreementId}.pdf`
    
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    })
  } catch (error) {
    console.error('[Agreement PDF API] Error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
