import { cn } from "@/lib/utils";
import type { HTMLAttributes, ElementType } from "react";

type CardVariant = "default" | "paper" | "ghost";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  as?: ElementType;
}

const variantClasses: Record<CardVariant, string> = {
  default:
    "bg-(--color-surface) border border-(--color-smoke) shadow-[0_1px_3px_rgba(28,14,15,0.08)]",
  paper: "bg-(--color-paper) border border-(--color-smoke)",
  ghost: "bg-transparent",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export function Card({
  variant = "default",
  padding = "md",
  as: As = "div",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <As
      className={cn(
        "rounded-xl",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </As>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("pb-4 border-b border-(--color-smoke)", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("py-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("pt-4 border-t border-(--color-smoke)", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
