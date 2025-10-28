import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Database setup initiated...')
    
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      return NextResponse.json({
        success: false,
        database: { configured: false, type: 'none', provider: 'none' },
        message: 'Database not configured - DATABASE_URL environment variable missing'
      }, { status: 400 })
    }

    // Test connection
    console.log('🔍 Testing database connection...')
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful')

    // Create tables if they don't exist
    console.log('📋 Creating database tables...')
    
    try {
      // Create User table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "passwordHash" TEXT,
          "role" TEXT NOT NULL DEFAULT 'VIEWER',
          "emailVerified" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
        );
      `
      
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
      `
      
      // Create Document table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Document" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "filename" TEXT NOT NULL,
          "fileSize" INTEGER NOT NULL,
          "mimeType" TEXT NOT NULL,
          "pageCount" INTEGER NOT NULL DEFAULT 0,
          "uploaderId" TEXT NOT NULL,
          "s3Key" TEXT NOT NULL,
          "drmOptions" TEXT NOT NULL DEFAULT '{}',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
        );
      `
      
      // Create ShareLink table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "ShareLink" (
          "id" TEXT NOT NULL,
          "documentId" TEXT NOT NULL,
          "creatorId" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "expiresAt" TIMESTAMP(3),
          "maxOpens" INTEGER,
          "openCount" INTEGER NOT NULL DEFAULT 0,
          "requirePass" BOOLEAN NOT NULL DEFAULT false,
          "passphraseHash" TEXT,
          "passphraseHint" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
        );
      `
      
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "ShareLink_code_key" ON "ShareLink"("code");
      `
      
      // Create ViewAudit table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "ViewAudit" (
          "id" TEXT NOT NULL,
          "userId" TEXT,
          "shareLinkId" TEXT,
          "documentId" TEXT NOT NULL,
          "ipHash" TEXT NOT NULL,
          "uaHash" TEXT NOT NULL,
          "sessionId" TEXT NOT NULL,
          "event" TEXT NOT NULL,
          "meta" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ViewAudit_pkey" PRIMARY KEY ("id")
        );
      `
      
      console.log('✅ All tables created successfully!')
      
      // Create demo user if it doesn't exist
      try {
        await prisma.user.upsert({
          where: { email: 'demo@example.com' },
          update: {},
          create: {
            id: 'demo-user-1',
            email: 'demo@example.com',
            passwordHash: 'demo-hash',
            role: 'CREATOR',
            emailVerified: true
          }
        })
        console.log('✅ Demo user created')
      } catch (userError) {
        console.log('ℹ️ Demo user already exists or creation failed')
      }
      
      // Get counts
      const userCount = await prisma.user.count()
      const docCount = await prisma.document.count()
      
      return NextResponse.json({
        success: true,
        database: {
          configured: true,
          type: 'postgresql',
          provider: 'supabase',
          tablesExist: true,
          userCount,
          documentCount: docCount
        },
        message: 'Database setup completed successfully! All tables created.'
      })
      
    } catch (tableError) {
      console.error('❌ Table creation failed:', tableError)
      
      return NextResponse.json({
        success: false,
        database: {
          configured: true,
          type: 'postgresql',
          provider: 'supabase',
          tablesExist: false,
          error: tableError instanceof Error ? tableError.message : 'Table creation failed'
        },
        message: 'Database connected but table creation failed'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    
    return NextResponse.json({
      success: false,
      database: {
        configured: false,
        type: 'none',
        provider: 'none'
      },
      error: error instanceof Error ? error.message : 'Database setup failed',
      message: 'Failed to connect to database. Check your DATABASE_URL configuration.'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      return NextResponse.json({
        success: false,
        database: { configured: false, type: 'none', provider: 'none' },
        message: 'Database not configured'
      })
    }

    // Test connection and tables
    try {
      await prisma.$queryRaw`SELECT 1 as test`
      
      const userCount = await prisma.user.count()
      const docCount = await prisma.document.count()
      
      return NextResponse.json({
        success: true,
        database: {
          configured: true,
          type: 'postgresql',
          provider: 'supabase',
          connected: true,
          tablesExist: true,
          userCount,
          documentCount: docCount
        },
        message: 'Database is fully operational'
      })
      
    } catch (error) {
      return NextResponse.json({
        success: false,
        database: {
          configured: true,
          type: 'postgresql',
          provider: 'supabase',
          connected: false,
          tablesExist: false,
          error: error instanceof Error ? error.message : 'Connection failed'
        },
        message: 'Database connection or schema issues detected - tables need to be created'
      })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database status check failed'
    }, { status: 500 })
  }
}