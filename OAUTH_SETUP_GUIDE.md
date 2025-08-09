# Complete OAuth Setup Guide - LoveAIHub

## 🔧 Critical Configuration Steps

### 1. Supabase Project Settings

**Navigate to:** Supabase Dashboard → Authentication → URL Configuration

**Site URL:**
```
https://www.loveaihub.com
```

**Redirect URLs (ALL of these must be added):**
```
https://www.loveaihub.com/auth/callback
https://b7e5be42-6638-4562-9f22-45864e9d423d-00-3ue6fyi4lbny4.janeway.replit.dev/auth/callback
http://localhost:5000/auth/callback
```

### 2. Google Cloud Console Configuration

**Navigate to:** Google Cloud Console → APIs & Services → Credentials

**OAuth 2.0 Client IDs → Edit your client:**

**Authorized JavaScript origins:**
```
https://gfrpidhedgqixkgafumc.supabase.co
https://www.loveaihub.com
```

**Authorized redirect URIs:**
```
https://gfrpidhedgqixkgafumc.supabase.co/auth/v1/callback
```

### 3. Supabase Auth Providers

**Navigate to:** Supabase Dashboard → Authentication → Providers

**Google Provider Settings:**
- Enable Google provider
- Add your Google Client ID
- Add your Google Client Secret
- **Redirect URL (use this exact URL):**
  ```
  https://gfrpidhedgqixkgafumc.supabase.co/auth/v1/callback
  ```

### 4. Environment Variables

**Vercel Project Settings → Environment Variables:**
```
SUPABASE_URL=https://gfrpidhedgqixkgafumc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcnBpZGhlZGdxaXhrZ2FmdW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODM0NjgsImV4cCI6MjA2OTE1OTQ2OH0.JaYdiISBG8vqfen_qzkOVgYRBq4V2v5CzvxjhBBsM9c
DATABASE_URL=postgresql://postgres.gfrpidhedgqixkgafumc:[AKraj@$5630]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

**Replit Secrets:**
```
SUPABASE_URL=https://gfrpidhedgqixkgafumc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcnBpZGhlZGdxaXhrZ2FmdW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODM0NjgsImV4cCI6MjA2OTE1OTQ2OH0.JaYdiISBG8vqfen_qzkOVgYRBq4V2v5CzvxjhBBsM9c
VITE_SUPABASE_URL=https://gfrpidhedgqixkgafumc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcnBpZGhlZGdxaXhrZ2FmdW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODM0NjgsImV4cCI6MjA2OTE1OTQ2OH0.JaYdiISBG8vqfen_qzkOVgYRBq4V2v5CzvxjhBBsM9c
```

## 🚀 Deployment Steps

1. **Update Supabase configuration** (steps 1-3 above)
2. **Redeploy Vercel project** (will automatically use new OAuth flow)
3. **Test authentication** on https://www.loveaihub.com

## 🔍 Troubleshooting

- **404 Error:** Check Vercel routing configuration
- **Missing Code:** Verify Google Cloud redirect URIs
- **Authentication Error:** Check Supabase provider settings
- **Token Issues:** Verify environment variables are set correctly

## ✅ Expected Flow

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. Google redirects to: `https://gfrpidhedgqixkgafumc.supabase.co/auth/v1/callback`
4. Supabase processes OAuth and redirects to: `https://www.loveaihub.com/auth/callback`
5. Our serverless function sets auth cookie and redirects to: `https://www.loveaihub.com/?auth=success`
6. Frontend detects success parameter and shows dashboard

## 🏗️ What We Fixed

- Enhanced OAuth callback with comprehensive error handling
- Added support for both authorization code and implicit flows
- Improved logging for debugging OAuth issues
- Standardized callback URL to always use production domain
- Added proper cookie domain settings for cross-subdomain access