// Database setup script for production
const { PrismaClient } = require('@prisma/client')

async function setupDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  try {
    console.log('🔄 Setting up database tables...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Create tables using raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "passwordHash" TEXT,
        "role" TEXT NOT NULL DEFAULT 'VIEWER',
        "emailVerified" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `
    
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `
    
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
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
      );
    `
    
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
    
    // Create a demo user
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
    console.log('🎉 Database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error)
      process.exit(1)
    })
}

module.exports = { setupDatabase }