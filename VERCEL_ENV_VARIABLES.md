# 🔐 Vercel Environment Variables Setup

## Required Environment Variables for New Deployment

Copy and paste these into your new Vercel project settings:

### 1. Database (CRITICAL)
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.dkxzlgfordrunpkpvzpr.supabase.co:5432/postgres
```
**Get this from**: Supabase Dashboard → Settings → Database → Connection string

### 2. Authentication
```
NEXTAUTH_SECRET=your-random-32-character-secret-key
NEXTAUTH_URL=https://your-new-app-name.vercel.app
```
**Generate secret**: Use any random 32+ character string

### 3. AWS S3 Storage (for document uploads)
```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=your_bucket_name
```

### 4. Application Settings
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-new-app-name.vercel.app
```

### 5. Optional: Payments (Razorpay)
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## How to Add in Vercel:
1. Go to your new project in Vercel
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Your actual value
   - **Environments**: Select **Production**, **Preview**, **Development**
4. Click **Save**

## Critical Notes:
- ⚠️ **DATABASE_URL** is most important - without it, nothing works
- ⚠️ Replace `your-new-app-name` with your actual Vercel app name
- ⚠️ Get Supabase connection string from your dashboard
- ⚠️ Generate a strong NEXTAUTH_SECRET (32+ characters)

## After Adding Variables:
1. **Redeploy** your app (Deployments → Redeploy)
2. **Test** the new URL
3. **Verify** pricing shows ₹999
4. **Set up database** by visiting `/api/setup/database`

## Quick Test:
Once deployed, run:
```bash
node verify-new-deployment.js https://your-new-app-name.vercel.app
```