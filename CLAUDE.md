# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack for faster builds
- `npm run build` - Build production version with Turbopack optimization
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Architecture Overview

This is a Next.js 15.5.0 application using the App Router architecture with TypeScript and Tailwind CSS 4.

### Directory Structure
- `/app` - Next.js App Router pages and API routes
  - `/api/contact` - Contact form email handling with Nodemailer
  - `/dashboard` - Protected dashboard area with separate routing
  - `/css` - Global styles (globals.css, navbar.css, bg.css)
- `/components` - Reusable React components
- `/lib` - Utility functions and email templates
- `/public` - Static assets including images and icons

### Key Architectural Patterns

**Path Aliases** (configured in tsconfig.json):
- `@/*` - Maps to project root for imports
- `nav` - Direct alias to `components/nav` for navigation component

**Navigation System**:
- Navigation component (`components/nav.tsx`) conditionally hides on dashboard routes
- Uses `usePathname()` to detect `/dashboard` URLs and returns null

**Email System**:
- Contact form API route uses Nodemailer with SMTP configuration
- Separate HTML and text email templates in `/lib/email/`
- Environment-based configuration with development fallback
- Error handling extracts detailed error information for debugging

**Styling Architecture**:
- Tailwind CSS 4 with PostCSS configuration
- Custom CSS organized in `/app/css/` directory
- Liquid glass effect styling for navbar component

### Technology Stack
- **Framework**: Next.js 15.5.0 with Turbopack
- **Styling**: Tailwind CSS 4
- **Animations**: GSAP, Lottie Web, Lord Icon Element
- **Email**: Nodemailer with custom templates
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens

### Environment Configuration
Required environment variables for full functionality:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration
- `SMTP_FROM`, `CONTACT_TO` - Email addresses
- `PUBLIC_LOGO_URL` - Logo URL for email templates

### Development Notes
- Turbopack is enabled for both dev and build commands for faster compilation
- Dashboard routes have separate layout without main navigation
- Contact form includes comprehensive error handling and type safety
- Custom TypeScript configuration includes specific file inclusions for mixed JS/TS files