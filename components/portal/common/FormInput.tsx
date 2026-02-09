"use client";

import { Input, type InputProps } from "@heroui/react";
import { forwardRef } from "react";

/**
 * Standardized Input wrapper for Portal forms
 * 
 * Features:
 * - labelPlacement="outside" by default
 * - validationBehavior="native" for inline validation messages
 * - Integrates with react-hook-form + zod
 * 
 * Usage:
 * <FormInput
 *   label="Email"
 *   isRequired
 *   isInvalid={!!errors.email}
 *   errorMessage={errors.email?.message}
 *   {...register("email")}
 * />
 */
export const FormInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <Input
      ref={ref}
      labelPlacement="outside"
      validationBehavior="native"
      {...props}
    />
  );
});

FormInput.displayName = "FormInput";
