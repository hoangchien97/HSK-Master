import { cn } from "@/lib/utils";

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Divider({
  orientation = "horizontal",
  className,
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        className={cn("w-px bg-(--color-smoke) self-stretch", className)}
        aria-hidden="true"
      />
    );
  }
  return (
    <hr
      className={cn("border-0 border-t border-(--color-smoke)", className)}
    />
  );
}
export default Divider;
