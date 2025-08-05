# Overview

LoveAIHub is a comprehensive AI platform providing access to multiple AI models for image generation, video creation, chat completion, audio synthesis, and transcription. It features a modern React frontend and a Node.js/Express backend, utilizing PostgreSQL for data persistence and integrating with A4F.co for AI services and Razorpay for payment processing. The platform aims to be a robust, scalable solution for AI-powered content creation.

# User Preferences

Preferred communication style: Simple, everyday language.
Deployment approach: Iterative - start with core features and add credentials/services incrementally as new features are built.

# System Architecture

## Frontend Architecture

The client-side application is built using React with TypeScript. Key technologies include:
- **UI Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS with custom glass morphism effects and dark theme. Radix UI primitives and custom shadcn/ui components are used for consistent design.
- **Build Tool**: Vite

The architecture emphasizes a component-based design with clear separation of concerns.

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

- **OAuth Redirect URL Fix (August 5, 2025)**
  - **RESOLVED**: Fixed critical OAuth redirect URL conflict causing 404 NOT_FOUND errors
  - **Issue**: OAuth callbacks were redirecting to `/home` but production dashboard was at root URL `/`
  - **Root Cause**: Found 5 separate redirect locations all pointing to incorrect `/home` path
  - **Solution**: Updated ALL OAuth redirect URLs to point to root URL `/`:
    * `server/supabaseAuth.ts` - Local development OAuth callbacks (2 locations) 
    * `api/index.ts` - Production Vercel serverless function (3 locations including client-side JavaScript)
  - **Status**: Code fixed, requires production deployment to take effect
  - **Result**: Consistent OAuth redirect behavior across all environments