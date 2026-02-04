# HSK Master Portal — Sprint Plan (Next.js + NextAuth + Shadcn) v2

Mục tiêu: triển khai portal có 3 role **SYSTEM_ADMIN / TEACHER / STUDENT**, UI vibe theo design bạn cung cấp (Work Center, Attendance board, Library/Assignments, Student dashboard, Admin users/analytics).

## Tech stack
- Next.js (App Router) + TypeScript
- NextAuth (Auth.js) + Prisma Adapter + Postgres
- TailwindCSS
- Shadcn UI (Radix)
- react-hook-form + zod + @hookform/resolvers
- react-toastify
- lucide-react, clsx, tailwind-merge
- dayjs
- @radix-ui/react-tooltip (hoặc tooltip shadcn)

## Sprint cadence (đề xuất)
- 2 tuần / sprint (MVP có thể gom 4 sprint đầu thành 4–6 tuần)

## Files
- `00-foundation.md` — kiến trúc, setup NextAuth + RBAC, conventions
- `01-sprint-1-auth-rbac-shell.md`
- `02-sprint-2-classes-schedule.md`
- `03-sprint-3-attendance-board.md`
- `04-sprint-4-library-assignments.md`
- `05-sprint-5-grading-student-dashboard.md`
- `06-sprint-6-flashcards-learning-engine.md`
- `07-sprint-7-admin-users-analytics.md`
- `08-sprint-8-hardening-release.md`

## Vibe coding workflow (gợi ý)
1) Mở ảnh design của màn cần làm.
2) Copy phần **Goal / Scope / Acceptance Criteria** của sprint tương ứng.
3) Yêu cầu Copilot/AI: “Generate page + components theo shadcn, Tailwind, theo layout/vibe trong design. Implement API routes + Prisma models đúng contracts.”
4) Làm xong check **Demo checklist**.
