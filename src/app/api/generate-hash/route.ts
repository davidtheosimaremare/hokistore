import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json({
        success: false,
        error: 'Password is required'
      }, { status: 400 })
    }

    // Generate hash with same settings as auth.ts
    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)
    
    // Verify the hash works
    const verification = await bcrypt.compare(password, hash)
    
    return NextResponse.json({
      success: true,
      password: password,
      hash: hash,
      verification: verification,
      message: verification ? 'Hash generated and verified successfully' : 'Hash verification failed'
    })

  } catch (error) {
    console.error('Hash generation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate hash',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Generate hash for admin123
    const password = 'admin123'
    const hash = await bcrypt.hash(password, 10)
    const verification = await bcrypt.compare(password, hash)
    
    return NextResponse.json({
      defaultPassword: password,
      generatedHash: hash,
      verification: verification,
      currentHashInDB: '$2b$10$rOzJq3gJY.N7VQF5FQABKeqYqQ4d.u9WgS4QTlG1ZKXM6v4jKX/tG',
      instruction: 'Use this generated hash to update the database if needed'
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to generate default hash'
    }, { status: 500 })
  }
} 