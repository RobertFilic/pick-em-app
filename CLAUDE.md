# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Testing
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ci` - Run tests for CI (no watch mode)
- `npm run test:debug` - Run tests with Node debugger

### Development
- `npm run dev` - Start Next.js development server
- ESLint is configured with `eslint.config.mjs` using Next.js core web vitals and TypeScript rules
- TypeScript configuration uses strict mode with Next.js plugin

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Supabase Auth with profile management
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks pattern (useState, useEffect)
- **Testing**: Jest + Testing Library with jsdom environment
- **Analytics**: Google Analytics with consent management

### Project Structure
```
app/                    # Next.js App Router pages
  admin/               # Admin dashboard pages
  competitions/        # Competition detail pages
  leagues/             # Private league pages
  dashboard/           # User dashboard
components/            # Reusable UI components
  auth/               # Authentication components
  competition/        # Competition-specific components
  league/             # League management components
  ui/                 # Base UI components (Button, Modal, etc.)
hooks/                # Custom React hooks
  useAuth.ts          # Authentication state management
  useCompetitions.ts  # Competition data fetching
  useLeagues.ts       # League management
  useNotification.ts  # Toast notifications
lib/                  # Utility libraries
  types.ts            # TypeScript type definitions
  supabaseClient.ts   # Supabase client configuration
  analytics.ts        # GA4 analytics wrapper
  consent.ts          # GDPR consent management
  utils.ts            # General utilities
```

### Key Patterns

#### Authentication Flow
- Uses `useAuth` hook for centralized auth state
- Automatic profile fetching from Supabase profiles table
- Auth state changes trigger profile updates
- Logout clears both user and profile state

#### Data Fetching
- Custom hooks for each data domain (leagues, competitions)
- Error handling with user-friendly messages
- Loading states for better UX
- Real-time updates where applicable

#### Component Architecture
- Separation between client and server components
- Index files for clean imports (`components/ui/index.ts`)
- Props interfaces defined in `lib/types.ts`
- Consistent error boundaries and loading states

#### Styling System
- Tailwind CSS with custom color palette (violet/purple theme)
- Font system: Plus Jakarta Sans + Inter
- Dark mode support with system preference detection
- Responsive design with mobile-first approach

### Database Schema
- **profiles**: User profile information
- **competitions**: Available competitions/tournaments
- **leagues**: Private leagues created by users
- **league_members**: Junction table for league membership

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### Testing Configuration
- Jest with Next.js integration
- Testing Library for React components
- 70% coverage threshold for branches, functions, lines, statements
- Path aliases match TypeScript configuration
- MSW for API mocking in tests