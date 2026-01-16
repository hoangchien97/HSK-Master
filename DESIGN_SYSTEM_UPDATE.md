# Design System Update - HSK Master

## Cập nhật ngày: 16/01/2026

### 📦 Packages Installed
- ✅ `lucide-react` - Icon library for React components

### 🎨 Updated Color System (`app/globals.css`)

Updated color variables based on ver2 design system:

#### Primary Colors (Imperial Red)
- `--color-primary-50` through `--color-primary-950`
- Main brand color: `#ec131e` (primary-500)

#### Semantic Colors Added
- **Success** (Green): `success-50` to `success-950`
- **Warning** (Amber): `warning-50` to `warning-950`
- **Error** (Red): `error-50` to `error-950`
- **Info** (Blue): `info-50` to `info-950`

#### Sidebar Colors
- `--color-sidebar-bg`: `#fafafa`
- `--color-sidebar-text`: `#374151`

### 📄 System Design Page (`app/system-design/page.tsx`)

Completely rebuilt with a sidebar navigation system:

#### Features Implemented:

1. **Sidebar Navigation**
   - Sticky sidebar on desktop (hidden on mobile)
   - Logo with HSK Master branding
   - Two sections:
     - **Nền tảng (Foundation)**: Colors, Typography, Icons
     - **Components**: Buttons, Input & Form, Select & Menu, Popover, Cards, Header & Footer
   - Active state highlighting
   - System status indicator at bottom

2. **Foundation Sections (COMPLETED)**

   **✅ Colors (Màu sắc)**
   - Complete primary color scale (50-950)
   - Semantic color palettes (Success, Warning, Error, Info)
   - Visual color swatches with hex codes
   
   **✅ Typography**
   - Font family documentation
   - Type scale showcase (Display, H1, H2, H3, Body, Caption)
   - Chinese character support demo
   
   **✅ Icons**
   - Lucide React integration guide
   - Visual icon grid with 14+ icons
   - Hover interactions

3. **Components Sections**

   **✅ Buttons (COMPLETED)**
   - Full variant matrix showcasing all button types
   - State demonstrations (default, hover, focus, active, disabled, loading)
   - Content composition examples
   - Usage code examples with syntax highlighting
   
   **✅ Inputs (COMPLETED)**
   - Input states: Default, Focus, Error, Disabled
   - Textarea component
   - Input with icon (search)
   - Input with tags (tag management)
   - Error states with validation messages
   
   **✅ Checkbox, Radio & Switches (COMPLETED)**
   - Checkbox states: Checked, Unchecked, Disabled
   - Multiple selection examples
   - Radio button groups with descriptions
   - Toggle switches: ON, OFF, Disabled states
   - Card-style selection components
   
   **✅ Select & Dropdown (COMPLETED)**
   - Dropdown open/closed states
   - Selected state styling
   - Menu items with badges
   - Error and disabled states
   - Hover interactions
   
   **✅ Pagination (COMPLETED)**
   - Basic numbered pagination
   - Pagination with ellipsis (many pages)
   - Simple prev/next pagination
   - Pagination with results info
   - Various button styles and states
   
   **🚧 Other Components (TODO)**
   - Popover
   - Cards
   - Header & Footer

#### Top Navigation Bar
- Breadcrumb showing current section
- Search button (placeholder)
- Export Figma button (placeholder)

#### Hero Section
- Large heading with gradient text effect
- Descriptive subtitle

### 🔘 Button Component (`app/components/shared/Button.tsx`)

Completely redesigned with comprehensive feature set:

#### ✅ Variants (6 types)
1. **primary** - Main action button with solid background
2. **secondary** - Secondary actions with border
3. **outline** - Outlined button with transparent background
4. **ghost** - Minimal button without border
5. **gradient** - Premium gradient from yellow to red
6. **icon-only** - Icon-only button (circular, requires aria-label)

#### ✅ States
- **Default** - Standard appearance
- **Hover** - Enhanced visual feedback (scale, colors, shadows)
- **Focus** - Clear focus ring for keyboard navigation (focus-visible:ring-4)
- **Active/Pressed** - Slight scale down (scale-[0.98])
- **Disabled** - Reduced opacity, pointer-events disabled
- **Loading** - Animated spinner replaces icon

#### ✅ Sizes
- **sm** - Small (px-3 py-1.5, text-sm)
- **md** - Medium/Default (px-6 py-2.5, text-base)
- **lg** - Large (px-8 py-3.5, text-lg)

#### ✅ Content Composition
1. **Text-only** - Simple text button
2. **Icon + Text (Left)** - Icon positioned before text
3. **Icon + Text (Right)** - Icon positioned after text
4. **Icon-only** - Just icon (with mandatory aria-label)
5. **Loading state** - Spinner replaces icon during loading
6. **With Badge/Counter** - Optional badge display (e.g., notification count)
7. **Full Width** - Spans full container width

#### Props Interface
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
  badge?: string | number;
  'aria-label'?: string;  // Required for icon-only variant
  disabled?: boolean;
  // ...extends ButtonHTMLAttributes
}
```

#### Accessibility Features
- Focus-visible ring for keyboard navigation
- Automatic aria-label validation for icon-only buttons
- Disabled state prevents pointer events
- Loading state automatically disables button

### 🎯 Custom CSS Utilities Added

```css
.section-header-gradient - Section header spacing
.shadow-soft - Subtle shadow effect
.no-scrollbar - Hide scrollbar
```

### 🚀 How to Use

1. Navigate to `/system-design` route
2. Use sidebar to switch between sections:
   - Click on Foundation items to view colors, typography, or icons
   - Click on "Buttons" in Components to see full button documentation
   - Other component sections show TODO placeholders
3. Sections update dynamically using React state

### 📝 Button Usage Examples

```jsx
// Basic button
<Button variant="primary">Click me</Button>

// With icon
<Button variant="primary" icon={<ArrowRight />} iconPosition="right">
  Continue
</Button>

// Loading state
<Button variant="primary" loading>
  Processing...
</Button>

// Icon only with accessibility
<Button 
  variant="icon-only" 
  icon={<Settings />} 
  aria-label="Settings"
/>

// With badge
<Button variant="primary" badge="3">
  Notifications
</Button>

// Gradient premium button
<Button variant="gradient" icon={<ArrowRight />} iconPosition="right">
  Nâng cấp Premium
</Button>

// Full width
<Button variant="primary" fullWidth>
  Đăng ký khóa học ngay
</Button>
```

### 📋 Next Steps

1. Implement remaining Component sections:
   - Popover/Tooltip examples
   - Card component variations
   - Header & Footer documentation

2. Mobile menu implementation for design system page
3. Search functionality
4. Export to Figma feature
5. Add actual React components for forms:
   - Input component
   - Select component
   - Checkbox component
   - Radio component
   - Switch component
   - Pagination component

### 🔧 Technical Details

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v4 with custom theme
- **Icons**: Lucide React
- **State Management**: React useState hook
- **Client Component**: Uses 'use client' directive for interactivity
- **Accessibility**: WCAG 2.1 compliant with focus management

### 🎨 Design Reference

Based on `publishing/design_system/ver1/code.html` and `ver2/code.html` design specifications.
