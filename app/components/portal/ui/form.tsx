import * as React from "react"
import { Label } from "./label"
import { cn } from "@/lib/utils"

interface FormFieldContextValue {
  name: string
  error?: string
}

const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(undefined)

export function FormField({
  children,
  name,
  error,
}: {
  children: React.ReactNode
  name: string
  error?: string
}) {
  return (
    <FormFieldContext.Provider value={{ name, error }}>
      <div className="space-y-2">
        {children}
      </div>
    </FormFieldContext.Provider>
  )
}

export function FormLabel({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  const context = React.useContext(FormFieldContext)
  if (!context) {
    throw new Error("FormLabel must be used within FormField")
  }
  
  return (
    <Label htmlFor={context.name} className={className}>
      {children}
    </Label>
  )
}

export function FormControl({ 
  children 
}: { 
  children: React.ReactElement 
}) {
  const context = React.useContext(FormFieldContext)
  if (!context) {
    throw new Error("FormControl must be used within FormField")
  }
  
  const childProps: Record<string, unknown> = {
    name: context.name,
    "aria-invalid": context.error ? "true" : "false",
  }
  
  if (context.error) {
    childProps["aria-describedby"] = `${context.name}-error`
  }
  
  return React.cloneElement(children, childProps)
}

export function FormMessage({ className }: { className?: string }) {
  const context = React.useContext(FormFieldContext)
  if (!context) {
    throw new Error("FormMessage must be used within FormField")
  }
  
  if (!context.error) return null
  
  return (
    <p
      id={`${context.name}-error`}
      className={cn("text-sm font-medium text-destructive", className)}
    >
      {context.error}
    </p>
  )
}

export function FormDescription({ 
  children,
  className 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  )
}
