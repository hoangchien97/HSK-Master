import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-(--color-smoke)",
        variant === "circular" && "rounded-full",
        variant === "text" && "rounded h-4",
        variant === "rectangular" && "rounded-md",
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["w-full", "w-4/5", "w-3/5", "w-2/3", "w-1/2"];
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" className={widths[i % widths.length]} />
      ))}
    </div>
  );
}

export default Skeleton;
