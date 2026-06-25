import React from "react";
import { cn } from "@/lib/utils";

type TableHTMLProps = React.TableHTMLAttributes<HTMLTableElement>;
type ThHTMLProps = React.ThHTMLAttributes<HTMLTableCellElement>;
type TdHTMLProps = React.TdHTMLAttributes<HTMLTableCellElement>;
type TrHTMLProps = React.HTMLAttributes<HTMLTableRowElement>;
type THeadHTMLProps = React.HTMLAttributes<HTMLTableSectionElement>;
type TBodyHTMLProps = React.HTMLAttributes<HTMLTableSectionElement>;
type TFootHTMLProps = React.HTMLAttributes<HTMLTableSectionElement>;

export function Table({ className, ...props }: TableHTMLProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn("w-full text-sm border-collapse", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: THeadHTMLProps) {
  return (
    <thead className={cn("bg-(--color-paper)", className)} {...props} />
  );
}

export function TableHead({ className, ...props }: ThHTMLProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap",
        className
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: TBodyHTMLProps) {
  return (
    <tbody
      className={cn("divide-y divide-(--color-smoke)", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: TrHTMLProps) {
  return (
    <tr
      className={cn(
        "hover:bg-(--color-paper) transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLProps) {
  return (
    <td className={cn("px-4 py-3 text-(--color-ink)", className)} {...props} />
  );
}

export function TableFooter({ className, ...props }: TFootHTMLProps) {
  return (
    <tfoot
      className={cn(
        "border-t-2 border-(--color-smoke) bg-(--color-paper)",
        className
      )}
      {...props}
    />
  );
}
