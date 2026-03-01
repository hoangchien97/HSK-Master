# 🏮 Ruby HSK — Trung tâm tiếng Trung

> **HSK Learning Portal & Landing Page**
> Production: [rubyhsk.vn](https://rubyhsk.vn) · Deploy: Vercel

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.1.1 (App Router) |
| **UI** | React 19 · TailwindCSS v4 · HeroUI · framer-motion |
| **Database** | Supabase Postgres via Prisma 5.22 |
| **Auth** | NextAuth v5 (Google OAuth + Credentials, JWT) |
| **i18n** | next-intl |
| **Deploy** | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+ · npm 10+
- Supabase project with Postgres (or local Postgres)
- Google OAuth credentials (for auth)

### Setup

```bash
# 1. Clone & install
git clone <repo-url> && cd HSK-Master
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, DIRECT_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, etc.
# See SETUP_ENV.md for details

# 3. Database setup
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
HSK-Master/
├── app/                          # Next.js App Router
│   ├── (landing)/                # 🌐 Public site: /, /about, /contact, /courses/**
│   ├── (portal)/                 # 🎓 Learning portal: /portal/[role]/**
│   ├── (portal-auth)/            # 🔐 Auth: /portal/login, /portal/register
│   ├── api/                      # API routes (auth, portal CRUD, OG images)
│   ├── globals.css               # Design tokens + animations
│   ├── layout.tsx                # Root layout
│   └── not-found.tsx             # Global 404
├── actions/                      # Server Actions (mutations)
├── components/
│   ├── landing/                  # Landing page components
│   ├── portal/                   # Portal components
│   └── shared/                   # Cross-cutting shared components
├── constants/                    # Brand values, portal roles
├── enums/                        # TypeScript enums (portal status, modes)
├── hooks/                        # Custom React hooks
├── interfaces/                   # TypeScript interfaces
├── lib/                          # Prisma client, utils, Supabase storage
├── providers/                    # React context providers
├── services/                     # Data access layer (services → Prisma)
├── prisma/
│   ├── schema.prisma             # Database schema (20+ models)
│   ├── migrations/               # Migration history
│   └── seed.ts                   # Database seeding
├── docs/                         # Documentation
│   ├── HSK_AUDIT_REPORT.md       # Comprehensive audit findings
│   ├── IMPLEMENTATION_GUIDE.md   # Implementation reference & prompts
│   ├── PROJECT_RULES.md          # Coding standards & checklist
│   └── ...                       # Feature specs
└── scripts/                      # Utility scripts
```

---

## Architecture

### Rendering Strategy

| Page | Path | Strategy | Rationale |
|------|------|----------|-----------|
| Homepage | `/` | SSG + ISR (1h) | Fast crawl, stable content |
| About | `/about` | SSG | Static content |
| Contact | `/contact` | SSG | Static |
| Course List | `/courses` | ISR | Courses added periodically |
| Course Detail | `/courses/[slug]` | ISR | SEO per course |
| Lesson List | `/courses/[slug]/lessons` | ISR | Long-tail SEO |
| Lesson Detail | `/lessons/[id]` | SSR | Dynamic content |
| Vocabulary | `/vocabulary` | SSR | Search functionality |
| Portal | `/portal/**` | SSR | Protected, personalized |

### Data Flow

```
Server Component → services/*.service.ts → Prisma → Supabase Postgres
Server Action    → actions/*.actions.ts  → Prisma → Supabase Postgres
API Route        → app/api/**/route.ts   → Prisma → Supabase Postgres
```

### Key Models (Prisma)

- **Content**: Category → Course → Lesson → Vocabulary
- **Practice**: PortalLessonProgress, PortalItemProgress, PortalPracticeSession, PortalPracticeAttempt
- **Portal**: PortalUser → PortalClass → PortalClassEnrollment
- **Schedule**: PortalScheduleSeries → PortalSchedule (Google Calendar sync)
- **Assignments**: PortalAssignment → PortalAssignmentSubmission
- **Auth**: Account, Session, VerificationToken (NextAuth)

---

## Development Guidelines

### UI Components

**Prefer HeroUI** for all interactive elements:

```tsx
import { Button } from "@heroui/react";    // or individual: @heroui/button
import { Input } from "@heroui/react";
import { Card } from "@heroui/react";

// Consistent variants:
<Button color="primary" variant="solid">CTA</Button>
<Button color="default" variant="bordered">Secondary</Button>
<Input variant="bordered" label="Email" />
```

### Server vs Client Components

```tsx
// ✅ Default: Server Component
export default async function CoursePage() {
  const courses = await getCourses();
  return <CourseList courses={courses} />;
}

// ✅ Client only when needed
"use client";
export function CourseFilter({ onFilter }: Props) {
  const [query, setQuery] = useState("");
  // ...
}
```

### Data Access Pattern

```tsx
// ✅ Service layer with caching
import { unstable_cache } from "next/cache";

export const getCourses = unstable_cache(
  async () => prisma.course.findMany({ where: { isPublished: true } }),
  ["courses"],
  { revalidate: 3600, tags: ["courses"] }
);

// ✅ Server Action with revalidation
"use server";
export async function createCourse(data: CourseInput) {
  await prisma.course.create({ data });
  revalidateTag("courses");
}
```

### Database

- Add `@@index` for FK columns used in `WHERE` clauses
- Use `select` instead of `include` when you don't need all fields
- Use `Promise.all` for independent queries
- Paginate with cursor-based pagination for large datasets

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (`prisma generate` + `next build`) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run migrations (dev) |
| `npm run prisma:deploy` | Deploy migrations (prod) |
| `npm run prisma:studio` | Open Prisma Studio |

---

## Documentation

| Document | Purpose |
|----------|---------|
| [HSK Audit Report](docs/HSK_AUDIT_REPORT.md) | Comprehensive code review with top 10 issues and patches |
| [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md) | AI-ready prompts for implementing audit fixes |
| [Project Rules](docs/PROJECT_RULES.md) | Coding standards and performance checklist |
| [Setup Environment](SETUP_ENV.md) | Environment variables guide |

---

## Database Migrations

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name descriptive_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (DEV ONLY)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

---

## License

Private — All rights reserved.
