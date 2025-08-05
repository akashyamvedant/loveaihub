# Overview

LoveAIHub is a comprehensive AI platform providing access to multiple AI models for image generation, video creation, chat completion, audio synthesis, and transcription. It features a modern React frontend and a Node.js/Express backend, utilizing PostgreSQL for data persistence and integrating with A4F.co for AI services and Razorpay for payment processing. The platform aims to be a robust, scalable solution for AI-powered content creation.

# User Preferences

Preferred communication style: Simple, everyday language.
Deployment approach: Iterative - start with core features and add credentials/services incrementally as new features are built.

# System Architecture

## Frontend Architecture

The client-side application is built using React with TypeScript. Key technologies include:
- **UI Framework**: React with TypeScript
- **Routing**: Wouter with **Conditional Route Rendering** (see Architecture Note below)
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS with custom glass morphism effects and dark theme. Radix UI primitives and custom shadcn/ui components are used for consistent design.
- **Build Tool**: Vite

The architecture emphasizes a component-based design with clear separation of concerns.

### IMPORTANT ARCHITECTURE NOTE: Shared URL Structure

**Root URL Behavior (`/`):**
- **Authenticated Users**: Shows Dashboard (Home component) with full AI platform functionality
- **Unauthenticated Users**: Shows Landing Page with marketing content and sign-up options

**Implementation Details:**
- Both landing page and dashboard exist at the same URL: `https://www.loveaihub.com/`
- Authentication state determines which component renders at root URL
- Logic in `client/src/App.tsx` uses `hasAuth` condition to switch between `Landing` and `Home` components
- After logout, page reload is required to clear React state and properly show landing page
- This design provides seamless user experience without URL redirects

**For Developers:**
- When debugging logout issues, remember both pages share the same URL
- Authentication state management is critical for proper page rendering
- Logout must clear all auth tokens AND force page reload to reset React state
- Do not modify this URL structure without updating authentication flow logic

## Backend Architecture

The server uses a RESTful API architecture built on:
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM
- **Authentication**: Supabase Auth integration with Express sessions and PostgreSQL storage.

The backend follows a service-oriented architecture, handling AI API integration, payment processing, and data storage.

## Data Storage Solutions

- **Primary Database**: PostgreSQL hosted on Neon.
- **ORM**: Drizzle ORM for type-safe operations and migrations.
- **Schema Design**: Normalized relational schema for users, generations, blog posts, and subscriptions, supporting multi-tenant usage.
- **Session Storage**: PostgreSQL-backed session store.

## Authentication and Authorization

- **Authentication Provider**: Supabase Auth for email/password and social logins.
- **Session Management**: Server-side sessions with secure HTTP-only cookies.
- **Authorization**: Role-based access control.
- **Security**: CSRF protection.
- **Frontend Auth**: Custom authentication modal with a modern design.
- **Authentication Flow**: Supports beautiful sign up, sign in, and password reset forms, with social login options.

# External Dependencies

- **AI Services**: A4F.co API, providing access to over 20 AI models.
- **Payment Processing**: Razorpay for subscriptions and payments.
- **Database Hosting**: Neon for PostgreSQL.
- **Authentication**: Supabase authentication service.

## Recent Changes (August 2025)

- **Migration from Replit Agent to Replit Environment (August 5, 2025)**
  - **COMPLETED**: Successfully migrated project from Replit Agent environment to standard Replit
  - **Issues Fixed**:
    * Missing tsx dependency - installed and verified working
    * Environment variables security - properly configured using Replit secrets
    * Password reset flow - created `/reset-password` page with proper token handling
    * Authentication redirect URLs - fixed password reset links to redirect to proper page instead of malformed `#` URL
  - **Migration Steps Completed**:
    * ✓ Installed required packages (tsx for TypeScript execution)
    * ✓ Restarted workflow successfully with all dependencies
    * ✓ Added environment variables securely via Replit secrets system
    * ✓ Created reset password page with proper Supabase token handling
    * ✓ Fixed authentication redirect URLs for password reset functionality
    * ✓ Verified server running on port 5000 with Supabase connection
  - **Result**: Project now runs cleanly in Replit environment with proper security practices

- **Authentication System Fixes (August 5, 2025)**
  - **RESOLVED**: Fixed critical authentication issues reported by user
  - **Issues Addressed**:
    * Password reset redirect URL malformed (`https://www.loveaihub.com/#`) - created proper `/reset-password` page with token handling
    * Invalid login credentials error despite correct credentials - fixed environment configuration mismatches
    * Reset emails going to spam folder - configured proper redirect URLs for better email reputation
  - **Solutions Implemented**:
    * Created comprehensive `/reset-password` page with proper Supabase token parsing and validation
    * Fixed redirect URLs in both development (`server/supabaseAuth.ts`) and production (`api/index.ts`) environments
    * Added proper route handling for reset password flow in client-side routing
    * Configured consistent authentication endpoints across environments
  - **Status**: Code fixes complete, requires production deployment to take full effect
  - **Critical Fix**: Updated `vercel.json` routing configuration to properly handle `/reset-password` client-side route (was causing 404 NOT_FOUND errors)

- **OAuth Redirect URL Fix (August 5, 2025)**
  - **RESOLVED**: Fixed critical OAuth redirect URL conflict causing 404 NOT_FOUND errors
  - **Issue**: OAuth callbacks were redirecting to `/home` but production dashboard was at root URL `/`
  - **Root Cause**: Found 5 separate redirect locations all pointing to incorrect `/home` path
  - **Solution**: Updated ALL OAuth redirect URLs to point to root URL `/`:
    * `server/supabaseAuth.ts` - Local development OAuth callbacks (2 locations) 
    * `api/index.ts` - Production Vercel serverless function (3 locations including client-side JavaScript)
  - **Status**: Code fixed, requires production deployment to take effect
  - **Result**: Consistent OAuth redirect behavior across all environments

- **Logout System Fix (August 5, 2025)**
  - **RESOLVED**: Fixed logout system issues with proper state management
  - **Issues Fixed**:
    * "Cannot GET /api/logout" error - added proper route handlers for legacy requests
    * Missing redirect after logout - authentication state not properly cleared
    * Profile dropdown logout not working - used old logout method
  - **Solution**: 
    * Added GET `/api/logout` handlers for legacy support in both dev and production
    * Updated all logout buttons to use POST `/api/auth/signout` with complete state cleanup
    * Implemented `window.location.replace('/')` to force page reload and reset React state
    * Fixed profile dropdown logout in `dashboard-header.tsx` to match sidebar logout
  - **Result**: Both logout methods (sidebar and profile dropdown) work consistently and redirect to landing page