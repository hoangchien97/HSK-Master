"use client";
import React from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, FieldPath, ControllerRenderProps, ControllerFieldState } from "react-hook-form";

interface FormFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> {
  name: TName;
  control: Control<TFieldValues>;
  render: (props: { field: ControllerRenderProps<TFieldValues, TName>; fieldState: ControllerFieldState }) => React.ReactNode;
}

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  name,
  control,
  render,
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => <>{render({ field, fieldState })}</>}
    />
  );
}
export default FormField;
