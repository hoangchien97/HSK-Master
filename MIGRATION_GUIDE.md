# Hướng dẫn Migration và Seed Database

## 📋 Tổng quan

Dự án đã được cập nhật với:
- ✅ Schema mới với 4 models bổ sung: `HeroSlide`, `HSKLevel`, `Feature`, `CtaStat`
- ✅ Course model được mở rộng với các trường mới
- ✅ Seed data đầy đủ cho trang chủ
- ✅ Services layer để fetch data từ database

---

## 🔄 Quy trình thay đổi Database Schema

### Khi nào cần làm?
- Thêm model mới
- Thêm/sửa/xóa field trong model
- Thay đổi quan hệ giữa các models
- Thêm index, constraint

### Step by Step

#### **Bước 1: Chỉnh sửa Schema**
Mở file `prisma/schema.prisma` và thực hiện thay đổi:

```prisma
// Ví dụ: Thêm model mới
model NewModel {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
}

// Ví dụ: Thêm field vào model có sẵn
model Course {
  // ... existing fields
  thumbnail String? // Field mới
}
```

#### **Bước 2: Format Schema (Optional)**
```bash
npx prisma format
```

#### **Bước 3: Generate Prisma Client**
```bash
npx prisma generate
```
> ✅ Tạo TypeScript types mới từ schema

#### **Bước 4: Tạo Migration**
```bash
# Development
npx prisma migrate dev --name ten-mo-ta-thay-doi

# Production (sau khi test kỹ)
npx prisma migrate deploy
```

**Ví dụ tên migration:**
- `add-thumbnail-to-course`
- `create-blog-model`
- `add-user-role-field`

> ⚠️ Migration sẽ apply changes lên database và tạo SQL file trong `prisma/migrations/`

#### **Bước 5: Verify Migration**
```bash
# Xem status
npx prisma migrate status

# Test connection
npx prisma db pull
```

---

## 📦 Quy trình thay đổi Seed Data

### Khi nào cần làm?
- Cập nhật data mẫu
- Thêm data mới
- Sync data với schema mới

### Step by Step

#### **Bước 1: Chỉnh sửa Seed File**
Mở file `prisma/seed.ts` và thực hiện thay đổi:

```typescript
// Ví dụ: Thêm data mới
await prisma.course.create({
  data: {
    title: "Khóa học mới",
    slug: "khoa-hoc-moi",
    // ... other fields
  }
})
```

#### **Bước 2: Clear Database (Optional - Cẩn thận!)**
```bash
# ⚠️ XÓA HẾT DATA - CHỈ dùng trong development
npx prisma migrate reset --force

# Hoặc chỉ reset seed
npx prisma db seed
```

#### **Bước 3: Run Seed**
```bash
npx prisma db seed
```

> ✅ Script sẽ chạy `prisma/seed.ts` và populate database

#### **Bước 4: Verify Data**
```bash
# Mở Prisma Studio để xem data
npx prisma studio
```
Truy cập: http://localhost:5555

---

## 🚀 Commands Tổng hợp (Cheat Sheet)

### Setup ban đầu
```bash
# 1. Cài dependencies
npm install

# 2. Setup database URL trong .env
DATABASE_URL="your-connection-string"

# 3. Generate client
npx prisma generate

# 4. Run migrations
npx prisma migrate dev

# 5. Seed data
npx prisma db seed
```

### Development workflow
```bash
# Sau khi sửa schema:
npx prisma generate
npx prisma migrate dev --name ten-thay-doi
npx prisma db seed

# Xem data trong browser
npx prisma studio

# Check migration status
npx prisma migrate status
```

### Reset hoàn toàn (Development only!)
```bash
# ⚠️ XÓA HẾT data và chạy lại migrations + seed
npx prisma migrate reset --force

# Sau đó seed lại
npx prisma db seed
```

### Sync schema với database hiện tại
```bash
# Pull schema từ database (overwrite schema.prisma)
npx prisma db pull

# Push schema lên database (không tạo migration)
npx prisma db push
```

---

## 🎯 Workflow Examples

### Scenario 1: Thêm field mới vào model có sẵn

```bash
# 1. Sửa prisma/schema.prisma
# Thêm: thumbnail String? vào model Course

# 2. Generate client
npx prisma generate

# 3. Tạo migration
npx prisma migrate dev --name add-thumbnail-to-course

# 4. Update seed.ts để thêm data cho field mới (optional)
# Edit prisma/seed.ts

# 5. Chạy seed
npx prisma db seed
```

### Scenario 2: Tạo model mới hoàn toàn

```bash
# 1. Thêm model mới vào prisma/schema.prisma
model BlogPost {
  id        String   @id @default(uuid())
  title     String
  content   String
  createdAt DateTime @default(now())
}

# 2. Generate client
npx prisma generate

# 3. Tạo migration
npx prisma migrate dev --name create-blog-post-model

# 4. Thêm seed data trong prisma/seed.ts
await prisma.blogPost.createMany({
  data: [
    { title: "Post 1", content: "..." },
    { title: "Post 2", content: "..." },
  ]
})

# 5. Chạy seed
npx prisma db seed

# 6. Tạo service (optional)
# app/services/blog.service.ts
export async function getBlogPosts() {
  return await prisma.blogPost.findMany()
}
```

### Scenario 3: Sửa data trong seed.ts

```bash
# 1. Chỉ cần edit prisma/seed.ts
# Thay đổi data trong các create/createMany

# 2. Chạy lại seed (data sẽ duplicate nếu không clear)
npx prisma db seed

# Hoặc reset toàn bộ (⚠️ xóa hết data)
npx prisma migrate reset --force
```

### Scenario 4: Sửa lỗi trong migration

```bash
# Nếu migration bị lỗi và chưa commit:

# 1. Xóa migration file vừa tạo
# Delete folder trong prisma/migrations/

# 2. Sửa schema
# Edit prisma/schema.prisma

# 3. Tạo migration mới
npx prisma migrate dev --name ten-migration-sua-lai

# Nếu đã commit lên production:
# Tạo migration mới để fix
npx prisma migrate dev --name fix-previous-migration
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot read properties of undefined"
```bash
# Client chưa được generate
npx prisma generate
```

### Lỗi: "The table does not exist"
```bash
# Database chưa có bảng, chạy migration
npx prisma migrate dev
# Hoặc
npx prisma db push
```

### Lỗi: "Database is not in sync"
```bash
# Option 1: Push schema (không tạo migration)
npx prisma db push

# Option 2: Reset và migrate lại (⚠️ mất data)
npx prisma migrate reset --force
npx prisma migrate dev
```

### Lỗi: Import từ '@prisma/client' không work
```bash
# Đảm bảo đã generate và install
npm install @prisma/client
npx prisma generate

# Restart TypeScript server trong VSCode
# Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### Seed bị duplicate data
```bash
# Thêm logic check trước khi create trong seed.ts
const existing = await prisma.course.findUnique({
  where: { slug: 'hsk-1' }
})
if (!existing) {
  await prisma.course.create({ ... })
}

# Hoặc dùng upsert
await prisma.course.upsert({
  where: { slug: 'hsk-1' },
  update: { ... },
  create: { ... }
})

# Hoặc clear trước khi seed (trong seed.ts)
await prisma.course.deleteMany()
await prisma.course.createMany({ ... })
```

---

## ⚙️ Best Practices

### 1. **Luôn backup trước khi migrate production**
```bash
# Export data trước
pg_dump $DATABASE_URL > backup.sql

# Hoặc dùng Supabase backup feature
```

### 2. **Test migration trong development trước**
```bash
# Tạo branch mới
git checkout -b feature/new-schema

# Test migration
npx prisma migrate dev --name test-changes

# Nếu ok, merge vào main
```

### 3. **Dùng descriptive migration names**
```bash
# ✅ Good
npx prisma migrate dev --name add-user-avatar-field
npx prisma migrate dev --name create-comment-model
npx prisma migrate dev --name add-post-category-relation

# ❌ Bad
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
```

### 4. **Version control migration files**
```bash
# Commit cả folder migrations
git add prisma/migrations
git commit -m "feat: add user avatar field"
```

### 5. **Sử dụng isActive flag thay vì xóa**
```prisma
model Course {
  // ... fields
  isPublished Boolean @default(true)  // Soft delete
  isActive    Boolean @default(true)
}
```

### 6. **Seed data nên có order/priority**
```typescript
// Seed theo thứ tự dependency
await prisma.category.createMany({ ... })  // 1. Categories first
await prisma.course.createMany({ ... })    // 2. Courses depend on categories
await prisma.lesson.createMany({ ... })    // 3. Lessons depend on courses
```

---

---

## 📊 Models đã thêm mới (Current)

### HeroSlide
Quản lý slides trong hero slideshow:
- image, badge, title, description
- Primary & Secondary CTA buttons
- Overlay gradient, order, isActive

### HSKLevel  
Quản lý thông tin các cấp độ HSK:
- level (1-6), title, badge, description
- vocabularyCount, targetAudience
- Styling: badgeColor, accentColor, bgGradient
- href, order, isActive

### Feature
Quản lý features trong "Why Choose Us" section:
- icon, iconBg, iconColor
- title, description
- order, isActive

### CtaStat
Quản lý stats trong CTA section:
- value (e.g., "10,000+", "5 năm")
- label (e.g., "Học viên", "Kinh nghiệm")
- order, isActive

### Course (Expanded)
Thêm các trường mới:
- image, instructor, instructorAvatar
- price, originalPrice, students, rating
- tag (e.g., "Bán chạy", "Mới nhất")

## 🔧 Services đã tạo

### Hero Service (`app/services/hero.service.ts`)
```typescript
getHeroSlides(): Promise<HeroSlide[]>
```

### HSK Service (`app/services/hsk.service.ts`)
```typescript
getHSKLevels(): Promise<HSKLevel[]>
getHSKLevelByLevel(level: number): Promise<HSKLevel | null>
```

### Course Service (`app/services/course.service.ts`)
```typescript
getCourses(): Promise<Course[]>
getCoursesByLevel(level: string): Promise<Course[]>
getCourseBySlug(slug: string): Promise<CourseWithCategory | null>
getCoursesWithCategory(): Promise<CourseWithCategory[]>
```

### Feature Service (`app/services/feature.service.ts`)
```typescript
getFeatures(): Promise<Feature[]>
```

### CTA Service (`app/services/cta.service.ts`)
```typescript
getCtaStats(): Promise<CtaStat[]>
```

## 💡 Cách sử dụng trong Components

### Ví dụ: Update HeroSlideShow component

```typescript
// app/components/home/HeroSlideShow.tsx
import { getHeroSlides } from '@/app/services'

export default async function HeroSlideShow() {
  const slides = await getHeroSlides()
  
  return (
    // ... render với data từ database
  )
}
```

### Ví dụ: Update HSKLevelsSection component

```typescript
// app/components/home/HSKLevelsSection.tsx
import { getHSKLevels } from '@/app/services'

export default async function HSKLevelsSection() {
  const hskLevels = await getHSKLevels()
  
  return (
    // ... render với data từ database
  )
}
```

### Ví dụ: Update CoursesSection component

```typescript
// app/components/home/CoursesSection.tsx
import { getCourses } from '@/app/services'

export default async function CoursesSection() {
  const courses = await getCourses()
  
  return (
    // ... render với data từ database
  )
}
```

## 🎯 Lợi ích

1. **Dynamic Data**: Quản lý tất cả content qua Supabase
2. **Flexible**: Dễ dàng thêm/sửa/xóa content mà không cần deploy code
3. **Scalable**: Services layer tách biệt logic, dễ maintain
4. **Type-safe**: TypeScript interfaces đầy đủ

## ⚠️ Lưu ý

- Sau khi migrate, tất cả data cũ vẫn được giữ nguyên
- Seed data chỉ là mẫu, bạn có thể edit qua Supabase dashboard
- Services tự động handle error, return empty array nếu có lỗi
- Tất cả queries có filter `isActive: true` để dễ quản lý

  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 📚 Tài liệu tham khảo

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Seeding Guide](https://www.prisma.io/docs/guides/database/seed-database)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Supabase + Prisma Guide](https://supabase.com/docs/guides/integrations/prisma)

---

## 🎓 Quick Tips

1. **Development**: Dùng `migrate dev` - tự động tạo migration và apply
2. **Production**: Dùng `migrate deploy` - chỉ apply migrations có sẵn
3. **Prototype**: Dùng `db push` - nhanh nhưng không tạo history
4. **Inspect**: Dùng `prisma studio` - GUI để xem/edit data
5. **Sync**: Dùng `db pull` - lấy schema từ database về

---

## 📝 Checklist khi thay đổi Schema

- [ ] Backup database (production)
- [ ] Sửa `schema.prisma`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate dev --name descriptive-name`
- [ ] Update `seed.ts` nếu cần
- [ ] Run `npx prisma db seed`
- [ ] Test local với `npx prisma studio`
- [ ] Update services/types nếu cần
- [ ] Update components sử dụng data mới
- [ ] Test thoroughly
- [ ] Commit migrations folder
- [ ] Deploy to production
- [ ] Run `npx prisma migrate deploy` on production

---

*Last updated: {{ current_date }}*
*Database: Supabase PostgreSQL*
*ORM: Prisma 7.2.0*
