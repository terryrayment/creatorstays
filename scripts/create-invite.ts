/**
 * Script to create a creator invite token
 * 
 * Usage:
 *   cd creatorstays
 *   npx tsx scripts/create-invite.ts
 *   npx tsx scripts/create-invite.ts --max-uses=10 --note="For influencer campaign"
 *   npx tsx scripts/create-invite.ts --expires=30 --note="30-day limited invite"
 * 
 * Make sure to run `npm install` first if you haven't!
 */

import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

// Generate a friendly, memorable invite code
function generateInviteCode(): string {
  const adjectives = ['BRIGHT', 'SWIFT', 'BOLD', 'PRIME', 'EPIC', 'SPARK', 'BLAZE', 'NOVA', 'APEX', 'VIBE']
  const nouns = ['STAY', 'CREATOR', 'COLLAB', 'DREAM', 'LAUNCH', 'WAVE', 'SPARK', 'FLOW', 'GLOW', 'RISE']
  const numbers = Math.floor(Math.random() * 900) + 100 // 100-999
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  
  return `${adj}${noun}${numbers}`
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2)
  let maxUses = 100 // Default: 100 uses
  let expiresInDays: number | null = null // Default: no expiration
  let note = 'General beta invite'
  
  for (const arg of args) {
    if (arg.startsWith('--max-uses=')) {
      maxUses = parseInt(arg.split('=')[1], 10)
    } else if (arg.startsWith('--expires=')) {
      expiresInDays = parseInt(arg.split('=')[1], 10)
    } else if (arg.startsWith('--note=')) {
      note = arg.split('=')[1]
    }
  }
  
  // Generate the invite code
  const token = generateInviteCode()
  
  // Calculate expiration date if specified
  const expiresAt = expiresInDays 
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null
  
  // Create the invite in the database
  const invite = await prisma.creatorInvite.create({
    data: {
      token,
      maxUses,
      expiresAt,
      note,
      createdBy: 'admin-script',
    },
  })
  
  console.log('\n' + '='.repeat(60))
  console.log('🎉 CREATOR INVITE TOKEN CREATED!')
  console.log('='.repeat(60))
  console.log('')
  console.log(`Token:        ${invite.token}`)
  console.log(`Max Uses:     ${invite.maxUses}`)
  console.log(`Expires:      ${invite.expiresAt ? invite.expiresAt.toLocaleDateString() : 'Never'}`)
  console.log(`Note:         ${invite.note}`)
  console.log('')
  console.log('📧 SHAREABLE LINK:')
  console.log('')
  console.log(`   https://creatorstays.co/join/${invite.token}`)
  console.log('')
  console.log('='.repeat(60))
  console.log('')
  
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('Error creating invite:', e)
  await prisma.$disconnect()
  process.exit(1)
})
