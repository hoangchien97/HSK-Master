# ⚠️ Setup Required

## Error: Cannot read properties of undefined (reading 'findMany')

Lỗi này xảy ra vì chưa có file `.env.local` với `DATABASE_URL`.

### Quick Fix:

1. **Tạo file `.env.local` trong root folder:**
```bash
cp .env.example .env.local
```

2. **Update DATABASE_URL trong `.env.local`:**

Nếu dùng Supabase (như seed đã chạy):
```env
DATABASE_URL="postgresql://postgres.ukbeoggejnqgdxqoqkvj:YOUR_PASSWORD@db.ukbeoggejnqgdxqoqkvj.supabase.co:5432/postgres"
```

Lấy connection string từ:
- Supabase Dashboard → Project Settings → Database → Connection String (URI mode)
- **Chú ý**: Thay `[YOUR-PASSWORD]` bằng password thật

3. **Restart dev server:**
```bash
npm run dev
```

### Verify Setup:

Test connection:
```bash
npx prisma studio
```

Nếu mở được Prisma Studio (http://localhost:5555), setup đã OK!

---

**Note**: File `.env.local` đã được thêm vào `.gitignore`, không lo bị commit lên Git.
