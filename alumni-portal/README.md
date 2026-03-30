# Alumni Portal

A Next.js app for browsing and searching JEME alumni data. Uses Prisma with PostgreSQL (Supabase).

## Prerequisites

- Node.js 18+
- Access to the PostgreSQL database (ask a team member for credentials)

## Setup after cloning

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in `DATABASE_URL` with the real connection string.

3. **Generate the Prisma client**
   ```bash
   npx prisma generate
   ```

4. **Start the dev server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Database

The schema lives in `prisma/schema.prisma`. The Prisma client is generated into `src/generated/prisma/`.

If the database schema changes:
```bash
npx prisma generate   # regenerate the client
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
