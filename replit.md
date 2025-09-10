# Overview

This is a laundry management system called "Billtracky" built as a full-stack web application. The system handles invoice creation, customer management, service configuration, and order tracking for laundry businesses. It provides employee authentication via access codes and supports different service types (wash, iron, both) with dynamic pricing.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Simple access code-based authentication for employees
- **Storage**: In-memory storage implementation with interface for easy database migration
- **API**: RESTful API with JSON responses

## Data Models
- **Employees**: Access code authentication with role-based permissions
- **Customers**: Contact information with order history tracking
- **Services**: Configurable pricing for wash, iron, and combination services
- **Invoices**: Complete order records with customer details and line items
- **Invoice Items**: Individual service entries with quantities and pricing

## Development Setup
- **Monorepo Structure**: Shared schema between client and server
- **Type Safety**: End-to-end TypeScript with shared types
- **Development**: Hot module replacement with Vite dev server
- **Build**: Client builds to static files, server bundles with esbuild

# External Dependencies

## Database
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations and migrations
- **Connection**: Environment-based DATABASE_URL configuration

## UI Framework
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens

## Development Tools
- **Vite**: Development server and build tool with React plugin
- **TypeScript**: Type checking and enhanced developer experience
- **ESBuild**: Fast bundling for production server builds
- **Replit Integration**: Development environment plugins and error handling