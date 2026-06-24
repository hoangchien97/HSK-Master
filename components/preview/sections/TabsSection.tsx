"use client";
import { Tabs } from "@/components/ui/navigation/Tabs";
import { BookOpen, GraduationCap, User, Settings } from "lucide-react";
import { PreviewSection, PreviewBlock, PropsTable } from "../PreviewUtils";

export default function TabsSection() {
  return (
    <PreviewSection
      id="tabs"
      title="Tabs"
      description="Navigation tabs for switching between content panels."
    >
      <PreviewBlock title="Underline Variant (default)">
        <Tabs
          variant="underline"
          items={[
            {
              label: "Overview",
              content: (
                <div className="p-2 text-sm text-(--color-ink)">
                  <p>Overview tab content — course summary, stats, and highlights.</p>
                </div>
              ),
            },
            {
              label: "Lessons",
              content: (
                <div className="p-2 text-sm text-(--color-ink)">
                  <p>Lessons tab content — list of all lessons in this course.</p>
                </div>
              ),
            },
            {
              label: "Students",
              content: (
                <div className="p-2 text-sm text-(--color-ink)">
                  <p>Students tab content — enrolled student list.</p>
                </div>
              ),
            },
            {
              label: "Disabled",
              disabled: true,
              content: <p>Disabled tab content</p>,
            },
          ]}
        />
      </PreviewBlock>

      <PreviewBlock title="Pill Variant">
        <Tabs
          variant="pill"
          items={[
            {
              label: "All",
              content: (
                <div className="p-2 text-sm text-(--color-ink)">
                  Showing all items.
                </div>
              ),
            },
            {
              label: "Active",
              content: (
                <div className="p-2 text-sm text-(--color-ink)">
                  Showing active items only.
                </div>
              ),
            },
            {
              label: "Archived",
              content: (
                <div className="p-2 text-sm text-(--color-ink)">
                  Showing archived items.
                </div>
              ),
            },
          ]}
        />
      </PreviewBlock>

      <PreviewBlock title="With Icons">
        <Tabs
          variant="underline"
          items={[
            {
              label: "Courses",
              icon: <BookOpen size={14} />,
              content: (
                <div className="p-2 text-sm text-(--color-ink)">
                  Course management content.
                </div>
              ),
            },
            {
              label: "Teachers",
              icon: <GraduationCap size={14} />,
              content: (
                <div className="p-2 text-sm text-(--color-ink)">
                  Teacher roster content.
                </div>
              ),
            },
            {
              label: "Students",
              icon: <User size={14} />,
              content: (
                <div className="p-2 text-sm text-(--color-ink)">
                  Student roster content.
                </div>
              ),
            },
            {
              label: "Settings",
              icon: <Settings size={14} />,
              content: (
                <div className="p-2 text-sm text-(--color-ink)">
                  Settings content.
                </div>
              ),
            },
          ]}
        />
      </PreviewBlock>

      <PropsTable
        props={[
          {
            name: "items",
            type: "TabItem[]",
            description: "Array of tab items with label, content, icon, disabled",
          },
          {
            name: "variant",
            type: '"underline" | "pill"',
            default: '"underline"',
            description: "Visual style of the tabs",
          },
          {
            name: "defaultIndex",
            type: "number",
            default: "0",
            description: "Index of the initially active tab",
          },
          {
            name: "onChange",
            type: "(index: number) => void",
            description: "Callback when active tab changes",
          },
        ]}
      />
    </PreviewSection>
  );
}
