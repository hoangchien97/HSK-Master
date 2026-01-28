# 🎨 Favicon & Icons Generation Guide

## Required Files

Bạn cần tạo các file icons sau và đặt vào folder `/public`:

### 1. Favicon Files
```
public/
├── favicon.ico (32x32 or 16x16, multi-size .ico file)
├── icon-16x16.png
├── icon-32x32.png
├── icon-192x192.png (for PWA)
├── icon-512x512.png (for PWA)
├── apple-touch-icon.png (180x180)
├── safari-pinned-tab.svg (monochrome SVG)
└── mstile-150x150.png (for Windows)
```

### 2. OG Image
```
public/
└── og-image.jpg (1200x630px - for social sharing)
```

## Quick Generation Methods

### Option 1: Using Online Tool (Easiest)
1. Go to: https://realfavicongenerator.net/
2. Upload your logo (minimum 260x260px, square recommended)
3. Download the generated package
4. Extract all files to `/public` folder

### Option 2: Using Figma/Design Tool
1. Create a 512x512px canvas
2. Design your icon with brand colors (#ec131e red/yellow)
3. Export as:
   - PNG: 16x16, 32x32, 192x192, 512x512, 180x180
   - SVG: safari-pinned-tab.svg (monochrome)
   - ICO: favicon.ico (multi-size)

### Option 3: Using ImageMagick (CLI)
```bash
# Install ImageMagick first
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Convert your logo.png to multiple sizes
convert logo.png -resize 16x16 icon-16x16.png
convert logo.png -resize 32x32 icon-32x32.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 512x512 icon-512x512.png
convert logo.png -resize 180x180 apple-touch-icon.png
convert logo.png -resize 150x150 mstile-150x150.png

# Create .ico file
convert logo.png -define icon:auto-resize=16,32,48 favicon.ico
```

### Option 4: Using Online Favicon Generator
- https://favicon.io/
- Upload image → Generate → Download

## Design Guidelines

### Icon Design
- **Shape**: Square or circular
- **Colors**: Use brand colors (#ec131e red, yellow accents)
- **Symbol**: Languages icon or "HSK" text
- **Style**: Simple, recognizable at small sizes
- **Background**: Transparent or solid color

### OG Image (Social Sharing)
- **Size**: 1200x630px
- **Format**: JPG or PNG
- **Content**:
  - Brand name "HSK Master"
  - Tagline "Trung tâm tiếng Trung uy tín"
  - Background: Gradient or photo
  - Logo placement
- **Text**: Large, readable, high contrast
- **Safe area**: Keep important content in center 1000x500px

## Example Icon Concept

```
┌─────────────┐
│   ┌─────┐   │
│   │ 中文 │   │  ← Chinese characters
│   └─────┘   │
│   HSK       │  ← Text
│   Master    │
└─────────────┘
Red/Yellow gradient background
```

## Temporary Solution (For Testing)

If you don't have icons yet, you can use a simple colored square:

```bash
# Create solid color icons (temporary)
convert -size 512x512 xc:#ec131e icon-512x512.png
convert -size 192x192 xc:#ec131e icon-192x192.png
convert -size 180x180 xc:#ec131e apple-touch-icon.png
convert -size 32x32 xc:#ec131e icon-32x32.png
convert -size 16x16 xc:#ec131e icon-16x16.png
```

## Verification

After adding icons, verify:

1. **Favicon appears in browser tab**
   - Open your site in browser
   - Check browser tab icon

2. **PWA icons work**
   - Open DevTools → Application → Manifest
   - Check icon paths are correct

3. **Social sharing preview**
   - Use tools:
     - Facebook: https://developers.facebook.com/tools/debug/
     - Twitter: https://cards-dev.twitter.com/validator
     - LinkedIn: https://www.linkedin.com/post-inspector/

4. **Mobile icons**
   - Add to home screen (iOS/Android)
   - Check icon appearance

## Checklist

- [ ] favicon.ico created
- [ ] icon-16x16.png created
- [ ] icon-32x32.png created
- [ ] icon-192x192.png created
- [ ] icon-512x512.png created
- [ ] apple-touch-icon.png created
- [ ] safari-pinned-tab.svg created (optional)
- [ ] mstile-150x150.png created (optional)
- [ ] og-image.jpg created (1200x630)
- [ ] All files placed in /public folder
- [ ] Tested in browser
- [ ] Tested social sharing preview

## Resources

- Favicon Generator: https://realfavicongenerator.net/
- OG Image Generator: https://www.opengraph.xyz/
- Icon Design: https://www.figma.com/
- ImageMagick: https://imagemagick.org/

---

**Note**: Icons are referenced in `app/layout.tsx` metadata config. After creating icons, no code changes needed - just add files to `/public` folder!
