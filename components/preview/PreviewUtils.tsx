"use client";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PreviewSection({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="mb-16 scroll-mt-4">
      <div className="mb-6 pb-4 border-b border-(--color-smoke)">
        <h2 className="text-2xl font-semibold text-(--color-ink)">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

export function PreviewBlock({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="rounded-xl border border-(--color-smoke) overflow-hidden">
      <div className="px-4 py-3 bg-(--color-paper) border-b border-(--color-smoke)">
        <h3 className="text-sm font-semibold text-(--color-ink)">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className={cn("p-6 bg-white", className)}>{children}</div>
    </div>
  );
}

interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export function PropsTable({ props }: { props: PropRow[] }) {
  return (
    <div className="rounded-xl border border-(--color-smoke) overflow-hidden">
      <div className="px-4 py-3 bg-(--color-paper) border-b border-(--color-smoke)">
        <h3 className="text-sm font-semibold text-(--color-ink)">Props</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-(--color-paper) border-b border-(--color-smoke)">
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                Prop
              </th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                Default
              </th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {props.map((p) => (
              <tr
                key={p.name}
                className="border-b border-(--color-smoke) last:border-0"
              >
                <td className="px-4 py-2 font-mono text-xs text-(--color-vermillion)">
                  {p.name}
                </td>
                <td className="px-4 py-2 font-mono text-xs text-blue-600">
                  {p.type}
                </td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                  {p.default ?? "—"}
                </td>
                <td className="px-4 py-2 text-xs text-(--color-ink)">
                  {p.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
