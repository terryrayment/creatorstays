import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5 // max requests
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour in ms

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return false
  }
  
  if (entry.count >= RATE_LIMIT) {
    return true
  }
  
  entry.count++
  return false
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, message, website } = body

    // Honeypot check - if website field is filled, it's a bot
    if (website) {
      console.log('[Contact] Honeypot triggered, ignoring submission')
      // Return success to not reveal detection
      return NextResponse.json({ success: true })
    }

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Store in database
    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email: email.toLowerCase(),
        message,
        ip,
      },
    })

    console.log('[Contact] Message saved:', {
      id: contact.id,
      name,
      email,
      ip,
    })

    // Try to send email via Resend if configured
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    if (RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'CreatorStays <hello@creatorstays.com>',
            to: 'hello@creatorstays.com',
            reply_to: email,
            subject: `Contact Form: ${name}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #000; border-bottom: 2px solid #FFD84A; padding-bottom: 10px;">
                  New Contact Form Submission
                </h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                  IP: ${ip} | Submitted: ${new Date().toISOString()}
                </p>
              </div>
            `,
          }),
        })
        console.log('[Contact] Email sent via Resend')
      } catch (emailError) {
        console.error('[Contact] Email send failed:', emailError)
        // Don't fail the request if email fails - we have DB backup
      }
    } else {
      console.log('[Contact] No RESEND_API_KEY - message stored in DB only')
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent. We\'ll get back to you within 24 hours.',
    })
  } catch (error) {
    console.error('[Contact] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
