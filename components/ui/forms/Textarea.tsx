import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";
import { Label } from "./Label";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      wrapperClassName,
      showCount,
      maxLength,
      className,
      id,
      required,
      value,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          required={required}
          maxLength={maxLength}
          value={value}
          className={cn(
            "w-full rounded-sm border bg-white px-3 py-2 text-sm resize-y transition-colors outline-none",
            "border-(--color-smoke) focus:border-(--color-vermillion) focus:ring-1 focus:ring-(--color-vermillion)",
            "placeholder:text-muted-foreground text-(--color-ink)",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        <div className="flex justify-between mt-1">
          <div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            {!error && hint && (
              <p className="text-xs text-muted-foreground">{hint}</p>
            )}
          </div>
          {showCount && maxLength && (
            <p className="text-xs text-muted-foreground">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
export default Textarea;
