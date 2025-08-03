# Deploying LoveAIHub to Vercel

This guide will help you deploy your LoveAIHub project to Vercel with the beautiful MagicPath authentication design.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A Supabase project for authentication and database
3. Your environment variables ready

## Step 1: Setup Supabase Database

1. Go to https://supabase.com and create a new project
2. Go to Project Settings > Database
3. Copy your connection string (replace [YOUR-PASSWORD] with your actual password)
4. Run the database schema setup:
   ```sql
   -- Run this in your Supabase SQL editor
   CREATE TABLE IF NOT EXISTS users (
     id SERIAL PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     first_name VARCHAR(255),
     last_name VARCHAR(255),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

## Step 2: Prepare Environment Variables

Set up these environment variables in Vercel:
- `DATABASE_URL` - Your Supabase PostgreSQL connection string
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_SUPABASE_URL` - Same as SUPABASE_URL (for frontend)
- `VITE_SUPABASE_ANON_KEY` - Same as SUPABASE_ANON_KEY (for frontend)

## Step 2: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

1. Run in your project directory:
```bash
vercel
```

2. Follow the prompts:
   - Link to existing project? **No**
   - Project name: **loveaihub** (or your preferred name)
   - Directory: **./** (current directory)

3. Set environment variables:
```bash
vercel env add DATABASE_URL
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

4. Deploy:
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository (you'll need to push this code to GitHub first)
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

5. Add Environment Variables in the Vercel dashboard:
   - `DATABASE_URL`
   - `SUPABASE_URL` 
   - `SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `NODE_ENV` = `production`

6. Click "Deploy"

## Step 4: Update Your Database

After deployment, make sure your database schema is up to date:

```bash
# If using the deployed site, run migrations
npm run db:push
```

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Test the authentication flow
3. Verify all API endpoints work
4. Check that the database connections are working

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are in package.json
2. **Environment variables**: Make sure all required env vars are set in Vercel dashboard
3. **Database connection**: Verify your DATABASE_URL is accessible from Vercel
4. **API routes not working**: Check that your server/index.ts is properly configured

### Important Notes:

- Vercel runs your app as serverless functions
- Each API call starts a new function instance
- Database connections should use connection pooling
- File uploads need to use external storage (like Supabase Storage)

## Production Considerations

1. **Database**: Use a production PostgreSQL database (Supabase Pro, Neon, or AWS RDS)
2. **File Storage**: Configure Supabase Storage for file uploads
3. **Domain**: Set up a custom domain in Vercel dashboard
4. **Analytics**: Enable Vercel Analytics
5. **Monitoring**: Set up error tracking and performance monitoring

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are correctly set
3. Test your database connection
4. Check the Vercel documentation at https://vercel.com/docs