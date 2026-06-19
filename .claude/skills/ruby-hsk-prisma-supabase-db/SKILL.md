# ruby-hsk-prisma-supabase-db

## When to use
Database queries, schema changes, migrations, seeds, understanding data models.

---

## Database access model
```
All app code → lib/prisma.ts (singleton) → Prisma Client
  → DATABASE_URL (pgbouncer pooler, port 6543)  ← runtime queries
  → DIRECT_URL (direct connection, port 5432)   ← migrations only
  → Supabase PostgreSQL
```

**`pg` package: installed, zero imports in codebase — dead dependency. Do not use.**
**Supabase JS: NOT used for DB queries — Prisma only.**

---

## Prisma singleton

`lib/prisma.ts` — the only place `PrismaClient` is instantiated. Import from here everywhere:
```ts
import { prisma } from "@/lib/prisma"
// or
import prisma from "@/lib/prisma"
```
Never instantiate `new PrismaClient()` outside this file.

---

## Schema overview

`prisma/schema.prisma` — 814 lines, 60+ models, organized in 4 groups:

**Public content (landing site):**
`Category`, `Course`, `Lesson`, `Vocabulary`, `GrammarPoint`, `HeroSlide`, `HSKLevel`, `Feature`, `CtaStat`, `Album`, `Photo`, `Review`, `PageMetadata`, `Registration`

**Practice / learning:**
`PortalLessonProgress`, `PortalItemProgress`, `PortalItemSkillProgress`, `PortalLessonSkillProgress`, `PortalLessonSessionState`, `PortalPracticeSession`, `PortalPracticeAttempt`

**Portal / management:**
`PortalUser`, `PortalClass`, `PortalClassEnrollment`, `PortalScheduleSeries`, `PortalSchedule`, `PortalAssignment`, `PortalAssignmentSubmission`, `PortalAttendance`, `PortalNotification`, `ChatSession`, `ChatMessage`, `GoogleCalendarToken`

**NextAuth models:**
`Account`, `Session`, `VerificationToken`

---

## Query patterns (use these — they are the established patterns)

**Parallel fetch:**
```ts
const [a, b, c] = await Promise.all([
  prisma.portalClass.findMany({ where, include }),
  prisma.portalClass.count({ where }),
  prisma.portalUser.findUnique({ where: { id } }),
])
```

**Pagination:**
```ts
const skip = (page - 1) * pageSize
const [items, total] = await Promise.all([
  prisma.model.findMany({ skip, take: pageSize, where }),
  prisma.model.count({ where }),
])
```

**Transaction:**
```ts
await prisma.$transaction([
  prisma.model.update({ where, data }),
  prisma.other.deleteMany({ where }),
])
```

**Upsert:**
```ts
await prisma.portalItemProgress.upsert({
  where: { userId_vocabId: { userId, vocabId } },
  update: { seenCount: { increment: 1 } },
  create: { userId, vocabId, seenCount: 1 },
})
```

**Aggregation:**
```ts
const result = await prisma.portalItemSkillProgress.groupBy({
  by: ['mode'],
  where: { userId },
  _avg: { masteryScore: true },
})
```

**No raw SQL — zero `$queryRaw` / `$executeRaw` in the codebase. Keep it that way.**

---

## Commands

```bash
# Development — creates and applies migration
npx prisma migrate dev --name <descriptive-name>

# Production — apply pending migrations only
npx prisma migrate deploy

# Regenerate client after schema change
npx prisma generate

# Visual DB browser
npx prisma studio

# Seeds
npx tsx prisma/seed.ts             # Landing content (categories, HSK levels, CMS defaults)
npx tsx prisma/seed-vocabulary.ts  # HSK 1-6 vocabulary from JSON exports
npx tsx prisma/seed-portal.ts      # Test users, classes, practice records
```

---

## Schema change process

1. Edit `prisma/schema.prisma`
2. `npx prisma migrate dev --name <description>`
3. `npx prisma generate`
4. Update `services/portal/<domain>.service.ts` for changed queries
5. Update `actions/<domain>.actions.ts` if mutation signatures changed

---

## Domain model notes

**Strengths:**
- Course → Lesson → Vocabulary hierarchy matches HSK curriculum
- Per-skill progress (flashcard/quiz/listen/write) with SRS session state
- `GoogleCalendarToken` encrypted at rest (AES-256-GCM)
- `PortalNotification` feeds Supabase Realtime delivery

**Gaps (observations — do not change schema without approval):**
- No `TeacherProfile` model — teacher bios/specializations not in schema
- `Registration` (lead capture) exists but status workflow (PENDING→CONTACTED→ENROLLED) not confirmed in schema
- Quiz data model unclear — `quizzes` route exists but no `Quiz`/`QuizQuestion` model visible — To verify
- `GrammarPoint` exists but no grammar practice session model
