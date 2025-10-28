# 🚀 New Vercel App Deployment Guide

## Why Create a New App?
Your current Vercel app is stuck with old cached builds and broken GitHub integration. A fresh deployment will solve all issues.

## Step-by-Step Setup

### 1. Create New Vercel Project
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository**:
   - Select **GitHub**
   - Choose: `sivahari1/FlipBook-DRM`
   - Click **"Import"**

### 2. Configure Project Settings
**Framework Preset**: Next.js
**Root Directory**: `./` (leave empty)
**Build Command**: `npm run build`
**Output Directory**: `.next`
**Install Command**: `npm install`

### 3. Environment Variables (CRITICAL)
Add these environment variables:

```bash
# Database
DATABASE_URL=your_supabase_connection_string

# Authentication
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://your-new-app-name.vercel.app

# AWS S3 Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_region
AWS_S3_BUCKET_NAME=your_bucket_name

# Optional: Razorpay (for payments)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 4. Deploy
1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Get your new URL: `https://your-new-app-name.vercel.app`

## Expected Results
✅ Shows ₹999 for 1 Month Plan
✅ Auto-deployment works on GitHub push
✅ Database connection works
✅ Document uploads work
✅ Share links work

## After Deployment
1. **Test the pricing**: Should show ₹999
2. **Set up database**: Visit `/api/setup/database` 
3. **Update domain**: Point your custom domain to new app
4. **Delete old app**: Remove the broken Vercel project

## Verification Checklist
- [ ] Pricing shows ₹999 (not ₹1,999)
- [ ] Database setup API works
- [ ] Document upload works
- [ ] Share links work
- [ ] Auto-deployment triggers on push

## Troubleshooting
If issues persist:
1. Check environment variables are set correctly
2. Ensure DATABASE_URL is valid Supabase connection
3. Verify GitHub integration is connected
4. Check build logs for errors

## Benefits of Fresh Deployment
- ✅ Clean build cache
- ✅ Proper GitHub integration
- ✅ Latest code deployed
- ✅ All environment variables fresh
- ✅ No legacy configuration issues