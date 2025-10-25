# Zenara Architecture & Security Review

## Repository Overview

- **Tech stack**: The app remains a Next.js 14 project with the `/app` directory, Supabase persistence, and LangChain/OpenAI integrations. Client state now leans on React Query, Zustand stores, and a shared auth context exposed through `app/providers.tsx`.【F:app/providers.tsx†L1-L17】【F:app/store/taskStore.ts†L1-L197】
- **Shared services**: Utility modules continue to live under `app/lib`, including the monolithic Supabase data access layer (`storage.ts`), AI orchestration (`processingService.ts`), and prompt persistence (`promptService.ts`).【F:app/lib/storage.ts†L1-L200】【F:app/lib/processingService.ts†L1-L197】【F:app/lib/promptService.ts†L1-L200】
- **API surface**: Route handlers in `app/api/*` still call the storage and AI services directly. New health checking and additional Zod validation appear, but authentication remains inconsistent across endpoints.【F:app/api/health/route.ts†L1-L12】【F:app/api/tasks/route.ts†L1-L45】【F:app/api/pomodoro-sessions/route.ts†L1-L45】

## What Changed Since the Previous Review

- **Centralized client providers**: A dedicated `AuthProvider` now wraps the app, reacting to Supabase auth state changes and exposing sign-in/out helpers to client components.【F:app/providers.tsx†L1-L17】【F:app/lib/AuthContext.tsx†L1-L64】
- **Server-side prompt mutations**: The prompts POST handler now authenticates via `createRouteHandlerClient` before inserting rows, reducing the risk of anonymous prompt creation.【F:app/api/prompts/route.ts†L1-L87】
- **Payload validation**: Tasks and pomodoro session endpoints introduced Zod schemas, catching malformed requests earlier than before.【F:app/api/tasks/route.ts†L1-L45】【F:app/api/pomodoro-sessions/route.ts†L1-L45】
- **Client-side Supabase usage**: Zustand stores call `supabase.auth.getUser()` before performing task mutations, which keeps UI mutations scoped to the active session even though the server layer still trusts caller-provided IDs.【F:app/store/taskStore.ts†L35-L187】

## Architectural Observations & Recommendations

### 1. Break down the monolithic storage service

- **Issue**: `DatabaseStorage` centralizes CRUD for users, tasks, pomodoro sessions, scratchpads, and settings against the raw Supabase client, encouraging tight coupling and duplication of business rules across the API and client stores.【F:app/lib/storage.ts†L1-L200】
- **Recommendation**: Introduce feature-scoped repositories (e.g., `features/tasks/server/repository.ts`) that encapsulate validation, ownership checks, and serialization. Wire them through feature-specific services that route handlers and client-side hooks can share.

### 2. Generate database types instead of hand-maintaining them

- **Issue**: `shared/schema.ts` still duplicates table shapes manually, and new modules (e.g., Zustand stores) drift toward camelCase properties that differ from Supabase column names.【F:shared/schema.ts†L1-L76】【F:app/store/taskStore.ts†L41-L152】
- **Recommendation**: Adopt Supabase CLI or Drizzle to generate typed clients and map them to domain DTOs. This prevents subtle bugs when schema migrations happen.

### 3. Rationalize Supabase client creation

- **Issue**: There are now four different Supabase entry points—`db.ts`, `supabaseClient.ts`, `supabase.ts`, and `supabase-server.ts`—with overlapping responsibilities and divergent environment fallbacks (mock clients, manual type stubs, server helpers).【F:app/lib/db.ts†L1-L35】【F:app/lib/supabaseClient.ts†L1-L23】【F:app/lib/supabase.ts†L1-L49】【F:app/lib/supabase-server.ts†L1-L8】
- **Recommendation**: Consolidate client creation into a single module per environment (browser/server/tests) that enforces explicit configuration. Export typed factory functions so both API routes and client stores share consistent auth context and error handling.

### 4. Standardize API layering and auth contracts

- **Issue**: Some endpoints (prompts POST) enforce authenticated Supabase sessions while others still accept raw `userId` query/body parameters. Route handlers continue to orchestrate domain logic directly, making cross-cutting concerns like logging, RBAC, and rate limiting difficult to apply uniformly.【F:app/api/tasks/route.ts†L12-L40】【F:app/api/pomodoro-sessions/route.ts†L12-L40】【F:app/api/note-versions/route.ts†L4-L26】
- **Recommendation**: Introduce an API middleware/utilities package that resolves the session, injects a feature service, and handles errors consistently. Require session-derived user IDs for all routes and reject mismatched payloads before hitting storage.

### 5. Decouple AI orchestration components

- **Issue**: `ProcessingService` still instantiates a global `ChatOpenAI` client and intertwines prompt lookup, template construction, and streaming response management. API routes create new service instances ad hoc, duplicating logic and making it hard to swap models/providers.【F:app/lib/processingService.ts†L1-L197】【F:app/api/process-note/route.ts†L1-L24】【F:app/api/process-note-stream/route.ts†L1-L38】
- **Recommendation**: Move toward dependency-injected services: a prompt repository, an AI client factory, and a streaming serializer. Provide thin route handlers that depend on these abstractions for easier testing and provider changes.

## Security Findings & Mitigations

### 1. Several API routes remain unauthenticated

- **Issue**: `tasks`, `pomodoro-sessions`, `note-versions`, and both note-processing endpoints still trust caller-supplied `userId` values and never verify the Supabase session, allowing unauthorized access to other users' data if RLS is lax.【F:app/api/tasks/route.ts†L12-L40】【F:app/api/pomodoro-sessions/route.ts†L12-L40】【F:app/api/note-versions/route.ts†L4-L26】【F:app/api/process-note/route.ts†L6-L24】【F:app/api/process-note-stream/route.ts†L5-L31】
- **Mitigation**: Require session authentication via `createRouteHandlerClient`, derive `user.id` server-side, and enforce Row Level Security policies so Supabase rejects mismatched rows.

### 2. Prompt management still exposes privileged mutations

- **Issue**: `PromptService` performs inserts, updates, and deletes against the global Supabase client without scoping by the authenticated user. While the POST route now authenticates, the service remains callable elsewhere and update/delete methods only filter by ID, enabling horizontal privilege escalation if invoked with arbitrary IDs.【F:app/lib/promptService.ts†L180-L275】
- **Mitigation**: Pass the authenticated user ID into the service and enforce it in every query, both in the API layer and database policies. Consider splitting default prompt reads from user-specific mutations to minimize attack surface.

### 3. OpenAI streaming endpoint lacks abuse safeguards

- **Issue**: The SSE route accepts arbitrary content and optional prompt identifiers without authentication or rate limiting, exposing the OpenAI key to untrusted callers and inviting prompt-injection attempts.【F:app/api/process-note-stream/route.ts†L5-L38】【F:app/lib/processingService.ts†L115-L197】
- **Mitigation**: Gate access behind authenticated sessions, add per-user throttling (e.g., Upstash Ratelimit), validate prompt IDs/types, and audit streaming output to prevent leakage of system instructions.

### 4. Environment fallbacks can hide misconfiguration

- **Issue**: Both `db.ts` and `supabaseClient.ts` silently create placeholder Supabase clients when environment variables are missing, which can mask deployment errors and encourage running against mock data inadvertently.【F:app/lib/db.ts†L14-L35】【F:app/lib/supabaseClient.ts†L3-L23】
- **Mitigation**: Fail fast in production when credentials are absent, and provide explicit test doubles in unit tests instead of silent fallbacks.

## Next Steps

1. Unify Supabase client factories and update API routes to resolve the authenticated user automatically before calling feature services.【F:app/api/prompts/route.ts†L40-L75】【F:app/lib/supabase-server.ts†L1-L8】
2. Decompose `DatabaseStorage` into feature-scoped repositories backed by generated Supabase or Drizzle types, and update `ARCHITECTURE.md` to capture the target layering.【F:app/lib/storage.ts†L1-L200】【F:shared/schema.ts†L1-L76】
3. Harden AI endpoints with authentication, rate limiting, and dependency-injected model clients before exposing them broadly.【F:app/api/process-note-stream/route.ts†L5-L38】【F:app/lib/processingService.ts†L1-L197】
4. Extend the prompt service refactor to cover reads/updates/deletes and enforce user ownership consistently, paired with Supabase RLS policies.【F:app/lib/promptService.ts†L180-L357】
