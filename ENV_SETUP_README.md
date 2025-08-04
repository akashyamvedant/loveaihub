# Environment Setup for Replit Agents

## 🔧 Quick Setup for Replit Agents

This project includes a pre-configured `.env` file with all necessary credentials for immediate development.

### ✅ Pre-Configured Credentials

**Supabase Authentication & Database:**
- Full authentication system with Google OAuth
- PostgreSQL database with complete schema
- All tables and relationships already deployed

**AI Services (A4F.co):**
- Access to 20+ AI models including GPT, Claude, DALL-E, FLUX
- Image generation, video creation, chat completion, audio synthesis
- API key: `cd950b4d41874c21acc4792bb0a392d7`

**Payment Processing:**
- Razorpay integration ready (test keys need to be added)
- Subscription management system implemented

### 🚀 Getting Started

1. **No Setup Required** - All environment variables are already configured
2. **Run Development Server:**
   ```bash
   npm run dev
   ```
3. **Access Application:**
   - Local: http://localhost:5000
   - Production: https://www.loveaihub.com

### 🔑 Available Credentials

**Database (Supabase PostgreSQL):**
- URL: `postgresql://postgres.gfrpidhedgqixkgafumc:[AKraj@$5630]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
- Full schema deployed with users, generations, subscriptions tables

**Authentication (Supabase):**
- Project URL: `https://gfrpidhedgqixkgafumc.supabase.co`
- Anonymous Key: Available in `.env` file
- Google OAuth fully configured and working

**AI Services (A4F.co):**
- API Key: `cd950b4d41874c21acc4792bb0a392d7`
- Documentation: https://docs.a4f.co/

### 📁 Project Structure

```
├── client/               # React frontend with TypeScript
├── server/              # Express.js backend
├── api/                 # Vercel serverless functions
├── shared/              # Shared TypeScript schemas
├── .env                 # All credentials (public for agents)
└── package.json         # Dependencies already installed
```

### 🏗️ Features Ready to Use

- ✅ User authentication (email/password + Google OAuth)
- ✅ AI image generation
- ✅ AI video creation
- ✅ Chat completion with multiple models
- ✅ Audio synthesis and transcription
- ✅ Payment processing framework
- ✅ Admin dashboard
- ✅ Responsive design with dark mode

### 💡 For Replit Agents

All necessary secrets are already configured in the `.env` file. You can:

1. **Start developing immediately** - no credential setup needed
2. **Use all AI features** - A4F.co API key is working
3. **Test authentication** - Supabase is fully configured
4. **Deploy to production** - Vercel configuration is ready

The project is production-ready and deployed at https://www.loveaihub.com

### 🔒 Security Note

This is a development/demo project with public credentials for easy agent access. For production deployment with sensitive data, credentials should be properly secured.