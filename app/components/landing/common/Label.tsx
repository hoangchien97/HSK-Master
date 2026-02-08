"use client";

import { LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/lib/utils";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "flex items-center gap-1 text-sm font-bold text-gray-700 dark:text-gray-300",
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-error-500">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";

export default Label;
export { Label };
