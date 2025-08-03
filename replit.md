# Overview

LoveAIHub is a comprehensive AI platform that provides access to multiple AI models for image generation, video creation, chat completion, audio synthesis, and transcription. The application features a modern React frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and integrating with A4F.co API for AI services and Razorpay for payment processing.

# User Preferences

Preferred communication style: Simple, everyday language.

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

- **Authentication Provider**: Replit OpenID Connect for secure user authentication
- **Session Management**: Server-side sessions with secure HTTP-only cookies
- **Authorization**: Role-based access control with admin privileges for platform management
- **Security**: CSRF protection and secure session configuration with proper cookie settings

## External Dependencies

- **AI Services**: A4F.co API integration providing access to 20+ AI models including FLUX, DALL-E, GPT, Claude, and Gemini for various AI tasks
- **Payment Processing**: Razorpay integration for subscription management and payment processing
- **Database Hosting**: Neon PostgreSQL for cloud database services
- **Authentication**: Replit Auth service for OpenID Connect authentication
- **Development Tools**: Replit-specific tooling for development environment integration