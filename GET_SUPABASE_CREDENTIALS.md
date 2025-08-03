# 🔑 How to Get Your Supabase Credentials for Vercel

Follow these steps to get all the credentials you need for deployment:

## Step 1: Go to Your Supabase Dashboard

1. Visit: https://supabase.com/dashboard
2. Sign in to your account
3. Select your project (or create a new one if you don't have one)

## Step 2: Get SUPABASE_URL and SUPABASE_ANON_KEY

1. In your Supabase project dashboard
2. Click on **"Settings"** in the left sidebar
3. Click on **"API"**
4. You'll see:
   - **Project URL** (this is your `SUPABASE_URL`)
   - **Project API keys** section with **anon/public** key (this is your `SUPABASE_ANON_KEY`)

Copy these values:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Get DATABASE_URL

1. Still in **Settings** → **Database**
2. Scroll down to **"Connection string"**
3. Select **"Pooler"** → **"Transaction"**
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual database password

It will look like:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres
```

## Step 4: Complete Environment Variables for Vercel

Here's what you'll paste in Vercel:

```
DATABASE_URL=postgresql://postgres:your-actual-password@db.your-project-id.supabase.co:5432/postgres
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
```

## Don't Have a Supabase Project? Create One:

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign in with GitHub
4. Click **"New project"**
5. Choose organization and fill details:
   - **Name**: LoveAIHub
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for testing
6. Click **"Create new project"**
7. Wait 2-3 minutes for setup
8. Follow steps above to get credentials

## Security Notes:

- Never commit these values to your GitHub repository
- Only add them in Vercel's environment variables section
- The VITE_ prefixed variables are needed for the frontend
- Keep your database password secure

## Ready for Vercel:

Once you have all these values, go to:
1. https://vercel.com/new
2. Import your GitHub repository
3. Add these environment variables
4. Deploy!

Your LoveAIHub with beautiful MagicPath authentication will be live!