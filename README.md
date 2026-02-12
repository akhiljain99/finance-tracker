# Simple Finance

Tagline: **Make finance simple**

Simple Finance is a full-stack finance tracker built with Next.js, Prisma, and NextAuth.

## Features

- Email/password login
- Google login with NextAuth
- Modern dashboard with:
  - Monthly income vs spending chart
  - Spending by category chart
  - Investment portfolio mix chart
  - Savings and portfolio KPI cards
- Tracker page to add:
  - Expenses
  - Income
  - Investments (stock, crypto, real estate, etc.)
- Daily morning email digest for monthly totals

## Tech Stack

- Next.js App Router
- TypeScript
- Prisma + PostgreSQL
- NextAuth
- Recharts
- Tailwind CSS + shadcn UI

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

```bash
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Daily digest cron auth
CRON_SECRET=some-strong-random-secret

# Resend (email delivery)
RESEND_API_KEY=re_...
DIGEST_FROM_EMAIL=Simple Finance <digest@yourdomain.com>
```

3. Run migrations and generate Prisma client

```bash
npx prisma migrate dev
npx prisma generate
```

4. (Optional) Seed demo data

```bash
npx prisma db seed
```

5. Start the app

```bash
npm run dev
```

## Daily Digest Cron

- Cron endpoint: `GET /api/cron/daily-summary`
- Requires `Authorization: Bearer <CRON_SECRET>`
- `vercel.json` schedules it daily at `13:00 UTC`

If deploying outside Vercel, schedule this endpoint with your own job runner.
