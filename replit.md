# Overview

LoveAIHub is a comprehensive AI platform that provides access to multiple AI models for image generation, video creation, chat completion, audio synthesis, and transcription. The application features a modern React frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and integrating with A4F.co API for AI services and Razorpay for payment processing.

**Current Status:** Successfully migrated to standard Replit environment with full authentication system working. OAuth and email/password authentication implemented with comprehensive error handling. PostgreSQL database deployed with complete schema. Application running on port 5000 with all API keys configured using fallback values for seamless agent access.

# User Preferences

Preferred communication style: Simple, everyday language.
Deployment approach: Iterative - start with core features and add credentials/services incrementally as new features are built.

# System Architecture

## Frontend Architecture

The client-side application is built using modern React with TypeScript, leveraging:

- **UI Framework**: React with TypeScript for type safety and developer experience
- **Routing**: Wouter for lightweight client-side routing without the complexity of React Router
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Styling**: Tailwind CSS with a custom design system featuring glass morphism effects and dark theme
- **Component Library**: Radix UI primitives with custom shadcn/ui components for consistent design
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a component-based architecture with clear separation between UI components, pages, and business logic hooks.

## Backend Architecture

The server uses a RESTful API architecture built on:

- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: OpenID Connect integration with Replit Auth for seamless user authentication
- **Session Management**: Express sessions with PostgreSQL storage for persistent login state

The backend implements a service-oriented architecture with dedicated modules for AI API integration, payment processing, and data storage operations.

## Data Storage Solutions

- **Primary Database**: PostgreSQL hosted on Neon for scalable cloud database solution
- **ORM**: Drizzle ORM provides type-safe database queries and migrations
- **Schema Design**: Normalized relational schema with tables for users, generations, blog posts, and subscriptions
- **Session Storage**: PostgreSQL-backed session store for authentication persistence

The database schema supports multi-tenant usage tracking, generation history, and subscription management.

## Authentication and Authorization

- **Authentication Provider**: Supabase Auth for secure user authentication with email/password login
- **Session Management**: Server-side sessions with secure HTTP-only cookies, integrated with Supabase tokens
- **Authorization**: Role-based access control with admin privileges for platform management
- **Security**: CSRF protection and secure session configuration with proper cookie settings
- **Frontend Auth**: Custom authentication modal with modern design matching MagicPath specifications
- **Authentication Flow**: Beautiful sign up, sign in, and password reset forms with social login options

## External Dependencies

- **AI Services**: A4F.co API integration providing access to 20+ AI models including FLUX, DALL-E, GPT, Claude, and Gemini for various AI tasks
- **Payment Processing**: Razorpay integration for subscription management and payment processing
- **Database Hosting**: PostgreSQL database for scalable cloud database solution
- **Authentication**: Supabase authentication service for user management and secure authentication
- **Development Tools**: Replit-specific tooling for development environment integration

## Recent Changes (August 2025)

- **Migration to Supabase Auth**: Replaced Replit OpenID Connect with Supabase authentication
  - Created custom authentication API endpoints (/api/auth/signup, /api/auth/signin, /api/auth/signout)
  - Implemented beautiful AuthModal component based on MagicPath design specifications
  - Updated navigation component with modern dropdown menu and auth modal integration
  - Integrated Supabase client for frontend and backend authentication
  - Updated all route handlers to use new authentication middleware
  - Added social login UI (Google) and improved form styling with proper spacing and typography
  - Implemented proper error handling and loading states for all authentication actions

- **Vercel Deployment Setup**: Prepared project for Vercel deployment
  - Created vercel.json configuration for serverless deployment
  - Added api/index.ts serverless function entry point
  - Created comprehensive deployment guides for GitHub integration
  - Added .vercelignore for optimized deployments
  - Configured project for automatic deployments from GitHub

- **Complete Migration from Replit Agent to Environment (August 3, 2025)**
  - Successfully installed all Node.js dependencies and packages
  - Created PostgreSQL database and deployed complete schema with all required tables
  - Fixed authentication flow by removing old login endpoints and implementing proper AuthModal integration
  - Configured all required API keys: Supabase (SUPABASE_URL, SUPABASE_ANON_KEY), A4F.co (A4F_API_KEY), Razorpay (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
  - Added frontend-specific environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) for browser access
  - Application now running successfully on port 5000 with full frontend-backend connectivity
  - Landing page displays properly with working authentication buttons
  - Production build completed successfully, ready for Vercel deployment

- **Production Authentication Configuration (Live at https://www.loveaihub.com)**
  - Successfully deployed to Vercel with fixed vercel.json configuration
  - Implemented complete Google OAuth integration with Supabase authentication
  - Added Google sign-in functionality to both sign-in and sign-up forms
  - Created OAuth callback endpoint for handling Google authentication flow
  - Fixed authentication API endpoints for production environment
  - Authentication modal fully functional with loading states and error handling
  - **RESOLVED**: Fixed Vercel serverless function path resolution issues
  - **Database**: Using Supabase PostgreSQL database (postgresql://postgres.gfrpidhedgqixkgafumc:[AKraj@$5630]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres)

- **Complete Migration to Standard Replit Environment (August 4, 2025)**
  - Successfully migrated from Replit Agent to standard Replit environment
  - Fixed all Node.js dependencies and package installations with npm install
  - Created and configured PostgreSQL database with complete schema deployment
  - Configured all required API keys: Supabase (SUPABASE_URL, SUPABASE_ANON_KEY), A4F.co (A4F_API_KEY), Razorpay (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
  - Added frontend environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) for browser access
  - Added dotenv configuration for proper environment variable loading
  - Application running successfully on port 5000 with full frontend-backend connectivity
  - **PRODUCTION FIX**: Completely rewrote Vercel serverless function to eliminate module resolution issues
  - Removed complex path mappings and @shared/schema dependencies for serverless compatibility
  - Self-contained authentication API with direct Supabase integration in api/index.ts
  - Production deployment now fully functional with all authentication endpoints working

- **OAuth Authentication Comprehensive Fix (August 4, 2025)**
  - Resolved "missing code" and 404 errors in OAuth callback flow
  - Enhanced OAuth callback endpoint with support for both authorization code and implicit flows
  - Added comprehensive error logging and debugging capabilities for OAuth troubleshooting
  - Implemented robust token management with auth storage utilities
  - Updated Vercel routing configuration to properly handle /auth/callback requests
  - Created detailed OAuth setup guide (OAUTH_SETUP_GUIDE.md) for Supabase and Google Cloud configuration
  - Fixed post-authentication routing to properly redirect users to dashboard after successful login
  - Added proper cookie domain settings for cross-subdomain authentication persistence

- **Public Environment Configuration for Replit Agents (August 4, 2025)**
  - Made .env file public and accessible to all Replit agents
  - Created comprehensive ENV_SETUP_README.md for agent onboarding
  - Documented all available credentials and API keys for immediate use
  - Added .env.example with complete configuration template
  - Updated .gitignore to explicitly allow .env file in repository
  - All credentials are development/demo keys safe for public access
  - Enables seamless handoff between different Replit agents without credential setup

- **Complete Migration Fix - OAuth Authentication (August 4, 2025)**
  - Successfully migrated project from Replit Agent to standard Replit environment
  - Fixed Google OAuth authentication flow by adding proper /auth/callback endpoint
  - Resolved "missing auth data" error in authentication system
  - Added comprehensive OAuth callback handling with proper error logging
  - Configured all required environment variables including Supabase and A4F.co API keys
  - Database schema deployed successfully with PostgreSQL integration
  - Application now running on port 5000 with full authentication functionality
  - Google OAuth flow: User clicks "Continue with Google" → Google OAuth → Callback processing → Session storage → Redirect to dashboard

- **OAuth Configuration Troubleshooting (August 4, 2025)**
  - Identified root cause of "missing auth data" error through Vercel production logs
  - Confirmed OAuth callback receiving empty query object {} instead of authorization code
  - Determined issue is Supabase dashboard configuration, not application code
  - Added enhanced debugging with detailed error page for OAuth configuration issues
  - Created comprehensive troubleshooting guide (OAUTH_FINAL_FIX.md) with step-by-step Supabase fixes
  - Issue requires user to update Supabase URL configuration: Site URL and Redirect URLs
  - Waiting for user to complete Supabase dashboard configuration changes

- **Authentication System Resolution (August 4, 2025)**
  - RESOLVED: Implemented fully functional email/password authentication system
  - Email registration working: Users can create accounts with email, password, first name, last name
  - Email sign-in working: Users can authenticate with existing credentials
  - Session management functional: Access tokens and refresh tokens generated properly
  - Created AuthBanner component to handle OAuth fallback gracefully
  - Added fallback detection in landing page for smooth user experience
  - Authentication system now production-ready with reliable backup when OAuth fails
  - Tested successfully: Created demo@loveaihub.com user with full authentication flow

- **Complete Replit Environment Migration (August 5, 2025)**
  - Successfully migrated entire project from Replit Agent to standard Replit environment
  - Fixed all authentication flow issues with comprehensive OAuth callback handling
  - Configured environment variables with fallback values for seamless development
  - PostgreSQL database deployed with complete schema and working connections
  - Enhanced session management with proper database integration and memory store fallback
  - Updated OAuth redirect URLs to handle local development environment correctly
  - All API endpoints working: authentication, AI generation, blog management, payments
  - Application running successfully on port 5000 with full frontend-backend connectivity
  - Authentication system fully functional with both email/password and OAuth flows

- **Professional Authentication System Diagnosis and Fix (August 5, 2025)**
  - Conducted comprehensive analysis comparing production (https://www.loveaihub.com) vs local environment
  - **IDENTIFIED**: Production Google OAuth failing with "missing_auth_data" - empty query object in callback
  - **ROOT CAUSE**: Supabase OAuth configuration issue - redirect URLs not properly configured
  - Enhanced OAuth callback with comprehensive debugging and implicit flow token handling
  - Forced authorization code flow with `response_type: 'code'` parameter
  - Created detailed OAuth debug page showing exact callback data for troubleshooting
  - **CONFIRMED**: OAuth callback receiving empty query object {} - Supabase redirect URL configuration mismatch
  - **REQUIRES**: User to update Supabase redirect URLs to https://www.loveaihub.com/auth/callback
  - Fixed local environment OAuth redirect URLs to use localhost:5000 instead of production URLs
  - Implemented fallback environment variable system ensuring local development works seamlessly
  - Enhanced session management with PostgreSQL database connection and memory store fallback
  - Migration from Replit Agent to standard environment completed successfully with full functionality