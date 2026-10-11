# Merchant Management API

A NestJS API for managing merchant applications, user access, reviewer
assignments, and application decisions. New applications are queued for risk
review, and the API provides Swagger documentation for trying endpoints.

## Requirements

- Node.js 22 or newer
- pnpm
- Docker and Docker Compose (for the database and Redis)

## Configuration

Install dependencies and create your local environment file:

```bash
pnpm install
cp .env.example .env
```

Update the values in `.env` for your environment. Generate separate
base64-encoded secrets for the access and refresh tokens:

```bash
openssl genrsa -out private.pem 2048
```

```bash
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
```

```bash
base64 -w 0 private.pem > private_base64.txt
```

```bash
base64 -w 0 public.pem > public_base64.txt
```

Run the command twice and set the results as `JWT_ACCESS_SECRET` and
`JWT_REFRESH_SECRET`. Don’t use the example values in production.

When running the API directly on your machine, the example settings connect to
PostgreSQL at `localhost:5433` and Redis at `127.0.0.1:6379`.

## Run locally

Start the database and Redis:

```bash
docker compose up -d postgres redis
```

Apply database migrations, then start the API in watch mode:

```bash
pnpm run migration:run
pnpm run start:dev
```

In development, seed the database with the sample users:

```bash
pnpm run seed
```

The seed command can be run again safely. Sample accounts all use
`Password123!`:

| Role     | Email                    |
| -------- | ------------------------ |
| Admin    | `admin@merchants.com`    |
| Reviewer | `reviewer@merchants.com` |
| Sales    | `sales1@merchants.com`   |
| Sales    | `sales2@merchants.com`   |

These accounts are for local developement only. Do not use them in a deployed
environment.

## Run with Docker Compose

Make sure `.env` exists and contains the required database and token settings.
Compose supplies the API container with the internal service names for
PostgreSQL and Redis.

Build and start the API with its dependencies:

```bash
docker compose up --build merchant-api
```

The API listens on port `3000` by default. Change `PORT` in `.env` to use a
different host port. Before the first run, apply migrations from your local
machine while the Compose database is running:

```bash
docker compose up -d postgres redis
pnpm run migration:run
```

Stop the services with `Ctrl+C`, or run `docker compose down` in another
terminal.

## API

Swagger UI is available at
[http://localhost:3000/api/docs](http://localhost:3000/api/docs). Log in at
`POST /auth/login` to receive access and refresh tokens. Use the access token as
a bearer token for protected endpoints. `POST /auth/refresh` returns a new
access token.

Main endpoint groups:

- `/auth` — login and refresh tokens
- `/merchant-application` — submit, list, view, update, assign, and decide on
  merchant applications
- `/user` — create and manage users
- `/audit` — create audit log entries

Access to application operations is role-based. Sales users can work with their
own applications, while reviewers and administrators have additional review and
decision capabilities.

## Migrations

After changing an entity’s database schema, generate a migration with a
descriptive path:

```bash
pnpm run migration:generate src/database/migrations/AddMerchantField
pnpm run migration:run
```

To check migration status or undo the latest migration:

```bash
pnpm run migration:show
pnpm run migration:revert
```

Changes to TypeORM query settings that do not affect the database schema (for
example, whether a column is selected by default) do not require a migration.

## Tests

```bash
pnpm test
pnpm run test:e2e
pnpm run test:cov
```

## Project notes

The API is built with NestJS, TypeORM, PostgreSQL, Redis, and BullMQ. For more
information about the framework, see the
[NestJS documantation](https://docs.nestjs.com).
