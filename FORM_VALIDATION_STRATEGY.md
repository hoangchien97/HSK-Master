# Form Validation Strategy

## Overview

Dự án sử dụng 2 phương pháp validation khác nhau cho Landing và Portal:

### 🌐 Landing Pages
**Approach:** Native HTML5 Validation + Custom Components

**Why:**
- Đơn giản, lightweight
- Phù hợp với static forms (contact, newsletter)
- Không cần complex validation logic
- Fast page load

**Components:**
```tsx
// Custom Input component với native validation
<Input
  label="Email"
  type="email"
  required
  error={errors.email}
/>
```

**Location:** `app/components/landing/common/`

---

### 🔐 Portal (Admin/Teacher/Student)
**Approach:** React Hook Form + Zod Schema Validation

**Why:**
- Complex forms với nhiều fields
- Type-safe validation với TypeScript
- Reusable validation schemas
- Better UX với instant validation
- Integrated error handling

**Stack:**
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@heroui/react` - UI components

**Example:**
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormInput } from "@/app/components/portal/common";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormInput
        label="Email"
        type="email"
        isRequired
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message}
        {...register("email")}
      />
    </form>
  );
}
```

**Key Components:**
- `FormInput` - Standardized Input wrapper
  - Auto `labelPlacement="outside"`
  - Auto `validationBehavior="native"`
  - Integrates with react-hook-form

**Validators Location:** `app/validators/`
```
validators/
  ├── auth.ts          # Login, Register schemas
  ├── class.ts         # Class management
  ├── schedule.ts      # Schedule/Calendar
  ├── assignment.ts    # Assignment/Homework
  └── attendance.ts    # Attendance tracking
```

---

## Form Styling Standards

### Container
```tsx
<form className="flex flex-col gap-4">
  {/* All form inputs */}
</form>
```

### Input Fields
```tsx
<FormInput
  label="Field Label"
  labelPlacement="outside"        // Label above input
  validationBehavior="native"     // Show inline validation
  isRequired                       // Shows required indicator
  isInvalid={!!errors.field}      // Error state
  errorMessage={errors.field?.message} // Error message
  {...register("field")}           // react-hook-form integration
/>
```

### Password Fields
```tsx
<FormInput
  label="Mật khẩu"
  type={showPassword ? "text" : "password"}
  isRequired
  endContent={<PasswordToggleButton />}  // Eye icon
  {...register("password")}
/>
```

---

## Migration Guide

### Don't mix validation approaches:
❌ **Wrong:**
```tsx
// Portal form using native validation
<Input type="email" required />
```

✅ **Correct:**
```tsx
// Portal form with zod + react-hook-form
const schema = z.object({ email: z.string().email() });
<FormInput {...register("email")} isInvalid={!!errors.email} />
```

### When to use which:

| Scenario | Use |
|----------|-----|
| Contact form (landing) | Native validation |
| Newsletter signup | Native validation |
| Login/Register | react-hook-form + zod |
| Admin CRUD forms | react-hook-form + zod |
| Multi-step forms | react-hook-form + zod |
| Forms with dependencies | react-hook-form + zod |

---

## Benefits

### Landing (Native)
✅ Zero JavaScript for validation  
✅ Better SEO  
✅ Instant page load  
✅ Simple maintenance  

### Portal (react-hook-form + zod)
✅ Type-safe validation  
✅ Reusable schemas  
✅ Complex validation logic  
✅ Better error handling  
✅ Form state management  
✅ Integration with backend validation  

---

## Best Practices

1. **Always use `labelPlacement="outside"`** for portal forms
2. **Add `validationBehavior="native"`** to show inline messages
3. **Use `flex flex-col gap-4`** for form containers
4. **Keep validation schemas** in `/validators` folder
5. **Export FormInput** from common components
6. **Don't duplicate validation** logic - reuse schemas
7. **Show loading states** during submission
8. **Clear forms** after successful submission

---

## Examples

See working examples:
- Landing: `app/components/landing/contact/ContactForm.tsx`
- Portal Auth: `app/components/portal/auth/LoginForm.tsx`
- Portal CRUD: `app/components/portal/classes/ClassFormModal.tsx`
