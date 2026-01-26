# 📄 SEO Metadata Management Guide

## Overview
Project này sử dụng **database-driven metadata** thay vì hard-code trong code. Điều này cho phép:
- ✅ Quản lý SEO tập trung
- ✅ Thay đổi metadata không cần deploy
- ✅ A/B testing metadata
- ✅ Version control & history tracking

## Database Schema

### PageMetadata Model
Lưu metadata cho các pages tĩnh (`/`, `/about`, `/contact`, etc.)

### Course Model - SEO Fields
Mỗi course có các fields SEO riêng:
- `metaTitle` - Custom SEO title
- `metaDescription` - Meta description
- `keywords` - Keywords
- `ogImage` - Open Graph image
- `viewCount`, `enrollmentCount` - Social proof

## Usage

### 1. Static Pages (Home, About, Contact, etc.)

```typescript
import { getPageMetadata } from "../services/metadata.service";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPageMetadata("/about");
  return metadata || {
    // Fallback metadata
    title: "Giới thiệu",
    description: "..."
  };
}
```

### 2. Dynamic Pages (Course Detail)

```typescript
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      metaTitle: true,
      metaDescription: true,
      keywords: true,
      ogImage: true,
      // ...
    },
  });

  return {
    title: course.metaTitle || course.title,
    description: course.metaDescription || course.description,
    // ...
  };
}
```

## Migration & Seed

### Run Migration
```bash
npx prisma migrate dev --name add_seo_fields
```

### Run Seed
```bash
npx prisma db seed
```

## Managing Metadata

### Option 1: Direct Database Update
```sql
UPDATE "PageMetadata"
SET title = 'New Title', description = 'New Description'
WHERE "pagePath" = '/about';
```

### Option 2: Prisma Studio (Recommended)
```bash
npx prisma studio
```
Navigate to PageMetadata table and edit visually.

### Option 3: Build Admin Panel
Tạo admin panel để quản lý metadata (future enhancement).

## SEO Features Implemented

### ✅ Phase 1: Database Enhancement
- [x] SEO fields in Course model
- [x] PageMetadata model
- [x] Seed data with rich SEO content
- [x] Social proof (viewCount, enrollmentCount)

### ✅ Phase 2: Metadata & Tags
- [x] Dynamic metadata service
- [x] Open Graph tags
- [x] Twitter Card
- [x] Root layout metadata
- [x] Per-page metadata from DB

### 🔄 Phase 2: Remaining
- [ ] Sitemap.xml generator
- [ ] Robots.txt

### 🔄 Phase 3: Structured Data
- [ ] Course schema (schema.org)
- [ ] Review/Rating schema
- [ ] Organization schema
- [ ] FAQ schema
- [ ] Breadcrumb schema

## Best Practices

### Metadata Guidelines
- **Title**: 50-60 characters (hiển thị đầy đủ trên Google)
- **Description**: 150-160 characters
- **Keywords**: 5-10 keywords, comma-separated
- **OG Image**: 1200x630px (tỷ lệ 1.91:1)

### SEO Content Writing
- Include target keywords naturally
- Write for users, not search engines
- Add numbers & social proof
- Use action words (Học, Đăng ký, Khám phá)

## Environment Variables

```env
NEXT_PUBLIC_SITE_URL="https://hskmaster.edu.vn"
```

## Future Enhancements

1. **Admin Panel** - Quản lý metadata qua UI
2. **A/B Testing** - Test different titles/descriptions
3. **Analytics Integration** - Track CTR from SERP
4. **Auto-suggestions** - AI-powered meta descriptions
5. **Preview Tool** - Preview how page looks in Google

## Resources

- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
- [Schema.org](https://schema.org/)
