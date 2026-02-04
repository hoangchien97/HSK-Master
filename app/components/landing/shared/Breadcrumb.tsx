import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs lg:text-sm text-text-secondary-light dark:text-text-secondary-dark">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-1 md:gap-2">
          {index < items.length - 1 ? (
            <>
              <Link href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
              <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
            </>
          ) : (
            <span className="font-medium text-primary">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
