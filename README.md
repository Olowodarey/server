# Stacks Academy - Backend Server

A production-grade, modular NestJS backend powering the Stacks Academy platform.

## Architecture Overview

The backend is built as a **NestJS Monorepo**, utilizing **Clean Architecture** principles to separate concerns and ensure high maintainability.

### Project Structure
```text
server/
├── apps/
│   └── api/                # Main HTTP API application
│       ├── src/
│       │   ├── modules/    # 9 Core Feature Modules
│       │   ├── app.module.ts
│       │   └── main.ts
│       └── test/           # End-to-End tests
├── libs/
│   ├── common/             # Shared utilities (Guards, Decorators, Interceptors)
│   ├── config/             # Typed Joi-validated environment config
│   └── database/           # TypeORM Entities and Migrations
├── package.json            # Monorepo dependencies (pnpm workspaces)
├── nest-cli.json           # NestJS project config
└── docker-compose.yml      # Local Postgres & API dev setup
```

## Core Modules

1. **Auth**: SIP-018 structural sign challenge/response authentication issuing JWTs.
2. **Users**: Profiles, stats tracking, and role-based access.
3. **Courses**: Learning paths, lessons, and step-by-step progress tracking.
4. **Assessments**: AI-driven quiz generation via Claude 3.5 Haiku and automated grading.
5. **AI Tutor**: Context-aware educational chat keeping track of user progress.
6. **Gamification**: Immutable XP events, streak calculation, and earned badges.
7. **Certificates**: SIP-009 NFT minting module on the Stacks blockchain.
8. **Gallery**: Community project submissions with upvoting and moderation.
9. **Builders**: Ecosystem directory of developers and learners.

## Tech Stack

* **Framework**: NestJS 10 (TypeScript)
* **Database**: PostgreSQL 16
* **ORM**: TypeORM
* **Authentication**: Passport.js (JWT) + `@stacks/encryption`
* **AI Integration**: Anthropic SDK (Claude 3.5 Haiku)
* **Blockchain**: Stacks.js (`@stacks/network`, `@stacks/transactions`)
* **Validation**: `class-validator` + `Joi`
* **Package Manager**: pnpm

## Getting Started

### Prerequisites
- Node.js v20+
- pnpm v9+
- Docker & Docker Compose

### Local DevelopmentSetup

1. **Clone & Install**:
   ```bash
   cd server
   pnpm install
   ```

2. **Environment Variables**:
   Copy the example environment file and insert your API keys (Anthropic, DB, secret keys).
   ```bash
   cp .env.example .env
   ```

3. **Start Infrastructure (Database)**:
   ```bash
   docker-compose up -d postgres
   ```

4. **Run Migrations & Seeds**:
   ```bash
   pnpm run migration:run
   pnpm run seed
   ```

5. **Start the API Server**:
   ```bash
   pnpm run start:dev
   ```

The API will be available at `http://localhost:3001/api/v1`.

### Dockerized Production Build
The entire server can be built and run using the optimized multi-stage `Dockerfile`:
```bash
docker build -t stacks-academy-api .
docker run -p 3001:3001 --env-file .env stacks-academy-api
```

## API Design Principles
* **Consistent Responses**: All requests return `{ success: boolean, data?: any, meta?: any }` wrapped by the `TransformInterceptor`.
* **Standard Errors**: `GlobalExceptionFilter` serializes all errors avoiding generic HTML responses.
* **Pagination**: Lists utilize standard `page` and `limit` URL queries mapped via `PaginationDto`.
* **Security**: DTO whitelist validation is strictly enforced; most routes default to `@ApiBearerAuth('JWT')` protection unless explicitly marked `@Public()`.