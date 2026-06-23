"use client";

import { Input } from "@/components/ui/forms/Input";
import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  // HeroUI-compatible props — bridged to new Input API
  isRequired?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  startContent?: ReactNode;
  endContent?: ReactNode;
  // New Input API
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  wrapperClassName?: string;
  // HeroUI layout props — silently dropped (no-ops in new system)
  labelPlacement?: string;
  validationBehavior?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>((
  {
    isRequired,
    isInvalid,
    errorMessage,
    isReadOnly,
    isDisabled,
    startContent,
    endContent,
    error,
    labelPlacement: _lp,
    validationBehavior: _vb,
    leftIcon,
    rightIcon,
    ...props
  },
  ref
) => {
  // Bridge isInvalid + errorMessage → error string
  //   triggers the error border style without visible text when isInvalid but no message
  const derivedError = error ?? (isInvalid ? (errorMessage ?? " ") : undefined);

  return (
    <Input
      ref={ref}
      required={isRequired ?? props.required}
      readOnly={isReadOnly ?? props.readOnly}
      disabled={isDisabled ?? props.disabled}
      error={derivedError}
      leftIcon={leftIcon ?? startContent}
      rightIcon={rightIcon ?? endContent}
      {...props}
    />
  );
});

FormInput.displayName = "FormInput";
