# URGENT: Database Connection Fix

## Problem
Your Supabase database connection is failing. The error shows:
```
Can't reach database server at `db.dkxzlgfordrunpkpvzpr.supabase.co:5432`
```

## Immediate Fix Steps

### 1. Check Supabase Database Status
1. Go to https://supabase.com/dashboard
2. Select your project
3. Check if the database is paused or has issues
4. If paused, click "Resume" or "Restore"

### 2. Get Correct DATABASE_URL
1. In Supabase dashboard → Settings → Database
2. Copy the "Connection string" under "Connection parameters"
3. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.dkxzlgfordrunpkpvzpr.supabase.co:5432/postgres
   ```

### 3. Update Vercel Environment Variables
1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Update DATABASE_URL with the correct connection string from Supabase
3. Make sure it's set for "Production", "Preview", and "Development"
4. Click "Save"

### 4. Redeploy
After updating the environment variable:
1. Go to Vercel dashboard → Deployments
2. Click "..." on latest deployment → "Redeploy"
3. Wait for deployment to complete

### 5. Test Database Setup
Once redeployed, test the database setup:
```bash
curl -X POST https://flip-book-drm.vercel.app/api/setup/database
```

## Alternative: Manual Database Setup

If the API still fails, set up tables manually in Supabase:

1. Go to Supabase → SQL Editor
2. Run this SQL:

```sql
-- Create User table
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

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Create Document table
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

-- Create ShareLink table
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

CREATE UNIQUE INDEX IF NOT EXISTS "ShareLink_code_key" ON "ShareLink"("code");

-- Create ViewAudit table
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

-- Insert demo user
INSERT INTO "User" ("id", "email", "passwordHash", "role", "emailVerified") 
VALUES ('demo-user-1', 'demo@example.com', 'demo-hash', 'CREATOR', true)
ON CONFLICT ("email") DO NOTHING;
```

## Expected Result
After fixing the database connection, you should see:
- ✅ 4 tables in Supabase dashboard
- ✅ Document uploads work
- ✅ Document previews work  
- ✅ Share links work