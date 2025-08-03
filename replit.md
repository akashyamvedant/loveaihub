# Overview

LoveAIHub is a comprehensive AI platform that provides access to multiple AI models for image generation, video creation, chat completion, audio synthesis, and transcription. The application features a modern React frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and integrating with A4F.co API for AI services and Razorpay for payment processing.

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