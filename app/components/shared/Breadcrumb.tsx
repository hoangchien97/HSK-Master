import Link from "next/link";

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
              <span className="material-symbols-outlined text-[12px] md:text-[14px] lg:text-[16px]">chevron_right</span>
            </>
          ) : (
            <span className="font-medium text-primary">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
