import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block text-sm font-medium text-(--color-ink) mb-1",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-(--color-vermillion)" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
);
Label.displayName = "Label";
export default Label;
