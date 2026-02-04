# Sprint 8 — Hardening + Release

## Goal
Ổn định, bảo mật, polishing UI, performance, release.

## Scope
- RBAC audit (no data leaks)
- Error handling/toasts + empty states everywhere
- Pagination/virtualization for large tables
- Upload robustness
- Logging/monitoring (Sentry optional)
- E2E smoke tests:
  - admin login → create class
  - teacher create sessions → attendance
  - create assignment → student submit → grade
- Accessibility basics

## Release checklist
- [ ] Env/secrets (NextAuth, provider keys, DB url)
- [ ] Seed demo data
- [ ] Admin bootstrap (first admin)
- [ ] Docs “How to” for teacher/admin/student flows
