# Hướng dẫn cấu hình Supabase Storage cho Avatar Upload

## Bước 1: Tạo Storage Bucket trên Supabase

1. Vào Supabase Dashboard → Storage
2. Tạo bucket mới tên `avatars`
3. Chọn **Public bucket** để ảnh có thể truy cập công khai
4. Lưu bucket

## Bước 2: Cấu hình biến môi trường

Thêm vào file `.env.local`:

```env
# Supabase Storage Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

### Lấy thông tin:
- **PROJECT_REF**: Trong URL Supabase Dashboard
- **ANON_KEY**: Dashboard → Settings → API → Project API keys → `anon` `public`
- **SERVICE_ROLE_KEY**: Dashboard → Settings → API → Project API keys → `service_role` (giữ bí mật!)

## Bước 3: Cấu hình Storage Policy (Optional)

Nếu muốn kiểm soát quyền truy cập:

```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow public read access
CREATE POLICY "Allow public to read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Allow users to update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow users to delete their own avatars
CREATE POLICY "Allow users to delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
```

## Bước 4: Test Upload

1. Chạy `npm run dev`
2. Đăng nhập vào `/portal/login`
3. Vào `/portal/profile`
4. Upload ảnh đại diện
5. Kiểm tra trong Supabase Storage → avatars

## Cấu trúc lưu trữ

Ảnh sẽ được lưu theo format:
```
avatars/
  ├── {userId}/
  │   ├── {timestamp}.jpg
  │   ├── {timestamp}.png
  │   └── ...
```

## Flow hoạt động

1. **Client**: Chọn ảnh → Preview trên UI (chưa upload)
2. **Submit Form**: Upload ảnh lên Supabase Storage
3. **API Response**: Trả về URL công khai
4. **Database**: Lưu URL vào `PortalUser.image`
5. **Display**: Hiển thị ảnh từ Supabase CDN

## Lưu ý

- Bucket `avatars` phải là **Public** để hiển thị ảnh
- Service Role Key có quyền bypass RLS, giữ bí mật
- Ảnh cũ sẽ bị ghi đè nếu upload lại (x-upsert: true)
- Có thể xóa ảnh cũ trước khi upload mới để tiết kiệm storage
