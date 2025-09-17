# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack for faster builds
- `npm run build` - Build production version with Turbopack optimization
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Database Commands
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:undo` - Rollback last migration
- `npm run db:seed` - Run all database seeders
- `npm run db:seed:undo` - Rollback all seeders
- `npm run db:reset` - Complete database reset with base seeds (roles, settings, sample content)

## Architecture Overview

This is a Next.js 15.5.0 application using the App Router architecture with TypeScript and Tailwind CSS 4.

### Directory Structure
- `/app` - Next.js App Router pages and API routes
  - `/api` - RESTful API endpoints with admin and public routes
  - `/backoffice` - Admin dashboard with authentication-protected routes
    - `/(auth)` - Login page with route group
    - `/(dashboard)` - Protected dashboard pages with sidebar layout
  - `/css` - Global styles (globals.css, navbar.css, bg.css)
- `/components` - Reusable React components
  - `/backoffice` - Admin-specific components (forms, tables, modals)
- `/lib` - Utility functions and configurations
  - `/db` - Sequelize models, migrations, and seeders
  - `/email` - Email template functions
  - `/validations` - Zod validation schemas
- `/public` - Static assets including images and icons

### Key Architectural Patterns

**Dual Architecture**:
- **Frontend**: Public website with navigation conditionally hidden on backoffice routes
- **Backoffice**: Admin dashboard with Supabase authentication and separate sidebar layout

**Authentication & Middleware**:
- Supabase authentication with JWT tokens stored in cookies
- Middleware protects all `/backoffice` routes except login
- User information passed via headers to API routes (`x-user-id`, `x-user-email`)

**Database Architecture**:
- PostgreSQL with Sequelize ORM
- Full migration and seeding system for database schema management
- Models include: Users, Roles, Settings, Packages, Services, Gallery, Reviews, Stats, Contact Submissions
- SSL configuration with development fallback for certificate issues

**Path Aliases** (configured in tsconfig.json):
- `@/*` - Maps to project root for imports
- `nav` - Direct alias to `components/nav` for navigation component

**Navigation System**:
- Main navigation (`components/nav.tsx`) conditionally hides on backoffice routes
- Uses `usePathname()` to detect `/backoffice` URLs and returns null
- Separate sidebar navigation for admin dashboard

**API Architecture**:
- RESTful endpoints with separate admin and public routes
- Comprehensive CRUD operations for all content types
- File upload handling for gallery and media management
- Contact form submission with email notifications

**Email System**:
- Contact form API route uses Nodemailer with SMTP configuration
- Separate HTML and text email templates in `/lib/email/`
- Environment-based configuration with development fallback

### Technology Stack
- **Framework**: Next.js 15.5.0 with Turbopack
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: Supabase with JWT tokens
- **Styling**: Tailwind CSS 4 with PostCSS
- **Animations**: GSAP, Lottie Web, Lord Icon Element
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Headless UI, Heroicons
- **Email**: Nodemailer with custom templates
- **Drag & Drop**: DND Kit for admin interfaces

### Environment Configuration
Critical environment variables (validated in `lib/env.ts`):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase config
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` - Server-side Supabase
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT token signing
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `TO_EMAIL` - Email configuration

### Development Notes
- Turbopack enabled for dev and build commands for faster compilation
- SSL certificate rejection disabled in development for database connections
- Environment validation with detailed logging and fallback behavior
- Mixed JS/TS files supported with explicit TypeScript configuration includes