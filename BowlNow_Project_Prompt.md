# BowlNow Business Management Platform - Current Build Prompt

## Project Overview
Build a comprehensive backend web application for **BowlNow** - a business management platform that helps manage clients, track projects, and handle billing. The system serves as an integrated CRM with multiple modules including sales pipeline management, client tracking, revenue analytics, invoice generation with Stripe integration, and client onboarding processes.

## Tech Stack Requirements
- **Frontend**: React 18.3.1 with TypeScript
- **Backend**: Express.js with Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack React Query v5
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **Payment Processing**: Stripe integration
- **Authentication**: Passport.js with local strategy

## Current Database Schema & Business Logic

### Core Entities
1. **Users Table** - Authentication and Stripe customer data
2. **Clients Table** - Main client information with payment tracking
3. **Boost Clients Table** - Full-service client project tracking
4. **Revenue Table** - Financial tracking and MRR calculations  
5. **Invoices Table** - Billing and payment status
6. **Onboarding Forms Table** - Client onboarding workflow
7. **Contacts Table** - Client communication tracking

### Key Business Rules
- **Client Types**: "crm", "crm_ads", "website_only", "full_service" (display as "Boost")
- **Client Statuses**: "prospect", "active", "past_due", "cancelled"
- **Revenue Tracking**: Separate MRR and one-time payments
- **Payment Fields**: currentPayment, proposedPayment, upsellAmount stored as text

## Current Application Features

### 1. Dashboard Overview
- Total clients count (89 imported)
- Active paying clients (60 clients)
- Monthly Recurring Revenue ($43,201.67 MRR)
- Prospects and overdue tracking
- Real-time metrics calculation

### 2. Active Clients Management
- Client list with status badges and payment info
- Comprehensive client profile dialogs with 4 tabs:
  - **Overview**: Business details, contact info, service type
  - **Subscription**: Payment information and billing status
  - **Communication Timeline**: Contact history and preferences
  - **Boost Progress**: Project milestone tracking for full-service clients
- Full edit functionality with form validation
- Service type labeling (full_service displays as "Boost")

### 3. CRM Pipeline (Prospects)
- Drag-and-drop pipeline interface using react-beautiful-dnd
- Status-based columns: Prospect → Active → Past Due → Cancelled
- Client profile access from pipeline cards
- Add new client functionality
- Status transition tracking

### 4. Revenue Analytics
- MRR calculation and tracking
- One-time payment tracking
- Annual revenue projections
- Client payment analysis
- Revenue metrics dashboard

### 5. Invoice Management
- Invoice creation and tracking
- Stripe integration for payment processing
- Payment status monitoring
- Client billing history

### 6. Client Onboarding
- Onboarding form workflow
- Status tracking for new clients
- Progress monitoring

## Current Data State
- **89 total clients** imported from CSV
- **60 active paying clients** generating **$43,201.67 MRR**
- **$518,420 projected annual revenue**
- Complete client database with payment history
- Functional Stripe integration ready for billing

## Technical Implementation Details

### Frontend Architecture
- Single-page application with tab-based navigation
- Sidebar navigation component
- Responsive design with mobile support
- Real-time data fetching with React Query
- Form validation using Zod schemas
- Toast notifications for user feedback

### Backend API Structure
- RESTful API endpoints
- Database operations through Drizzle ORM
- Express session management
- Stripe webhook handling
- File upload support for CSV imports

### Key Components
- `Dashboard` - Main application shell
- `Sidebar` - Navigation component  
- `ClientManagement` - Active clients with full CRUD
- `CRMPipeline` - Prospect management with drag-drop
- `RevenueTracker` - Financial analytics
- `InvoiceManagement` - Billing system
- `ClientOnboarding` - New client workflow

## Current Working Features
✅ Client data import from CSV
✅ Real-time dashboard metrics
✅ Client profile management with edit functionality
✅ CRM pipeline with drag-drop interface
✅ Revenue tracking and MRR calculations
✅ Stripe payment integration setup
✅ Responsive UI with professional design
✅ Form validation and error handling
✅ Full-service clients labeled as "Boost"

## Development Setup
- Run `npm run dev` to start development server
- Database migrations with `npm run db:push`
- Stripe test/live keys configuration required
- PostgreSQL database connected via Neon

## Next Development Priorities
1. Complete edit functionality for CRM Pipeline
2. Enhanced project tracking for Boost clients
3. Advanced reporting and analytics
4. Email/SMS communication integration
5. Advanced filtering and search capabilities
6. Export functionality for reports
7. Client portal for self-service access

This represents a fully functional business management platform with comprehensive client relationship management, financial tracking, and project management capabilities, specifically designed for BowlNow's business operations.