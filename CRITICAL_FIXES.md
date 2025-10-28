# Critical Production Fixes

## Issues Identified
1. ❌ Supabase database is empty (no tables)
2. ❌ Vercel auto-deployment not working (GitHub integration)
3. ❌ Document preview not working (database dependency)
4. ❌ Share links not working (database dependency)

## Fix Steps

### 1. Fix Database Setup (URGENT)

Your Supabase database is completely empty. Run this immediately:

```bash
# Option A: Run via your deployed app
curl -X POST https://flip-book-drm.vercel.app/api/setup/database

# Option B: Run the fix script
node fix-database.js
```

### 2. Verify Database Tables Created

After running the setup, check your Supabase dashboard. You should see these tables:
- User
- Document  
- ShareLink
- ViewAudit

### 3. Fix Vercel Auto-Deployment

**In GitHub Repository Settings:**
1. Go to https://github.com/sivahari1/FlipBook-DRM/settings
2. Click "Webhooks" in left sidebar
3. Delete any AWS Amplify webhooks
4. Click "Applications" → "Authorized OAuth Apps"
5. Remove AWS Amplify access

**In Vercel Dashboard:**
1. Go to your project settings
2. Click "Git" tab
3. If not connected, click "Connect Git Repository"
4. Select your GitHub repo: sivahari1/FlipBook-DRM
5. Set branch to "main"

### 4. Test All Fixes

After database setup:
1. ✅ Upload a document → Should work
2. ✅ Preview document → Should work  
3. ✅ Create share link → Should work
4. ✅ Access share link → Should work

## Environment Variables Check

Ensure these are set in Vercel:
- DATABASE_URL (Supabase connection string)
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- AWS_ACCESS_KEY_ID (for S3)
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- AWS_S3_BUCKET_NAME

## Expected Results

After fixes:
- 🟢 Supabase shows 4 tables with data
- 🟢 Document uploads work
- 🟢 Document previews work
- 🟢 Share links work
- 🟢 Auto-deployment triggers on GitHub push