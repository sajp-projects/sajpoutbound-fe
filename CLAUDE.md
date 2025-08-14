# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `npm run dev` - Start development server with Vite
- `npm run build` - TypeScript compilation + Vite build for production
- `npm run lint` - ESLint code quality check
- `npm run lint:fix` - Auto-fix ESLint issues for TypeScript files
- `npm run preview` - Preview production build locally

## Project Overview

**PT. SAJP Frontend** - A comprehensive warehouse/logistics management system built with React 19 + TypeScript, using Vite as the build tool. The application manages the complete supply chain from inventory to delivery with role-based access control (RBAC).

**Main Stack:**
- React 19.0.0 + TypeScript
- Vite 6.3.1 (build tool)
- React Router 7.5.1 (routing)
- Tailwind CSS 4.1.4 + shadcn/ui (styling)
- TanStack Query 5.74.4 (server state)
- React Hook Form 7.56.3 + Joi (forms/validation)
- Axios 1.9.0 (HTTP client)

## Architecture

**Feature-Based Structure with RBAC:**
```
src/
├── components/ui/        # shadcn/ui components (Button, Card, etc.)
├── components/           # Custom business components
├── layout/              # AuthLayout, BaseLayout, RBACLayout
├── pages/               # Route-based pages organized by domain
├── hooks/               # Custom React hooks for API calls
├── types/               # TypeScript definitions
├── utils/               # Utility functions
├── constant/            # App constants including PERMISSION definitions
└── lib/                 # Third-party configurations
```

**Domain Modules:**
- **User Management** (`pengguna/`, `peran/`): Users, roles, permissions
- **Inventory** (`gudang/`, `barang/`): Warehouses, products, stock
- **Operations** (`do/`, `pengiriman/`, `armada/`): Delivery orders, shipments, fleet
- **Customer Relations** (`pelanggan/`): Customer management
- **Reporting** (`laporan/`): Operational reports and analytics

## Key Patterns

**API Integration:**
- Custom hooks per domain (e.g., `useAuth`, `useBarang`) using TanStack Query
- Axios interceptors for centralized HTTP handling and authentication
- 5-minute stale time for queries
- Strong TypeScript typing for all API responses

**Permission System:**
- RBAC implementation with resources and actions defined in `PERMISSION` constants
- All routes protected via `RBACLayout` wrapper
- Resource-based permissions (USER, WAREHOUSE, PRODUCT, etc.)

**State Management:**
- Server state: TanStack Query
- Authentication: Custom `useAuth` hook with localStorage persistence
- Forms: React Hook Form with Joi validation
- Local component state: React hooks

**Component Organization:**
- UI components follow shadcn/ui conventions in `components/ui/`
- Business components in `components/` with feature-specific logic
- Page components in `pages/` organized by domain
- Layouts handle authentication, main app structure, and access control

## Configuration

**Path Aliases:** `@/*` maps to `./src/*`

**Development Proxy:** Vite proxies API calls to `localhost:3000`

**Environment Variables:** `VITE_API_BASE_URL` for API configuration

**TypeScript:** Project references setup with separate app and node configs

## Authentication Flow

JWT tokens with refresh token rotation, localStorage persistence, automatic redirects on auth failure. All protected routes require valid authentication and appropriate permissions.

## Important Files

- `src/App.tsx` - Main routing with lazy loading
- `src/layout/BaseLayout.tsx` - Main app layout with sidebar navigation
- `src/hooks/auth.ts` - Authentication logic and state management
- `src/constant/PERMISSION.ts` - RBAC permission definitions
- `components.json` - shadcn/ui configuration