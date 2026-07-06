<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

# TOMPARO — AI Career & Job Application Platform

## Project Overview

TomParo is an AI-powered career intelligence platform that helps job seekers get hired faster and helps recruiters hire smarter. Built with Next.js 16, Tailwind CSS v4, Prisma 6, Supabase PostgreSQL, and Google Gemini AI.

**Live URL:** https://www.tomparo.com  
**GitHub:** https://github.com/thrinxs/tomparo  
**Built by:** Thrinxs (https://thrinxs.com)  
**Founder:** Josh Gold

---

## Tech Stack

- **Framework:** Next.js 16.2.10 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (uses `@import "tailwindcss"` not `@tailwind`)
- **Database:** PostgreSQL via Supabase (cloud, production-ready)
- **ORM:** Prisma 6 (stable, well-documented, NextAuth compatible)
- **AI:** Google Gemini 2.5 Flash (free tier)
- **Auth:** NextAuth.js (JWT strategy, credentials + Google)
- **Payments:** Paystack (Nigerian payments, planned)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Document Generation:** docx + file-saver (for DOCX downloads)
- **PDF Parsing:** pdf2json
- **DOC/DOCX Parsing:** mammoth
- **File Upload:** react-dropzone
- **Notifications:** react-hot-toast
- **State Management:** Zustand
- **Password Hashing:** bcryptjs
- **Deployment:** Vercel (with auto-deploy from GitHub main branch)

---

## Project Structure

```
tomparo/
├── app/                          # All pages and API routes
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout (Navbar + Footer + SessionProvider)
│   ├── globals.css               # Tailwind v4 CSS entry
│   ├── (auth)/                   # Auth pages (own layout, no navbar)
│   │   ├── layout.tsx
│   │   ├── signin/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/              # User dashboard (sidebar layout)
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │       ├── page.tsx          # Dashboard home
│   │       ├── resume/page.tsx   # CV analysis (WORKING)
│   │       ├── job/page.tsx      # Job matching (WORKING)
│   │       ├── apply/page.tsx    # Cover letter + email (WORKING)
│   │       ├── skills/page.tsx   # Skill gap (placeholder)
│   │       ├── interview/page.tsx # Interview coaching (Premium)
│   │       ├── career/page.tsx   # Career AI (Premium)
│   │       ├── chat/page.tsx     # AI Chat (Premium)
│   │       ├── messages/page.tsx # Support inbox (Premium)
│   │       ├── history/page.tsx  # History (placeholder)
│   │       └── settings/page.tsx # Settings (placeholder)
│   ├── (admin)/                  # Admin dashboard
│   ├── (staff)/                  # Staff dashboard
│   ├── (support)/                # Customer care dashboard
│   ├── pricing/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── contact/page.tsx
│   └── api/                      # API routes
│       ├── auth/[...nextauth]/route.ts
│       ├── auth/signup/route.ts
│       ├── resume/upload/route.ts     # WORKING
│       ├── resume/analyze/route.ts    # WORKING
│       ├── job/match/route.ts         # WORKING
│       ├── application/cover-letter/route.ts  # WORKING
│       ├── application/email/route.ts # WORKING
│       ├── interview/start/route.ts
│       ├── skills/analyze/route.ts
│       ├── career/analyze/route.ts
│       ├── chat/route.ts
│       ├── payment/initialize/route.ts
│       ├── payment/webhook/route.ts
│       └── ...
├── components/                   # Reusable components
│   ├── Logo.tsx                  # Universal logo (one source of truth)
│   ├── Footer.tsx                # Global footer (hides on dashboard/auth)
│   ├── SessionProvider.tsx       # NextAuth session wrapper
│   ├── layout/
│   │   ├── Navbar.tsx            # Public navbar (hides on dashboard/auth)
│   │   ├── DashboardSidebar.tsx  # Dashboard sidebar navigation
│   │   ├── DashboardTopbar.tsx   # Dashboard top bar with user avatar
│   │   ├── AdminSidebar.tsx
│   │   ├── StaffSidebar.tsx
│   │   └── SupportSidebar.tsx
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── Progress.tsx
│   │   ├── GlowingCard.tsx
│   │   ├── GradientText.tsx
│   │   ├── ShimmerButton.tsx
│   │   ├── Spotlight.tsx
│   │   ├── Meteors.tsx
│   │   └── AnimatedNumber.tsx
│   ├── resume/
│   │   ├── ResumeUploader.tsx    # CV upload (drag & drop + paste)
│   │   └── ResumeAnalysis.tsx    # AI analysis results display
│   ├── job/
│   │   ├── JobInput.tsx          # Job description input
│   │   └── JobAnalysis.tsx       # Job match results display
│   ├── application/
│   │   ├── CoverLetter.tsx       # Cover letter generator (DOCX download)
│   │   └── EmailGenerator.tsx    # Email generator (3 styles, DOCX download)
│   ├── dashboard/
│   ├── interview/
│   ├── skills/
│   ├── career/
│   ├── chat/
│   ├── support/
│   ├── admin/
│   └── ads/
├── lib/                          # Core logic
│   ├── prisma.ts                 # Prisma client (Prisma 6, PostgreSQL)
│   ├── gemini.ts                 # Gemini AI client (model: gemini-2.5-flash)
│   ├── auth.ts                   # NextAuth configuration
│   ├── utils.ts                  # Helper functions (cn, toJson, etc.)
│   ├── usage-limiter.ts          # Rate limiting per user role
│   ├── paystack.ts               # Paystack payment logic (planned)
│   └── ai/                       # AI service modules
│       ├── resume-analyzer.ts    # CV analysis AI prompts (WORKING)
│       ├── job-analyzer.ts       # Job matching AI prompts (WORKING)
│       ├── application-generator.ts # Cover letter + email AI (WORKING)
│       ├── interview-coach.ts    # Interview Q&A AI
│       ├── skill-gap-engine.ts   # Skill gap analysis AI
│       └── career-intelligence.ts # Career AI advisor
├── types/                        # TypeScript types
│   ├── index.ts
│   ├── user.ts
│   ├── resume.ts
│   ├── job.ts
│   └── ai.ts
├── hooks/                        # Custom React hooks
│   ├── useSession.ts
│   ├── useUsage.ts
│   ├── useResume.ts
│   └── useSubscription.ts
├── docs/                         # Business documentation
│   ├── recruiter-roadmap.md
│   ├── job-marketplace-vision.md
│   ├── opportunity-discovery.md
│   ├── monetization-strategy.md
│   └── job-discovery-feature.md
├── public/
│   └── images/
│       └── logo.png              # TomParo logo (cropped, no whitespace)
├── prisma/
│   └── schema.prisma             # Database schema (Prisma 6, PostgreSQL)
├── proxy.ts                      # Route protection (was middleware.ts)
├── next.config.ts                # Next.js config with serverExternalPackages
├── tailwind.config.ts            # Tailwind config with animations
├── postcss.config.mjs            # PostCSS config (@tailwindcss/postcss)
└── .env.local                    # Environment variables (NEVER commit)
```

---

## User Roles

- **GUEST** — No account, limited features, ads shown
- **FREE** — Basic account, extended limits, ads shown
- **PREMIUM** — Full features, unlimited, no ads (₦5,000/mo)
- **SUPPORT** — Customer care dashboard access
- **STAFF** — Internal staff dashboard access
- **ADMIN** — Full system access
- **RECRUITER_STARTER** — 20 CVs/mo, 3 job posts (₦5,000/mo)
- **RECRUITER_GROWTH** — 50 CVs/mo, 10 job posts (₦10,000/mo)
- **RECRUITER_BUSINESS** — 200 CVs/mo, unlimited posts (₦30,000/mo)
- **RECRUITER_ENTERPRISE** — 500 CVs/mo, featured posts (₦80,000/mo)
- **RECRUITER_SCALE** — 1,000 CVs/mo, priority (₦150,000/mo)
- **RECRUITER_CUSTOM** — Unlimited (custom pricing)

## Route Protection (proxy.ts)

- `/` `/pricing` `/privacy` `/terms` `/contact` → Public
- `/signin` `/signup` `/forgot-password` → Auth (redirect if logged in)
- `/dashboard/*` → Allow all users (guests browse, features gated internally)
- `/dashboard/interview` `/career` `/chat` `/messages` → Premium only (redirect to /pricing)
- `/admin/*` → Admin only
- `/staff/*` → Staff + Admin
- `/support/*` → Support + Admin
- `/recruiter/*` → Recruiter roles only

---

## Key Technical Decisions

### Tailwind v4

- Uses `@import "tailwindcss"` in globals.css (NOT `@tailwind base/components/utilities`)
- PostCSS plugin is `@tailwindcss/postcss` (NOT `tailwindcss`)
- Config still uses `tailwind.config.ts` for custom animations
- NEVER add `* { padding: 0; margin: 0; }` — breaks all Tailwind utilities

### Prisma 6 (Downgraded from 7)

- **Why Prisma 6:** Prisma 7 had too many undocumented breaking changes and NextAuth compatibility issues
- URL goes in `schema.prisma` datasource block (standard approach)
- `directUrl` also in schema.prisma (for migrations)
- No `prisma.config.ts` needed
- Standard `new PrismaClient({ log: [...] })` works
- Push command: `npx prisma db push` (with env vars loaded)
- Compatible with `@auth/prisma-adapter` v2

### Supabase PostgreSQL

- **Transaction Pooler** (port 6543) → DATABASE_URL for app runtime
- **Session Pooler / Direct** (port 5432) → DIRECT_URL for migrations
- Add `?pgbouncer=true` to DATABASE_URL for connection pooling
- Free tier: 500MB storage, 50k monthly active users
- Region: eu-central-1 (Frankfurt) for Nigerian users
- Project ref example: `postgres.bbqsbhlxrycyskaiwzie`

### Next.js 16

- Middleware renamed to `proxy.ts` (export function named `proxy`)
- App Router only (no pages directory)
- Route groups: `(auth)`, `(dashboard)`, `(admin)`, `(staff)`, `(support)`
- Route groups do NOT change URLs (they organize files only)
- Turbopack is default
- `next.config.ts` needs `serverExternalPackages` for pdf2json, mammoth, prisma

### Deployment Configuration

- Deployed on Vercel with auto-deploy from GitHub main branch
- Build script: `"build": "prisma generate && next build"`
- Postinstall: `"postinstall": "prisma generate"` (generates client after npm install)
- Environment variables set in Vercel dashboard (Production, Preview, Development)
- Sensitive vars marked as "Sensitive" in Vercel
- Custom domain: www.tomparo.com

### AI Integration

- Model: `gemini-2.5-flash` (free tier, fast, reliable)
- Response format: `application/json`
- Max tokens: 16384
- Temperature: 0.4
- JSON parsing with auto-fix for truncated responses (auto-closes braces, removes trailing commas)
- All AI prompts in `lib/ai/` modules
- All AI operations have countdown timer UI (typically 15-30 seconds)
- Input trimming: resume max 8000 chars, job max 4000 chars (prevents token overflow)

### Logo System

- Single source of truth: `components/Logo.tsx`
- Sizes: sm (h-8, footer), md (h-10, sidebar), lg (h-11, auth), xl (h-12, navbar)
- Image at: `public/images/logo.png` (cropped in Preview app to remove whitespace)
- Usage: `<Logo size="xl" />` or `<Logo size="md" href="/dashboard" />`

### Navbar/Footer Visibility

- Both are client components with `usePathname()` checks
- Both hide on: `/signin`, `/signup`, `/forgot-password`, `/dashboard/*`, `/admin/*`, `/staff/*`, `/support/*`
- Dashboard has its own sidebar + topbar layout

### File Uploads

- PDF: uses `pdf2json` (dynamic import inside API route)
- DOC/DOCX: uses `mammoth` (dynamic import)
- Max size: 5MB
- Character limit for AI: 100,000 (post-cleanup)

### Document Downloads

- DOCX generation using `docx` library
- File download using `file-saver`
- Font: Calibri, 11pt (22 half-points)
- Margins: 1 inch all sides (1440 twips)
- Available for: Cover Letter, Application Email (future: CV, reports)

### Countdown Timer Pattern

All AI operations use this pattern:

- Circular progress ring with seconds remaining
- Step-by-step progress list (4-5 steps)
- Green checkmarks for completed steps
- Pulsing dots for active step
- Overall progress bar at bottom
- Total duration: 15-30 seconds
- Auto-completes at 100% when AI actually responds

---

## Pricing Structure

### Consumer (B2C)

| Plan    | Price                   | Features                             |
| ------- | ----------------------- | ------------------------------------ |
| Guest   | Free                    | 2 CV analyses/day, basic tools, ads  |
| Free    | ₦0                      | 5 CV analyses/day, save history, ads |
| Premium | ₦5,000/mo or ₦50,000/yr | Unlimited, no ads, all features      |

### Recruiter (B2B) — ALL INCLUSIVE (no per-post fees)

| Plan       | Price       | CVs/Mo    | Job Posts            |
| ---------- | ----------- | --------- | -------------------- |
| Starter    | ₦5,000/mo   | 20        | 3 active             |
| Growth     | ₦10,000/mo  | 50        | 10 active            |
| Business   | ₦30,000/mo  | 200       | Unlimited            |
| Enterprise | ₦80,000/mo  | 500       | Unlimited + Featured |
| Scale      | ₦150,000/mo | 1,000     | Unlimited + Priority |
| Custom     | Custom      | Unlimited | Everything           |

### Revenue Streams

1. Consumer Premium subscriptions
2. Recruiter subscriptions (all-inclusive, no per-post fees)
3. Affiliate revenue (courses, certifications - 5-30% commission)
4. Ads (free users only, premium = ZERO ads)
5. Company branding packages (future)

### Ad Strategy

- Premium users see ZERO ads (sacred promise)
- Free users see career-relevant ads only
- Never intrusive, max 3 ads per page
- Phase 1 (0-1000 users): NO ADS
- Phase 2 (1000-5000): Affiliate only
- Phase 3 (5000+): Curated ads
- Phase 4 (20k+): Direct deals + network

---

## Environment Variables (.env.local)

```
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_URL=http://localhost:3000  # Local dev
# NEXTAUTH_URL=https://www.tomparo.com  # Production (set in Vercel)
NEXTAUTH_SECRET=<generated with openssl rand -base64 32>

# AI
GEMINI_API_KEY=<Google AI Studio key, starts with AQ.A or AIza>

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=<Paystack public key>
PAYSTACK_SECRET_KEY=<Paystack secret key>

# Google OAuth (optional)
GOOGLE_CLIENT_ID=<Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth client secret>
```

---

## Vercel Environment Variables

Must be added in Vercel dashboard for production to work:

- DATABASE_URL (Supabase transaction pooler URL with ?pgbouncer=true)
- DIRECT_URL (Supabase session pooler URL)
- NEXTAUTH_URL (https://www.tomparo.com)
- NEXTAUTH_SECRET (same as local)
- GEMINI_API_KEY
- NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
- PAYSTACK_SECRET_KEY
- GOOGLE_CLIENT_ID (placeholder for now)
- GOOGLE_CLIENT_SECRET (placeholder for now)

Mark sensitive variables (secrets, passwords, tokens) as "Sensitive" in Vercel.

---

## Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build (runs prisma generate first)
npm run start        # Start production server
npm run lint         # Run ESLint

# Database (with env vars loaded)
export $(cat .env.local | grep DATABASE_URL | xargs)
export $(cat .env.local | grep DIRECT_URL | xargs)
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database (Supabase)
npx prisma studio    # Open database GUI

# Git
git add .
git commit -m "message"
git push             # Auto-deploys to Vercel via GitHub integration
```

---

## Current Build Status

### ✅ Completed & Deployed

- Landing page (premium design with hero, features, pricing, CTA)
- Authentication system (signup, signin, forgot-password) — WORKING on tomparo.com
- Dashboard layout (sidebar navigation + topbar with user avatar)
- Logo component (universal, consistent sizing)
- Resume upload (drag & drop PDF/DOC/DOCX + paste text)
- AI resume analysis (ATS score, strengths, weaknesses, keywords, quick wins, contact info, section coverage) — WORKING
- Job matching (match score, skills comparison, application advice, interview focus, CV tweaks) — WORKING
- Cover letter generator (AI-written, editable, DOCX download) — WORKING
- Application email generator (3 styles: Formal/Modern/Concise, editable, DOCX download) — WORKING
- Countdown timer on all AI operations (with step-by-step progress)
- Session management with NextAuth (JWT strategy)
- Route protection with proxy.ts
- Multiple dashboard types (User, Admin, Staff, Support)
- Supabase PostgreSQL integration (working locally + production)
- Deployed on Vercel with custom domain (www.tomparo.com)
- Auto-deployment from GitHub main branch

### ⏳ In Progress (Next Priority)

- Full subscription system (pricing page + Paystack integration)
- Usage tracking and daily limits enforcement
- Feature gating (Premium locks, upgrade prompts)
- Free trial for Visual CV Analysis (1-time use)
- Subscription management (view/cancel/reactivate)
- Email notifications (payment success/fail, renewals)
- Skill gap analysis with learning roadmap
- Interview coaching (Premium)
- Career AI chat (Premium)
- Visual CV analysis with annotations (Premium — free trial once)
- History page (past analyses)
- Settings page (profile management)

### ⏳ Future Features

- Job listings / public marketplace
- Recruiter platform (bulk CV upload, ranking)
- Ad system for free users
- Auto job discovery from external sources (Premium)
- Application tracking
- User submissions for opportunities
- WhatsApp notifications (via Termii)
- Live chat with customer support (Tawk.to)
- AI Career Chat (like ChatGPT for career questions)
- Company profiles and branding
- Real-time collaboration (Supabase Realtime)
- File storage for CVs (Supabase Storage)

---

## Migration History

### From SQLite to PostgreSQL (Supabase)

**Why:** SQLite doesn't work on Vercel (serverless), needed real cloud database

**Changes made:**

- Removed `@prisma/adapter-libsql` and `@libsql/client`
- Changed schema provider from `sqlite` to `postgresql`
- Added `directUrl` for migrations
- Added `@db.Text` annotations for long text fields
- Updated `.env.local` and Vercel with Supabase URLs

### From Prisma 7 to Prisma 6

**Why:** Prisma 7 had breaking changes not compatible with NextAuth adapter

**Changes made:**

- Downgraded from `prisma@7` to `prisma@^6`
- Downgraded from `@prisma/client@7` to `@prisma/client@^6`
- Deleted `prisma.config.ts`
- Restored URL in `schema.prisma` datasource block
- Simplified `lib/prisma.ts` (standard PrismaClient constructor)

---

## Vision

TomParo is building Nigeria's first AI-native job marketplace — a complete ecosystem connecting job seekers with employers through intelligent matching, career coaching, and hiring tools.

### For Job Seekers

- AI-powered CV optimization
- Job matching from multiple sources (internal + external)
- Auto-discovery of opportunities matching 85%+ of their CV
- Cover letter and application email generation
- Interview coaching with AI feedback
- Skill gap analysis with learning roadmaps
- Career AI chat for personalized advice
- 1-click apply to matched jobs
- Application tracking

### For Recruiters/Employers

- Bulk CV upload (ZIP folder support)
- AI-powered candidate ranking
- Job-specific candidate matching
- Post jobs (included in subscription)
- Candidate database search
- Team collaboration
- Analytics dashboard
- Communication tools (bulk emails, rejection letters, interview scheduling)

### External Job Sources (Future)

- Remotive API, Adzuna API (free)
- Jobberman, MyJobMag, Terawork (Nigerian)
- Upwork, Fiverr, Toptal (freelance - partnerships)
- LinkedIn, Twitter (social - paid APIs)
- User-submitted opportunities

### Revenue Projections

- Year 1: ₦20M (~$13K)
- Year 2: ₦110M (~$73K)
- Year 3: ₦410M (~$275K)
- Year 5: ₦2B+ (~$1.3M+)

---

## Notes for Future Development

- **Local dev requires env vars:** Always load `.env.local` before Prisma commands
- **Vercel auto-deploys:** Every push to `main` branch triggers new deployment
- **Test locally first:** Always run `npm run build` before pushing to catch errors
- **Sensitive vars in Vercel:** Mark as "Sensitive" — you can't view them again
- **Database migrations:** Always run `npx prisma db push` after schema changes
- **AI response truncation:** JSON parser auto-fixes common truncation issues
- **DOCX downloads:** Use professional Calibri 11pt formatting
- **Countdown timers:** Give users clear expectation of AI processing time
- **Never commit .env.local:** Already ignored in `.gitignore`
- **Logo cropping:** Physical PNG cropped to remove whitespace, then sized via CSS
