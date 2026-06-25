"use client";

interface NavItem {
  id: string;
  label: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    id: "system-design",
    label: "System Design",
    icon: "🎨",
    items: [
      { id: "colors", label: "Colors" },
      { id: "typography", label: "Typography" },
      { id: "hsk-levels", label: "HSK Levels" },
    ],
  },
  {
    id: "primitives",
    label: "Primitives",
    icon: "📦",
    items: [
      { id: "button", label: "Button" },
      { id: "badge", label: "Badge" },
      { id: "avatar", label: "Avatar" },
      { id: "card", label: "Card" },
      { id: "display", label: "Divider / Progress / Skeleton" },
    ],
  },
  {
    id: "forms",
    label: "Forms",
    icon: "📝",
    items: [
      { id: "input", label: "Input / Textarea" },
      { id: "select", label: "Select" },
      { id: "toggle", label: "Checkbox / Radio / Switch" },
    ],
  },
  {
    id: "overlays",
    label: "Overlays",
    icon: "🔲",
    items: [
      { id: "modal", label: "Modal / Drawer" },
      { id: "popover", label: "Dropdown / Tooltip / Popover" },
    ],
  },
  {
    id: "navigation",
    label: "Navigation",
    icon: "🧭",
    items: [
      { id: "tabs", label: "Tabs" },
      { id: "accordion", label: "Accordion" },
      { id: "nav", label: "Breadcrumb / Pagination" },
    ],
  },
  {
    id: "data",
    label: "Data",
    icon: "📊",
    items: [{ id: "table", label: "Table" }],
  },
];

interface PreviewSidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
}

export default function PreviewSidebar({
  activeId,
  onSelect,
}: PreviewSidebarProps) {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-(--color-smoke) overflow-y-auto">
      <nav className="p-4">
        {NAV.map((group) => (
          <div key={group.id} className="mb-5">
            <div className="flex items-center gap-1.5 mb-2 px-2">
              <span className="text-base">{group.icon}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </span>
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(item.id)}
                      className={[
                        "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-(--color-vermillion) text-white font-medium"
                          : "text-(--color-ink) hover:bg-(--color-paper)",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
