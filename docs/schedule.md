You are a senior Next.js engineer. Build V1 Google Calendar Hybrid Sync for Ruby-HSK.

Tech stack:
- Next.js App Router (app/)
- NextAuth (Google Provider)
- Supabase (DB)
- TypeScript
- Tailwind minimal UI

Business rules (V1):
1) Ruby-HSK is the source of truth (one-way sync only).
2) Teacher creates/updates/deletes a class schedule in Ruby-HSK.
3) For each attendee (teacher + students):
   - If the attendee has connected Google Calendar (calendar scope granted + refresh_token stored) => create/update/delete the event directly on their Google Calendar (guaranteed sync).
   - Else (not connected) => fallback: send invite by adding them as an attendee to the TEACHER event (or send an .ics email invite) so they can accept manually.
4) No reverse sync from Google Calendar to Ruby-HSK. No webhooks/watch.

OAuth / NextAuth requirements:
- Default sign-in scope for authentication is: openid email profile.
- Calendar connection is OPTIONAL and must use incremental authorization:
  - Ask for calendar scope ONLY when user clicks "Connect Google Calendar" in Settings.
- Use least privilege scope: https://www.googleapis.com/auth/calendar.events
- Ensure refresh_token is obtained reliably:
  - Use prompt=consent and access_type=offline in the calendar connect flow.
  - Handle the case where Google does not return refresh_token on subsequent logins:
    - Provide a "Reconnect" action that forces consent again.
- Never expose refresh_token to the client.
- Store tokens in Supabase server-side only (encrypted at rest or using Supabase Vault-like approach; if not available, use AES encryption with an env secret on server).
NextAuth configuration changes (important):
- In NextAuth Google provider:
  - Use authorization params for basic login: scope openid email profile
- Implement a way to detect calendar-connect flow:
  - If request includes calendar scope, persist refresh_token.
- In jwt/session callbacks:
  - Save providerAccountId + userId mapping
  - Ensure you can identify the logged-in user id (Supabase user id) on server routes.

Edge cases to handle:
- refresh_token missing: show UI hint "Please reconnect to enable calendar sync."
- token refresh failed or revoked: mark connection invalid and prompt reconnect.
- teacher not connected: still allow schedule in Ruby-HSK, but show "calendar sync pending" and fallback only possible if teacher event cannot be created.
- avoid sending duplicate invites:
  - teacher event attendees should be updated with full list each time
  - student direct events should not include all attendees if it causes duplicate notifications

Deliverables:
- Supabase SQL migration files (or SQL blocks)
- NextAuth config changes
- API routes
- lib modules
- Settings UI + minimal schedule sync wiring
- Include comments and logs for debugging.

Xong cũng generate file md hướng dẫn cách sử dụng, flow schedule hiện tại, tạo như thế nào để sync calendar cho teacher và student . Tiếp đến là step by step config google console liên quan về google calendar api


Implement cho tôi
