# LoveAIHub: Complete Setup Guide for AI Agents

## 📋 Overview
This guide provides step-by-step instructions for setting up the LoveAIHub React + Express application from the GitHub repository `akashyamvedant/loveaihub`. Follow these instructions exactly to avoid common setup issues.

## 🎯 Project Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Radix UI
- **Backend**: Express.js + TypeScript + Node.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **AI Services**: A4F.co API
- **Payment**: Razorpay (optional)
- **Deployment**: Supports Vercel, Railway, Render, or any Node.js hosting

## 🚀 Prerequisites
- Node.js 18 or higher
- npm, yarn, or pnpm package manager
- Access to PostgreSQL database (Neon/Supabase recommended)
- Supabase account for authentication
- A4F.co API account for AI services

## 📦 Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/akashyamvedant/loveaihub.git
cd loveaihub

# Install all dependencies (CRITICAL: Do this first)
npm install

# Install additional required packages that may be missing
npm install vite @vitejs/plugin-react nanoid --save-dev
npm install tsx --global  # Required for TypeScript execution
```

**⚠️ Common Issue**: If you get "tsx: not found" error, run:
```bash
npm install tsx --save-dev
# OR install globally
npm install tsx --global
```

## 🔧 Step 2: Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Development Environment
NODE_ENV=development

# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (PostgreSQL) - Use Supabase connection string
DATABASE_URL=postgresql://postgres.your-project:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres

# Session Secret (Generate a strong random string)
SESSION_SECRET=your-long-random-session-secret-minimum-32-characters

# A4F.co AI Services API
A4F_API_KEY=your-a4f-api-key

# Server Port
PORT=5000

# Optional: Payment Processing
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Optional: Builder.io (for CMS features)
VITE_PUBLIC_BUILDER_KEY=your-builder-key
```

### 🔑 How to Get Required Credentials:

#### Supabase Setup:
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to Settings > API to get your keys:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_ANON_KEY`: Public anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (keep secret)
3. Navigate to Settings > Database to get connection string for `DATABASE_URL`

#### A4F.co API:
1. Visit [a4f.co](https://a4f.co) and create an account
2. Get your API key from the dashboard
3. Use it as `A4F_API_KEY`

## 🗄️ Step 3: Database Schema Setup

```bash
# Push database schema to your PostgreSQL instance
npm run db:push
```

**⚠️ If drizzle-kit command fails**:
```bash
# Try using npx instead
npx drizzle-kit push

# Or install drizzle-kit globally
npm install drizzle-kit --save-dev
```

**Note**: The database schema includes tables for users, sessions, generations, blog posts, subscriptions, and usage analytics.

## 🔧 Step 4: Fix Vite Configuration Issues

**CRITICAL**: The most common setup issue is Vite import failures. Here's how to fix it:

### 4.1 Verify Vite Installation
```bash
# Ensure Vite is properly installed
npm list vite
# Should show vite@5.x.x or higher

# If not installed or showing empty:
npm install vite @vitejs/plugin-react --save-dev
```

### 4.2 Fix Server Vite Import (if needed)
The server should already be configured to handle Vite gracefully, but if you encounter import errors, check that `server/vite.ts` has proper imports:

```typescript
import { createServer as createViteServer, createLogger } from "vite";
import viteConfig from "../vite.config.js";
import { nanoid } from "nanoid";
```

### 4.3 Environment Detection
Ensure your server properly detects development mode by setting:
```bash
# In your environment or via DevServerControl tool
NODE_ENV=development
```

## 🚀 Step 5: Start the Application

```bash
# Start in development mode
npm run dev
```

### Expected Output:
```
Starting LoveAIHub server...
Loading modules...
✓ dotenv loaded
✓ express loaded
A4F API initialized with key: xxx-xxx-cd...
A4F API base URL: https://api.a4f.co/v1
✓ routes loaded
✓ vite loaded
Registering routes...
Using simplified memory store for sessions in development
Supabase initialized successfully
✓ Routes registered
Setting up file serving...
Environment mode: development
✓ Vite setup complete
Starting server on port 5000...
serving on port 5000
🚀 LoveAIHub server is running on http://localhost:5000
```

## ✅ Step 6: Verification Checklist

### 6.1 Server Startup Verification
- [ ] All modules load without errors
- [ ] A4F API initializes with your key
- [ ] Supabase connection established
- [ ] Vite setup completes successfully
- [ ] Server starts on port 5000

### 6.2 Frontend Verification
Visit `http://localhost:5000` and verify:
- [ ] Landing page loads (for unauthenticated users)
- [ ] Login/signup functionality works
- [ ] Dashboard loads after authentication
- [ ] Navigation between AI tools works
- [ ] No console errors in browser

### 6.3 API Endpoints Testing
Test these critical endpoints:
```bash
# Test session endpoint
curl http://localhost:5000/api/test-session

# Test auth endpoint (should return unauthorized)
curl http://localhost:5000/api/auth/user

# Test health check
curl http://localhost:5000/api/health
```

## 🐛 Common Issues and Solutions

### Issue 1: "tsx: not found"
**Solution**:
```bash
npm install tsx --global
# OR use npx
npx tsx server/index.ts
```

### Issue 2: "Cannot find package 'vite'"
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm install vite @vitejs/plugin-react --save-dev
```

### Issue 3: "Database connection failed"
**Solution**:
- Verify `DATABASE_URL` format
- Check network connectivity to database
- Ensure database exists and user has permissions
- Test connection string manually

### Issue 4: "Authentication service unavailable"
**Solution**:
- Verify all three Supabase environment variables are set
- Check Supabase project is active
- Verify API keys are correct and not expired

### Issue 5: Missing Environment Variables
**Solution**:
- Copy the complete `.env` template above
- Fill in all required values
- Restart the server after adding variables

### Issue 6: Port Already in Use
**Solution**:
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
# OR use different port
PORT=3000 npm run dev
```

### Issue 7: Frontend Shows "API-only mode"
**Solution**:
- Ensure `NODE_ENV=development` is set
- Restart server after setting environment
- Check that Vite setup completes successfully

## 🔧 Advanced Configuration

### Production Build
```bash
npm run build
npm start
```

### Custom Port
```bash
PORT=3000 npm run dev
```

### Database Migration
```bash
# Generate new migration
npx drizzle-kit generate

# Apply migration
npx drizzle-kit migrate
```

## 📁 Project Structure
```
loveaihub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API clients
│   │   └── App.tsx        # Main app component
│   └── index.html         # Entry HTML file
├── server/                # Express backend
│   ├── services/          # External service integrations
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── supabaseAuth.ts   # Authentication logic
│   └── vite.ts           # Vite development server
├── shared/               # Shared types and schemas
├── api/                  # Serverless functions (Vercel)
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
└── tailwind.config.ts    # Tailwind CSS config
```

## 🎯 Key Features Available After Setup

### Authentication System
- Email/password authentication
- Google OAuth integration
- Password reset functionality
- Session management

### AI Tools
- **Image Generation**: AI-powered image creation
- **Video Generation**: AI video creation tools
- **AI Chat**: Conversational AI interface
- **Audio Tools**: Text-to-speech and audio synthesis
- **Image Editing**: AI-powered image editing

### Dashboard Features
- User analytics and usage tracking
- Generation history
- Subscription management
- Admin panel
- Blog system
- API documentation

## 🚀 Deployment Options

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Railway/Render
1. Connect repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Configure environment variables

### Traditional VPS
1. Clone repository on server
2. Install dependencies
3. Set up environment variables
4. Use PM2 or similar for process management

## 🔐 Security Considerations

1. **Never commit sensitive data**: Use `.env` for all secrets
2. **Use strong session secrets**: Minimum 32 characters random string
3. **Enable HTTPS in production**: Required for authentication
4. **Validate environment variables**: Check all required vars are set
5. **Database security**: Use connection pooling and proper credentials

## 📞 Support and Troubleshooting

If you encounter issues not covered in this guide:

1. **Check server logs**: Look for specific error messages
2. **Verify environment variables**: Ensure all required variables are set
3. **Test database connection**: Verify DATABASE_URL works
4. **Check API keys**: Ensure all external service keys are valid
5. **Review network connectivity**: Ensure access to external services

## 🎉 Success Criteria

Your LoveAIHub setup is successful when:

✅ Server starts without errors
✅ Frontend loads and displays properly  
✅ Authentication system works (login/logout)
✅ Database operations function correctly
✅ All API endpoints respond appropriately
✅ AI tools interfaces load without errors
✅ Navigation between pages works smoothly

---

**🚀 Congratulations!** Your LoveAIHub platform is now fully operational and ready for use!

For any additional customization or feature development, refer to the component files in `client/src/components/` and API routes in `server/routes.ts`.
