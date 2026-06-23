import { cn } from "@/lib/utils";

type ProgressVariant = "default" | "success" | "warning" | "danger";

interface ProgressProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
  className?: string;
}

const indicatorClasses: Record<ProgressVariant, string> = {
  default: "bg-(--color-vermillion)",
  success: "bg-green-500",
  warning: "bg-amber-400",
  danger: "bg-red-600",
};

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function Progress({
  value,
  max = 100,
  variant = "default",
  size = "md",
  label,
  showValue = false,
  className,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-xs font-medium text-(--color-ink)">{label}</span>
          )}
          {showValue && (
            <span className="text-xs text-muted-foreground">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          "w-full rounded-full bg-(--color-smoke) overflow-hidden",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            indicatorClasses[variant]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
export default Progress;
