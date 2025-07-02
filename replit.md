# BowlNow Business Management Platform

## Overview

BowlNow is a comprehensive business management platform designed specifically for bowling centers and similar entertainment businesses. The system serves as an integrated CRM, project management, and financial tracking solution that helps manage clients, track projects, handle billing, and streamline business operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18.3.1 with TypeScript for type safety and modern development
- **UI Framework**: Tailwind CSS with shadcn/ui components for consistent, accessible design
- **State Management**: TanStack React Query v5 for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy (planned)
- **Payment Processing**: Stripe integration for subscription and payment management
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Database Strategy
- **ORM**: Drizzle ORM chosen for type safety, performance, and excellent TypeScript integration
- **Migration System**: Drizzle Kit for schema migrations and database management
- **Connection**: Neon serverless PostgreSQL for scalable cloud database hosting

## Key Components

### Core Business Entities
1. **Users Table**: Authentication and Stripe customer integration
2. **Clients Table**: Central client management with payment tracking and business details
3. **Boost Clients Table**: Full-service project tracking with milestone management
4. **Revenue Table**: Financial metrics and MRR calculations
5. **Invoices Table**: Billing management and payment status tracking
6. **Onboarding Forms Table**: Client onboarding workflow management
7. **Contacts Table**: Communication history and preferences

### Client Management System
- **Client Types**: "crm", "crm_ads", "website_only", "full_service" (displayed as "Boost")
- **Status Tracking**: "prospect", "active", "past_due", "cancelled"
- **Payment Management**: Current payments, proposed payments, and upsell opportunities
- **Communication Preferences**: Email, phone, or other preferred contact methods

### Dashboard Features
- **Real-time Metrics**: Total clients (89 imported), active paying clients (60), MRR ($43,201.67)
- **Status Overview**: Prospects tracking, overdue accounts, revenue calculations
- **Client Profiles**: Comprehensive 4-tab client dialogs with full CRUD operations
- **Project Tracking**: Milestone-based progress tracking for full-service clients

### Project Management (Boost Clients)
- **Milestone Tracking**: Kickoff calls, landing pages, Meta/Google ads, website launches
- **Progress Visualization**: Percentage-based progress indicators
- **Date Tracking**: Completion dates for each project milestone
- **Status Management**: Boolean flags for major project components

## Data Flow

### Client Lifecycle
1. **Prospect Creation**: Initial client entry with business details and contact information
2. **Status Progression**: Movement through prospect → active → past_due/cancelled states
3. **Payment Tracking**: Current payment amounts, proposed increases, upsell opportunities
4. **Project Assignment**: Full-service clients get Boost project tracking records
5. **Communication Logging**: Contact history and preference management

### Revenue Calculation
- **MRR Calculation**: Sum of all active client current payments
- **Pipeline Value**: Tracking of proposed payments and upsell opportunities
- **Financial Reporting**: Real-time revenue metrics and client payment status

### Import/Export System
- **CSV Import**: Bulk client import from existing business data
- **Data Migration**: Automated status assignment based on payment amounts
- **Client Type Detection**: Automatic categorization based on service products

## External Dependencies

### Payment Processing
- **Stripe Integration**: Subscription management, customer records, payment processing
- **Customer Sync**: Automatic Stripe customer creation for billing clients
- **Subscription Tracking**: Integration between local client records and Stripe subscriptions

### UI Component Library
- **Radix UI Primitives**: Accessible, unstyled components for complex UI patterns
- **Tailwind CSS**: Utility-first styling with custom design system variables
- **shadcn/ui**: Pre-built component library built on Radix and Tailwind

### Development Tools
- **TypeScript**: Full type safety across frontend, backend, and shared schemas
- **Drizzle Kit**: Database schema management and migration tools
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition

## Deployment Strategy

### Replit Configuration
- **Modules**: Node.js 20, Web hosting, PostgreSQL 16
- **Build Process**: Vite frontend build + esbuild backend compilation
- **Development**: Hot reload with Vite dev server and Express backend
- **Production**: Static frontend serving with Express API routes

### Environment Setup
- **Database**: Automatic PostgreSQL provisioning with Drizzle schema setup
- **Development**: Local development with hot reloading and error overlays
- **Production**: Optimized builds with static asset serving

### Scalability Considerations
- **Database**: Neon serverless PostgreSQL for automatic scaling
- **Frontend**: Static asset optimization and code splitting
- **API**: Express.js with efficient query patterns and caching strategies

## Changelog

Recent Changes:
- January 2, 2025: Successfully migrated project from Replit Agent to standard Replit environment
  - ✓ Configured PostgreSQL database with proper schema
  - ✓ Set up Stripe payment integration with secret keys
  - ✓ Added comprehensive sample data including 8 realistic bowling center clients
  - ✓ Verified all features working: dashboard metrics, client management, revenue tracking
  - ✓ Application running smoothly on port 5000 with full functionality
- June 25, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.