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
    <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index < items.length - 1 ? (
            <>
              <Link
                href={item.href}
                className="hover:text-primary-600 transition-colors font-medium"
              >
                {item.label}
              </Link>
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <span className="font-semibold text-primary-600">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
