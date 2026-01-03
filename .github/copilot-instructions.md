# Pinewood Derby AI Coding Agent Instructions

This document provides essential guidance for AI coding agents working on the Pinewood Derby codebase.

## Architecture Overview

This is a [Next.js](https://nextjs.org/) application using the App Router, with a PostgreSQL database managed by [Prisma](https://www.prisma.io/). The architecture is designed to separate concerns between the frontend, backend API, and business logic.

A key pattern is the separation of data fetching and business logic:

- **`src/app/api/**/route.ts`**: Thin API route handlers. They are responsible for handling HTTP requests and responses, and calling business logic from `src/api-biz`.
- **`src/api-biz/*.ts`**: Server-side business logic. These files contain the core logic for creating, reading, updating, and deleting data. They interact with the database via the Prisma client defined in `src/api-biz/db.ts`.
- **`src/client-biz/*.ts`**: Client-side data fetching logic. These files use `axios` to call the API routes defined in `src/app/api`. They provide a clean interface for the frontend components to fetch data.
- **`src/lib/*.ts`**: Shared utilities, data transformations, and type definitions. If a piece of logic or a type is needed on both the client and server, it belongs here. Prisma's generated types are used extensively.
- **`src/app/**/page.tsx`**: Frontend pages. Many are client components (`'use client'`) that use the functions from `src/client-biz` to fetch data. A common pattern is to have a `*-data.ts` file alongside a page (e.g., `src/app/derby/[id]/derby-data.ts`) that orchestrates multiple `client-biz` calls to gather all data needed for that page.
- **`src/components/*.tsx`**: Reusable React components.

**Example Data Flow for fetching cars:**

1.  A React component in a page calls `fetchCars(derbyId)` from `src/client-biz/car.ts`.
2.  `fetchCars` makes a GET request to `/api/car?derby_id={derbyId}`.
3.  The route handler at `src/app/api/car/route.ts` receives the request.
4.  The handler calls `getDerbyCars(derbyId)` from `src/api-biz/car.ts`.
5.  `getDerbyCars` uses the Prisma client to query the database for the cars.
6.  The data is returned up the chain and displayed on the page.

## Developer Workflow

The primary development workflow is managed through `make`. Run `make` to see a full list of available commands.

- **To run the application locally**:
  ```bash
  make run
  ```
  This command will:
  1.  Install dependencies (`npm ci`).
  2.  Start the PostgreSQL database in Docker.
  3.  Apply any pending database migrations using Prisma (`npx prisma migrate dev`).
  4.  Start the Next.js development server.
  The local environment uses `.env.dev` for environment variables.

- **To run tests**:
  ```bash
  make test
  ```
  This runs all `*.test.ts` files using Jest. To run a single test file:
  ```bash
  make src/api-biz/car.test.ts
  ```
  Tests use the `.env.test` environment file and run against a test database.

- **Database Migrations**:
  Migrations are handled by Prisma. To create a new migration, run:
  ```bash
  npx prisma migrate dev --name your-migration-name
  ```
  Migrations are stored in the `prisma/migrations` directory.

## Key Files and Directories

- **`prisma/schema.prisma`**: The single source of truth for the database schema.
- **`src/api-biz/db.ts`**: Exports the initialized Prisma client for use in the business logic layer.
- **`src/client-biz/axios.ts`**: Exports the configured `axios` client for client-side API requests.
- **`Makefile`**: Defines all the common development and testing tasks.
- **`docker-compose.yaml`**: Defines the local database service.
